import {
  Body,
  Controller,
  Get,
  Put,
  SetMetadata,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Permissions } from 'src/common/decorators/permission.decorator';
import { PermissionGuard } from 'src/common/guard/admin/permission.guard';
import { JwtAdminAuthGuard } from 'src/common/guard/jwt-auth/jwt-auth-admin.guard';
import {
  CACHE_NAMESPACES_KEY,
  InvalidateCacheInterceptor,
} from 'src/common/interceptors/invalidate-cache.interceptor';
import { CACHE_NS } from 'src/common/cache/cache-keys';
import { SettingsService } from './settings.service';

@ApiTags('Admin - Settings')
@ApiBearerAuth()
@UseGuards(JwtAdminAuthGuard, PermissionGuard)
@UseInterceptors(InvalidateCacheInterceptor)
@SetMetadata('entity', 'SETTING')
@SetMetadata(CACHE_NAMESPACES_KEY, [CACHE_NS.settings])
@Controller('admin/settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @Permissions('LIST')
  @ApiOperation({ summary: 'Lấy toàn bộ cấu hình website' })
  findAll() {
    return this.settingsService.getAll();
  }

  @Put()
  @Permissions('UPDATE')
  @ApiOperation({ summary: 'Cập nhật cấu hình website (partial upsert)' })
  update(@Body() body: Record<string, unknown>) {
    return this.settingsService.updateMany(body);
  }
}
