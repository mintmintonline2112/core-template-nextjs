import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Request, Response } from 'express';
import { Repository } from 'typeorm';
import { UAParser } from 'ua-parser-js';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { JwtConfig } from 'src/config/jwt.config';
import { User } from 'src/modules/admin/users/user.entity';
import { UserRefreshToken } from 'src/modules/admin/refresh-token/user_refresh-token.entity';
import { UserLoginDto } from 'src/modules/admin/users/dto/UserLoginDto';
import { UserRegisterDto } from 'src/modules/admin/users/dto/UserRegisterDto';
import { Staff } from 'src/modules/admin/staffs/staffs.entity';
import { AccountStatus } from 'src/common/enums/account-status.enum';
import { MailService } from 'src/modules/admin/mail/mail.service';
import { UploadImageService } from 'src/modules/upload-image/upload-image.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(UserRefreshToken)
    private readonly refreshTokenRepo: Repository<UserRefreshToken>,
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
    private readonly mailService: MailService,
    private readonly uploadImageService: UploadImageService,
  ) {}

  // ─── Private Helpers ──────────────────────────────────────────────────────

  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000;
    const value = parseInt(match[1], 10);
    const unit = match[2];
    const map: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };
    return value * map[unit];
  }

  private getCookieOptions(maxAge: number) {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge,
    };
  }

  private get clearCookieOptions() {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
    };
  }

  private buildPayload(user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.fullName,
      avatar: user.avatar,
      type: 'USER',
      status: user.status,
      phone: user.phone,
    };
  }

  private async generateTokens(payload: any) {
    const jwt = this.configService.getOrThrow<JwtConfig>('jwt');
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: jwt.accessTokenSecret,
      expiresIn: jwt.accessTokenExpiresIn,
    } as JwtSignOptions);
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: jwt.refreshTokenSecret,
      expiresIn: jwt.refreshTokenExpiresIn,
    } as JwtSignOptions);
    return { accessToken, refreshToken };
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // ─── Auth ─────────────────────────────────────────────────────────────────

  /** Login user and set access + refresh token cookies */
  async login(dto: UserLoginDto, req: Request, res: Response) {
    try {
      const userAgent = req.headers['user-agent'] || '';
      const ip = req.ip;
      const ua = new UAParser(userAgent).getResult();

      const user = await this.userRepository.findOne({
        where: { email: dto.email },
      });

      if (!user) throw new UnauthorizedException('Invalid email or password');

      if (user.status === AccountStatus.INACTIVE) {
        throw new UnauthorizedException(
          'Account not activated. Please verify OTP first.',
        );
      }

      const isMatch = await bcrypt.compare(dto.password, user.password);
      if (!isMatch)
        throw new UnauthorizedException('Invalid email or password');

      user.lastLoginAt = new Date();
      await this.userRepository.save(user);

      const payload = this.buildPayload(user);
      const { accessToken, refreshToken } = await this.generateTokens(payload);

      const jwt = this.configService.getOrThrow<JwtConfig>('jwt');
      const accessMaxAge = this.parseExpiresIn(jwt.accessTokenExpiresIn);
      const refreshMaxAge = this.parseExpiresIn(jwt.refreshTokenExpiresIn);

      await this.refreshTokenRepo.save({
        userId: user.id,
        tokenHash: await bcrypt.hash(refreshToken, 10),
        expiresAt: new Date(Date.now() + refreshMaxAge),
        ipAddress: ip,
        userAgent,
        device: ua.device.type || 'desktop',
        browser: ua.browser.name,
        os: ua.os.name,
      });

      res.cookie(
        'user_access_token',
        accessToken,
        this.getCookieOptions(accessMaxAge),
      );
      res.cookie(
        'user_refresh_token',
        refreshToken,
        this.getCookieOptions(refreshMaxAge),
      );

      return { user: payload };
    } catch (error) {
      throw error instanceof UnauthorizedException
        ? error
        : new InternalServerErrorException('Login failed');
    }
  }

  /** Rotate access and refresh tokens using the refresh cookie */
  async refreshToken(req: Request, res: Response) {
    const oldRefreshToken = req.cookies?.user_refresh_token;

    if (!oldRefreshToken) {
      throw new UnauthorizedException('Session not found');
    }

    try {
      const jwt = this.configService.getOrThrow<JwtConfig>('jwt');

      const payload = await this.jwtService.verifyAsync(oldRefreshToken, {
        secret: jwt.refreshTokenSecret,
      });

      const storedTokens = await this.refreshTokenRepo.find({
        where: { userId: payload.id },
      });
      let currentToken = null;

      for (const t of storedTokens) {
        const isMatch = await bcrypt.compare(oldRefreshToken, t.tokenHash);
        if (isMatch) {
          currentToken = t;
          break;
        }
      }

      if (
        !currentToken ||
        currentToken.isRevoked ||
        currentToken.expiresAt < new Date()
      ) {
        throw new UnauthorizedException('Invalid or expired session');
      }

      const user = await this.userRepository.findOne({
        where: { id: payload.id },
      });

      if (!user || user.status !== AccountStatus.ACTIVE) {
        throw new UnauthorizedException('User is inactive or not found');
      }

      const newPayload = this.buildPayload(user);
      const { accessToken, refreshToken: newRefreshToken } =
        await this.generateTokens(newPayload);

      currentToken.tokenHash = await bcrypt.hash(newRefreshToken, 10);
      currentToken.expiresAt = new Date(
        Date.now() + this.parseExpiresIn(jwt.refreshTokenExpiresIn),
      );
      currentToken.isRevoked = false;
      await this.refreshTokenRepo.save(currentToken);

      const accessMaxAge = this.parseExpiresIn(jwt.accessTokenExpiresIn);
      const refreshMaxAge = this.parseExpiresIn(jwt.refreshTokenExpiresIn);

      res.cookie(
        'user_access_token',
        accessToken,
        this.getCookieOptions(accessMaxAge),
      );
      res.cookie(
        'user_refresh_token',
        newRefreshToken,
        this.getCookieOptions(refreshMaxAge),
      );

      return { message: 'Token refreshed successfully' };
    } catch (err) {
      res.clearCookie('user_access_token', this.clearCookieOptions);
      res.clearCookie('user_refresh_token', this.clearCookieOptions);

      if (err instanceof UnauthorizedException) throw err;
      throw new UnauthorizedException('Session expired');
    }
  }

  /** Revoke refresh token and clear session cookies */
  async logout(req: Request, res: Response) {
    const refreshToken = req.cookies?.user_refresh_token;

    if (refreshToken) {
      const tokens = await this.refreshTokenRepo.find();
      for (const t of tokens) {
        const isMatch = await bcrypt.compare(refreshToken, t.tokenHash);
        if (isMatch && !t.isRevoked) {
          t.isRevoked = true;
          await this.refreshTokenRepo.save(t);
          break;
        }
      }
    }

    res.clearCookie('user_access_token', this.clearCookieOptions);
    res.clearCookie('user_refresh_token', this.clearCookieOptions);

    return { message: 'Logged out successfully' };
  }

  // ─── Registration ──────────────────────────────────────────────────────────

  /** Register new user: check email uniqueness, send OTP (valid 1 minute) */
  async register(dto: UserRegisterDto) {
    const [existingUser, existingStaff] = await Promise.all([
      this.userRepository.findOne({ where: { email: dto.email } }),
      this.staffRepository.findOne({ where: { email: dto.email } }),
    ]);

    if (existingUser || existingStaff) {
      throw new BadRequestException('This email is already in use');
    }

    const otp = this.generateOtp();

    const user = this.userRepository.create({
      ...dto,
      password: await bcrypt.hash(dto.password, 10),
      status: AccountStatus.INACTIVE,
      otp,
      otpExpires: new Date(Date.now() + 60 * 1000),
    });

    await this.userRepository.save(user);

    try {
      await this.mailService.sendOtpEmail(user.email, otp);
    } catch {
      console.error('Failed to send OTP email to:', user.email);
    }

    return { message: 'OTP sent to your email. Valid for 1 minute.' };
  }

  /** Verify OTP to activate the account */
  async verifyOtp(email: string, otp: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) throw new BadRequestException('User not found');

    if (user.status === AccountStatus.ACTIVE) {
      return { message: 'Account already activated. Please login.' };
    }

    if (!user.otp || user.otp !== otp) {
      throw new BadRequestException('Invalid OTP code');
    }

    if (user.otpExpires < new Date()) {
      user.otp = null;
      user.otpExpires = null;
      await this.userRepository.save(user);
      throw new BadRequestException(
        'OTP has expired. Please request a new one.',
      );
    }

    user.status = AccountStatus.ACTIVE;
    user.emailVerifiedAt = new Date();
    user.otp = null;
    user.otpExpires = null;
    await this.userRepository.save(user);

    return { message: 'Account activated successfully. You can now login.' };
  }

  /** Clear old OTP and send a fresh one (valid 1 minute) */
  async resendOtp(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) throw new BadRequestException('User not found');

    const otp = this.generateOtp();
    user.otp = otp;
    user.otpExpires = new Date(Date.now() + 60 * 1000);
    await this.userRepository.save(user);
    await this.mailService.sendOtpEmail(user.email, otp);

    return { message: 'New OTP sent to your email. Valid for 1 minute.' };
  }

  // ─── Password Reset ────────────────────────────────────────────────────────

  /** Generate a reset token and send a password-reset link via email (valid 15 minutes) */
  async forgotPassword(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user)
      throw new BadRequestException('No account found with this email');

    const token = randomBytes(32).toString('hex');
    user.otp = token;
    user.otpExpires = new Date(Date.now() + 15 * 60 * 1000);
    await this.userRepository.save(user);

    const resetLink = `http://localhost:4200/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    await this.mailService.sendPasswordResetEmail(user.email, resetLink);

    return {
      message: 'Password reset link sent to your email. Valid for 15 minutes.',
    };
  }

  /** Validate the reset token from the email link and set the new password */
  async resetPassword(token: string, email: string, password: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user || !user.otp || user.otp !== token) {
      throw new BadRequestException(
        'Reset link is invalid or has already been used',
      );
    }

    if (user.otpExpires < new Date()) {
      user.otp = null;
      user.otpExpires = null;
      await this.userRepository.save(user);
      throw new BadRequestException(
        'Reset link has expired. Please request a new one.',
      );
    }

    user.password = await bcrypt.hash(password, 10);
    user.otp = null;
    user.otpExpires = null;
    await this.userRepository.save(user);

    return { message: 'Password reset successfully. You can now login.' };
  }

  // ─── Profile ───────────────────────────────────────────────────────────────

  /** Return public profile fields (no password) */
  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: [
        'id',
        'fullName',
        'email',
        'phone',
        'address',
        'avatar',
        'status',
      ],
    });

    if (!user) throw new BadRequestException('User not found');
    return user;
  }

  /** Update avatar — saves to uploads/profile */
  async updateAvatar(userId: string, file: Express.Multer.File) {
    const avatarPath = await this.uploadImageService.upload(file, 'profile');
    await this.userRepository.update(userId, { avatar: avatarPath });

    const updated = await this.userRepository.findOne({
      where: { id: userId },
      select: [
        'id',
        'fullName',
        'email',
        'phone',
        'address',
        'avatar',
        'status',
      ],
    });

    return { message: 'Avatar updated successfully', user: updated };
  }

  /** Update profile: name, phone, address, and optionally change password */
  async updateProfile(userId: string, dto: any) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) throw new BadRequestException('User not found');

    if (dto.fullName !== undefined) user.fullName = dto.fullName;
    if (dto.phone !== undefined) user.phone = dto.phone;
    if (dto.address !== undefined) user.address = dto.address;

    if (dto.newPassword) {
      if (!dto.currentPassword) {
        throw new BadRequestException(
          'Current password is required to change password',
        );
      }

      const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
      if (!isMatch) {
        throw new BadRequestException('Current password is incorrect');
      }

      if (dto.newPassword !== dto.confirmPassword) {
        throw new BadRequestException(
          'New password and confirmation do not match',
        );
      }

      if (dto.newPassword.length < 6) {
        throw new BadRequestException(
          'New password must be at least 6 characters',
        );
      }

      user.password = await bcrypt.hash(dto.newPassword, 10);
    }

    await this.userRepository.save(user);

    const updated = await this.userRepository.findOne({
      where: { id: userId },
      select: [
        'id',
        'fullName',
        'email',
        'phone',
        'address',
        'avatar',
        'status',
      ],
    });

    return { message: 'Profile updated successfully', user: updated };
  }
}
