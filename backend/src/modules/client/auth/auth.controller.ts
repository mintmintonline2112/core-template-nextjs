import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  BadRequestException,
  Get,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Patch,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { UserLoginDto } from 'src/modules/admin/users/dto/UserLoginDto';
import { UserRegisterDto } from 'src/modules/admin/users/dto/UserRegisterDto';
import { JwtUserAuthGuard } from 'src/common/guard/jwt-auth/jwt-auth-client.guard';
import { FileInterceptor } from '@nestjs/platform-express/multer/interceptors/file.interceptor';

@ApiTags('Client Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ─── Auth ──────────────────────────────────────────────────────────────────

  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  async login(
    @Body() dto: UserLoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(dto, req, res);
  }

  @Public()
  @Post('refresh-token')
  @ApiOperation({ summary: 'Rotate session tokens' })
  async refreshToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.refreshToken(req, res);
  }

  @Post('logout')
  @ApiOperation({ summary: 'Logout and clear session cookies' })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.logout(req, res);
  }

  // ─── Registration ──────────────────────────────────────────────────────────

  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 600_000 } })
  @Post('register')
  @ApiOperation({ summary: 'Register new account and send OTP' })
  async register(@Body() dto: UserRegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 6, ttl: 60_000 } })
  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify OTP to activate account' })
  async verifyOtp(@Body() body: { email: string; otp: string }) {
    if (!body?.email || !body?.otp) {
      throw new BadRequestException('Email and OTP are required');
    }
    return this.authService.verifyOtp(body.email, body.otp);
  }

  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 3, ttl: 300_000 } })
  @Post('resend-otp')
  @ApiOperation({ summary: 'Resend a new OTP code' })
  async resendOtp(@Body() body: { email: string }) {
    if (!body?.email) throw new BadRequestException('Email is required');
    return this.authService.resendOtp(body.email);
  }

  // ─── Password Reset ────────────────────────────────────────────────────────

  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 3, ttl: 300_000 } })
  @Post('forgot-password')
  @ApiOperation({ summary: 'Send password reset link to email' })
  async forgotPassword(@Body('email') email: string) {
    if (!email) throw new BadRequestException('Email is required');
    return this.authService.forgotPassword(email);
  }

  @Public()
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password using token from email link' })
  async resetPassword(@Body() body: { token: string; email: string; password: string }) {
    if (!body?.token || !body?.email || !body?.password) {
      throw new BadRequestException('Token, email, and password are required');
    }
    return this.authService.resetPassword(body.token, body.email, body.password);
  }

  // ─── Profile ───────────────────────────────────────────────────────────────

  @Get('profile')
  @UseGuards(JwtUserAuthGuard)
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@Req() req: any) {
    return this.authService.getProfile(req.user.id);
  }

  @Post('update-avatar')
  @UseGuards(JwtUserAuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiOperation({ summary: 'Upload a new avatar (saved to uploads/profile)' })
  async updateAvatar(@Req() req: any, @UploadedFile() file: Express.Multer.File) {
    return this.authService.updateAvatar(req.user.id, file);
  }

  @Patch('update-profile')
  @UseGuards(JwtUserAuthGuard)
  @ApiOperation({ summary: 'Update name, phone, address and optionally change password' })
  async updateProfile(@Req() req: any, @Body() dto: any) {
    return this.authService.updateProfile(req.user.id, dto);
  }
}
