#!/bin/sh
# 사이트를 다시 만들고 GitHub에 올립니다.
# GitHub(main)에 올라가면 Vercel이 자동으로 https://3ro27.vercel.app 에 배포합니다.
# 사용법: sh deploy.sh "무엇을 바꿨는지 한 줄 메모"
set -e
cd "$(dirname "$0")"
sh build.sh
git add -A
if git diff --cached --quiet; then
  echo "바뀐 내용이 없습니다."
  exit 0
fi
git commit -m "${1:-사이트 내용 수정}"
git push
echo "올렸습니다. 1분쯤 뒤 https://3ro27.vercel.app 에 반영됩니다."
