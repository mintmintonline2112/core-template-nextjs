# Prime Nuts USA — Frontend (Next.js)

Website + trang quản trị CMS cho Prime Nuts USA, dựng theo kiến trúc dentis-next
(Next.js 15 App Router, React 19) và nối với `backend/` (NestJS).

## Chạy

```
npm install        # hoặc đã có sẵn node_modules
npm run dev        # http://localhost:3001 (site) · /admin (quản trị)
npm run build && npm start
```

Cấu hình `.env.local` (xem `.env.example`): `API_URL` / `NEXT_PUBLIC_API_URL`
trỏ về backend (`http://localhost:3010/api`), `REVALIDATE_SECRET` khớp backend.

## Cấu trúc

Theo chuẩn App Router: **route groups** `(group)` gom layout mà không đổi URL,
**private folders** `_folder` chứa code không phải route, đặt cạnh route dùng nó.

```
src/
├── app/
│   ├── layout.tsx                 # Root layout (metadata, site.css)
│   ├── (site)/                    # Site public — URL: / , /products, /news, /news/[slug], /contact, /[slug]
│   │   ├── layout.tsx             # Header (menu CMS) + Footer + SiteEffects
│   │   ├── _components/           # Header, Footer, Brand, WorldMap, SourcingSlider, forms, sections/…
│   │   └── _lib/                  # cms.ts, menu.ts, sanitize.ts, site-menu.ts (fallback menu)
│   ├── admin/                     # Dashboard CMS — URL: /admin/…
│   │   ├── layout.tsx             # AuthProvider + React Query + admin.css
│   │   ├── login/                 # /admin/login (+ _components/LoginScreen)
│   │   ├── (protected)/           # Cần đăng nhập — layout.tsx bọc AdminShell
│   │   │   └── <feature>/         # page.tsx, create/, edit/[id]/, _components/ (form, list), _lib/ (*.service.ts)
│   │   ├── _auth/                 # AuthProvider
│   │   ├── _layout/               # AdminShell, AdminSidebar, AdminProviders, navigation
│   │   ├── _components/           # data-table, generic-form, rich-text-editor, library-picker, image-compress-dialog…
│   │   └── _lib/                  # admin-api, crud-service, pagination, session, utils, confirm, cms-shared, seo/translation-fields
│   └── api/revalidate/            # Backend ping để drop fetch-cache khi admin sửa nội dung
├── lib/                           # Dùng chung site + admin: env, api, settings, i18n, fonts, contact-page, video…
├── types/                         # Kiểu dữ liệu chung (cms.ts)
├── styles/                        # site.css (port từ bản tĩnh) + admin.css
└── fonts/                         # Barlow / Barlow Condensed (woff2, next/font/local)
```

Quy ước: import bằng alias `@/…` (`@/app/(site)/_lib/cms`, `@/app/admin/_lib/utils`);
file cùng thư mục dùng `./`. Service của feature này cần ở feature khác thì import
thẳng `@/app/admin/(protected)/<feature>/_lib/<x>.service`.

## Nối backend

- Menu header: `GET /api/client/menu` (fallback tĩnh khi lỗi)
- Trang: `GET /api/client/pages/:slug` (metadata + nội dung sửa được từ admin)
- News: `GET /api/client/blog-posts` (+ `/slug/:slug`, categories) — lọc, phân trang
- Form báo giá: `POST /api/client/quote-requests` · Form liên hệ: `POST /api/client/contact`
- Admin đăng nhập bằng tài khoản staff của backend (seed: admin@gmail.com / admin#123)

Site render tiếng Anh (bản dịch phụ 'vi' qua cột translations). Ảnh bài viết
serve từ backend `/uploads`; ảnh tĩnh của site nằm trong `public/images`.
