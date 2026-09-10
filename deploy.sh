#!/usr/bin/env bash
# ============================================================
# Deploy Prime Nuts lên VPS bằng MỘT lệnh:
#     bash /www/wwwroot/primenuts.vn/deploy.sh
#
# Làm tuần tự: kéo code → build backend → migration + seed →
# build frontend ra thư mục tạm rồi tráo vào (site không trắng
# trang giữa chừng) → restart 2 app → kiểm tra sống/chết.
#
# Restart tự động khi app chạy bằng pm2 hoặc systemd. Nếu đang
# là "Default Project" của aaPanel thì script báo để bấm tay —
# xem mục "Bật auto-restart" trong README.md để chuyển sang pm2.
# ============================================================
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_NAME="${API_NAME:-primenuts_api}"
WEB_NAME="${WEB_NAME:-primenuts_web}"
APP_USER="${APP_USER:-www}"

say()  { printf '\n\033[1;32m==> %s\033[0m\n' "$1"; }
warn() { printf '\033[1;33m!!  %s\033[0m\n' "$1"; }

# Restart 1 app: thử pm2 trước, rồi systemd. Trả về 1 nếu không tự làm được.
restart_app() {
  local name="$1"
  if command -v pm2 >/dev/null 2>&1 && pm2 describe "$name" >/dev/null 2>&1; then
    pm2 restart "$name" --update-env >/dev/null
    return 0
  fi
  if systemctl list-unit-files 2>/dev/null | grep -q "^${name}\.service"; then
    systemctl restart "${name}.service"
    return 0
  fi
  return 1
}

say "1/6  Kéo code mới từ GitHub"
git -C "$ROOT" pull --ff-only

say "2/6  Backend: cài gói + build"
cd "$ROOT/backend"
npm install
npm run build

say "3/6  Backend: migration + seed"
npm run db:run:prod
npm run db:seed:prod

say "4/6  Frontend: cài gói + build (thư mục tạm)"
cd "$ROOT/frontend-next"
npm install
rm -rf .next-build .next-old
NEXT_DIST_DIR=.next-build npm run build

# Tráo build mới vào .next chỉ mất vài mili giây → gần như không downtime
if [ -d .next ]; then mv .next .next-old; fi
mv .next-build .next
rm -rf .next-old

# App chạy bằng user www nên phải trả quyền, nếu không Next/Nest không ghi được cache
chown -R "$APP_USER:$APP_USER" "$ROOT/frontend-next/.next" "$ROOT/backend/dist" 2>/dev/null || true

say "5/6  Restart 2 app"
NEED_MANUAL=0
for app in "$API_NAME" "$WEB_NAME"; do
  if restart_app "$app"; then
    echo "    ✔ đã restart $app"
  else
    NEED_MANUAL=1
    echo "    ✖ không tự restart được $app"
  fi
done

if [ "$NEED_MANUAL" = "1" ]; then
  warn "Vào aaPanel → Website → Node.js Project → bấm Restart cho app phía trên."
  warn "Muốn khỏi bấm tay: làm mục 'Bật auto-restart (pm2)' trong README.md."
fi

say "6/6  Kiểm tra"
sleep 3
printf '    site (3001): HTTP %s\n' "$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3001/ || echo 'khong ket noi duoc')"
printf '    api  (3010): HTTP %s  (404 = OK, backend sống)\n' "$(curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3010/api || echo 'khong ket noi duoc')"

say "Xong. Nhớ Ctrl+F5 khi mở site."
