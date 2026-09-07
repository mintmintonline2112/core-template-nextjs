# Prime Nuts USA

Website for Prime Nuts USA — California almond supply for U.S. and global markets.

## Structure

```
primenutsvn/
├── frontend-next/    # Website + admin CMS (Next.js 15) — bản chính thức, nối backend
├── backend/          # NestJS + TypeORM/MySQL CMS API — see backend/README.md
├── frontend/         # Bản demo tĩnh ban đầu (HTML/CSS/JS) — tham chiếu thiết kế
└── skills/, tools/   # Local Claude/dev tooling — not part of the website
```

## Quick start

1. **Backend:** `cd backend`, cấu hình `.env` (DB `primenuts`, JWT), rồi
   `npm install`, `npm run db:run && npm run db:seed`, `npm run start:dev`
   → API `http://localhost:3010/api`, Swagger `/docs`
2. **Frontend:** `cd frontend-next && npm install && npm run dev`
   → site `http://localhost:3001`, quản trị `/admin`
   (đăng nhập seed: admin@gmail.com / admin#123)
3. Bản demo tĩnh cũ: mở `frontend/index.html` trực tiếp trong trình duyệt
