# Prime Nuts USA — Backend

CMS & API cho website Prime Nuts USA (NestJS 11 + TypeORM/MySQL): quản lý trang
nội dung (pages/sections), tin tức (blog), menu, cài đặt site, liên hệ và
**yêu cầu báo giá B2B** (quote requests), kèm RBAC staff/roles/permissions.

- API prefix: `/api` — Swagger: `http://localhost:<PORT>/docs`
- Endpoint công khai cho website: `POST /api/client/contact`, `POST /api/client/quote-requests`,
  `GET /api/client/pages/:slug`, `GET /api/client/blog-posts`
- Nội dung gốc tiếng Anh; bản dịch (vi) lưu ở cột JSON `translations`

------------------------------------------------------------------------------------------------------------------------------------------------

### 1. Quy trình làm việc với Git (Git Flow)

Tuân thủ các bước dưới đây để đảm bảo an toàn dữ liệu, kiểm soát code khi dùng AI và tránh xung đột khi làm việc nhóm.

**Bước 1: Khởi tạo nhánh tính năng**
Luôn bắt đầu từ nhánh develop để lấy code mới nhất:
- git checkout develop
- git pull origin develop
- git checkout -b feature/ten-tinh-nang

**Bước 2: Kiểm soát Code khi dùng AI hỗ trợ**
Trong quá trình làm, nếu bạn đã hoàn thành một phần và muốn nhờ AI thực hiện tiếp nhưng sợ không kiểm soát được các thay đổi:
1. Chạy `git add .` để đánh dấu những phần bạn đã làm xong (Staged).
2. Sau khi AI thực hiện xong, review và test lại các file AI mới sửa so với phần đã add trước đó.
3. Nếu mọi thứ ổn định, tiếp tục `git add .` để tổng hợp tất cả.

**Bước 3: Cập nhật code và xử lý xung đột (Conflict)**
Trước khi push code lên, phải đảm bảo code tương thích với bản mới nhất trên server:
1. Chạy `git add .` sau đó `git stash` để cất tạm code hiện tại vào bộ nhớ đệm.
2. Chạy `
` để lấy code mới nhất về.
3. Chạy `git stash pop` để đưa code đang cất ra lại.
4. Nếu báo Conflict: Mở VS Code để xử lý các đoạn bị trùng lặp, sau đó `git add .` để xác nhận.

**Bước 4: Commit và Push**
Sau khi đã xác nhận mọi file sửa đổi bằng `git add .`
- git commit -m "feat: mô tả ngắn gọn tính năng"
- git push origin feature/ten-nhanh-cua-ban

**Bước 5: Tạo Pull Request (PR)**
1. Truy cập github.com, vào mục Pull Request -> New Pull Request.
2. Chọn ô Base là **develop**, ô Compare là **feature/ten-nhanh-cua-ban**.
3. Bấm Create Pull Request và chờ Review.

**Lưu ý quan trọng:**
- Tuyệt đối không tự ý Merge code.
- Mọi thay đổi sẽ được kiểm tra và test kỹ lưỡng trước tiến hành Merge vào nhánh chính.

------------------------------------------------------------------------------------------------------------------------------------------------

### 2. Cấu trúc thư mục
   Tất cả mã nguồn nằm trong thư mục src và tuân thủ các quy tắc sau:

common/base/
Nơi chứa base.entity.ts và base.service.ts. Mọi Entity và Service mới bắt buộc phải kế thừa từ các lớp cơ sở này.

configs/
Chứa file app.config.ts quản lý toàn bộ biến môi trường. Tuyệt đối không gọi process.env trực tiếp trong mã nguồn.

constants/
Chứa app.constant.ts để quản lý tập trung các biến tĩnh, Enum và thông báo lỗi.

database/
Bao gồm migrations, seeders và data-source.ts. Đây là nơi quản lý cấu trúc và dữ liệu mẫu của cơ sở dữ liệu.

