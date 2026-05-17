/**
 * 학식 데이터 클라이언트
 *
 * 데이터 출처: public/data/cafeteria.json (정적 파일)
 *   - 매일 11시 관리자 컴퓨터에서 시립대 크롤링 (scripts/update-cafeteria.mjs)
 *   - Git push → GitHub Pages 자동 배포 → 사이트 갱신
 *
 * 시립대 본 도메인(www.uos.ac.kr)이 클라우드 호스팅 IP를 차단해서
 * Render/Cloudflare 같은 서버 측 크롤링 불가능 → 정적 데이터 방식.
 */

/**
 * cafeteria.json 데이터 가져오기
 *
 * @param {Date|string} date - 표시할 날짜
 * @returns {Promise<{date, restaurants}>}
 */
export async function fetchCafeterias(date) {
  let targetMonth, targetDay
  if (date instanceof Date) {
    targetMonth = date.getMonth() + 1
    targetDay = date.getDate()
  } else if (typeof date === 'string' && /^\d{8}$/.test(date)) {
    targetMonth = parseInt(date.slice(4, 6), 10)
    targetDay = parseInt(date.slice(6, 8), 10)
  } else {
    const d = new Date()
    targetMonth = d.getMonth() + 1
    targetDay = d.getDate()
  }

  const base = import.meta.env.BASE_URL || '/'
  const res = await fetch(`${base}data/cafeteria.json?t=${Date.now()}`)
  if (!res.ok) throw new Error('학식 데이터 로딩 실패')
  const raw = await res.json()

  // 각 식당에서 요청 날짜 데이터만 추출
  const key = `${targetMonth}-${targetDay}`
  const restaurants = (raw.restaurants || []).map((r) => {
    const meals = r.weeklyMeals?.[key] || null
    const empty = !meals || (!meals.breakfast && !meals.lunch && !meals.dinner)
    return {
      ...r,
      meals: meals || { breakfast: null, lunch: null, dinner: null },
      empty,
    }
  })

  const yyyy = new Date().getFullYear()
  return {
    date:
      typeof date === 'string'
        ? date
        : `${yyyy}${String(targetMonth).padStart(2, '0')}${String(targetDay).padStart(2, '0')}`,
    fetchedAt: raw.fetchedAt,
    restaurants,
  }
}
