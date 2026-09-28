#!/bin/sh
# index.src.html 하나를 고쳐서 이 스크립트를 실행하면
#   netlify/index.html  → 실제 배포용 완성본 (Vercel)
#   index.html          → Claude 링크(아티팩트) 미리보기용
# 가 함께 만들어집니다.
set -e
cd "$(dirname "$0")"

SITE_URL="https://3ro27.vercel.app"   # 배포 주소 (공유 미리보기 이미지에 사용)
DESC="놀며 자라는 아이, 살며 배우는 어른, 함께 돌보는 마을. 남양주 별내 위스테이별내에서 주민이 함께 만드는 초등 마을돌봄, 3로27 사회적협동조합입니다."

# 1) 배포용: 완전한 HTML 문서로 감싸기
{
  cat <<EOF
<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="$DESC">
<meta property="og:type" content="website">
<meta property="og:title" content="3로27 사회적협동조합">
<meta property="og:description" content="$DESC">
<meta property="og:image" content="$SITE_URL/images/og-image.jpg">
<meta property="og:url" content="$SITE_URL/">
<link rel="icon" type="image/png" href="images/favicon.png">
EOF
  # </style>까지는 <head>, 나머지는 <body>
  awk '{print} /<\/style>/{exit}' index.src.html
  echo '</head>'
  echo '<body>'
  awk 'f{print} /<\/style>/{f=1}' index.src.html
  echo '</body>'
  echo '</html>'
} | sed 's#{{LOGO}}#images/logo.png#g' > netlify/index.html

# 2) Claude 링크용: 로고를 파일 안에 넣기
B64=$(base64 -w0 netlify/images/logo.png)
awk -v r="data:image/png;base64,$B64" '{gsub(/\{\{LOGO\}\}/, r); print}' index.src.html > index.html

echo "완료: netlify/index.html, index.html"
