import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable, tap } from 'rxjs';
import { AppCacheService } from '../cache/app-cache.service';

export const CACHE_NAMESPACES_KEY = 'cacheNamespaces';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

/**
 * Sau mỗi request ghi (POST/PUT/PATCH/DELETE) thành công trên controller có
 * @SetMetadata(CACHE_NAMESPACES_KEY, [...]), bump version các namespace cache
 * tương ứng — AppCacheService sẽ đồng thời ping storefront Next.js để drop
 * fetch-cache tag, nên site public thấy thay đổi ngay lập tức.
 */
@Injectable()
export class InvalidateCacheInterceptor implements NestInterceptor {
  constructor(
    private readonly reflector: Reflector,
    private readonly cache: AppCacheService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<{ method: string }>();
    if (!MUTATING_METHODS.has(request.method)) return next.handle();

    const namespaces = this.reflector.getAllAndOverride<string[] | undefined>(
      CACHE_NAMESPACES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!namespaces?.length) return next.handle();

    return next.handle().pipe(
      tap(() => {
        for (const ns of namespaces) {
          void this.cache.invalidate(ns);
        }
      }),
    );
  }
}
