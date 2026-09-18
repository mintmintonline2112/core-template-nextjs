#!/usr/bin/env bash
# ============================================================
# Deploy website lên VPS bằng MỘT lệnh:
#     bash /www/wwwroot/<ten-mien-site>/deploy.sh
#
# Tuần tự: git fetch + merge (tự gỡ vướng lock file / file upload trùng tên)
# → npm ci + build backend → migration + seed → npm ci + build frontend
# → giải phóng cổng nếu bị tiến trình lạ chiếm → restart 2 app bằng pm2
# (tự tạo nếu pm2 chưa có) → chờ app mở cổng → kiểm tra HTML + asset
# → pm2 save.
#
# QUY TẮC: 2 app CHỈ do pm2 quản. Hai project cùng tên trong aaPanel
# phải để STOPPED (không Delete — xoá là mất domain + SSL + proxy).
# Nếu panel bật lên, nó tranh cổng 3005/3012 với pm2 → app crash-loop
# (cột ↺ trong `pm2 ls` tăng liên tục). Script tự kill tiến trình
# không thuộc pm2 đang giữ cổng, nhưng panel phải Stop thì nó mới
# không bật lại.
# ============================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# ĐỔI TRƯỚC KHI DEPLOY: APP_NAME là tên riêng của site này — pm2 sẽ quản 2 tiến
# trình tên <APP_NAME>_api và <APP_NAME>_web. Một VPS chạy nhiều site thì mỗi site
# phải có APP_NAME + cổng RIÊNG, không được trùng tên/cổng với site khác.
APP_NAME="${APP_NAME:-core}"
API_NAME="${API_NAME:-${APP_NAME}_api}"; API_PORT="${API_PORT:-3012}"
WEB_NAME="${WEB_NAME:-${APP_NAME}_web}"; WEB_PORT="${WEB_PORT:-3005}"
APP_USER="${APP_USER:-www}"

say()  { printf '\n\033[1;32m==> %s\033[0m\n' "$1"; }
warn() { printf '\033[1;33m!!  %s\033[0m\n' "$1"; }
die()  { printf '\033[1;31mXX  %s\033[0m\n' "$1"; exit 1; }

command -v pm2 >/dev/null 2>&1 || die "Chưa có pm2 → npm install -g pm2 rồi chạy lại."

# Chốt an toàn: cổng khai báo ở trên phải đúng là cổng app mở. Lệch là free_port
# có thể kill nhầm tiến trình của site khác trên cùng VPS.
grep -q "next start -p $WEB_PORT\"" "$ROOT/frontend-next/package.json" \
  || die "frontend-next/package.json: script start phải là 'next start -p $WEB_PORT' (khớp WEB_PORT)."
[ -f "$ROOT/backend/.env" ] || die "Chưa có backend/.env — tạo từ backend/.env.example trước."
grep -qE "^PORT=${API_PORT}[[:space:]]*$" "$ROOT/backend/.env" \
  || die "backend/.env phải có dòng PORT=$API_PORT (khớp API_PORT)."
{ [ -f "$ROOT/frontend-next/.env.local" ] || [ -f "$ROOT/frontend-next/.env" ]; } \
  || die "Chưa có frontend-next/.env.local — tạo từ frontend-next/.env.example trước."

# PID đang giữ cổng TCP (rỗng nếu cổng trống)
port_pid() { ss -tlnpH "sport = :$1" 2>/dev/null | grep -oP 'pid=\K[0-9]+' | head -1 || true; }

# $1 có phải con/cháu (tối đa 5 đời) của $2 không
is_descendant_of() {
  local p="$1" i
  for i in 1 2 3 4 5; do
    { [ -z "$p" ] || [ "$p" = "1" ]; } && return 1
    [ "$p" = "$2" ] && return 0
    p="$(ps -o ppid= -p "$p" 2>/dev/null | tr -d ' ' || true)"
  done
  return 1
}

