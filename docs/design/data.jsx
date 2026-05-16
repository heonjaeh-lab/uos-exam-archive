/* data.jsx — 자유전공학부 1학년 맥락의 mock data */

const areas = [
  { id:'thought', name:'사상과 역사',    icon: () => Icon.edu(),    courses:14, tone:'#1c7ed6' },
  { id:'society', name:'사회와 문화',    icon: () => Icon.globe(),  courses:21, tone:'#0ca678' },
  { id:'human',   name:'인간과 환경',    icon: () => Icon.heart(),  courses:11, tone:'#e8590c' },
  { id:'science', name:'자연과 기술',    icon: () => Icon.beaker(), courses:18, tone:'#4c6ef5' },
  { id:'lang',    name:'언어와 표현',    icon: () => Icon.msg(),    courses:23, tone:'#7950f2' },
  { id:'art',     name:'예술과 스포츠',  icon: () => Icon.brush(),  courses:9,  tone:'#c2255c' },
  { id:'core',    name:'자유전공 핵심',  icon: () => Icon.pin(),    courses:5,  tone:'#1864ab', featured:true },
  { id:'req',     name:'1학년 필수',     icon: () => Icon.check(),  courses:7,  tone:'#087f5b', featured:true },
];

// 자유전공 1학년이 흔히 듣는 1학기 과목
const myCourses = [
  { id:'c1', code:'GE1101', name:'사고와 표현',         prof:'박정원', area:'언어',   credit:3, color:'#1c7ed6' },
  { id:'c2', code:'EN1102', name:'대학영어 Ⅰ',          prof:'J. Miller', area:'언어', credit:2, color:'#0ca678' },
  { id:'c3', code:'MA1001', name:'대학수학 Ⅰ',          prof:'한태성', area:'자연',   credit:3, color:'#7950f2' },
  { id:'c4', code:'PH1001', name:'일반물리학 Ⅰ',        prof:'서민호', area:'자연',   credit:3, color:'#e8590c' },
  { id:'c5', code:'FM1001', name:'자유전공 세미나 Ⅰ',   prof:'정유나', area:'핵심',   credit:1, color:'#1864ab' },
  { id:'c6', code:'PS1002', name:'정치학 원론',          prof:'안주영', area:'사회',   credit:3, color:'#c2255c' },
  { id:'c7', code:'HI1003', name:'한국사의 이해',        prof:'장민호', area:'사상',   credit:3, color:'#4c6ef5' },
];

const recentUploads = [
  { id:1, type:'중간', title:'대학수학 Ⅰ 2025-1 중간고사 (풀이 포함)', course:'대학수학 Ⅰ', prof:'한태성', uploader:'자전26_지호', when:'12분 전', views:142, bookmarks:36, hasSol:true },
  { id:2, type:'중간', title:'일반물리학 Ⅰ 2025-1 중간 — 운동학·역학 위주', course:'일반물리학 Ⅰ', prof:'서민호', uploader:'민지', when:'1시간 전', views:88, bookmarks:21, hasSol:false },
  { id:3, type:'퀴즈', title:'사고와 표현 — 글쓰기 평가 기준 정리', course:'사고와 표현', prof:'박정원', uploader:'재성', when:'3시간 전', views:67, bookmarks:14, hasSol:true },
  { id:4, type:'기말예상', title:'한국사의 이해 — 출제 경향 분석 (2023~2024)', course:'한국사의 이해', prof:'장민호', uploader:'역사덕후', when:'어제', views:204, bookmarks:51, hasSol:false },
  { id:5, type:'중간', title:'정치학 원론 2025-1 중간 + 학우 풀이', course:'정치학 원론', prof:'안주영', uploader:'서연', when:'2일 전', views:113, bookmarks:24, hasSol:true },
  { id:6, type:'중간', title:'대학영어 Ⅰ 2024-2 중간 (J.Miller 분반)', course:'대학영어 Ⅰ', prof:'J. Miller', uploader:'익명', when:'3일 전', views:312, bookmarks:88, hasSol:false },
];

const popularCourses = [
  { id:1, code:'MA1001', name:'대학수학 Ⅰ',      prof:'한태성 외 3분반', area:'자연과 기술', count:42, trend:+18 },
  { id:2, code:'GE1101', name:'사고와 표현',      prof:'박정원 외',     area:'언어와 표현', count:38, trend:+12 },
  { id:3, code:'PH1001', name:'일반물리학 Ⅰ',    prof:'서민호 외',     area:'자연과 기술', count:31, trend:+8 },
  { id:4, code:'FM1001', name:'자유전공 세미나 Ⅰ', prof:'정유나 외 2분반', area:'자유전공 핵심', count:18, trend:+24 },
  { id:5, code:'EN1102', name:'대학영어 Ⅰ',      prof:'J. Miller 외',  area:'언어와 표현', count:27, trend:+5 },
  { id:6, code:'HI1003', name:'한국사의 이해',    prof:'장민호',        area:'사상과 역사', count:22, trend:+3 },
];

