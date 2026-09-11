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
import { createHash, randomUUID, timingSafeEqual } from 'crypto';
import { Request, Response } from 'express';
import { JwtConfig } from 'src/config/jwt.config';
import { Repository } from 'typeorm';
import { UAParser } from 'ua-parser-js';
import { RefreshToken } from '../refresh-token/refresh-token.entity';
import { Staff } from '../staffs/staffs.entity';
import { StaffLoginDto } from '../staffs/dto/StaffLoginDto';
import { StaffsService } from '../staffs/staffs.service';
import { UpdateProfileDto } from '../staffs/dto/UpdateProfileDto';
import { UploadImageService } from 'src/modules/upload-image/upload-image.service';

/**
 * Số phiên đăng nhập giữ lại cho mỗi nhân viên. Vượt quá thì phiên cũ nhất bị xoá,
 * nên bảng có trần cứng dù ai đó đăng nhập lại bao nhiêu lần đi nữa.
 */
const MAX_SESSIONS_PER_STAFF = 10;

/** Băm refresh token để lưu: SHA-256 phủ toàn bộ chuỗi và tra tức thì. */
function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/** So hai chuỗi băm mà không để lộ vị trí ký tự lệch qua thời gian chạy. */
function sameHash(a: string, b: string): boolean {
  const left = Buffer.from(a, 'hex');
  const right = Buffer.from(b, 'hex');
  return left.length === right.length && timingSafeEqual(left, right);
}

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

  private signAccessToken(payload: any): Promise<string> {
    const jwt = this.configService.getOrThrow<JwtConfig>('jwt');

    return this.jwtService.signAsync(payload, {
      secret: jwt.accessTokenSecret,
      expiresIn: jwt.accessTokenExpiresIn,
    } as JwtSignOptions);
  }

  /**
   * Refresh token chỉ mang id nhân viên và mã phiên — không kèm danh sách quyền
   * như access token, vừa nhẹ cookie vừa không nhân đôi chỗ lộ quyền.
   */
  private signRefreshToken(
    staffId: string,
    sessionId: string,
  ): Promise<string> {
    const jwt = this.configService.getOrThrow<JwtConfig>('jwt');

    return this.jwtService.signAsync({ id: staffId, sid: sessionId }, {
      secret: jwt.refreshTokenSecret,
      expiresIn: jwt.refreshTokenExpiresIn,
    } as JwtSignOptions);
  }

  /**
   * Dọn bảng phiên: xoá hàng đã hết hạn của mọi người, rồi cắt bớt phiên cũ của
   * riêng nhân viên sắp đăng nhập. Chạy ngay trong luồng đăng nhập nên không cần
   * cài thêm tác vụ định kỳ.
   */
  private async pruneSessions(staffId: string): Promise<void> {
    try {
      await this.refreshTokenRepo
        .createQueryBuilder()
        .delete()
        .where('expiresAt < NOW()')
        .execute();

      const stale = await this.refreshTokenRepo
        .createQueryBuilder('token')
        .select('token.id', 'id')
        .where('token.staff_id = :staffId', { staffId })
        .orderBy('token.createdAt', 'DESC')
        .offset(MAX_SESSIONS_PER_STAFF - 1)
        .limit(100)
        .getRawMany<{ id: number }>();

      if (stale.length) {
        await this.refreshTokenRepo.delete(stale.map((row) => row.id));
      }
    } catch {
      // Dọn dẹp là việc phụ — hỏng thì vẫn phải cho người ta đăng nhập.
    }
  }

  /**
   * Cấp cookie cho một phiên mới và ghi phiên đó xuống DB.
   * Dùng chung cho cả đăng nhập admin lẫn đăng nhập nhân viên.
   */
  private async issueSession(staff: Staff, req: Request, res: Response) {
    const jwt = this.configService.getOrThrow<JwtConfig>('jwt');
    const accessMaxAge = this.parseExpiresIn(jwt.accessTokenExpiresIn);
    const refreshMaxAge = this.parseExpiresIn(jwt.refreshTokenExpiresIn);

    const payload = this.buildPayload(staff);
    const sessionId = randomUUID();

    const accessToken = await this.signAccessToken(payload);
    const refreshToken = await this.signRefreshToken(staff.id, sessionId);

    await this.pruneSessions(staff.id);

    const userAgent = req.headers['user-agent'] || '';
    const parser = new UAParser(userAgent);

    await this.refreshTokenRepo.save({
      staff,
      sessionId,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + refreshMaxAge),
      ipAddress: req.ip,
      userAgent,
      device: parser.getDevice().model || 'PC',
      browser: parser.getBrowser().name || 'Unknown',
      os: parser.getOS().name || 'Unknown',
    });

    res.cookie('accessToken', accessToken, this.getCookieOptions(accessMaxAge));
    res.cookie(
      'refreshToken',
      refreshToken,
      this.getCookieOptions(refreshMaxAge),
    );

    return payload;
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

      return { user: await this.issueSession(staff, req, res) };
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

      return { user: await this.issueSession(staff, req, res) };
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

      let decoded: { id?: string; sid?: string };
      try {
        decoded = await this.jwtService.verifyAsync(oldRefreshToken, {
          secret: jwt.refreshTokenSecret,
          clockTolerance: 5,
        });
      } catch {
        throw new UnauthorizedException('Session expired');
      }

      if (!decoded?.sid) {
        throw new UnauthorizedException('Invalid session');
      }

      // Tra thẳng bằng mã phiên: đúng một hàng, đúng một phép so bcrypt, thay vì
      // duyệt mọi phiên của nhân viên như trước.
      const session = await this.refreshTokenRepo.findOne({
        where: { sessionId: decoded.sid },
        relations: ['staff', 'staff.role', 'staff.role.permissions'],
      });

      if (!session || session.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      if (!sameHash(session.tokenHash, hashToken(oldRefreshToken))) {
        // Đúng mã phiên nhưng sai token = token cũ bị dùng lại sau khi đã xoay.
        // Coi như phiên bị lộ và huỷ luôn.
        await this.refreshTokenRepo.delete(session.id);
        throw new UnauthorizedException('Invalid or expired token');
      }

      const newRefreshToken = await this.signRefreshToken(
        session.staff.id,
        session.sessionId,
      );
      const accessToken = await this.signAccessToken(
        this.buildPayload(session.staff),
      );

      session.tokenHash = hashToken(newRefreshToken);
      session.expiresAt = new Date(Date.now() + refreshMaxAge);

      await this.refreshTokenRepo.save(session);

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

  /** Đọc mã phiên trong refresh token mà không cần token còn hạn. */
  private readSessionId(refreshToken?: string): string | null {
    if (!refreshToken) return null;
    try {
      const decoded = this.jwtService.decode(refreshToken);
      return decoded?.sid ?? null;
    } catch {
      return null;
    }
  }

  // LOGOUT
  async logout(req: Request, res: Response) {
    const refreshToken = req.cookies?.refreshToken;

    // Cookie dọn trước và luôn dọn: cookie hỏng hay hết hạn thì vẫn phải đăng
    // xuất được, trước đây chỗ này trả lỗi 500.
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    // Xoá hẳn hàng thay vì đánh dấu đã thu hồi — hàng chỉ tồn tại khi phiên còn sống.
    const sessionId = this.readSessionId(refreshToken);
    if (sessionId) {
      await this.refreshTokenRepo.delete({ sessionId });
    }

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
