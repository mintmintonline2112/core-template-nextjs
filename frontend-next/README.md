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

```
src/
├── app/
│   ├── (site)/          # Site public: / , /products, /news, /news/[slug], /contact
│   ├── admin/           # Dashboard CMS (copy từ dentis-next, đã adapt en/vi)
│   └── api/revalidate/  # Backend ping để drop fetch-cache khi admin sửa nội dung
├── components/site/     # Header, Footer, WorldMap, SourcingSlider, forms, SiteEffects
├── admin/               # Framework admin: generic-form, data-table, rich-text, RBAC…
├── lib/                 # api, cms, menu, settings, sanitize, env, i18n (en/vi)
├── config/site-menu.ts  # Menu fallback khi API lỗi
└── styles/              # site.css (port từ bản tĩnh) + admin.css
```

## Nối backend

- Menu header: `GET /api/client/menu` (fallback tĩnh khi lỗi)
- Trang: `GET /api/client/pages/:slug` (metadata + nội dung sửa được từ admin)
- News: `GET /api/client/blog-posts` (+ `/slug/:slug`, categories) — lọc, phân trang
- Form báo giá: `POST /api/client/quote-requests` · Form liên hệ: `POST /api/client/contact`
- Admin đăng nhập bằng tài khoản staff của backend (seed: admin@gmail.com / admin#123)

Site render tiếng Anh (bản dịch phụ 'vi' qua cột translations). Ảnh bài viết
serve từ backend `/uploads`; ảnh tĩnh của site nằm trong `public/images`.
