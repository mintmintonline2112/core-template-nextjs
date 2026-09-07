import { Body, Controller, Post, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { BaseController } from 'src/common/base/base.controller';
import { CreateRoleDto } from './dto/CreateRoleDto';
import { UpdateRoleDto } from './dto/UpdateRoleDto';
import { Role } from './roles.entity';
import { RolesService } from './roles.service';
import type { FindManyOptions, FindOneOptions } from 'typeorm';
import { JwtAdminAuthGuard } from 'src/common/guard/jwt-auth/jwt-auth-admin.guard';
import { PermissionGuard } from 'src/common/guard/admin/permission.guard';
import { Permissions } from 'src/common/decorators/permission.decorator';

@ApiTags('Roles')
@UseGuards(JwtAdminAuthGuard, PermissionGuard)
@SetMetadata('entity', 'ROLE')
@Controller('admin/roles')
export class RolesController extends BaseController<
  Role,
  CreateRoleDto,
  UpdateRoleDto,
  number
> {
  constructor(private readonly rolesService: RolesService) {
    super(rolesService, 'ROLE');
  }

  protected override getSearchFields(): (keyof Role)[] {
    return ['name'];
  }

  protected override getFindAllOptions(): FindManyOptions<Role> {
    return { relations: { permissions: true } };
  }

  protected override getFindOneOptions(id: number): FindOneOptions<Role> {
    return { where: { id } as any, relations: { permissions: true } };
  }

  @Post()
  @Permissions('CREATE')
  @ApiBody({ type: CreateRoleDto })
  async create(@Body() dto: CreateRoleDto) {
    return super.create(dto);
  }
}
