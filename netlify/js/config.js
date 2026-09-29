// 사이트 공통 설정 (공개해도 되는 값만 둡니다)
// Supabase 공개용(publishable) 키는 브라우저에 노출되도록 만들어진 키이고,
// 실제 권한은 데이터베이스 접근 규칙(RLS)이 막습니다.
window.SITE_CONFIG = {
  supabaseUrl: "https://vbbztfsopyysfglwqccy.supabase.co",
  supabaseKey: "sb_publishable_pYZ22-DV5pSd1O2i573LGg_SMVm8qD_",
  photoBucket: "activity-photos",

  // ✏️ 후원 계좌가 정해지면 채워주세요. 비워두면 "카카오채널로 문의" 안내가 나옵니다.
  donationAccount: null, // 예: { bank: "OO은행", number: "000-0000-0000-00", holder: "3로27 사회적협동조합" }

  // 사업 목록 (DESIGN.md의 사업-색 짝과 같음)
  services: {
    afterschool: { name: "방과후 상시돌봄", tag: "방과후", color: "pink" },
    vacation:    { name: "방학 종일돌봄", tag: "방학", color: "yellow" },
    meal:        { name: "마을급식·간식", tag: "마을급식", color: "lime" },
    education:   { name: "아동 교육·문화 프로그램", tag: "교육·문화", color: "blue" },
    training:    { name: "돌봄활동가 양성", tag: "활동가 양성", color: "purple" }
  }
};
