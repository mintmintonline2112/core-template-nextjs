import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

/**
 * Thin wrapper over cache-manager that adds:
 *  - get-or-compute (`wrap`)
 *  - namespace invalidation via a version counter (`invalidate`)
 *
 * The version trick lets us drop an entire namespace with ONE write — no wildcard
 * key deletes — so it behaves identically on the in-memory store (dev) and Redis
 * (prod). Swapping the store (see app-cache.module.ts) needs zero changes here.
 */
@Injectable()
export class AppCacheService {
  /** Default entry TTL (ms) — short, so even without invalidation staleness is bounded. */
  static readonly DEFAULT_TTL = 120_000; // 2 minutes
  /** Version keys outlive entries; if one ever expires, readers safely restart at v1. */
  private static readonly VERSION_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  /** Build a stable, order-independent key part from a params object (or scalar). */
  static keyOf(input: Record<string, unknown> | string | number): string {
    if (input === null || typeof input !== 'object') return String(input);
    const obj = input as Record<string, unknown>;
    const parts = Object.keys(obj)
      .filter((k) => obj[k] !== undefined && obj[k] !== null && obj[k] !== '')
      .sort()
      .map((k) => `${k}=${String(obj[k])}`);
    return parts.length ? parts.join('&') : 'default';
  }

  private versionKey(ns: string): string {
    return `${ns}:__ver`;
  }

  private async version(ns: string): Promise<number> {
    return (await this.cache.get<number>(this.versionKey(ns))) ?? 1;
  }

  /** Return cached value for (ns, keyPart) or compute, store and return it. */
  async wrap<T>(
    ns: string,
    keyPart: string,
    producer: () => Promise<T>,
    ttl: number = AppCacheService.DEFAULT_TTL,
  ): Promise<T> {
    const ver = await this.version(ns);
    const key = `${ns}:v${ver}:${keyPart}`;

    const hit = await this.cache.get<T>(key);
    if (hit !== undefined && hit !== null) return hit;

    const data = await producer();
    await this.cache.set(key, data, ttl);
    return data;
  }

  /**
   * Invalidate every entry in a namespace by bumping its version, AND purge the
   * matching storefront (Next.js) fetch-cache tag on-demand so the public pages
   * refresh instantly instead of waiting for their time-based revalidate.
   */
  async invalidate(ns: string): Promise<void> {
    const ver = await this.version(ns);
    await this.cache.set(this.versionKey(ns), ver + 1, AppCacheService.VERSION_TTL);

    // namespace 'client:products' → Next tag 'products'
    this.revalidateStorefront(ns.replace(/^client:/, ''));
  }

  /**
   * Tell the Next storefront to drop a fetch-cache tag. Fire-and-forget: never
   * block or fail the admin write if the storefront is unreachable/unconfigured.
   */
  private revalidateStorefront(tag: string): void {
    const base = process.env.STOREFRONT_URL;
    const secret = process.env.REVALIDATE_SECRET;
    if (!base || !secret) return; // not configured (e.g. dev without env) → skip

    void fetch(`${base}/api/revalidate`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-revalidate-secret': secret,
      },
      body: JSON.stringify({ tags: [tag] }),
    }).catch(() => {
      /* storefront down / network blip — ignore, time-based revalidate still covers it */
    });
  }
}
