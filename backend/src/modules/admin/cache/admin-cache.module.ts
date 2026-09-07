import { Module } from '@nestjs/common';
import { AdminCacheController } from './admin-cache.controller';

// AppCacheService is provided globally (AppCacheModule), so no imports needed.
@Module({
  controllers: [AdminCacheController],
})
export class AdminCacheModule {}
