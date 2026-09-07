import { Controller, Get, Query } from '@nestjs/common';
import { Public } from 'src/common/decorators/public.decorator';
import { AppCacheService } from 'src/common/cache/app-cache.service';
import { CACHE_NS } from 'src/common/cache/cache-keys';
import { normalizeLang } from 'src/common/i18n/translations';
import { ClientBlogPostsService } from './blog-posts.service';

@Controller('client/blog-categories')
export class ClientBlogCategoriesController {
  constructor(
    private readonly postsService: ClientBlogPostsService,
    private readonly cache: AppCacheService,
  ) {}

  @Public()
  @Get()
  async findAll(@Query('lang') langRaw?: string) {
    const lang = normalizeLang(langRaw);
    return this.cache.wrap(
      CACHE_NS.blogPosts,
      `categories:active:${lang}`,
      () => this.postsService.findActiveCategories(lang),
    );
  }
}
