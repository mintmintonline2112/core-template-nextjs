# Core Template — Next.js + NestJS CMS

Khung mẫu để dựng website doanh nghiệp: website public (Next.js) + dashboard quản trị
+ API/CMS (NestJS + TypeORM + MySQL/MariaDB). Clone khung này ra là có sẵn trang, blog,
menu, thư viện ảnh, form liên hệ, phân quyền nhân viên và script deploy.

```
<ten-site>/
├── frontend-next/    # Website public + dashboard quản trị (Next.js 15)
├── backend/          # API + CMS (NestJS + TypeORM) — xem backend/README.md
└── deploy.sh         # Deploy lên VPS bằng một lệnh
```

## Có sẵn những gì

| Nhóm | Nội dung |
|---|---|
| Nội dung | Trang động ghép từ section, blog + chuyên mục, menu nhiều cấp, thư viện ảnh (tự nén khi upload) |
| Khách hàng | Form liên hệ, form yêu cầu báo giá, gửi mail thông báo, thông báo trong dashboard |
| Quản trị | Đăng nhập, phiên đăng nhập nhiều thiết bị, vai trò + phân quyền theo nhân viên |
| Giao diện | ~19 component bố cục dùng lại được, 4 màu thương hiệu chỉnh trong dashboard, font chỉnh trong dashboard |
| SEO | Tiêu đề/mô tả theo từng trang, canonical, Open Graph, sitemap, robots |
| Vận hành | `deploy.sh` (build + migration + restart + kiểm tra), script đồng bộ bố cục giữa 2 database |

## Tạo site mới từ khung này

1. Tạo repo mới, clone khung này vào rồi trỏ `origin` sang repo mới.
2. Đổi nhận diện — tìm và thay trong các file sau:
   - `frontend-next/src/config/contact.ts` — địa chỉ, điện thoại, email, giờ mở cửa
   - `frontend-next/src/lib/settings.ts` — tên thương hiệu mặc định
   - `frontend-next/src/app/(site)/_lib/seo.ts` — tiêu đề, mô tả, ảnh chia sẻ mặc định
   - `frontend-next/src/lib/brand-colors.ts` — 4 màu thương hiệu
   - `frontend-next/public/favicon.svg`, `public/images/` — logo và ảnh
3. Viết lại nội dung khởi tạo cho đúng ngành của khách:
   `backend/src/database/seeding/seeds/page.seed.ts`, `menu.seed.ts`, `blog.seed.ts`.
   Xong chạy `cd backend && npm run content:export` để sinh lại bản dự phòng.
4. Đổi tên app và cổng trong `deploy.sh`, `frontend-next/package.json` (`-p <cổng>`),
   `backend/.env` (`PORT`).
5. Tạo database riêng, chạy `npm run db:run && npm run db:seed`.
6. Đổi mật khẩu tài khoản admin seed ngay sau lần đăng nhập đầu tiên.

## Chạy trên máy dev

1. **Backend:** `cd backend`, tạo `.env` từ `.env.example` (DB, JWT, FRONTEND_URL), rồi
   `npm install`, `npm run db:run && npm run db:seed`, `npm run start:dev`
   → API `http://localhost:3012/api`, Swagger `/docs`
2. **Frontend:** `cd frontend-next`, tạo `.env.local` từ `.env.example`, rồi
   `npm install && npm run dev`
   → website `http://localhost:3005`, quản trị `/admin`
   (tài khoản seed: xem `backend/src/database/seeding/seeds/staff.seed.ts`)

Kiểm tra trước khi commit: `npx tsc --noEmit`, `npm run lint`, `npm run lint:layers`
(frontend) và `npx tsc --noEmit -p tsconfig.json` (backend).

## Nội dung & component (CMS)

Website ghép từ các **section**; mỗi section dùng một **component** = một *bố cục*
(đặt tên theo hình dạng: `hero`, `faq`, `media-cards`, `steps`…), biến thể hiển thị
là `metadata.layout` (đổi layout, dữ liệu giữ nguyên). Section key là id neo trên
trang (`/#gioi-thieu`), cố định sau khi tạo.

- Registry component: `frontend-next/src/app/(site)/_components/sections/index.ts`
  (helper chung ở `shared.tsx`; tên cũ vẫn nhận qua `LEGACY_COMPONENTS`).
- Danh mục cho admin (ô nhập liệu, bố cục, kiểm tra dữ liệu):
  `backend/src/database/seeding/seeds/section-definition.seed.ts`.
- **Nội dung mặc định chỉ nằm ở** `backend/src/database/seeding/seeds/page.seed.ts`
  (component không có chữ mặc định). Sửa seed xong chạy `cd backend && npm run content:export`
  để sinh lại bản dự phòng `frontend-next/src/content/cms-fallback.json` (website dùng khi
  API lỗi) — không sửa tay file JSON này.
- Thêm bố cục mới = thêm case trong component + option `layout` trong seed + CSS.
  Thêm component mới = 1 file + 1 dòng registry + 1 entry seed + hình minh hoạ trong
  `admin/(protected)/page-sections/_components/component-picker.tsx`.

## Deploy (VPS — aaPanel / nginx)

Thay `<ten-site>` bằng tên thật của site. Mỗi site trên cùng một VPS phải dùng
**tên app và cổng riêng**, không trùng site khác.

| Thành phần | Giá trị |
|---|---|
| Code | `/www/wwwroot/<ten-site>` (git clone repo của site) |
| Node app 1 | `<ten-site>_api` — thư mục `backend/`, lệnh `start:prod`, cổng **3012** |
| Node app 2 | `<ten-site>_web` — thư mục `frontend-next/`, lệnh `start`, cổng **3005** |
| Nginx | `location /api` và `location /uploads` → proxy `http://127.0.0.1:3012` |
| Env | `backend/.env` và `frontend-next/.env.local` — chỉ có trên server, không đưa vào git |
| Database | Tạo trong panel → Databases |

