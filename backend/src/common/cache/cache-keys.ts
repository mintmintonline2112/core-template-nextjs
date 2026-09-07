/**
 * Cache namespaces for the public storefront reads. A namespace groups all cache
 * entries for one entity so it can be invalidated in one shot (version bump).
 */
export const CACHE_NS = {
  blogPosts: 'client:blog-posts',
  pages: 'client:pages',
  menu: 'client:menu',
  settings: 'client:settings',
} as const;

export type CacheNamespace = (typeof CACHE_NS)[keyof typeof CACHE_NS];
