/**
 * Helper dựng và so khớp đường dẫn (URL) — dùng chung cho site public và admin.
 * Bảng route thực tế nằm ở `src/config/routes.ts`; ở đây chỉ có logic thuần.
 */

export type RouteId = number | string;

/** Ghép các đoạn thành 1 path, bỏ '/' thừa: joinPath('/admin', 'pages/', '/1') → '/admin/pages/1'. */
export function joinPath(...segments: Array<string | number>): string {
  const joined = segments
    .map((s) => String(s).trim())
    .filter(Boolean)
    .map((s) => s.replace(/^\/+|\/+$/g, ''))
    .filter(Boolean)
    .join('/');
  return `/${joined}`;
}

/** Thêm neo #anchor: withHash('/products', 'sizes') → '/products#sizes'. */
export function withHash(path: string, anchor: string): string {
  return anchor ? `${path}#${anchor.replace(/^#/, '')}` : path;
}

/** Thêm query string, bỏ qua giá trị rỗng/undefined: withQuery('/news', { category: 'x' }) → '/news?category=x'. */
export function withQuery(
  path: string,
  params: Record<string, string | number | boolean | null | undefined>,
): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    qs.set(key, String(value));
  }
  const query = qs.toString();
  return query ? `${path}?${query}` : path;
}

/** Bộ route chuẩn cho 1 resource CRUD: list / create / edit/[id]. */
export interface CrudRoutes {
  readonly list: string;
  readonly create: string;
  readonly edit: (id: RouteId) => string;
}

/**
 * createCrudRoutes('/admin', 'blog-posts') →
 *   { list: '/admin/blog-posts', create: '/admin/blog-posts/create', edit: (id) => '/admin/blog-posts/edit/1' }
 * Đổi tên segment `create` / `edit` ở đây nếu muốn đổi đồng loạt cho mọi resource.
 */
export function createCrudRoutes(base: string, segment: string): CrudRoutes {
  const list = joinPath(base, segment);
  return {
    list,
    create: joinPath(list, 'create'),
    edit: (id: RouteId) => joinPath(list, 'edit', id),
  };
}

/**
 * Path hiện tại có thuộc về `href` không (dùng tô sáng menu đang active).
 * - Trang chủ chỉ active khi khớp đúng '/' và href không có neo.
 * - Còn lại: khớp chính xác hoặc là trang con (`/admin/pages/edit/1` thuộc `/admin/pages`).
 */
export function isActivePath(pathname: string, href: string, home = '/'): boolean {
  const base = href.split(/[#?]/)[0] || home;
  if (base === home) return pathname === home && !href.includes('#');
  return pathname === base || pathname.startsWith(`${base}/`);
}