# Cổng của app bị tiến trình KHÔNG thuộc pm2 chiếm → kill để pm2 có chỗ
free_port() {
  local name="$1" port="$2" holder mine
  holder="$(port_pid "$port")"; [ -z "$holder" ] && return 0
  mine="$(pm2 pid "$name" 2>/dev/null | tr -d '[:space:]' || true)"
  if [ -n "$mine" ] && [ "$mine" != "0" ] && is_descendant_of "$holder" "$mine"; then return 0; fi
  warn "Cổng $port đang bị PID $holder ($(ps -o comm= -p "$holder" 2>/dev/null || echo '?')) chiếm — không phải pm2 $name → kill."
  warn "Nếu đó là project trong aaPanel: vào panel bấm STOP, không thì nó sẽ bật lại."
  kill "$holder" 2>/dev/null || true; sleep 2
  [ -n "$(port_pid "$port")" ] && { fuser -k "$port/tcp" >/dev/null 2>&1 || true; sleep 1; }
  return 0
}

# Chờ cổng TRỐNG, tối đa $2 giây (mặc định 20)
wait_port_free() { local i; for i in $(seq 1 "${2:-20}"); do [ -z "$(port_pid "$1")" ] && return 0; sleep 1; done; return 1; }

# Restart bằng pm2 theo kiểu STOP → chờ cổng trống → START; chưa có trong pm2
# thì tạo mới đúng thư mục + script. Không dùng `pm2 restart`: Next cũ cần vài
# giây mới tắt hẳn, trong lúc đó vẫn giữ cổng và trả HTML của build CŨ (trỏ tới
# CSS/JS đã bị xoá) → bước kiểm tra lấy nhầm, báo asset 404 dù bản mới vẫn ổn.
restart_app() {
  local name="$1" dir="$2" script="$3" port="$4"
  if pm2 describe "$name" >/dev/null 2>&1; then
    pm2 stop "$name" >/dev/null
    # Hết 20s mà cổng chưa nhả → tiến trình sót / lạ → free_port kill giúp.
    wait_port_free "$port" 20 || free_port "$name" "$port"
    pm2 start "$name" --update-env >/dev/null
  else
    free_port "$name" "$port"
    warn "pm2 chưa có $name → tạo mới: (cd $dir && pm2 start npm --name $name -- run $script)"
    (cd "$dir" && pm2 start npm --name "$name" -- run "$script" >/dev/null)
  fi
}

# Chờ tới khi cổng do CHÍNH tiến trình pm2 mới của app giữ (không phải bản cũ
# đang tắt dở hay tiến trình lạ), tối đa 40s.
wait_app_port() {
  local name="$1" port="$2" i holder mine
  for i in $(seq 1 40); do
    holder="$(port_pid "$port")"
    mine="$(pm2 pid "$name" 2>/dev/null | tr -d '[:space:]' || true)"
    if [ -n "$holder" ] && [ -n "$mine" ] && [ "$mine" != "0" ] && is_descendant_of "$holder" "$mine"; then
      return 0
    fi
    sleep 1
  done
  return 1
}

say "1/6  Kéo code mới từ GitHub"
git config --global --get-all safe.directory 2>/dev/null | grep -qx "$ROOT" \
  || git config --global --add safe.directory "$ROOT"
# frontend-next/.env từng bị commit nhầm rồi gỡ khỏi git. Trên máy đã deploy,
# file này là bản production ĐÃ SỬA nên `git pull` sẽ từ chối
# ("local changes would be overwritten"). Cất bản thật ra ngoài, trả working
# tree về sạch, pull xong đặt lại — chạy lần nào cũng an toàn.
ENV_FILES="frontend-next/.env backend/.env"
BACKED_UP=""
for f in $ENV_FILES; do
  if [ -f "$ROOT/$f" ] && git -C "$ROOT" ls-files --error-unmatch "$f" >/dev/null 2>&1; then
    warn "$f đang được git theo dõi — tạm cất bản trên máy để pull không gãy."
    cp "$ROOT/$f" "$ROOT/$f.deploy-backup"
    git -C "$ROOT" checkout -- "$f" 2>/dev/null || true
    BACKED_UP="$BACKED_UP $f"
  fi
done

