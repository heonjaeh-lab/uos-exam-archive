/**
 * JWT 토큰 발급/검증
 *
 * 시립대 포털 로그인 1회 성공 후 7일 유효 토큰 발급.
 * 이후 7일 동안은 시립대 호출 없이 사이트 사용 가능.
 *
 * 환경변수: JWT_SECRET (Render에서 자동 생성, 필수)
 */

import jwt from 'jsonwebtoken'
import crypto from 'crypto'

// 프로덕션에서 JWT_SECRET 누락 시 즉시 부팅 거부 — 예측 가능한 fallback으로
// 토큰을 위조하는 표면을 제거.
let SECRET = process.env.JWT_SECRET
if (!SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'JWT_SECRET 환경변수가 설정되지 않았습니다. ' +
        '프로덕션에서는 안전한 랜덤 비밀키를 반드시 설정해야 합니다.',
    )
  }
  // 개발 환경: 매 부팅마다 랜덤 secret 생성 (예측 불가, 재시작 시 토큰 무효화)
  SECRET = crypto.randomBytes(48).toString('base64')
  console.warn('[jwt] 개발 모드: 임시 JWT secret 생성됨 (서버 재시작 시 토큰 무효화)')
}

// 토큰 유효기간: 30일 → 7일로 단축 (탈취 시 영향 범위 축소)
const EXPIRES_IN = '7d'

/**
 * 토큰 발급
 * @param {Object} payload - { studentId, name? }
 */
export function signToken(payload) {
  return jwt.sign(
    {
      studentId: String(payload.studentId),
      name: payload.name || null,
    },
    SECRET,
    { expiresIn: EXPIRES_IN },
  )
}

/**
 * 토큰 검증
 * @param {string} token
 * @returns {Object|null} payload 또는 null (만료/잘못된 경우)
 */
export function verifyToken(token) {
  if (!token) return null
  try {
    return jwt.verify(token, SECRET)
  } catch {
    return null
  }
}

/**
 * Express 미들웨어 - Authorization 헤더 검증
 *
 * 사용:
 *   router.get('/protected', requireAuth, (req, res) => {
 *     // req.user.studentId 사용 가능
 *   })
 */
export function requireAuth(req, res, next) {
  const auth = req.headers.authorization || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null
  const payload = verifyToken(token)
  if (!payload) {
    return res.status(401).json({ error: '인증이 필요해요. 다시 로그인해주세요.' })
  }
  req.user = payload
  next()
}
