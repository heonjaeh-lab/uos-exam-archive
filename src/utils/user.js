/**
 * 사용자 상태 관리
 *
 * 시립대 포털 로그인 = 사용자 인증
 *   - 학번 + 30일 유효 JWT 토큰
 *   - localStorage에 저장
 *   - 토큰 만료 전까지는 시립대 호출 없이 자동 로그인
 */

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'uos-user'

/**
 * 사용자 식별자 형식 검증
 *
 * 포털 아이디는 학번(숫자)일 수도 있고, 이메일(또는 일반 문자열)일 수도 있음.
 *   - 학번: 6~10자리 숫자
 *   - 이메일/일반: 3자 이상이고 공백 없는 문자열
 */
function isValidStudentId(id) {
  const s = String(id || '').trim()
  if (!s) return false
  if (/\s/.test(s)) return false
  return s.length >= 3 && s.length <= 100
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
 * React hook
 */
export function useUser() {
  const [user, setUser] = useState(() => getStoredUser())

  useEffect(() => {
    const handler = (e) => setUser(e.detail)
    window.addEventListener('uos-user-changed', handler)

    // 1시간마다 토큰 만료 체크 (만료 시 자동 로그아웃)
    const interval = setInterval(() => {
      const current = getStoredUser()
      if (!current && user) setUser(null)
    }, 60 * 60 * 1000)

    return () => {
      window.removeEventListener('uos-user-changed', handler)
      clearInterval(interval)
    }
  }, [user])

  return user
}