# package-lock.json bị `npm install` các lần deploy CŨ ghi lại (npm trên VPS khác
# phiên bản máy dev) → pull từ chối. Bản trên máy không có giá trị: trả về bản
# trên GitHub. Từ giờ deploy dùng `npm ci` nên file này không bị sửa nữa.
for f in backend/package-lock.json frontend-next/package-lock.json; do
  if ! git -C "$ROOT" diff --quiet -- "$f"; then
    warn "$f bị npm trên máy sửa — trả về bản trên GitHub."
    git -C "$ROOT" checkout -- "$f"
  fi
done

# Fetch một lần (chỉ hỏi mật khẩu GitHub một lần), rồi merge từ bản vừa fetch.
git -C "$ROOT" fetch origin
UPSTREAM="$(git -C "$ROOT" rev-parse --abbrev-ref --symbolic-full-name '@{u}')"

# File upload trên server (VD ảnh up qua admin) trùng đường dẫn với file repo
# mới thêm → merge từ chối ("untracked working tree files would be overwritten").
# KHÔNG xoá: cất sang thư mục backup có mốc giờ rồi mới merge, in ra để kiểm tra.
UPLOAD_BACKUP="${DEPLOY_BACKUP_DIR:-$HOME/${APP_NAME}-deploy-backup}/$(date +%Y%m%d-%H%M%S)"
git -C "$ROOT" diff --name-only --diff-filter=A HEAD "$UPSTREAM" | while IFS= read -r f; do
  if [ -e "$ROOT/$f" ] && ! git -C "$ROOT" ls-files --error-unmatch "$f" >/dev/null 2>&1; then
    mkdir -p "$UPLOAD_BACKUP/$(dirname "$f")"
    mv "$ROOT/$f" "$UPLOAD_BACKUP/$f"
    warn "$f có sẵn trên máy nhưng trùng file mới trên GitHub — đã cất sang $UPLOAD_BACKUP/$f"
  fi
done

git -C "$ROOT" merge --ff-only "$UPSTREAM"

for f in $BACKED_UP; do
  mv -f "$ROOT/$f.deploy-backup" "$ROOT/$f"
  echo "    ✔ đã đặt lại $f (bản cấu hình thật trên máy)"
done

# `npm ci` thay cho `npm install`: cài ĐÚNG phiên bản trong package-lock.json và
# không ghi lại file đó (lần sau git pull không bị vướng). Lock lệch
# package.json thì ci dừng báo lỗi — sửa ở máy dev, commit lock rồi deploy lại.
# --include=dev: build cần devDependencies (nest cli, typescript, tailwind) kể cả
# khi shell đặt NODE_ENV=production.
say "2/6  Backend: cài gói + build"
cd "$ROOT/backend"
npm ci --include=dev
npm run build

say "3/6  Backend: migration + seed"
npm run db:run:prod
npm run db:seed:prod

say "4/6  Frontend: cài gói + build chuẩn vào .next"
cd "$ROOT/frontend-next"
npm ci --include=dev
# Build thẳng vào .next. Không build ra thư mục tạm rồi đổi tên: Next ghi
# distDir vào manifest runtime, đổi tên sau build làm /_next/static trả 400.
rm -rf .next .next-build .next-old
npm run build
chown -R "$APP_USER:$APP_USER" "$ROOT/frontend-next/.next" "$ROOT/backend/dist" 2>/dev/null || true

say "5/6  Restart 2 app bằng pm2"
free_port "$API_NAME" "$API_PORT"
free_port "$WEB_NAME" "$WEB_PORT"
restart_app "$API_NAME" "$ROOT/backend"       "start:prod" "$API_PORT"
restart_app "$WEB_NAME" "$ROOT/frontend-next" "start"      "$WEB_PORT"
wait_app_port "$API_NAME" "$API_PORT" && echo "    ✔ $API_NAME (bản mới) mở cổng $API_PORT" || warn "$API_NAME chưa mở cổng $API_PORT — xem: pm2 logs $API_NAME --lines 50"
wait_app_port "$WEB_NAME" "$WEB_PORT" && echo "    ✔ $WEB_NAME (bản mới) mở cổng $WEB_PORT" || warn "$WEB_NAME chưa mở cổng $WEB_PORT — xem: pm2 logs $WEB_NAME --lines 50"
pm2 save >/dev/null 2>&1 || true