### Cập nhật code (deploy bản mới)

```bash
bash /www/wwwroot/<ten-site>/deploy.sh
```

Script làm hết: `git pull` → build backend → migration + seed → build frontend
trực tiếp vào thư mục chuẩn `.next` → restart 2 app → kiểm tra site/api còn sống.
Không đổi tên output sau build vì manifest runtime của Next.js phụ thuộc `distDir`;
đổi `.next-build` thành `.next` có thể khiến `/_next/static` trả 400.

Chạy lần đầu trên máy mới, nếu git báo `dubious ownership` thì cấp phép một lần:

```bash
git config --global --add safe.directory /www/wwwroot/<ten-site>
```

Ghi chú:

- `npm install` chỉ cần khi `package.json` đổi; `db:run:prod`/`db:seed:prod` chạy dư
  vô hại (migration đã chạy bị bỏ qua, seed insert-only không đè dữ liệu admin sửa).
- Sửa `NEXT_PUBLIC_*` trong env của frontend → **bắt buộc** build lại rồi restart
  (giá trị bị nhúng vào code lúc build). Sửa `backend/.env` → chỉ cần restart app API.

### pm2 là tay quản duy nhất

2 app chạy bằng **pm2**. `deploy.sh` restart qua pm2, tự tạo app nếu pm2 chưa có,
và tự kill tiến trình lạ đang chiếm cổng trước khi restart.

**Nếu tạo project cùng tên trong aaPanel → Node.js Project phải để STOPPED** (không Delete —
xoá là mất domain + SSL + reverse proxy). Đừng bấm Start ở đó: panel sẽ tranh cổng
với pm2, app của pm2 crash-loop (cột `↺` trong `pm2 ls` tăng liên tục, status `errored`).

```bash
pm2 ls                                 # trạng thái, cột ↺ phải đứng yên
pm2 logs <ten-site>_web --lines 50     # log app
pm2 restart <ten-site>_api             # restart tay 1 app
ss -tlnp | grep -E ':(3005|3012)\b'    # ai đang giữ 2 cổng — phải là con của pm2
```

Lần đầu cài pm2 trên máy mới:

```bash
npm install -g pm2
cd /www/wwwroot/<ten-site>/backend       && pm2 start npm --name <ten-site>_api -- run start:prod
cd /www/wwwroot/<ten-site>/frontend-next && pm2 start npm --name <ten-site>_web -- run start
pm2 save
pm2 startup    # chạy tiếp dòng lệnh nó in ra → tự bật lại sau reboot
```

### Cache

Nội dung sửa từ admin tự cập nhật ra site: backend ping revalidate ngay khi lưu,
ngoài ra ISR tự làm mới mỗi **60 giây** — bình thường không phải làm gì.

**Xả cache nội dung thủ công** (khi site hiển thị dữ liệu cũ) — chạy trên VPS,
phải gọi thẳng cổng của web vì `/api` đã bị nginx chuyển cho backend:

```bash
curl -X POST http://127.0.0.1:3005/api/revalidate \
  -H "x-revalidate-secret: <REVALIDATE_SECRET trong frontend-next/.env.local>" \
  -H "Content-Type: application/json" \
  -d '{"tags":["pages","blog-posts","menu","settings"]}'
```

**Xả cache toàn bộ** (nghi ngờ build cũ/cache hỏng):

```bash
cd /www/wwwroot/<ten-site>/frontend-next && rm -rf .next && npm run build
```

rồi restart app web.

### Sự cố thường gặp

- **App pm2 `errored`, cột ↺ tăng liên tục / log báo `EADDRINUSE`**: cổng đang bị
  project cùng tên trong aaPanel chiếm. Vào panel bấm **Stop** project đó rồi restart lại
  bằng pm2. `bash deploy.sh` cũng tự dẹp.
- **502 Bad Gateway ngay sau deploy**: chỉ là vài giây app đang khởi động lại —
  chờ 10s rồi Ctrl+F5. Kéo dài quá 1 phút thì `pm2 ls` + `pm2 logs`.
- **Form ngoài site báo lỗi CORS/Network**: kiểm tra `FRONTEND_URL` trong
  `backend/.env` phải chứa đúng tên miền, và 2 block proxy `/api`, `/uploads`
  còn trong config nginx của site.
- **Sau reboot VPS site chết**: `pm2 resurrect` (đã `pm2 startup` thì tự lên).
  Tuyệt đối không Start từ panel.
- **Copy ảnh vào `uploads/` bằng FTP mà admin không thấy**: thư viện đọc từ bảng
  `media` chứ không quét đĩa mỗi lần. Vào Thư viện bấm **Quét lại** (hoặc restart app API,
  backend tự đồng bộ lúc khởi động).
- **Đang dùng admin thì bị đá ra đăng nhập lại**: mỗi tài khoản giữ tối đa 10
  phiên; đăng nhập ở máy thứ 11 sẽ đẩy phiên cũ nhất ra. Phiên hết hạn sau 7 ngày
  không dùng, và tối đa 30 ngày kể từ lúc đăng nhập dù dùng liên tục.
- **Cookie đăng nhập không có cờ bảo mật**: kiểm tra `NODE_ENV=production` trong
  `backend/.env` trên VPS, rồi restart app API.
- **Sửa DB bằng SQL trực tiếp mà site không đổi**: backend cache 2 phút, sửa qua admin
  thì tự xoá cache, sửa bằng SQL thì restart app API hoặc chờ 2 phút.
- Test nhanh: `curl -s https://<ten-mien>/api` trả JSON 404 của Nest = proxy OK;
  trả HTML = proxy mất.
