import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { AppCacheService } from 'src/common/cache/app-cache.service';
import { CACHE_NS } from 'src/common/cache/cache-keys';
import { normalizeLang } from 'src/common/i18n/translations';
import { MenuItem } from './menu-item.entity';
import { MenuItemsService } from './menu-items.service';

@ApiTags('Client - Menu')
@Controller('client/menu')
export class ClientMenuController {
  constructor(
    private readonly menuItemsService: MenuItemsService,
    private readonly cache: AppCacheService,
  ) {}

  @Public()
  @Get()
  async findTree(@Query('lang') langRaw?: string): Promise<MenuItem[]> {
    const lang = normalizeLang(langRaw);
    return this.cache.wrap(CACHE_NS.menu, `tree:${lang}`, () =>
      this.menuItemsService.findPublicTree(lang),
    );
  }
}
