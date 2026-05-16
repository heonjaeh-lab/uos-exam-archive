/**
 * 시립대 학식 페이지 크롤러 (v2)
 *
 * 시립대 학식 페이지는 일별 + 주간 데이터를 둘 다 표시함.
 * - 일별: '오늘' 기준 (요청 시점이 주말이면 비어있음)
 * - 주간: 월~일 전체 메뉴 (이게 더 안정적)
 *
 * 전략: 주간 테이블에서 요청 날짜에 해당하는 행을 추출.
 *
 * URL: https://www.uos.ac.kr/food/placeList.do?rstcde={코드}
 * 식당 코드:
 *   010: 100주년기념관 이룸라운지
 *   020: 학생회관 1층
 *   030: 양식당
 *   040: 자연과학관
 */

import * as cheerio from 'cheerio'

export const RESTAURANTS = [
  { code: '020', name: '학생회관 1층', shortName: '학생회관' },
  { code: '010', name: '100주년기념관 이룸라운지', shortName: '이룸라운지' },
  { code: '030', name: '양식당', shortName: '양식당' },
  { code: '040', name: '자연과학관', shortName: '자연과학관' },
]

const BASE_URL = 'https://www.uos.ac.kr/food/placeList.do'
const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

/**
 * 텍스트에서 m/d 패턴 추출 (예: "5/18 (월)" → {month:5, day:18})
 */
function parseDateLabel(text) {
  const m = text.match(/(\d{1,2})\/(\d{1,2})/)
  if (!m) return null
  return { month: parseInt(m[1], 10), day: parseInt(m[2], 10) }
}

/**
 * 한 식당의 식단을 가져와서 특정 날짜에 해당하는 메뉴 추출
 */
async function fetchOneCafeteria(rstcde, targetMonth, targetDay) {
  const url = `${BASE_URL}?rstcde=${rstcde}&menuid=2000005006002000000`
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'ko-KR,ko;q=0.9' },
  })
  if (!res.ok) throw new Error(`학식 응답 오류: ${res.status}`)

  const html = await res.text()
  const $ = cheerio.load(html)

  // 주간 식단 테이블 찾기 (caption에 "주간별" 포함)
  let weeklyTable = null
  $('table').each((_, t) => {
    const cap = $(t).find('caption').text()
    if (cap.includes('주간별')) {
      weeklyTable = t
      return false
    }
  })

  // 일별 테이블 fallback
  let dailyMeals = null
  if (!weeklyTable) {
    $('table').each((_, t) => {
      const cap = $(t).find('caption').text()
      if (cap.includes('날짜별')) {
        const tds = $(t).find('tbody td').toArray()
        const texts = tds.map((td) => $(td).text().trim())
        if (texts.length && !texts.every((x) => /글이 없습니다/.test(x))) {
          dailyMeals = {
            breakfast: texts[0] || null,
            lunch: texts[1] || null,
            dinner: texts[2] || null,
          }
        }
        return false
      }
    })
  }

  // 주간 테이블 파싱
  // 시립대 페이지 구조: 한 tr = [날짜th, 조식th, 조식td, 중식th, 중식td, 석식th, 석식td] (7개 셀)
  const weeklyMeals = {}
  const extractText = ($el) => {
    return ($el.html() || '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim()
  }

  if (weeklyTable) {
    $(weeklyTable)
      .find('tbody tr')
      .each((_, tr) => {
        const cells = $(tr).find('th, td').toArray()
        if (cells.length < 7) return

        const dateLabel = $(cells[0]).text().trim()
        const date = parseDateLabel(dateLabel)
        if (!date) return

        // 인덱스 기반 추출 (2=조식, 4=중식, 6=석식)
        const breakfast = extractText($(cells[2]))
        const lunch = extractText($(cells[4]))
        const dinner = extractText($(cells[6]))

        weeklyMeals[`${date.month}-${date.day}`] = {
          breakfast: breakfast || null,
          lunch: lunch || null,
          dinner: dinner || null,
        }
      })
  }

  // 결과 결정 우선순위: target 날짜 주간 데이터 > 일별 fallback
  let result = null
  if (targetMonth && targetDay) {
    result = weeklyMeals[`${targetMonth}-${targetDay}`] || null
  }
  if (!result && dailyMeals) result = dailyMeals
  if (!result) {
    // 주간 데이터 중 첫 번째라도
    const firstKey = Object.keys(weeklyMeals)[0]
    if (firstKey) result = weeklyMeals[firstKey]
  }

  const empty =
    !result || (!result.breakfast && !result.lunch && !result.dinner)

  return {
    rstcde,
    meals: result || { breakfast: null, lunch: null, dinner: null },
    empty,
    weeklyAvailable: Object.keys(weeklyMeals).length > 0,
  }
}

/**
 * 모든 식당의 식단 한꺼번에 가져오기
 */
export async function fetchAllCafeterias(yyyymmdd = '') {
  let targetMonth = null
  let targetDay = null

  if (yyyymmdd && /^\d{8}$/.test(yyyymmdd)) {
    targetMonth = parseInt(yyyymmdd.slice(4, 6), 10)
    targetDay = parseInt(yyyymmdd.slice(6, 8), 10)
  } else {
    const d = new Date()
    targetMonth = d.getMonth() + 1
    targetDay = d.getDate()
  }

  const results = await Promise.allSettled(
    RESTAURANTS.map((r) => fetchOneCafeteria(r.code, targetMonth, targetDay)),
  )

  const restaurants = RESTAURANTS.map((r, i) => {
    const result = results[i]
    if (result.status === 'fulfilled') {
      return { ...r, ...result.value }
    }
    return { ...r, error: result.reason?.message || '로딩 실패', meals: null, empty: true }
  })

  return {
    date: yyyymmdd || todayYYYYMMDD(),
    fetchedAt: new Date().toISOString(),
    restaurants,
  }
}

function todayYYYYMMDD() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}${mm}${dd}`
}
