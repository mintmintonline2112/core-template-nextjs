import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffsController } from './staffs.controller';
import { Staff } from './staffs.entity';
import { StaffsService } from './staffs.service';
import { RefreshToken } from '../refresh-token/refresh-token.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Staff, RefreshToken, User])],
  providers: [StaffsService],
  controllers: [StaffsController],
  exports: [StaffsService],
})
export class StaffsModule {}