modules/
Chia theo từng tính năng như Users, Roles, Staffs. Mỗi folder là một module độc lập và phải được đăng ký vào features.module.ts.

seed.ts
File thực thi riêng để đổ dữ liệu mẫu từ terminal, chạy độc lập với ứng dụng chính.

------------------------------------------------------------------------------------------------------------------------------------------------

### 3. Hệ thống Scripts
   Sử dụng lệnh npm run [tên_lệnh] để tương tác với hệ thống qua terminal.

Trước khi chạy migrations/seed lần đầu:
- Cấu hình `backend/.env` (DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME, ...)
- Tạo database `DB_NAME` trên DB server nếu chưa có

Quản lý cấu trúc bảng (Migrations)

- `npm run db:show`
  - Xem trạng thái các bản migration (đã chạy/chưa chạy).

- `npm run db:gen -- src/database/migrations/<TenMigration>`
  - Generate migration dựa trên thay đổi trong entity.
  - Ví dụ: `npm run db:gen -- src/database/migrations/AddStaffNewField`
  - Luôn mở file migration vừa tạo để review SQL trước khi chạy.

- `npm run db:create -- src/database/migrations/<TenMigration>`
  - Tạo migration rỗng để tự viết SQL/QueryRunner khi cần.

- `npm run db:run`
  - Chạy tất cả migration chưa chạy để tạo/cập nhật bảng trong database.

- `npm run db:revert`
  - Hoàn tác 1 migration gần nhất (rollback 1 bước).

Quản lý dữ liệu mẫu (Seeders)

- `npm run db:seed`
  - Đổ dữ liệu mẫu/mặc định (idempotent: nếu đã có dữ liệu thì bỏ qua).

Làm mới môi trường (Development)

- `npm run db:drop`
  - Xoá toàn bộ schema (tất cả bảng).

- `npm run db:fresh`
  - Reset toàn bộ: `db:drop` -> `db:run` -> `db:seed`.

Tình huống: bảng đang bình thường, thêm 1 field mới vào `staffs`, muốn cập nhật bảng `staffs` cho mới nhất

1. Sửa entity `Staff` (thêm field).
2. Generate migration:
   - `npm run db:gen -- src/database/migrations/UpdateStaffTable`
3. Chạy migration:
   - `npm run db:run`

Các bảng khác có bị ảnh hưởng không?
- Thông thường **không**: migration sẽ chỉ `ALTER TABLE staffs ...`.
- Các bảng khác chỉ bị ảnh hưởng nếu bạn thay đổi quan hệ/constraint/index liên quan (foreign key, unique index, join table, ...).
- Bạn luôn có thể kiểm tra nội dung file migration trước khi chạy để biết chính xác nó động vào bảng nào.

Nếu bạn muốn “tạo lại bảng staffs từ đầu”:
- Không khuyến nghị vì sẽ mất dữ liệu và có thể ảnh hưởng ràng buộc khoá ngoại.
- Cách an toàn là dùng migration để `ALTER TABLE` (thêm/sửa cột).
- Nếu buộc phải recreate, hãy tạo migration thủ công để drop/create đúng ý, hoặc reset toàn DB bằng `npm run db:fresh` (sẽ ảnh hưởng tất cả bảng).

------------------------------------------------------------------------------------------------------------------------------------------------

### 4. Nguyên tắc phát triển
   Path Alias: Luôn sử dụng đường dẫn tuyệt đối bắt đầu từ src/. Không sử dụng đường dẫn tương đối ../../.

Entity: Đặt trong thư mục entities của từng module và bắt buộc kế thừa từ BaseEntity.

Module: Mọi module mới phải được khai báo vào features.module.ts.

Database: Tuyệt đối không dùng synchronize: true. Mọi thay đổi cấu trúc bảng phải thực hiện qua Migration.

Clean Code: Sử dụng hằng số từ thư mục constants thay vì viết cứng giá trị vào logic xử lý.
