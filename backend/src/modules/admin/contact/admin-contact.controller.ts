import {
  Controller,
  Delete,
  Get,
  Param,
  Query,
  SetMetadata,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Permissions } from 'src/common/decorators/permission.decorator';
import { PermissionGuard } from 'src/common/guard/admin/permission.guard';
import { JwtAdminAuthGuard } from 'src/common/guard/jwt-auth/jwt-auth-admin.guard';
import { ContactService } from './contact.service';

@ApiTags('Admin - Contacts')
@ApiBearerAuth()
@UseGuards(JwtAdminAuthGuard, PermissionGuard)
@SetMetadata('entity', 'CONTACT')
@Controller('admin/contacts')
export class AdminContactController {
  constructor(private readonly contactService: ContactService) {}

  @Get()
  @Permissions('LIST')
  @ApiOperation({ summary: 'Danh sách liên hệ' })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
  ) {
    return this.contactService.findAll(page, limit, search);
  }

  @Get(':id')
  @Permissions('DETAIL')
  @ApiOperation({ summary: 'Chi tiết liên hệ' })
  findOne(@Param('id') id: number) {
    return this.contactService.findOne(Number(id));
  }

  @Delete(':id')
  @Permissions('DELETE')
  @ApiOperation({ summary: 'Xóa liên hệ' })
  remove(@Param('id') id: number) {
    return this.contactService.remove(Number(id));
  }
}
