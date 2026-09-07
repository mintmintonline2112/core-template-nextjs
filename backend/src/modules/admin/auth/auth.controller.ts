import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { Public } from 'src/common/decorators/public.decorator';
import { StaffLoginDto } from '../staffs/dto/StaffLoginDto';
import { AuthService } from './auth.service';
import { AuthExceptionFilter } from 'src/common/filters/auth-exception.filter';
import { JwtAdminAuthGuard } from 'src/common/guard/jwt-auth/jwt-auth-admin.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { UpdateProfileDto } from '../staffs/dto/UpdateProfileDto';

@ApiTags('Admin Auth')
@ApiBearerAuth()
@Controller('/admin/auth')
@UseFilters(AuthExceptionFilter)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  async login(
    @Body() dto: StaffLoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(dto, req, res);
  }

  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login-staff')
  async loginStaff(
    @Body() dto: StaffLoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.loginStaff(dto, req, res);
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.refreshToken(req, res);
  }

  @UseGuards(JwtAdminAuthGuard)
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.logout(req, res);
  }

  @UseGuards(JwtAdminAuthGuard)
  @Get('me')
  getMe(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.getMe(req, res);
  }

  @Patch('profile')
  @ApiBearerAuth()
  @UseGuards(JwtAdminAuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  async updateProfile(
    @Req() req: Request,
    @Body() dto: UpdateProfileDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const staffId = req.user['id'];
    return this.authService.updateProfile(staffId, dto, file);
  }
}
