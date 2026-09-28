---
name: 3로27 사회적협동조합
colors:
  primary: "#F2788A"
  primary-strong: "#C2485F"
  primary-soft: "#FDEBEE"
  on-primary: "#3F4044"
  secondary-yellow: "#FBBF1A"
  secondary-yellow-strong: "#8F6400"
  secondary-yellow-soft: "#FFF5D6"
  secondary-lime: "#B3CE2B"
  secondary-lime-strong: "#5C7210"
  secondary-lime-soft: "#F2F8DA"
  secondary-blue: "#7EA7DA"
  secondary-blue-strong: "#3A67A3"
  secondary-blue-soft: "#E8F0FA"
  secondary-purple: "#A865AE"
  secondary-purple-strong: "#7E3F86"
  secondary-purple-soft: "#F4E9F5"
  background: "#FFFFFF"
  surface-warm: "#FBF4EC"
  surface-muted: "#F6F5F4"
  on-background: "#3F4044"
  on-surface-variant: "#6D6E71"
  text-subtle: "#8E9095"
  outline: "#E4E2E0"
  shadow: "#3F4044"
  kakao: "#FEE500"
  on-kakao: "#191600"
typography:
  display-slogan:
    fontFamily: Gaegu
    fontSize: 56px
    fontWeight: "700"
    lineHeight: 70px
  headline-lg:
    fontFamily: Gothic A1
    fontSize: 30px
    fontWeight: "800"
    lineHeight: 42px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Gothic A1
    fontSize: 18px
    fontWeight: "800"
    lineHeight: 26px
  number-lg:
    fontFamily: Gothic A1
    fontSize: 40px
    fontWeight: "800"
    lineHeight: 44px
  body-lg:
    fontFamily: Noto Sans KR
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 28px
  body-md:
    fontFamily: Noto Sans KR
    fontSize: 15px
    fontWeight: "400"
    lineHeight: 26px
  meta:
    fontFamily: Noto Sans KR
    fontSize: 13px
    fontWeight: "700"
    lineHeight: 18px
    letterSpacing: 0.08em
  label-button:
    fontFamily: Noto Sans KR
    fontSize: 15px
    fontWeight: "700"
    lineHeight: 20px
  label-tag:
    fontFamily: Noto Sans KR
    fontSize: 12px
    fontWeight: "700"
    lineHeight: 16px
    letterSpacing: 0.04em
rounded:
  sm: 8px
  md: 16px
  lg: 20px
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  section: 72px
  gutter: 16px
  margin: 24px
  margin-mobile: 16px
  container: 1040px
elevation:
  none: none
  sm: 0 1px 2px rgba(63, 64, 68, 0.06)
  md: 0 8px 24px rgba(63, 64, 68, 0.10)
breakpoints:
  mobile: 0px
  tablet: 600px
  desktop: 1024px
components:
  button-kakao:
    backgroundColor: "{colors.kakao}"
    textColor: "{colors.on-kakao}"
    typography: "{typography.label-button}"
    rounded: "{rounded.full}"
    padding: 12px 24px
  button-ghost:
    backgroundColor: "{colors.background}"
    textColor: "{colors.on-background}"
    borderColor: "{colors.outline}"
    typography: "{typography.label-button}"
    rounded: "{rounded.full}"
    padding: 12px 24px
  card-service:
    backgroundColor: "{colors.background}"
    borderColor: "{colors.outline}"
    rounded: "{rounded.md}"
    padding: "{spacing.lg}"
    elevation: "{elevation.none}"
  card-service-hover:
    elevation: "{elevation.md}"
  card-info:
    backgroundColor: "{colors.surface-muted}"
    rounded: "{rounded.md}"
    padding: "{spacing.lg}"
  badge-tag:
    typography: "{typography.label-tag}"
    rounded: "{rounded.full}"
    padding: 4px 8px
  header-sticky:
    backgroundColor: "{colors.background}"
    borderColor: "{colors.outline}"
    elevation: "{elevation.sm}"
  cta-band:
    backgroundColor: "{colors.surface-warm}"
    rounded: "{rounded.lg}"
    padding: "{spacing.xl}"
---

## Brand & Style

3로27은 공동주택과 지역사회 자원으로 초등아동 돌봄 공백을 해결하는 주민주도형 돌봄조직이다. 사이트의 주 독자는 **기관·지자체·후원자**이므로, 첫인상은 **신뢰감**이고 그 위에 **마을 돌봄의 온기**를 더한다.

