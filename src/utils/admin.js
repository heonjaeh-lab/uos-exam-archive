/**
 * 관리자 권한 체크
 *
 * 현재는 단일 관리자 (사이트 운영자)만 지정.
 * 필요시 ADMIN_IDS 배열에 추가.
 */

// 관리자 포털 ID 목록 — 이 ID로 로그인하면 /admin 페이지 접근 가능
const ADMIN_IDS = ['heonjaeh']

export function isAdmin(user) {
  if (!user?.studentId) return false
  return ADMIN_IDS.includes(String(user.studentId).trim().toLowerCase())
}
