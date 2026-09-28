#!/bin/sh
# 사이트를 다시 만들고 Vercel(https://3ro27.vercel.app)에 배포합니다.
# 처음 한 번은 터미널에서 `npx.cmd vercel login` (PowerShell) 으로 로그인해 두어야 합니다.
set -e
cd "$(dirname "$0")"
sh build.sh
cd netlify
npx --yes vercel deploy --prod --yes
