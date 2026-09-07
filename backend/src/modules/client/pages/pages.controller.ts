import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from 'src/common/decorators/public.decorator';
import { AppCacheService } from 'src/common/cache/app-cache.service';
import { CACHE_NS } from 'src/common/cache/cache-keys';
import { normalizeLang } from 'src/common/i18n/translations';
import { Page } from 'src/modules/admin/pages/entities/page.entity';
import { ClientPagesService } from './pages.service';

@Controller('client/pages')
export class ClientPagesController {
  constructor(
    private readonly pagesService: ClientPagesService,
    private readonly cache: AppCacheService,
  ) {}

  /** `?lang=zh` → trả bản đã merge translations.zh (fallback tiếng Việt từng field). */
  @Public()
  @Get(':slug')
  async findBySlug(
    @Param('slug') slug: string,
    @Query('lang') langRaw?: string,
  ): Promise<Page | null> {
    const lang = normalizeLang(langRaw);
    return this.cache.wrap(CACHE_NS.pages, `slug:${slug}:${lang}`, () =>
      this.pagesService.findPublishedBySlug(slug, lang),
    );
  }
}
