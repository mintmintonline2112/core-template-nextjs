# Prime Nuts USA

Website for Prime Nuts USA — California almond supply for U.S. and global markets.

## Structure

```
primenutsvn/
├── frontend-next/    # Website + admin CMS (Next.js 15) — bản chính thức, nối backend
├── backend/          # NestJS + TypeORM/MySQL CMS API — xem backend/README.md
└── deploy.sh         # Deploy lên VPS bằng một lệnh
```

Trên máy dev còn `frontend/` (bản demo tĩnh ban đầu, giữ làm tham chiếu thiết kế)
và `skills/`, `tools/` (công cụ Claude). Ba thư mục này **cố ý không đưa vào git**
— chúng không thuộc sản phẩm và trước đây khiến mỗi lần VPS `git pull` phải kéo
thêm ~10 MB. Xem `.gitignore` ở gốc.

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
trực tiếp vào thư mục chuẩn `.next` → restart 2 app → kiểm tra site/api còn sống.
Không đổi tên output sau build vì manifest runtime của Next.js phụ thuộc `distDir`;
đổi `.next-build` thành `.next` có thể khiến `/_next/static` trả 400.

Chạy lần đầu trên máy mới, nếu git báo `dubious ownership` thì cấp phép một lần:

```bash
git config --global --add safe.directory /www/wwwroot/primenuts.vn
```

Ghi chú:

- `npm install` chỉ cần khi `package.json` đổi; `db:run:prod`/`db:seed:prod` chạy dư
  vô hại (migration đã chạy bị bỏ qua, seed insert-only không đè dữ liệu admin sửa).
- Sửa `NEXT_PUBLIC_*` trong env của frontend → **bắt buộc** build lại rồi restart
  (giá trị bị nhúng vào code lúc build). Sửa `backend/.env` → chỉ cần restart `primenuts_api`.

### pm2 là tay quản duy nhất (đã chuyển từ 2026-09-10)

2 app chạy bằng **pm2** (`primenuts_api` cổng 3010, `primenuts_web` cổng 3001).
`deploy.sh` restart qua pm2, tự tạo app nếu pm2 chưa có, và tự kill tiến trình lạ
đang chiếm cổng trước khi restart.

**Hai project cùng tên trong aaPanel → Node.js Project phải để STOPPED** (không Delete —
xoá là mất domain + SSL + reverse proxy). Đừng bấm Start ở đó nữa: panel sẽ tranh cổng
với pm2, app của pm2 crash-loop (cột `↺` trong `pm2 ls` tăng liên tục, status `errored`).

Lệnh hay dùng:

```bash
pm2 ls                              # trạng thái, cột ↺ phải đứng yên
pm2 logs primenuts_web --lines 50   # log app (đổi tên app tuỳ ý)
pm2 restart primenuts_api           # restart tay 1 app
ss -tlnp | grep -E ':(3001|3010)\b' # ai đang giữ 2 cổng — phải là con của pm2
```

Lần đầu cài pm2 trên máy mới:

```bash
npm install -g pm2
cd /www/wwwroot/primenuts.vn/backend       && pm2 start npm --name primenuts_api -- run start:prod
cd /www/wwwroot/primenuts.vn/frontend-next && pm2 start npm --name primenuts_web -- run start
pm2 save
pm2 startup    # chạy tiếp dòng lệnh nó in ra → tự bật lại sau reboot
```

Nginx không cần đổi gì vì vẫn proxy vào 127.0.0.1:3001/3010.

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

- **App pm2 `errored`, cột ↺ tăng liên tục / log báo `EADDRINUSE :::3001|3010`**:
  cổng đang bị project cùng tên trong aaPanel chiếm. Vào panel bấm **Stop** project đó,
  rồi `pm2 restart primenuts_web` (hoặc `_api`). `bash deploy.sh` cũng tự dẹp.
- **502 Bad Gateway ngay sau deploy**: chỉ là vài giây app đang khởi động lại —
  chờ 10s rồi Ctrl+F5. Kéo dài quá 1 phút thì `pm2 ls` + `pm2 logs`.
- **Form ngoài site báo lỗi CORS/Network**: kiểm tra `FRONTEND_URL` trong
  `backend/.env` phải chứa `https://primenuts.vn` và 2 block proxy `/api`,
  `/uploads` còn trong config nginx của site.
- **Sau reboot VPS site chết**: `pm2 resurrect` (đã `pm2 startup` thì tự lên, không cần).
  Tuyệt đối không Start từ panel.
- **Sửa DB bằng SQL trực tiếp mà site không đổi**: backend cache 2 phút, sửa qua admin
  thì tự xoá cache, sửa bằng SQL thì `pm2 restart primenuts_api` hoặc chờ 2 phút.
- Test nhanh: `curl -s https://primenuts.vn/api` trả JSON 404 của Nest = proxy OK;
  trả HTML = proxy mất.
