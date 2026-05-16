/**
 * 랜덤 부엉이 아바타 선택 유틸리티
 *
 * public/avatars/ 폴더의 이미지를 랜덤으로 하나 반환.
 * 새로고침할 때마다 다른 부엉이가 떠요.
 */

const AVATARS = [
  'avatar1.png',
  'avatar2.png',
  'avatar3.png',
  'avatar4.png',
  'avatar5.png',
  'avatar6.png',
  'avatar7.png',
  'avatar8.png',
  'avatar9.png',
  'avatar10.png',
  'avatar11.png',
]

/**
 * 매 호출마다 다른 랜덤 아바타
 */
export function getRandomAvatar() {
  const basePath = import.meta.env.BASE_URL
  const idx = Math.floor(Math.random() * AVATARS.length)
  return `${basePath}avatars/${AVATARS[idx]}`
}

/**
 * 페이지 세션 동안 고정되는 랜덤 아바타 (sessionStorage)
 * - 페이지 이동해도 같은 부엉이가 떠서 일관성 있음
 * - 새로고침 시에는 다시 랜덤 선택
 */
let _sessionAvatar = null
export function getSessionAvatar() {
  if (_sessionAvatar) return _sessionAvatar
  try {
    const cached = sessionStorage.getItem('uos-avatar')
    if (cached) {
      _sessionAvatar = cached
      return cached
    }
  } catch {}
  const url = getRandomAvatar()
  _sessionAvatar = url
  try {
    sessionStorage.setItem('uos-avatar', url)
  } catch {}
  return url
}
