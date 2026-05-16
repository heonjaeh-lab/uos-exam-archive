# Cloudflare Worker — UOS Crawler

학식/공지 크롤링을 Cloudflare Workers로 이전. 사용자 근처 PoP에서 실행되므로 한국 IP로 시립대 호출 가능.

## 배포 방법 (Cloudflare 대시보드, 가입 포함 ~10분)

### 1. Cloudflare 가입 (없으면)
1. https://dash.cloudflare.com/sign-up
2. 이메일/비밀번호로 가입
3. 이메일 인증

### 2. Worker 만들기
1. https://dash.cloudflare.com → 좌측 메뉴 **Workers & Pages** 클릭
2. **Create application** → **Create Worker** 클릭
3. 이름 입력: `uos-archive-crawler`
4. **Deploy** 클릭 (기본 코드로 일단 배포)
5. 배포 완료 후 **Edit code** 클릭

### 3. 코드 붙여넣기
1. Editor 좌측의 `worker.js` 열기
2. 전체 내용 삭제
3. 이 폴더의 `worker.js` 내용을 그대로 복사 붙여넣기
4. 우측 상단 **Deploy** 클릭

### 4. URL 확인
배포 후 받는 URL: `https://uos-archive-crawler.<your-subdomain>.workers.dev`

이 URL을 메모해두기.

### 5. 프론트엔드 .env 업데이트
```bash
VITE_CRAWLER_URL=https://uos-archive-crawler.<your-subdomain>.workers.dev
```

## 엔드포인트

- `GET /api/health` — 헬스체크
- `GET /api/cafeteria?date=20260518` — 학식 (날짜 선택)
- `GET /api/notice?board=academic` — 공지 (academic / general)

## 비용

무료 플랜:
- 일 100,000 요청
- 10ms CPU/요청

156명이 매일 학식+공지 각각 1번씩만 봐도 = 312회/일. 무료 한도 안에 충분.

## 왜 Cloudflare?

- ✅ 사용자 근처 PoP에서 실행 → 한국 사용자는 한국 PoP → 한국 IP로 시립대 호출
- ✅ Render Singapore보다 빠름
- ✅ 무료 한도 매우 관대
- ⚠️ Puppeteer 불가 (V8 isolate 환경) — 포털 로그인은 Render에 그대로
