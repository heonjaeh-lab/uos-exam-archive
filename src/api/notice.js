/**
 * 자유전공학부 공지사항 클라이언트
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

export async function fetchNoticeBoard(board = 'academic', page = 1) {
  const res = await fetch(`${BACKEND_URL}/api/notice?board=${board}&page=${page}`)
  if (!res.ok) throw new Error(`공지 로딩 실패: ${res.status}`)
  return res.json()
}

export async function fetchAllNoticeBoards() {
  const res = await fetch(`${BACKEND_URL}/api/notice/all`)
  if (!res.ok) throw new Error(`공지 로딩 실패: ${res.status}`)
  return res.json()
}
