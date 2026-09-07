import { Controller, SetMetadata, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { BaseController } from 'src/common/base/base.controller';
import { JwtAdminAuthGuard } from 'src/common/guard/jwt-auth/jwt-auth-admin.guard';
import { PermissionGuard } from 'src/common/guard/admin/permission.guard';
import {
  CACHE_NAMESPACES_KEY,
  InvalidateCacheInterceptor,
} from 'src/common/interceptors/invalidate-cache.interceptor';
import { CACHE_NS } from 'src/common/cache/cache-keys';
import { Page } from './entities/page.entity';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { PagesService } from './pages.service';

@ApiTags('Admin - Pages')
@ApiBearerAuth()
@UseGuards(JwtAdminAuthGuard, PermissionGuard)
@UseInterceptors(InvalidateCacheInterceptor)
@SetMetadata('entity', 'PAGE')
@SetMetadata(CACHE_NAMESPACES_KEY, [CACHE_NS.pages])
@Controller('admin/pages')
export class PagesController extends BaseController<
  Page,
  CreatePageDto,
  UpdatePageDto,
  number
> {
  constructor(private readonly pagesService: PagesService) {
    super(pagesService, 'Page');
  }

  protected override getSearchFields(): (keyof Page)[] {
    return ['title', 'slug'];
  }

  protected override getFindAllOptions() {
    return { relations: { sections: true } };
  }

  protected override getFindOneOptions(id: number) {
    return {
      where: { id },
      relations: { sections: true },
      order: { sections: { sortOrder: 'ASC' as const } },
    };
  }
}
