# UOS Archive Backend

서울시립대 포털 자동 로그인 + 시간표 스크래핑 백엔드.

## 왜 백엔드가 필요한가

시립대 포털은 비밀번호를 클라이언트 사이드에서 **ML4WebVKey** 라이브러리로 암호화한 뒤 서버로 보냄. 단순 HTTP 요청으로는 자동화 불가능 → **헤드리스 브라우저(Puppeteer)** 가 필요.

## 보안

- 비밀번호는 메모리에서만 사용, **저장 안 함**
- 로그에도 비밀번호 안 남김
- Rate limit: 같은 IP 5분당 10회
- CORS: 허용된 origin만 호출 가능

## 로컬 개발

```bash
cd backend
npm install
npm run dev
```

## Render 배포

1. https://render.com 가입
2. New → Blueprint → 이 GitHub 레포 연결
3. `backend/render.yaml` 자동 인식 → Apply
4. 15-20분 후 배포 완료 (Docker 빌드 시간)
5. 프론트엔드 `.env`에 백엔드 URL 추가:
   ```
   VITE_BACKEND_URL=https://uos-archive-backend.onrender.com
   ```

## API

### POST `/api/login-and-fetch`
시립대 포털 로그인 + 시간표 가져오기.

**Request**
```json
{ "userId": "20251234", "password": "your-password" }
```

**Response (성공)**
```json
{ "success": true, "data": { /* 시간표 */ } }
```

**Response (실패)**
```json
{ "success": false, "error": "로그인 실패. 학번/비밀번호를 확인해주세요." }
```

### GET `/api/health`
헬스체크.
