import { Controller, Get, SetMetadata, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permissions } from 'src/common/decorators/permission.decorator';
import { PermissionGuard } from 'src/common/guard/admin/permission.guard';
import { JwtAdminAuthGuard } from 'src/common/guard/jwt-auth/jwt-auth-admin.guard';
import { SectionDefinition } from './entities/section-definition.entity';

/**
 * Danh mục loại section (chỉ đọc) — admin dùng để render form section trực quan.
 * Dữ liệu do seed đồng bộ theo code, không có CRUD.
 */
@ApiTags('Admin - Section Definitions')
@ApiBearerAuth()
@UseGuards(JwtAdminAuthGuard, PermissionGuard)
@SetMetadata('entity', 'PAGE_SECTION')
@Controller('admin/section-definitions')
export class SectionDefinitionsController {
  constructor(
    @InjectRepository(SectionDefinition)
    private readonly definitionRepo: Repository<SectionDefinition>,
  ) {}

  @Get()
  @Permissions('LIST')
  @ApiOperation({ summary: 'Danh mục loại section của website' })
  findAll(): Promise<SectionDefinition[]> {
    return this.definitionRepo.find({
      order: { pageSlug: 'ASC', sortOrder: 'ASC' },
    });
  }
}
