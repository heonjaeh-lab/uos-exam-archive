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
 * 점심 메뉴 중 "오늘의 특별 메뉴" 추출
 *
 * 같은 주의 다른 날과 비교해서 오늘만 등장하거나 드물게 등장하는 아이템을 골라냄.
 * (예: 양식당의 "고구마치즈돈까스"는 매일 등장 → 제외 / "팟타이"는 그 날만 → 포함)
 */
function pickLunchHighlights(weeklyMeals, todayKey) {
  if (!weeklyMeals || !weeklyMeals[todayKey]?.lunch) return []
  const todayItems = weeklyMeals[todayKey].lunch
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
  if (todayItems.length === 0) return []

  // 다른 날들의 점심 아이템 빈도 카운트
  const freq = new Map()
  let dayCount = 0
  for (const [key, meals] of Object.entries(weeklyMeals)) {
    if (!meals?.lunch) continue
    dayCount += 1
    const seenInDay = new Set()
    meals.lunch
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .forEach((item) => {
        if (seenInDay.has(item)) return
        seenInDay.add(item)
        freq.set(item, (freq.get(item) || 0) + 1)
      })
  }

  // 매일 등장(또는 절반 이상 등장)하는 메뉴는 "기본 메뉴"로 간주 → 제외
  const threshold = Math.max(2, Math.ceil(dayCount / 2))
  const highlights = todayItems.filter((item) => (freq.get(item) || 0) < threshold)

  // 특별 메뉴가 너무 적으면(0~1개) 그냥 오늘 메뉴 통째로 (기본 메뉴라도 일단 보여주자)
  if (highlights.length < 2) return todayItems.slice(0, 4)
  return highlights.slice(0, 6)
}

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

  // 각 식당에서 요청 날짜 데이터만 추출 + 주간 비교로 "오늘의 특별 메뉴" 추출
  const key = `${targetMonth}-${targetDay}`
  const restaurants = (raw.restaurants || []).map((r) => {
    const meals = r.weeklyMeals?.[key] || null
    const empty = !meals || (!meals.breakfast && !meals.lunch && !meals.dinner)

    // 점심 메뉴 중 매일 반복되는 아이템 제외 → 오늘만의 특별 메뉴
    // (예: 양식당의 고구마치즈돈까스/치킨까스/쏘이까스는 매일 나오는 기본 메뉴)
    const lunchHighlights = pickLunchHighlights(r.weeklyMeals, key)

    return {
      ...r,
      meals: meals || { breakfast: null, lunch: null, dinner: null },
      lunchHighlights,
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
