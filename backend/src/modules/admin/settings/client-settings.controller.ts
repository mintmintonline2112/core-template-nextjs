import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';
import { AppCacheService } from 'src/common/cache/app-cache.service';
import { CACHE_NS } from 'src/common/cache/cache-keys';
import { applyTranslations, normalizeLang } from 'src/common/i18n/translations';
import { SettingsService } from './settings.service';

@ApiTags('Client - Settings')
@Controller('client/settings')
export class ClientSettingsController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly cache: AppCacheService,
  ) {}

  /**
   * `?lang=zh` → merge key `translations.zh.*` (siteTitle, siteDescription...)
   * đè lên giá trị gốc. `translations` bản thân vẫn được trả để admin đọc.
   */
  @Public()
  @Get()
  findAll(@Query('lang') langRaw?: string) {
    const lang = normalizeLang(langRaw);
    return this.cache.wrap(CACHE_NS.settings, `all:${lang}`, async () => {
      const all = await this.settingsService.getAll();
      return applyTranslations(all as { translations?: unknown }, lang);
    });
  }
}
