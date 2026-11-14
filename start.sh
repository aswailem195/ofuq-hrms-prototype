#!/usr/bin/env sh
set -eu
cd "$(dirname "$0")"
if [ ! -d node_modules ]; then
  echo 'ثبّت الحزم أولًا باستخدام npm install (يلزم Node.js مع npm).'
  exit 1
fi
exec node node_modules/vite/bin/vite.js --host 127.0.0.1 "$@"