const notices = [
  { tag:'학과', tagType:'primary',  title:'자유전공학부 1학년 2학기 전공탐색 멘토링 신청 (~6/14)', date:'05.20' },
  { tag:'이벤트', tagType:'success', title:'중간고사 자료 업로드 챌린지 · 상위 10명 카페이용권', date:'05.18' },
  { tag:'학식',   tagType:'warning', title:'학생회관 식당 5/22 휴무 · 인문학관 운영 시간 변경', date:'05.16' },
  { tag:'업데이트',tagType:'success', title:'시간표 충돌 검사 기능 추가 (v0.8.0)', date:'05.14' },
  { tag:'안내',   tagType:'outline', title:'자전 1학년 단톡방·디스코드 안내', date:'상시' },
];

// 시간표용 — 25-1학기 정현재 학생의 시간표
const timetableBlocks = [
  // day(0=월~4=금), startHalfHour(9:00=0, 9:30=1, 10:00=2…), duration(half-hours)
  { day:0, start:2,  dur:3, course:myCourses[0] }, // 월 10:00-11:30 사고와 표현
  { day:0, start:6,  dur:3, course:myCourses[3] }, // 월 12:00-13:30 일반물리 (실험 X, 강의)
  { day:0, start:14, dur:3, course:myCourses[5] }, // 월 16:00-17:30 정치학 원론
  { day:1, start:4,  dur:3, course:myCourses[2] }, // 화 11:00-12:30 대학수학
  { day:1, start:10, dur:3, course:myCourses[6] }, // 화 14:00-15:30 한국사의 이해
  { day:2, start:2,  dur:3, course:myCourses[0] }, // 수 10:00-11:30 사고와 표현
  { day:2, start:12, dur:2, course:myCourses[4] }, // 수 15:00-16:00 자유전공 세미나
  { day:3, start:4,  dur:3, course:myCourses[2] }, // 목 11:00-12:30 대학수학
  { day:3, start:10, dur:3, course:myCourses[6] }, // 목 14:00-15:30 한국사
  { day:4, start:0,  dur:4, course:myCourses[1] }, // 금 09:00-11:00 대학영어
  { day:4, start:8,  dur:3, course:myCourses[3] }, // 금 13:00-14:30 일반물리
];

// 학식 데이터 — 2026-05-16 (오늘) 기준
const cafeterias = [
  {
    id:'student-hall',
    name:'학생회관 식당',
    sub:'학생식당 1층',
    hours:'평일 11:30 — 14:00 / 17:00 — 19:00',
    badge:'1순위',
    badgeTone:'primary',
    rating:4.2,
    reviews:182,
    open:true,
    meals: [
      { kind:'중식 A', price:'5,000원', items:['돈까스', '미니돈가스소스', '양배추샐러드', '단무지', '미소장국', '쌀밥/김치'], tags:['든든','고기'], pop:'★★★★☆' },
      { kind:'중식 B', price:'4,500원', items:['김치제육볶음', '계란찜', '시금치무침', '콩나물국', '쌀밥/김치'], tags:['한식'], pop:'★★★★★' },
      { kind:'석식',   price:'5,000원', items:['치킨마요덮밥', '유부장국', '깍두기', '단무지'], tags:['덮밥'], pop:'★★★★☆' },
    ],
  },
  {
    id:'humanities',
    name:'인문학관 식당',
    sub:'인문학관 B1',
    hours:'평일 11:30 — 14:00',
    badge:'가성비',
    badgeTone:'success',
    rating:4.0,
    reviews:96,
    open:true,
    meals: [
      { kind:'중식',   price:'4,500원', items:['순두부찌개', '계란말이', '오징어채볶음', '쌀밥/김치'], tags:['따끈','국물'], pop:'★★★★☆' },
      { kind:'간편',   price:'3,500원', items:['치즈라면 + 김밥 1줄'], tags:['빠름'], pop:'★★★☆☆' },
    ],
  },
  {
    id:'engineering',
    name:'공학관 식당',
    sub:'공학관 1층',
    hours:'평일 11:30 — 14:00',
    badge:'양 많음',
    badgeTone:'warning',
    rating:3.9,
    reviews:74,
    open:true,
    meals: [
      { kind:'중식 A', price:'5,500원', items:['스파게티 미트소스', '갈릭브레드', '피클', '크림스프'], tags:['양식'], pop:'★★★★☆' },
      { kind:'중식 B', price:'5,000원', items:['제육볶음', '쌈채소', '된장찌개', '쌀밥/김치'], tags:['한식'], pop:'★★★☆☆' },
    ],
  },
  {
    id:'dorm',
    name:'기숙사 식당',
    sub:'생활관 1층',
    hours:'매일 07:30 — 09:00 / 17:30 — 19:30',
    badge:'조·석식만',
    badgeTone:'outline',
    rating:3.7,
    reviews:142,
    open:false, // 오늘은 점심 안 열음
    meals: [
      { kind:'조식', price:'3,500원', items:['토스트', '계란후라이', '잼/버터', '우유', '시리얼'], tags:['아침'], pop:'★★★☆☆' },
      { kind:'석식', price:'4,500원', items:['닭갈비', '치즈사리', '쫄면사리 옵션', '쌀밥/김치'], tags:['저녁'], pop:'★★★★☆' },
    ],
  },
];

Object.assign(window, {
  areas, myCourses, recentUploads, popularCourses, notices,
  timetableBlocks, cafeterias,
});