say "6/6  Kiểm tra"
SITE_URL="http://127.0.0.1:$WEB_PORT"

# Không chỉ kiểm HTML: deploy lệch build vẫn trả HTML 200 nhưng CSS/JS lại 4xx
# → trang mất style hoặc ChunkLoadError. Thử lại tối đa ~30s: app vừa mở cổng
# có thể chưa sẵn sàng ngay.
SITE_HTML=""; ASSET_PATH=""; ASSET_STATUS=""
for attempt in $(seq 1 15); do
  SITE_HTML="$(curl -fsS "$SITE_URL/" 2>/dev/null || true)"
  ASSET_PATH="$(printf '%s' "$SITE_HTML" | grep -oE '/_next/static/[^" ]+\.(css|js)' | sed -n '1p' || true)"
  if [ -n "$ASSET_PATH" ]; then
    ASSET_STATUS="$(curl -sS -o /dev/null -w '%{http_code}' "$SITE_URL$ASSET_PATH" || true)"
    [ "$ASSET_STATUS" = "200" ] && break
  fi
  sleep 2
done
[ -n "$SITE_HTML" ] || die "Next không trả được trang chủ tại $SITE_URL — xem: pm2 logs $WEB_NAME --lines 100"
[ -n "$ASSET_PATH" ] || die "Không tìm thấy asset Next trong HTML trang chủ."
printf '    site  (%s): HTTP 200\n' "$WEB_PORT"
printf '    asset (%s): HTTP %s  %s\n' "$WEB_PORT" "$ASSET_STATUS" "$ASSET_PATH"
[ "$ASSET_STATUS" = "200" ] || die "Build frontend chưa đồng bộ: asset Next trả HTTP $ASSET_STATUS (đã thử lại ~30s) — xem: pm2 logs $WEB_NAME --lines 100"

# Làm nóng + kiểm tra MỌI trang trong sitemap. Đã gặp: lượt truy cập ĐẦU TIÊN
# sau deploy nhận HTML cũ trỏ tới CSS không còn (trang mất style), Next tự dựng
# lại ngay sau đó. Gọi trước từng trang để khách không là người gặp, chờ Next
# dựng xong rồi kiểm tra CSS của từng trang.
PAGES="$(curl -fsS "$SITE_URL/sitemap.xml" 2>/dev/null | grep -oE '<loc>[^<]+' | sed -E 's#<loc>https?://[^/]+##' | sort -u || true)"
[ -n "$PAGES" ] || PAGES="/"
for p in $PAGES; do curl -s -o /dev/null "$SITE_URL$p" || true; done
sleep 5
BAD=0; TOTAL=0
for p in $PAGES; do
  TOTAL=$((TOTAL + 1))
  css="$(curl -fsS "$SITE_URL$p" 2>/dev/null | grep -oE '/_next/static/css/[^" ]+\.css' | head -1 || true)"
  [ -n "$css" ] || continue
  code="$(curl -s -o /dev/null -w '%{http_code}' "$SITE_URL$css" || true)"
  if [ "$code" != "200" ]; then
    warn "Trang $p trỏ tới $css → HTTP $code"
    BAD=$((BAD + 1))
  fi
done
if [ "$BAD" -eq 0 ]; then
  echo "    ✔ $TOTAL trang trong sitemap đều tải đúng CSS"
else
  warn "$BAD/$TOTAL trang còn trỏ CSS cũ — thường tự hết ở lượt truy cập kế tiếp; còn thì chạy lại: bash deploy.sh"
fi
printf '    api   (%s): HTTP %s  (404 = OK, backend sống)\n' "$API_PORT" "$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$API_PORT/api" || echo 'không kết nối được')"
pm2 ls | grep -E "$API_NAME|$WEB_NAME" || true

say "Xong. Mở site nhớ Ctrl+F5. Nếu cột ↺ ở trên còn tăng → cổng đang bị aaPanel tranh, vào panel STOP project cùng tên."
