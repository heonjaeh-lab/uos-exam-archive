/**
 * 시립대 학식 페이지 크롤러
 *
 * URL: https://www.uos.ac.kr/food/placeList.do?rstcde={코드}&yyyy={YYYYMMDD}
 *
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
 * 특정 식당의 특정 날짜 식단 가져오기
 *
 * @param {string} rstcde 식당 코드 (예: '020')
 * @param {string} yyyymmdd 날짜 YYYYMMDD (선택, 비우면 오늘)
 */
async function fetchOneCafeteria(rstcde, yyyymmdd = '') {
  const params = new URLSearchParams({
    rstcde,
    menuid: '2000005006002000000',
  })
  if (yyyymmdd) params.set('yyyymm', yyyymmdd)

  const url = `${BASE_URL}?${params.toString()}`
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'ko-KR,ko;q=0.9' },
  })
  if (!res.ok) throw new Error(`학식 페이지 응답 오류: ${res.status}`)

  const html = await res.text()
  const $ = cheerio.load(html)

  // 페이지의 식단 테이블 찾기 (caption에 "조식, 중식, 석식" 있는 첫 테이블)
  let foundTable = null
  $('table').each((_, table) => {
    const caption = $(table).find('caption').text()
    if (caption.includes('조식') && caption.includes('중식')) {
      foundTable = table
      return false
    }
  })

  // 날짜 정보 추출
  const dateText = $('h3, .date, .day').first().text().trim() ||
    $('strong').filter((_, el) => /\d{4}\.\s*\d+/.test($(el).text())).first().text().trim()

  if (!foundTable) {
    return {
      rstcde,
      date: dateText,
      meals: { breakfast: null, lunch: null, dinner: null },
      empty: true,
    }
  }

  // 테이블의 두 번째 행(데이터 행)의 셀들이 조식/중식/석식
  const $table = $(foundTable)
  const cells = $table.find('tbody tr td').toArray()
  const cellTexts = cells.map((c) =>
    $(c)
      .text()
      .replace(/\s+/g, ' ')
      .trim(),
  )

  // 셀이 "글이 없습니다" 인 경우 처리
  const isEmpty = cellTexts.length === 0 || cellTexts.every((t) => /글이 없습니다/.test(t))

  return {
    rstcde,
    date: dateText,
    meals: {
      breakfast: cellTexts[0] && !/글이 없습니다/.test(cellTexts[0]) ? cellTexts[0] : null,
      lunch: cellTexts[1] && !/글이 없습니다/.test(cellTexts[1]) ? cellTexts[1] : null,
      dinner: cellTexts[2] && !/글이 없습니다/.test(cellTexts[2]) ? cellTexts[2] : null,
    },
    empty: isEmpty,
  }
}

/**
 * 모든 식당의 오늘 식단 한꺼번에 가져오기
 *
 * @param {string} yyyymmdd 선택, 비우면 오늘
 * @returns {Promise<{date, restaurants: Array}>}
 */
export async function fetchAllCafeterias(yyyymmdd = '') {
  const results = await Promise.allSettled(
    RESTAURANTS.map((r) => fetchOneCafeteria(r.code, yyyymmdd)),
  )

  const restaurants = RESTAURANTS.map((r, i) => {
    const result = results[i]
    if (result.status === 'fulfilled') {
      return { ...r, ...result.value }
    }
    return { ...r, error: result.reason?.message || '로딩 실패', meals: null }
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
