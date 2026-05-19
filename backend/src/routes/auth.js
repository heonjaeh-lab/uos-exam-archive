import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { loginAndFetchTimetable } from '../services/uosScraper.js'
import { signToken, verifyToken } from '../utils/jwt.js'

const router = Router()

// 로그인 시도 제한: 같은 IP에서 5분 동안 최대 10회
const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message: { error: '너무 많은 시도. 5분 후 다시 시도해주세요.' },
  standardHeaders: true,
})

/**
 * POST /api/login-and-fetch
 * Body: { userId, password }
 * Response: { success, data?, error? }
 *
 * 포털 아이디(학번 또는 이메일)/비밀번호 받아서 시립대 포털 자동 로그인 → 시간표 반환
 */
router.post('/login-and-fetch', loginLimiter, async (req, res) => {
  const { userId, password } = req.body || {}

  if (!userId || !password) {
    return res.status(400).json({
      success: false,
      error: '아이디와 비밀번호가 필요합니다.',
    })
  }

  // 아이디 형식 검증 (학번 = 숫자 / 이메일 = 일반 문자열, 공백 금지)
  const trimmedId = String(userId).trim()
  if (
    trimmedId.length < 3 ||
    trimmedId.length > 100 ||
    /\s/.test(trimmedId)
  ) {
    return res.status(400).json({
      success: false,
      error: '아이디 형식이 올바르지 않습니다.',
    })
  }

  // 비밀번호는 메모리에서만 사용, 로그 절대 X
  const result = await loginAndFetchTimetable(trimmedId, password)

  // 로그인 성공 시 JWT 토큰 발급 (30일 유효)
  if (result.success) {
    result.token = signToken({ studentId: trimmedId })
    result.expiresInDays = 30
  }

  // 응답 상태 코드 결정
  const statusCode = result.success ? 200 : 401
  res.status(statusCode).json(result)
})

/**
 * POST /api/verify
 * 토큰 검증만 - 시립대 호출 없이 인증 상태 확인
 */
router.post('/verify', (req, res) => {
  const auth = req.headers.authorization || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  const payload = verifyToken(token)
  if (!payload) {
    return res.status(401).json({ valid: false, error: '토큰이 만료되었거나 잘못되었습니다.' })
  }
  res.json({ valid: true, studentId: payload.studentId, name: payload.name })
})

/**
 * GET /api/health
 * 헬스체크 (Render의 ping용)
 */
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

export default router
