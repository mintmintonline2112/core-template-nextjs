import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Request, Response } from 'express';
import { JwtConfig } from 'src/config/jwt.config';
import { Repository } from 'typeorm';
import { UAParser } from 'ua-parser-js';
import { RefreshToken } from '../refresh-token/refresh-token.entity';
import { StaffLoginDto } from '../staffs/dto/StaffLoginDto';
import { StaffsService } from '../staffs/staffs.service';
import { UpdateProfileDto } from '../staffs/dto/UpdateProfileDto';
import { UploadImageService } from 'src/modules/upload-image/upload-image.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
    private readonly staffsService: StaffsService,

    private readonly uploadImageService: UploadImageService,
  ) {}

  // Convert expiresIn string (e.g. 15m, 7d) to milliseconds
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

  // Generate tokens from payload
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

  // Build JWT payload — permissions stored as flat string array (e.g. ["PRODUCT_LIST", ...])
  // instead of objects ([{code:"PRODUCT_LIST"}]) to keep the cookie under the 4 KB browser limit.
  private buildPayload(staff: any) {
    try {
      const rawPermissions = staff.role?.permissions || [];

      const permissions: string[] = rawPermissions.map(
        (p: any) => p.code as string,
      );

      const modules = [
        ...new Set(rawPermissions.map((p: any) => p.module)),
      ].filter(Boolean);

      return {
        id: staff.id,
        staff_code: staff.staffCode,
        type: staff.type,
        email: staff.email,
        name: staff.name,
        role: {
          id: staff.role.id,
          name: staff.role.name,
        },
        permissions,
        modules,
      };
    } catch {
      throw new Error('Cannot build payload');
    }
  }

  // LOGIN ADMIN
  async login(dto: StaffLoginDto, req: Request, res: Response) {
    try {
      const userAgent = req.headers['user-agent'] || '';
      const ip = req.ip;

      const parser = new UAParser(userAgent);
      const device = parser.getDevice().model || 'PC';
      const browser = parser.getBrowser().name || 'Unknown';
      const os = parser.getOS().name || 'Unknown';

      const email = dto.email.trim();

      const staff = await this.staffsService.findOne({
        where: { email },
        relations: ['role', 'role.permissions'],
      });

      if (!staff) {
        throw new InternalServerErrorException('Invalid email or password');
      }

      if (staff.status?.toString().toLowerCase() !== 'active') {
        throw new InternalServerErrorException('Account is not activated');
      }

      if (staff.type !== 'admin') {
        throw new UnauthorizedException('Unauthorized access');
      }

      const isValid = await bcrypt.compare(dto.password, staff.password);

      if (!isValid) {
        throw new InternalServerErrorException('Invalid email or password');
      }

      const payload = this.buildPayload(staff);
      const { accessToken, refreshToken } = await this.generateTokens(payload);

      const jwt = this.configService.getOrThrow<JwtConfig>('jwt');

      const accessMaxAge = this.parseExpiresIn(jwt.accessTokenExpiresIn);
      const refreshMaxAge = this.parseExpiresIn(jwt.refreshTokenExpiresIn);

      await this.refreshTokenRepo.save({
        staff,
        token: await bcrypt.hash(refreshToken, 10),
        expiresAt: new Date(Date.now() + refreshMaxAge),
        ipAddress: ip,
        userAgent,
        device,
        browser,
        os,
      });

      res.cookie(
        'accessToken',
        accessToken,
        this.getCookieOptions(accessMaxAge),
      );

      res.cookie(
        'refreshToken',
        refreshToken,
        this.getCookieOptions(refreshMaxAge),
      );

      return {
        user: payload,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new InternalServerErrorException(
        error.message || 'An error occurred during login',
      );
    }
  }

  //LOGIN STAFF
  async loginStaff(dto: StaffLoginDto, req: Request, res: Response) {
    try {
      const userAgent = req.headers['user-agent'] || '';
      const ip = req.ip;

      const parser = new UAParser(userAgent);
      const device = parser.getDevice().model || 'PC';
      const browser = parser.getBrowser().name || 'Unknown';
      const os = parser.getOS().name || 'Unknown';

      const email = dto.email.trim();

      const staff = await this.staffsService.findOne({
        where: { email },
        relations: ['role', 'role.permissions'],
      });

      if (!staff) {
        throw new InternalServerErrorException('Invalid email or password');
      }

      if (staff.status?.toString().toLowerCase() !== 'active') {
        throw new InternalServerErrorException('Account is not activated');
      }

      const isValid = await bcrypt.compare(dto.password, staff.password);

      if (!isValid) {
        throw new InternalServerErrorException('Invalid email or password');
      }

      const payload = this.buildPayload(staff);
      const { accessToken, refreshToken } = await this.generateTokens(payload);

      const jwt = this.configService.getOrThrow<JwtConfig>('jwt');

      const accessMaxAge = this.parseExpiresIn(jwt.accessTokenExpiresIn);
      const refreshMaxAge = this.parseExpiresIn(jwt.refreshTokenExpiresIn);

      await this.refreshTokenRepo.save({
        staff,
        token: await bcrypt.hash(refreshToken, 10),
        expiresAt: new Date(Date.now() + refreshMaxAge),
        ipAddress: ip,
        userAgent,
        device,
        browser,
        os,
      });

      res.cookie(
        'accessToken',
        accessToken,
        this.getCookieOptions(accessMaxAge),
      );

      res.cookie(
        'refreshToken',
        refreshToken,
        this.getCookieOptions(refreshMaxAge),
      );

      return {
        user: payload,
      };
    } catch (error) {
      if (error.message) {
        throw new InternalServerErrorException(error.message);
      }
      throw new InternalServerErrorException('An error occurred during login');
    }
  }
  // REFRESH TOKEN
  async refreshToken(req: Request, res: Response) {
    const oldRefreshToken = req.cookies?.refreshToken;

    if (!oldRefreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    try {
      const jwt = this.configService.getOrThrow<JwtConfig>('jwt');

      const accessMaxAge = this.parseExpiresIn(jwt.accessTokenExpiresIn);
      const refreshMaxAge = this.parseExpiresIn(jwt.refreshTokenExpiresIn);

      try {
        await this.jwtService.verifyAsync(oldRefreshToken, {
          secret: jwt.refreshTokenSecret,
          clockTolerance: 5,
        });
      } catch {
        throw new UnauthorizedException('Session expired');
      }

      const decoded = this.jwtService.decode(oldRefreshToken) as any;

      const tokens = await this.refreshTokenRepo.find({
        where: { staff: { id: decoded.id } },
        relations: ['staff', 'staff.role', 'staff.role.permissions'],
      });

      let validToken: RefreshToken | null = null;

      for (const t of tokens) {
        const isMatch = await bcrypt.compare(oldRefreshToken, t.token);
        if (isMatch) {
          validToken = t;
          break;
        }
      }

      if (
        !validToken ||
        validToken.isRevoked ||
        validToken.expiresAt < new Date()
      ) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      const { accessToken, refreshToken: newRefreshToken } =
        await this.generateTokens(this.buildPayload(validToken.staff));

      validToken.token = await bcrypt.hash(newRefreshToken, 10);
      validToken.expiresAt = new Date(Date.now() + refreshMaxAge);

      await this.refreshTokenRepo.save(validToken);

      res.cookie(
        'accessToken',
        accessToken,
        this.getCookieOptions(accessMaxAge),
      );

      res.cookie(
        'refreshToken',
        newRefreshToken,
        this.getCookieOptions(refreshMaxAge),
      );

      return { message: 'Refresh successful' };
    } catch (error) {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid session');
    }
  }

  // LOGOUT
  async logout(req: Request, res: Response) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      throw new InternalServerErrorException('Token not found');
    }

    const tokens = await this.refreshTokenRepo.find({
      relations: ['staff'],
    });

    let validToken: RefreshToken | null = null;

    for (const t of tokens) {
      const isMatch = await bcrypt.compare(refreshToken, t.token);
      if (isMatch) {
        validToken = t;
        break;
      }
    }

    if (!validToken) {
      throw new InternalServerErrorException('Invalid token');
    }

    validToken.isRevoked = true;
    await this.refreshTokenRepo.save(validToken);

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return { message: 'Logout successful' };
  }

  // GET ME
  async getMe(req: Request, res: Response) {
    if (!req.user) {
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      throw new UnauthorizedException('Session expired');
    }

    const staff = await this.staffsService.findOne({
      where: { id: (req.user as { id: string }).id },
    });

    return {
      user: {
        ...req.user,
        avatar: staff?.avatar ?? null,
        phone: staff?.phone ?? null,
      },
    };
  }

  /**
   * Update staff profile information
   * Processes avatar upload, updates basic info, and handles password change with verification
   * @param staffId - Unique identifier of the staff
   * @param dto - Data transfer object containing update details
   * @param file - Optional image file for profile avatar
   */
  async updateProfile(
    staffId: string,
    dto: UpdateProfileDto,
    file?: Express.Multer.File,
  ) {
    try {
      const staff = await this.staffsService.findOne({
        where: { id: staffId },
      });

      if (!staff) {
        throw new NotFoundException('Staff not found');
      }

      if (file) {
        staff.avatar = await this.uploadImageService.upload(file, 'profile');
      }

      if (dto.name !== undefined) staff.name = dto.name;
      if (dto.phone !== undefined) staff.phone = dto.phone;

      if (dto.password) {
        if (!dto.currentPassword) {
          throw new BadRequestException('Current password is required');
        }

        const isMatch = await bcrypt.compare(
          dto.currentPassword,
          staff.password,
        );

        if (!isMatch) {
          throw new BadRequestException('Current password is incorrect');
        }

        if (dto.password !== dto.confirmPassword) {
          throw new BadRequestException('Password confirmation does not match');
        }

        staff.password = await bcrypt.hash(dto.password, 10);
      }

      await this.staffsService.update(staffId, staff);

      return {
        message: 'Profile updated successfully',
        user: {
          id: staff.id,
          name: staff.name,
          email: staff.email,
          avatar: staff.avatar,
          phone: staff.phone,
        },
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        error?.message || 'An error occurred while updating the profile',
      );
    }
  }
}
