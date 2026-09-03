# ============================================================================
# Deploy demo — đồng bộ frontend/ lên https://github.com/mintmintonline2112/dentis-demo
# Chạy:  powershell -File tools\deploy-demo.ps1
# Chỉ đẩy: *.html + assets/ + images/  (KHÔNG đẩy design-system docs, KHÔNG backend)
# ============================================================================
$ErrorActionPreference = "Stop"

$repo = "https://github.com/hitekdigital2/dentis-demo"
$src  = Join-Path $PSScriptRoot "..\frontend"
$work = Join-Path $env:TEMP "dentis-demo-deploy"

# 1. Lấy bản mới nhất của repo demo
if (Test-Path (Join-Path $work ".git")) {
  git -C $work fetch origin
  git -C $work reset --hard origin/main
} else {
  if (Test-Path $work) { Remove-Item -Recurse -Force $work }
  git clone --depth 5 $repo $work
}

# 2. Thay toàn bộ nội dung bằng frontend hiện tại
git -C $work rm -rq . 2>$null
Copy-Item (Join-Path $src "*.html") $work
Copy-Item (Join-Path $src "assets") $work -Recurse
Copy-Item (Join-Path $src "images") $work -Recurse

# 3. Commit + push nếu có thay đổi
git -C $work add -A
$changes = git -C $work status --porcelain
if ($changes) {
  $stamp = Get-Date -Format "yyyy-MM-dd HH:mm"
  git -C $work commit -m "Cap nhat demo tu dentis-project ($stamp)"
  git -C $work push origin main
  Write-Host "DA DEPLOY. Xem tai: https://mintmintonline2112.github.io/dentis-demo/" -ForegroundColor Green
} else {
  Write-Host "Khong co gi thay doi - bo qua." -ForegroundColor Yellow
}
