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

const app = express()
const PORT = process.env.PORT || 3001

// 허용된 origin (개발 + 프로덕션)
const ALLOWED_ORIGINS = (
  process.env.ALLOWED_ORIGINS ||
  'http://localhost:5173,http://localhost:5174,https://haheonjae.github.io'
).split(',').map((s) => s.trim())

// 미들웨어
app.use(helmet())
app.use(
  cors({
    origin: (origin, callback) => {
      // origin 없으면 (curl/postman) 허용
      if (!origin) return callback(null, true)
      if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true)
      callback(new Error(`CORS 차단: ${origin}`))
    },
    credentials: true,
  }),
)
app.use(express.json({ limit: '10kb' })) // 작은 페이로드만 허용

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
