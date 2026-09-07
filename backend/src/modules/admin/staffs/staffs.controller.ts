import {
  Body,
  Controller,
  Param,
  Post,
  Put,
  UseGuards,
  SetMetadata,
  Patch,
  Req,
  Delete,
} from '@nestjs/common';
import { ApiBody, ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { BaseController } from 'src/common/base/base.controller';
import { CreateStaffDto } from './dto/CreateStaffDto';
import { UpdateStaffDto } from './dto/UpdateStaffDto';
import { Staff } from './staffs.entity';
import { StaffsService } from './staffs.service';
import { Permissions } from 'src/common/decorators/permission.decorator';
import type { FindManyOptions, FindOneOptions } from 'typeorm';
import { JwtAdminAuthGuard } from 'src/common/guard/jwt-auth/jwt-auth-admin.guard';
import { PermissionGuard } from 'src/common/guard/admin/permission.guard';

@ApiTags('Staffs')
@ApiBearerAuth()
@UseGuards(JwtAdminAuthGuard, PermissionGuard)
@SetMetadata('entity', 'STAFF')
@Controller('/admin/staffs')
export class StaffsController extends BaseController<
  Staff,
  CreateStaffDto,
  UpdateStaffDto,
  string
> {
  constructor(private readonly staffsService: StaffsService) {
    super(staffsService, 'STAFF');
  }

  protected override getSearchFields(): (keyof Staff)[] {
    return ['name', 'email'];
  }

  protected override getFindAllOptions(): FindManyOptions<Staff> {
    return { relations: { role: true } };
  }

  protected override getFindOneOptions(id: string): FindOneOptions<Staff> {
    return { where: { id: id as any }, relations: { role: true } };
  }

  @Post()
  @Permissions('CREATE')
  @ApiBody({ type: CreateStaffDto })
  async create(@Body() dto: CreateStaffDto) {
    return await this.staffsService.createStaff(dto);
  }

  @Put(':id')
  @Permissions('UPDATE')
  @ApiBody({ type: UpdateStaffDto })
  override async update(
    @Param('id') id: string,
    @Body() dto: UpdateStaffDto,
    @Req() req?: any,
  ) {
    const actorId = req?.user?.id;

    return await this.staffsService.updateStaff(id, dto, actorId);
  }

  @Delete(':id')
  @Permissions('DELETE')
  async deleteStaff(@Param('id') id: string, @Req() req?: any) {
    const actorId = req?.user?.id;

    return await this.staffsService.delete(id, actorId);
  }

  @Patch('block/:id')
  @Permissions('STAFF_BLOCK')
  @ApiOperation({ summary: 'Block staff' })
  async block(@Param('id') id: string, @Req() req?: any) {
    const actorId = req?.user?.id;

    return await this.staffsService.toggleStatus(id, actorId);
  }
}
