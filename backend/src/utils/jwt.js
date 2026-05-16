/**
 * JWT 토큰 발급/검증
 *
 * 시립대 포털 로그인 1회 성공 후 30일 유효 토큰 발급.
 * 이후 30일 동안은 시립대 호출 없이 사이트 사용 가능.
 *
 * 환경변수: JWT_SECRET (Render에서 자동 생성)
 */

import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'dev-only-secret-DO-NOT-USE-IN-PROD-9f3a2b1c'
const EXPIRES_IN = '30d'

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
