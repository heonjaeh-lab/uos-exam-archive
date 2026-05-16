/**
 * 사용자 상태 관리
 *
 * 시립대 포털 로그인이 사용자 인증 역할을 함:
 *   - 학번 = 사용자 ID
 *   - 학번은 localStorage에 저장 (다음 방문 시 자동 인식)
 *   - 시간표는 Firestore에 학번별로 저장
 */

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'uos-user'

/**
 * 학번 형식 검증 (8~10자리 숫자)
 */
function isValidStudentId(id) {
  return /^\d{6,10}$/.test(String(id || ''))
}

/**
 * 로컬에 저장된 사용자 정보 읽기
 */
export function getStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!isValidStudentId(parsed?.studentId)) return null
    return parsed
  } catch {
    return null
  }
}

/**
 * 사용자 저장
 */
export function saveUser({ studentId, name }) {
  if (!isValidStudentId(studentId)) {
    throw new Error('학번 형식이 올바르지 않아요.')
  }
  const user = {
    studentId: String(studentId),
    name: name || null,
    savedAt: new Date().toISOString(),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  // 다른 컴포넌트에 알림
  window.dispatchEvent(new CustomEvent('uos-user-changed', { detail: user }))
  return user
}

/**
 * 로그아웃 (저장된 사용자 정보 제거)
 */
export function clearUser() {
  localStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(new CustomEvent('uos-user-changed', { detail: null }))
}

/**
 * React hook — 로그인 상태 관리
 */
export function useUser() {
  const [user, setUser] = useState(() => getStoredUser())

  useEffect(() => {
    const handler = (e) => setUser(e.detail)
    window.addEventListener('uos-user-changed', handler)
    return () => window.removeEventListener('uos-user-changed', handler)
  }, [])

  return user
}
