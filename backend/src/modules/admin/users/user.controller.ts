import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  Put,
  Req,
  SetMetadata,
  UseGuards,
  Get,
} from '@nestjs/common';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { BaseController } from 'src/common/base/base.controller';
import type { FindOneOptions } from 'typeorm';
import { CreateUserDto } from './dto/CreateUserDto';
import { UpdateUserDto } from './dto/UpdateUserDto';
import { UsersService } from './user.service';
import { User } from './user.entity';
import { Permissions } from 'src/common/decorators/permission.decorator';
import { JwtAdminAuthGuard } from 'src/common/guard/jwt-auth/jwt-auth-admin.guard';
import { PermissionGuard } from 'src/common/guard/admin/permission.guard';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('Users')
@UseGuards(JwtAdminAuthGuard, PermissionGuard)
@SetMetadata('entity', 'USER')
@Controller('/admin/users')
export class UsersController extends BaseController<
  User,
  CreateUserDto,
  UpdateUserDto,
  string
> {
  constructor(private readonly usersService: UsersService) {
    super(usersService, 'USER');
  }

  protected override getSearchFields(): (keyof User)[] {
    return ['fullName', 'email', 'phone', 'address'];
  }

  protected override getFindOneOptions(id: string): FindOneOptions<User> {
    return { where: { id } as any };
  }

  @Patch('block/:id')
  @Permissions('USER_BLOCK')
  @ApiOperation({ summary: 'Block user' })
  async block(@Param('id') id: string) {
    return await this.usersService.toggleStatus(id);
  }

  @Post()
  @Permissions('CREATE')
  @ApiBody({ type: CreateUserDto })
  async create(@Body() dto: CreateUserDto) {
    return await this.usersService.createUser(dto);
  }

  @Put(':id')
  @Permissions('UPDATE')
  @ApiBody({ type: UpdateUserDto })
  override async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Req() req?: any,
  ) {
    const actorId = req?.user?.id;

    return await this.usersService.updateUser(id, dto, actorId);
  }

  @Public()
  @Get('analytics/traffic')
  async getTraffic() {
    return await this.usersService.getTrafficStats();
  }

  @Get('analytics/dashboard')
  async getDashboardStats() {
    return await this.usersService.getDashboardStats();
  }
}
