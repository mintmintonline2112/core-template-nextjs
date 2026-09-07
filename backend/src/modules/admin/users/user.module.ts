import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersController } from './user.controller';
import { User } from './user.entity';
import { UsersService } from './user.service';
import { Staff } from '../staffs/staffs.entity';
import {  UserRefreshToken} from "../refresh-token/user_refresh-token.entity";
@Module({
  imports: [TypeOrmModule.forFeature([User, Staff,UserRefreshToken])],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
