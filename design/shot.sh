#!/bin/bash
# usage: shot.sh out.png height [query]
D="$(cd "$(dirname "$0")" && pwd)"
OUT="$1"; H="${2:-1720}"; Q="${3:-}"
exec chromium --headless=new --no-sandbox --disable-dev-shm-usage --allow-file-access-from-files \
  --hide-scrollbars --force-device-scale-factor=2 --window-size=900,"$H" \
  --default-background-color=00000000 --virtual-time-budget=6000 \
  --screenshot="$OUT" "file://$D/canvas.html${Q:+?$Q}" >/dev/null 2>&1
