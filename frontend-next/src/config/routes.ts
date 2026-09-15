/**
 * Bảng đường dẫn (URL) của frontend — nguồn duy nhất cho mọi <Link>, router.push,
 * redirect, breadcrumb, sidebar… Không hardcode '/admin/…' hay '/news' ở nơi khác.
 *
 * Lưu ý: URL thật vẫn do tên thư mục trong `src/app` quyết định (file-based routing).
 * Muốn đổi 1 segment (vd. 'blog-posts' → 'posts') thì đổi ở đây VÀ đổi tên thư mục
 * `src/app/admin/(protected)/blog-posts` tương ứng; mọi link trong code tự cập nhật.
 */

import { createCrudRoutes, joinPath, withHash, withQuery } from '@/utils/route';

/* ---------------------------------------------------------------- Admin */

/** Prefix của khu quản trị — khớp thư mục `src/app/admin`. */
export const ADMIN_BASE = '/admin';

const admin = (segment: string) => joinPath(ADMIN_BASE, segment);
const adminCrud = (segment: string) => createCrudRoutes(ADMIN_BASE, segment);

export const adminRoutes = {
  root: ADMIN_BASE,
  login: admin('login'),
  dashboard: admin('dashboard'),

  // Nội dung
  blogPosts: adminCrud('blog-posts'),
  blogCategories: adminCrud('blog-categories'),
  pages: adminCrud('pages'),
  pageSections: adminCrud('page-sections'),
  menus: adminCrud('menus'),
  library: admin('library'),

  // Khách hàng
  contacts: admin('contacts'),
  contactPage: admin('contact-page'),

  // Hệ thống
  staffs: adminCrud('staffs'),
  roles: adminCrud('roles'),
  permissions: admin('permissions'),
  settings: admin('settings'),
} as const;

/* ----------------------------------------------------------------- Site */

const HOME = '/';
const PRODUCTS = '/products';
const NEWS = '/news';
const CONTACT = '/contact';

export const siteRoutes = {
  home: HOME,
  /** Neo tới 1 section trên trang chủ: /#about-map, /#how-it-works, /#request-quote… */
  homeSection: (anchor: string) => withHash(HOME, anchor),

  products: PRODUCTS,
  /** Neo tới 1 nhóm sản phẩm: /products#natural-almonds, /products#kernel-sizes… */
  productsSection: (anchor: string) => withHash(PRODUCTS, anchor),

  news: NEWS,
  newsCategory: (slug: string) => withQuery(NEWS, { category: slug }),
  /** Trang tin có lọc/phân trang: newsFiltered({ category, page }) → /news?category=x&page=2 */
  newsFiltered: (params: Record<string, string | number | null | undefined>) => withQuery(NEWS, params),
  newsPost: (slug: string) => joinPath(NEWS, slug),

  contact: CONTACT,

  /** Trang CMS động theo slug (src/app/(site)/[slug]). */
  page: (slug: string) => joinPath(slug),
} as const;
