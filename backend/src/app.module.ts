import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppConfigModule } from './config/app-config.module';
import { AppCacheModule } from './common/cache/app-cache.module';
import { DatabaseModule } from './database/database.module';
import { AdminModule } from './modules/admin/admin.module';
import { ClientModule } from './modules/client/client.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Rate-limit config (storage + default). Enforced only where ThrottlerGuard is
    // applied (sensitive auth routes) — NOT global, to avoid throttling SSR fetches
    // which all originate from the Next server's single IP.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    AppConfigModule,
    AppCacheModule,
    DatabaseModule,
    AdminModule,
    ClientModule,
  ],
})
export class AppModule {}
