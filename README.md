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

## Deploy (VPS — aaPanel)

Sơ đồ trên server:

| Thành phần | Giá trị |
|---|---|
| Code | `/www/wwwroot/primenuts.vn` (git clone repo này) |
| Node project 1 | `primenuts_api` — Path `backend/`, Run opt `start:prod`, Port **3010** |
| Node project 2 | `primenuts_web` — Path `frontend-next/`, Run opt `start`, Port **3001**, Domain `primenuts.vn` |
| Nginx (site primenuts.vn) | `location /api` và `location /uploads` → proxy `http://127.0.0.1:3010` |
| Env | `backend/.env` và `frontend-next/.env.local` — chỉ tồn tại trên server, không có trong git |
| Database | MySQL `primenuts` (tạo trong panel → Databases) |

### Cập nhật code (deploy bản mới)

**Một lệnh duy nhất:**

```bash
bash /www/wwwroot/primenuts.vn/deploy.sh
```

Script làm hết: `git pull` → build backend → migration + seed → build frontend
→ restart 2 app → kiểm tra site/api còn sống. Frontend được build ra thư mục tạm
rồi mới tráo vào `.next`, nên site **không bị trắng trang** giữa lúc build
(lỗi "Application error: a client-side exception" trước đây là do build đè trực tiếp).

Chạy lần đầu trên máy mới, nếu git báo `dubious ownership` thì cấp phép một lần:

```bash
git config --global --add safe.directory /www/wwwroot/primenuts.vn
```

Ghi chú:

- `npm install` chỉ cần khi `package.json` đổi; `db:run:prod`/`db:seed:prod` chạy dư
  vô hại (migration đã chạy bị bỏ qua, seed insert-only không đè dữ liệu admin sửa).
- Sửa `NEXT_PUBLIC_*` trong env của frontend → **bắt buộc** build lại rồi restart
  (giá trị bị nhúng vào code lúc build). Sửa `backend/.env` → chỉ cần restart `primenuts_api`.

### Bật auto-restart (pm2)

Node project dạng **Default Project** của aaPanel không restart được từ dòng lệnh,
nên `deploy.sh` sẽ báo "không tự restart được" và mình vẫn phải bấm 2 nút trong panel.
Chuyển sang pm2 một lần là hết phải bấm, lại tự bật lại khi app crash hoặc VPS reboot:

```bash
# 1. aaPanel → Node.js Project → bấm STOP cả 2 project (TUYỆT ĐỐI không Delete,
#    xoá là mất luôn cấu hình domain + SSL + reverse proxy của site)

# 2. Cho pm2 quản lý 2 app trên đúng port cũ
npm install -g pm2   # nếu chưa có
cd /www/wwwroot/primenuts.vn/backend      && pm2 start npm --name primenuts_api -- run start:prod
cd /www/wwwroot/primenuts.vn/frontend-next && pm2 start npm --name primenuts_web -- run start

# 3. Ghi nhớ để tự chạy lại sau khi reboot
pm2 save
pm2 startup    # chạy tiếp dòng lệnh mà nó in ra
```

Xong bước này thì `bash deploy.sh` là tự động 100%. Kiểm tra: `pm2 ls`, xem log:
`pm2 logs primenuts_web`. Nginx không cần đổi gì vì vẫn proxy vào 127.0.0.1:3001/3010.

### Cache

Nội dung sửa từ admin tự cập nhật ra site: backend ping revalidate ngay khi lưu,
ngoài ra ISR tự làm mới mỗi **60 giây** — bình thường không phải làm gì.

**Xả cache nội dung thủ công** (khi site hiển thị dữ liệu cũ) — chạy trên VPS,
phải gọi thẳng port 3001 vì `https://primenuts.vn/api` đã bị nginx chuyển cho backend:

```bash
curl -X POST http://127.0.0.1:3001/api/revalidate \
  -H "x-revalidate-secret: <REVALIDATE_SECRET trong frontend-next/.env.local>" \
  -H "Content-Type: application/json" \
  -d '{"tags":["pages","blog-posts","menu","settings"]}'
```

**Xả cache toàn bộ** (nghi ngờ build cũ/cache hỏng):

```bash
cd /www/wwwroot/primenuts.vn/frontend-next && rm -rf .next && npm run build
```
rồi restart `primenuts_web` trong panel.

### Sự cố thường gặp

- **Start báo `EADDRINUSE ... port 3001/3010`**: còn tiến trình cũ chiếm port —
  `fuser -k 3001/tcp` (hoặc `3010/tcp`) rồi Start lại từ panel.
- **Form ngoài site báo lỗi CORS/Network**: kiểm tra `FRONTEND_URL` trong
  `backend/.env` phải chứa `https://primenuts.vn` và 2 block proxy `/api`,
  `/uploads` còn trong config nginx của site.
- **Sau reboot VPS site chết**: vào panel Start lại 2 project.
- Test nhanh: `curl -s https://primenuts.vn/api` trả JSON 404 của Nest = proxy OK;
  trả HTML = proxy mất.
