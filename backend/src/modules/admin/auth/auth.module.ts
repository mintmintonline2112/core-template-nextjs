import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from '../refresh-token/refresh-token.entity';
import { StaffsModule } from '../staffs/staffs.module';
import { AuthService } from './auth.service';

import { AuthController } from './auth.controller';
import { JwtAdminStrategy } from './strategies/jwt.strategy';
import { UploadImageService } from 'src/modules/upload-image/upload-image.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([RefreshToken]),
    StaffsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAdminStrategy, UploadImageService],
  exports: [AuthService],
})
export class AuthModule {}
