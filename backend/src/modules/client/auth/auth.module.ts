import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRefreshToken } from 'src/modules/admin/refresh-token/user_refresh-token.entity';
import { User } from 'src/modules/admin/users/user.entity';
import { Staff } from 'src/modules/admin/staffs/staffs.entity';
import { JwtUserStrategy } from './strategires/jwt.strategry';
import { JwtUserAuthGuard } from 'src/common/guard/jwt-auth/jwt-auth-client.guard';
import { MailModule } from 'src/modules/admin/mail/mail.module';
import { UploadImageService } from 'src/modules/upload-image/upload-image.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.register({}),
    TypeOrmModule.forFeature([UserRefreshToken, User, Staff]),
    MailModule,
  ],

  controllers: [AuthController],

  providers: [
    AuthService,
    JwtUserStrategy,
    JwtUserAuthGuard,
    UploadImageService,
  ],

  exports: [AuthService],
})
export class AuthModule {}
