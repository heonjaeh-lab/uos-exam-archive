/**
 * 학식 데이터 클라이언트
 *
 * 우리 백엔드(Render)가 시립대 학식 페이지를 크롤링해서 JSON으로 변환해줌.
 */

// 학식 크롤링은 한국 IP 필요 → Cloudflare Workers 우선, 없으면 백엔드
const BACKEND_URL =
  import.meta.env.VITE_CRAWLER_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  'http://localhost:3001'

/**
 * 모든 식당의 식단 가져오기
 *
 * @param {Date|string} date 날짜 (Date 객체 또는 YYYYMMDD 문자열, 비우면 오늘)
 * @returns {Promise<{date, restaurants: Array}>}
 */
export async function fetchCafeterias(date) {
  let yyyymmdd = ''
  if (date instanceof Date) {
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth() + 1).padStart(2, '0')
    const dd = String(date.getDate()).padStart(2, '0')
    yyyymmdd = `${yyyy}${mm}${dd}`
  } else if (typeof date === 'string') {
    yyyymmdd = date.replace(/\D/g, '').slice(0, 8)
  }

  const url = yyyymmdd
    ? `${BACKEND_URL}/api/cafeteria?date=${yyyymmdd}`
    : `${BACKEND_URL}/api/cafeteria`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`학식 로딩 실패: ${res.status}`)
  return res.json()
}
