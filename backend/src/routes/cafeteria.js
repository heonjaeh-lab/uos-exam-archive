import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { fetchAllCafeterias, RESTAURANTS } from '../services/cafeteriaScraper.js'

const router = Router()

// 캐시 (5분 - 학식 데이터는 자주 안 바뀜)
const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5분

const cafeteriaLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
})

/**
 * GET /api/cafeteria?date=20260517
 * 모든 식당의 식단 한꺼번에 가져오기
 */
router.get('/cafeteria', cafeteriaLimiter, async (req, res) => {
  const date = (req.query.date || '').toString().trim()

  // 날짜 형식 검증 (YYYYMMDD 8자리, 비어있으면 오늘)
  if (date && !/^\d{8}$/.test(date)) {
    return res.status(400).json({ error: '날짜는 YYYYMMDD 형식 (예: 20260517)' })
  }

  // 캐시 확인
  const cacheKey = `cafeteria-${date || 'today'}`
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return res.json({ ...cached.data, cached: true })
  }

  try {
    const data = await fetchAllCafeterias(date)
    cache.set(cacheKey, { time: Date.now(), data })
    res.json(data)
  } catch (error) {
    console.error('[cafeteria] 오류:', error.message)
    res.status(500).json({ error: '학식 정보를 가져올 수 없어요.' })
  }
})

/**
 * GET /api/cafeteria/restaurants
 * 식당 목록만 반환 (코드 매핑용)
 */
router.get('/cafeteria/restaurants', (req, res) => {
  res.json({ restaurants: RESTAURANTS })
})

/**
 * GET /api/cafeteria/debug
 * 시립대 페이지 raw 확인 (디버그용)
 */
router.get('/cafeteria/debug', async (req, res) => {
  try {
    const url = 'https://www.uos.ac.kr/food/placeList.do?rstcde=020&menuid=2000005006002000000'
    const r = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'ko-KR,ko;q=0.9',
      },
    })
    const html = await r.text()
    const has주간별 = html.includes('주간별')
    const has월 = html.includes('월)')
    const tableMatches = (html.match(/<caption>/g) || []).length
    res.json({
      status: r.status,
      contentType: r.headers.get('content-type'),
      htmlLength: html.length,
      has주간별,
      has월,
      tableCount: tableMatches,
      htmlSnippet: html.slice(0, 300),
      weeklyTableSnippet: has주간별 ? html.slice(html.indexOf('주간별'), html.indexOf('주간별') + 1500) : null,
    })
  } catch (e) {
    res.status(500).json({ error: e.message, stack: e.stack })
  }
})

export default router
