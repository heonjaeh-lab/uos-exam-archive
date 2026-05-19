/**
 * 사용자 상태 관리
 *
 * 시립대 포털 로그인 = 사용자 인증
 *   - 학번 + 1년 유효 JWT 토큰
 *   - localStorage에 저장
 *   - 사이트 방문 시 자동으로 토큰 갱신 (영구 로그인 유지)
 */

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'uos-user'

/**
 * 사용자 식별자 형식 검증
 *
 * 시립대 포털은 ID 형식 자체엔 제한이 없음 (학번/영문/이메일 모두 허용).
 * 우리 쪽 검증은 "빈 값 아닌지"만 확인하고 나머지는 포털이 판단하도록 위임.
 */
function isValidStudentId(id) {
  const s = String(id || '').trim()
  return s.length > 0
}

/**
 * 학번(숫자) 형식인지 확인 — 표시용 (4자리 입학년도 추출 등에 사용)
 */
export function isNumericStudentId(id) {
  return /^\d{6,10}$/.test(String(id || ''))
}

/**
 * JWT 토큰 만료 확인 (서명 검증은 백엔드에서)
 */
function isTokenValid(token) {
  if (!token || typeof token !== 'string') return false
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return false
    const payload = JSON.parse(atob(parts[1]))
    if (!payload.exp) return false
    return payload.exp * 1000 > Date.now()
  } catch {
    return false
  }
}

/**
 * 저장된 사용자 정보 + 토큰 유효성 확인
 */
export function getStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!isValidStudentId(parsed?.studentId)) return null
    if (!isTokenValid(parsed?.token)) return null
    return parsed
  } catch {
    return null
  }
}

/**
 * 사용자 저장 (로그인 성공 시)
 */
export function saveUser({ studentId, token, name }) {
  if (!isValidStudentId(studentId)) {
    throw new Error('아이디 형식이 올바르지 않아요.')
  }
  const user = {
    studentId: String(studentId),
    name: name || null,
    token: token || null,
    savedAt: new Date().toISOString(),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  window.dispatchEvent(new CustomEvent('uos-user-changed', { detail: user }))
  return user
}

/**
 * 로그아웃
 */
export function clearUser() {
  localStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(new CustomEvent('uos-user-changed', { detail: null }))
}

/**
 * 현재 토큰 반환 (API 호출 시 Authorization 헤더용)
 */
export function getAuthToken() {
  return getStoredUser()?.token || null
}

/**
 * 백엔드에 토큰 갱신 요청 — 사이트 방문 시 자동으로 만료일 늘려서 영구 로그인 유지
 */
async function refreshToken() {
  const current = getStoredUser()
  if (!current?.token) return
  const backendUrl = import.meta.env.VITE_BACKEND_URL
  if (!backendUrl) return
  try {
    const res = await fetch(`${backendUrl}/api/refresh`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${current.token}` },
    })
    if (!res.ok) return
    const data = await res.json()
    if (data?.success && data?.token) {
      // 갱신된 토큰으로 저장 (studentId/name 유지)
      saveUser({
        studentId: current.studentId,
        token: data.token,
        name: current.name,
      })
    }
  } catch {
    // 네트워크 오류 등 무시 — 다음 방문 때 다시 시도
  }
}

/**
 * React hook
 *
 * 주의: useEffect 의존성에 user 포함 X.
 * refreshToken()이 saveUser()를 호출하고 그게 'uos-user-changed' 이벤트를
 * 발생시켜 setUser 트리거 → user 변경 → effect 재실행 → 무한 갱신 루프 발생.
 * effect는 마운트 1회만 실행되도록 의존성 빈 배열로 고정.
 */
export function useUser() {
  const [user, setUser] = useState(() => getStoredUser())

  useEffect(() => {
    const handler = (e) => setUser(e.detail)
    window.addEventListener('uos-user-changed', handler)

    // 마운트 시 1회만 토큰 갱신 (영구 로그인용)
    const stored = getStoredUser()
    if (stored) refreshToken()

    // 6시간마다 다시 갱신 (사이트 오래 열어둔 경우)
    const interval = setInterval(() => {
      const current = getStoredUser()
      if (current) {
        refreshToken()
      }
    }, 6 * 60 * 60 * 1000)

    return () => {
      window.removeEventListener('uos-user-changed', handler)
      clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return user
}
