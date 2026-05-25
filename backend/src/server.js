/**
 * UOS Archive 백엔드 메인 서버
 *
 * 환경 변수:
 *   - PORT (기본 3001)
 *   - ALLOWED_ORIGINS (콤마로 구분된 허용 origin들)
 *   - PUPPETEER_EXECUTABLE_PATH (Docker 환경에서만)
 */

import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import authRouter from './routes/auth.js'
import cafeteriaRouter from './routes/cafeteria.js'
import noticeRouter from './routes/notice.js'

const app = express()
const PORT = process.env.PORT || 3001

// Render는 프록시 뒤에서 실행되므로 X-Forwarded-For 헤더 신뢰
// 이게 없으면 express-rate-limit가 ValidationError 발생 → 요청 통과 안 됨
app.set('trust proxy', 1)

// 허용된 origin (개발 + 프로덕션)
const ALLOWED_ORIGINS = (
  process.env.ALLOWED_ORIGINS ||
  'http://localhost:5173,http://localhost:5174,http://127.0.0.1:5173,http://127.0.0.1:5174,https://heonjaeh-lab.github.io,https://haheonjae.github.io'
).split(',').map((s) => s.trim())

// 미들웨어 — Helmet 보안 헤더 강화
app.use(
  helmet({
    // API 전용이라 CSP는 보수적으로 — 외부 리소스 일체 불러오지 않음
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'none'"],
        frameAncestors: ["'none'"], // clickjacking 방지
      },
    },
    // HSTS: 1년, includeSubDomains
    strictTransportSecurity: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: { policy: 'no-referrer' },
    // X-Frame-Options DENY (위 frameAncestors와 함께)
    frameguard: { action: 'deny' },
    // 일부 사이드채널 차단
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    crossOriginResourcePolicy: { policy: 'same-site' },
  }),
)
app.use(
  cors({
    origin: (origin, callback) => {
      // origin 없으면 (curl/postman/server-to-server) 허용
      if (!origin) return callback(null, true)
      if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true)
      callback(new Error(`CORS 차단: ${origin}`))
    },
    credentials: true,
  }),
)
// 페이로드 크기 제한: 비밀번호 + 학번 + 약간 ≤ 1KB로 충분, 여유 두고 10KB
app.use(express.json({ limit: '10kb' }))

// 모든 요청 access log (비밀번호 등 body는 절대 로깅 안 함)
app.use((req, res, next) => {
  const start = Date.now()
  const ip = req.ip || req.connection?.remoteAddress || 'unknown'
  res.on('finish', () => {
    const elapsed = Date.now() - start
    console.log(`[req] ${req.method} ${req.url} → ${res.statusCode} (${elapsed}ms) from ${ip}`)
  })
  next()
})

// 헬스체크 (Render가 깨우는 용도)
app.get('/', (req, res) => {
  res.json({
    service: 'UOS Archive Backend',
    status: 'running',
    timestamp: new Date().toISOString(),
  })
})

// 라우터
app.use('/api', authRouter)
app.use('/api', cafeteriaRouter)
app.use('/api', noticeRouter)

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' })
})

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error('[server] 에러:', err.message)
  res.status(500).json({ error: '서버 내부 오류' })
})

app.listen(PORT, () => {
  console.log(`✅ UOS 백엔드 서버 가동: http://localhost:${PORT}`)
  console.log(`   허용 origin: ${ALLOWED_ORIGINS.join(', ')}`)
})