스타일은 **흰 바탕 + 넉넉한 여백 + 로고의 다섯 하트 색**이다. 화면 대부분은 흰색과 회색 계열로 차분하게 두고, 색은 사업을 구분하는 곳과 슬로건에만 쓴다. 슬로건 "놀며 자라는 아이 / 살며 배우는 어른 / 함께 돌보는 마을"은 단체의 목소리이므로 손글씨로, 나머지는 모두 읽기 편한 고딕으로 쓴다.

아이콘은 `icons/icon-scr.svg`(주색 라운드 사각형 위 흰색 하트 지붕 집)를 쓴다. PWA용은 `icons/icon-192.png`, `icons/icon-512.png`, `icons/icon-maskable-512.png`.

## Colors

색은 로고의 하트 다섯 색에서 나온다. 각 색은 세 단계로 쓴다: 기본색(면·블록), `-strong`(작은 글자용 진한 색), `-soft`(옅은 바탕).

- **Primary (`#F2788A`, 분홍):** 로고 맨 위 하트. 단체를 대표하는 색으로 아이콘 배경, 방과후 사업에 쓴다.
- **Secondary (노랑 `#FBBF1A` · 연두 `#B3CE2B` · 파랑 `#7EA7DA` · 보라 `#A865AE`):** 나머지 하트. 사업 구분에만 쓴다.
- **사업과 색의 짝 (고정):** 방과후=분홍, 방학=노랑, 마을급식=연두, 교육·문화=파랑, 활동가 양성=보라. 여러 색이 나란히 나올 때는 로고 순서(파랑·노랑·분홍·연두·보라)를 따른다.
- **Background (`#FFFFFF`):** 페이지 바탕. 첫 화면과 강조 띠는 `surface-warm`(`#FBF4EC`, 로고 시트의 살구빛), 정보 상자는 `surface-muted`(`#F6F5F4`).
- **Text (`#3F4044`):** 제목과 본문. 보조 설명은 `#6D6E71`, 메타 정보(눈썹 제목, 기준일)는 `#8E9095`.
- **Border (`#E4E2E0`):** 카드 테두리, 구분선, 헤더 아래 선.
- **Shadow (`#3F4044` 기반):** 글자색을 아주 옅게(6~10%) 섞어 쓴다. 회색 `#000` 그림자는 쓰지 않는다.
- **Kakao (`#FEE500`):** 카카오채널 문의 버튼에만 쓴다. 카카오 브랜드 색이므로 단체 색으로 쓰지 않는다.

## Typography

글꼴은 세 가지만 쓴다: 제목 **Gothic A1**, 본문 **Noto Sans KR**, 슬로건 **Gaegu**(손글씨). 한국어 줄바꿈은 단어 단위(`word-break: keep-all`)로 한다.

| 단계 | 토큰 | 크기 / 굵기 | 쓰는 곳 |
|---|---|---|---|
| 슬로건 | `display-slogan` | 56px / 700 (모바일 36px) | 첫 화면 슬로건만 |
| 제목 | `headline-lg` | 30px / 800 (모바일 24px) | 첫 화면 문장, 섹션 제목 |
| 작은 제목 | `headline-sm` | 18px / 800 | 카드 제목, 연혁 날짜 |
| 숫자 | `number-lg` | 40px / 800 | 숫자로 보는 3로27 |
| 본문 | `body-lg` | 16px / 400 | 문단, 섹션 소개글 (한 줄 최대 62자) |
| 본문(작게) | `body-md` | 15px / 400 | 카드 설명, 연혁 내용 |
| 메타 | `meta` | 13px / 700, 자간 0.08em | 눈썹 제목(WHY 3로27 등), 기준일 |
| 버튼 | `label-button` | 15px / 700 (작은 버튼 14px) | 버튼, 메뉴 |
| 태그 | `label-tag` | 12px / 700 | 사업 이름표 |

굵기는 400 · 700 · 800 세 단계만 쓴다.

## Layout & Spacing

간격은 **8px 단위**로, 아래 값만 쓴다.

| 토큰 | 값 | 쓰는 곳 |
|---|---|---|
| `xs` | 4px | 아이콘과 글자 사이 |
| `sm` | 8px | 제목과 설명 사이, 버튼 사이 |
| `md` | 16px | 카드 사이 간격(gutter), 모바일 좌우 여백 |
| `lg` | 24px | 카드 안쪽 여백, PC 좌우 여백 |
| `xl` | 40px | 섹션 제목과 내용 사이, 강조 띠 안쪽 |
| `section` | 72px | 섹션과 섹션 사이 (모바일 48px) |

- **본문 폭:** 가운데 정렬, 최대 1040px.
- **반응형 3폭:** 카드 목록(주요 사업, 함께하는 방법, 교육컨설팅 단계, 숫자)은 폭에 따라 열 수만 바꾼다.

