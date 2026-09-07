import { Global, Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { AppCacheService } from './app-cache.service';

/**
 * Global cache module. Default store = in-memory (no infra needed, great for dev).
 *
 * ─── Production: swap to Redis (chỉ sửa block dưới) ───────────────────────────
 *   npm i @keyv/redis
 *   import { createKeyv } from '@keyv/redis';
 *   ...
 *   CacheModule.register({
 *     isGlobal: true,
 *     ttl: AppCacheService.DEFAULT_TTL,
 *     stores: [createKeyv(process.env.REDIS_URL ?? 'redis://127.0.0.1:6379')],
 *   })
 *
 * Toàn bộ AppCacheService.wrap()/invalidate() GIỮ NGUYÊN khi đổi — chỉ store thay đổi.
 */
@Global()
@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      ttl: AppCacheService.DEFAULT_TTL,
    }),
  ],
  providers: [AppCacheService],
  exports: [AppCacheService],
})
export class AppCacheModule {}
