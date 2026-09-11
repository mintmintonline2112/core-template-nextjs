#!/usr/bin/env bash
# ============================================================
# Deploy Prime Nuts lên VPS bằng MỘT lệnh:
#     bash /www/wwwroot/primenuts.vn/deploy.sh
#
# Tuần tự: git pull → build backend → migration + seed → build frontend
# → giải phóng cổng nếu bị tiến trình lạ chiếm → restart 2 app bằng pm2
# (tự tạo nếu pm2 chưa có) → chờ app mở cổng → kiểm tra HTML + asset
# → pm2 save.
#
# QUY TẮC: 2 app CHỈ do pm2 quản. Hai project cùng tên trong aaPanel
# phải để STOPPED (không Delete — xoá là mất domain + SSL + proxy).
# Nếu panel bật lên, nó tranh cổng 3001/3010 với pm2 → app crash-loop
# (cột ↺ trong `pm2 ls` tăng liên tục). Script tự kill tiến trình
# không thuộc pm2 đang giữ cổng, nhưng panel phải Stop thì nó mới
# không bật lại.
# ============================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_NAME="${API_NAME:-primenuts_api}"; API_PORT="${API_PORT:-3010}"
WEB_NAME="${WEB_NAME:-primenuts_web}"; WEB_PORT="${WEB_PORT:-3001}"
APP_USER="${APP_USER:-www}"

say()  { printf '\n\033[1;32m==> %s\033[0m\n' "$1"; }
warn() { printf '\033[1;33m!!  %s\033[0m\n' "$1"; }
die()  { printf '\033[1;31mXX  %s\033[0m\n' "$1"; exit 1; }

command -v pm2 >/dev/null 2>&1 || die "Chưa có pm2 → npm install -g pm2 rồi chạy lại."

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

# Restart bằng pm2; chưa có trong pm2 thì tạo mới đúng thư mục + script
restart_app() {
  local name="$1" dir="$2" script="$3"
  if pm2 describe "$name" >/dev/null 2>&1; then
    pm2 restart "$name" --update-env >/dev/null
  else
    warn "pm2 chưa có $name → tạo mới: (cd $dir && pm2 start npm --name $name -- run $script)"
    (cd "$dir" && pm2 start npm --name "$name" -- run "$script" >/dev/null)
  fi
}

# Chờ cổng mở, tối đa 40s
wait_port() { local i; for i in $(seq 1 40); do [ -n "$(port_pid "$1")" ] && return 0; sleep 1; done; return 1; }

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

git -C "$ROOT" pull --ff-only

for f in $BACKED_UP; do
  mv -f "$ROOT/$f.deploy-backup" "$ROOT/$f"
  echo "    ✔ đã đặt lại $f (bản cấu hình thật trên máy)"
done

say "2/6  Backend: cài gói + build"
cd "$ROOT/backend"
npm install
npm run build

say "3/6  Backend: migration + seed"
npm run db:run:prod
npm run db:seed:prod

say "4/6  Frontend: cài gói + build chuẩn vào .next"
cd "$ROOT/frontend-next"
npm install
# Build thẳng vào .next. Không build ra thư mục tạm rồi đổi tên: Next ghi
# distDir vào manifest runtime, đổi tên sau build làm /_next/static trả 400.
rm -rf .next .next-build .next-old
npm run build
chown -R "$APP_USER:$APP_USER" "$ROOT/frontend-next/.next" "$ROOT/backend/dist" 2>/dev/null || true

say "5/6  Restart 2 app bằng pm2"
free_port "$API_NAME" "$API_PORT"
free_port "$WEB_NAME" "$WEB_PORT"
restart_app "$API_NAME" "$ROOT/backend"       "start:prod"
restart_app "$WEB_NAME" "$ROOT/frontend-next" "start"
wait_port "$API_PORT" && echo "    ✔ $API_NAME mở cổng $API_PORT" || warn "$API_NAME chưa mở cổng $API_PORT — xem: pm2 logs $API_NAME --lines 50"
wait_port "$WEB_PORT" && echo "    ✔ $WEB_NAME mở cổng $WEB_PORT" || warn "$WEB_NAME chưa mở cổng $WEB_PORT — xem: pm2 logs $WEB_NAME --lines 50"
pm2 save >/dev/null 2>&1 || true

say "6/6  Kiểm tra"
sleep 2
SITE_URL="http://127.0.0.1:$WEB_PORT"
SITE_HTML="$(curl -fsS "$SITE_URL/" || true)"
[ -n "$SITE_HTML" ] || die "Next không trả được trang chủ tại $SITE_URL — xem: pm2 logs $WEB_NAME --lines 100"

# Không chỉ kiểm HTML: deploy lệch build vẫn trả HTML 200 nhưng CSS/JS lại 400
# → trang mất style hoặc ChunkLoadError.
ASSET_PATH="$(printf '%s' "$SITE_HTML" | grep -oE '/_next/static/[^" ]+\.(css|js)' | sed -n '1p' || true)"
[ -n "$ASSET_PATH" ] || die "Không tìm thấy asset Next trong HTML trang chủ."
ASSET_STATUS="$(curl -sS -o /dev/null -w '%{http_code}' "$SITE_URL$ASSET_PATH" || true)"
printf '    site  (%s): HTTP 200\n' "$WEB_PORT"
printf '    asset (%s): HTTP %s  %s\n' "$WEB_PORT" "$ASSET_STATUS" "$ASSET_PATH"
[ "$ASSET_STATUS" = "200" ] || die "Build frontend chưa đồng bộ: asset Next trả HTTP $ASSET_STATUS."
printf '    api   (%s): HTTP %s  (404 = OK, backend sống)\n' "$API_PORT" "$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$API_PORT/api" || echo 'không kết nối được')"
pm2 ls | grep -E "$API_NAME|$WEB_NAME" || true

say "Xong. Mở site nhớ Ctrl+F5. Nếu cột ↺ ở trên còn tăng → cổng đang bị aaPanel tranh, vào panel STOP project cùng tên."
