import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAdminAuthGuard } from 'src/common/guard/jwt-auth/jwt-auth-admin.guard';
import { AppCacheService } from 'src/common/cache/app-cache.service';
import { CACHE_NS } from 'src/common/cache/cache-keys';

const ALL_NS = [
  CACHE_NS.blogPosts,
  CACHE_NS.pages,
  CACHE_NS.menu,
  CACHE_NS.settings,
];
const tagOf = (ns: string) => ns.replace(/^client:/, '');

/**
 * Manual storefront cache purge for admins. Invalidating a namespace bumps the
 * backend cache version AND revalidates the matching Next tag (see AppCacheService),
 * so one click clears both layers. Writes already auto-invalidate via
 * InvalidateCacheInterceptor — this endpoint is the safety valve for everything
 * else (direct DB edits, re-seeds, backend restarts, misconfigured env).
 */
@ApiTags('Admin - Cache')
@ApiBearerAuth()
@UseGuards(JwtAdminAuthGuard)
@Controller('admin/cache')
export class AdminCacheController {
  constructor(private readonly cache: AppCacheService) {}

  @Post('purge')
  @ApiOperation({
    summary: 'Purge storefront caches (backend + Next). Optional: tags[].',
  })
  async purge(@Body() body: { tags?: string[] }) {
    const requestedTags = body?.tags;
    const targets =
      Array.isArray(requestedTags) && requestedTags.length
        ? ALL_NS.filter((ns) => requestedTags.includes(tagOf(ns)))
        : ALL_NS;

    await Promise.all(targets.map((ns) => this.cache.invalidate(ns)));
    return { purged: targets.map(tagOf) };
  }
}