| 폭 | 기준 | 열 | 좌우 여백 |
|---|---|---|---|
| PC | 1024px 이상 | **3열** | 24px |
| 태블릿 | 600~1023px | **2열** | 24px |
| 모바일 | 600px 미만 | **1열** | 16px |

- 마지막 줄에 카드가 모자라면(예: 5개를 3열로) 남은 카드가 **남는 폭을 나눠 채운다**. 줄 중간에 빈칸을 두지 않는다.
- 상단 메뉴는 태블릿 이하에서 로고 아래 한 줄로 내려가고 가로로 밀어서 본다.

## Elevation & Depth

기본은 **평면**이다. 면의 구분은 그림자가 아니라 **테두리(`#E4E2E0`)와 바탕색 차이**로 한다. 그림자는 두 개만 쓴다.

- **`sm` (`0 1px 2px`, 6%):** 스크롤할 때 위에 붙어 있는 헤더.
- **`md` (`0 8px 24px`, 10%):** 마우스를 올린 카드. 올릴 때 위로 2px 살짝 뜬다(0.15초).
- 그 외 요소(버튼, 정보 상자, 사진)에는 그림자를 쓰지 않는다.

## Shapes

모서리는 네 가지만 쓴다. 로고 하트와 집 모양처럼 **각지되 부드러운** 느낌을 낸다.

| 토큰 | 값 | 쓰는 곳 |
|---|---|---|
| `sm` | 8px | 키보드 초점 표시, 작은 상자 |
| `md` | 16px | 카드, 정보 상자, 단계 상자 |
| `lg` | 20px | 문의 안내 띠처럼 큰 면 |
| `full` | 9999px | 버튼, 메뉴, 태그 |

하트 모양은 로고와 같은 V자 하트(`M0 30 30 0 50 20 70 0 100 30 50 80Z`)만 쓴다. 둥근 하트 이모지나 다른 하트 그림으로 바꾸지 않는다.

## Components

### Buttons

주 버튼은 **카카오채널 버튼**(`button-kakao`)이다. 사이트의 모든 문의는 카카오채널로 가기 때문이다. 보조 버튼(`button-ghost`)은 흰 바탕에 테두리만 있고, 페이지 안 이동(예: 교육컨설팅 알아보기)에 쓴다. 한 화면에 주 버튼은 하나만 둔다.

### Cards

- **사업 카드(`card-service`):** 흰 바탕 + 테두리. 윗부분은 사업 색 블록 또는 사진, 아래는 태그 → 제목 → 설명 순서. 태그는 사업의 `-soft` 바탕에 `-strong` 글자.
- **정보 상자(`card-info`):** 테두리 없이 `surface-muted` 바탕. 문제/해법, 교육컨설팅 단계에 쓴다. 마지막 단계만 글자색 바탕에 흰 글자로 강조할 수 있다.

### Photos

사진은 사업 카드 윗부분에 꽉 채워(`object-fit: cover`) 넣는다. **아이 얼굴이 알아볼 수 있게 나온 사진은 흐림 처리한 사본만** 쓰고, 화이트보드·이름표 등 이름이 보일 수 있는 부분도 흐리게 한다. 원본 사진은 저장소에 올리지 않는다.

## Do's and Don'ts

**Do**
- 새 색이 필요하면 먼저 다섯 하트 색의 `-strong` / `-soft`에서 고른다.
- 새 사업이 생기면 다섯 색 중 하나를 짝지어 이 문서에 적는다.
- 숫자에는 고정폭 숫자(`tabular-nums`)를 쓴다.

**Don't**
- **흰 글자를 하트 색 위에 올리지 않는다.** 분홍·노랑·연두 위 흰 글자는 읽기 어렵다. 색 위 글자는 `#3F4044`, 작은 색 글자는 `-strong`을 쓴다.
- **사업과 색의 짝을 바꾸거나 섞지 않는다.** 방학 카드에 분홍을 쓰는 식으로 쓰면 색이 뜻을 잃는다.
- **정해진 값 밖의 크기·간격·모서리를 쓰지 않는다.** 예: 14px 모서리, 17px 글자, 20px 간격.
- **예전 색 코드(`#F7B500`, `#A9C41F`, `#6F9BD3`, `#A565A9`)를 다시 쓰지 않는다.**
- **손글씨(Gaegu)를 슬로건 밖에 쓰지 않는다.**
- **카카오 노랑(`#FEE500`)을 단체 색처럼 배경·장식에 쓰지 않는다.**
- **얼굴이 드러난 아이 사진, 이름이 보이는 사진을 올리지 않는다.**
- **이모지나 캐릭터를 제목·섹션 표시로 쓰지 않는다.**
