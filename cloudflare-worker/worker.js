/**
 * UOS Archive — Cloudflare Workers 크롤러
 *
 * 학식/공지 페이지를 시립대 사이트에서 직접 fetch.
 * 사용자 근처 PoP에서 실행되므로 한국 IP로 요청 가능.
 *
 * 배포: Cloudflare Dashboard → Workers & Pages → Create Worker → 코드 붙여넣기
 *
 * 엔드포인트:
 *   GET /api/health
 *   GET /api/cafeteria?date=YYYYMMDD
 *   GET /api/notice?board=academic|general
 */

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

const ALLOWED_ORIGINS = [
  'https://heonjaeh-lab.github.io', // 실제 GitHub Pages 호스팅 도메인
  'https://haheonjae.github.io', // 구 도메인 (호환 유지)
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
]

// 인메모리 캐시 (Worker 인스턴스 내 - PoP별)
const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5분

export default {
  async fetch(request) {
    const url = new URL(request.url)
    const origin = request.headers.get('Origin') || ''
    const corsHeaders = makeCorsHeaders(origin)

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders })
    }

    try {
      let response
      if (url.pathname === '/api/health') {
        response = json({
          status: 'ok',
          timestamp: new Date().toISOString(),
          colo: request.cf?.colo || 'unknown',
          country: request.cf?.country || 'unknown',
        })
      } else if (url.pathname === '/api/debug') {
        // 시립대 페이지 fetch 결과 직접 확인
        const r = await fetch('https://www.uos.ac.kr/food/placeList.do?rstcde=020', {
          headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'ko-KR,ko;q=0.9' },
        })
        const html = await r.text()
        response = json({
          colo: request.cf?.colo,
          status: r.status,
          contentType: r.headers.get('content-type'),
          htmlLength: html.length,
          has주간별: html.includes('주간별'),
          htmlSnippet: html.slice(0, 500),
        })
      } else if (url.pathname === '/api/cafeteria') {
        response = await handleCafeteria(url.searchParams)
      } else if (url.pathname === '/api/notice') {
        response = await handleNotice(url.searchParams)
      } else if (url.pathname === '/api/server-time') {
        // 시립대 수강신청 서버 시간 (sugang.uos.ac.kr 의 Date 헤더)
        response = await handleServerTime()
      } else if (url.pathname.startsWith('/api/uos/')) {
        // 시립대 OpenAPI 프록시: /api/uos/<endpoint>?<params>
        // 예: /api/uos/ApiTimeTable/list.do?apiKey=...&year=2026&term=10
        response = await handleUosApi(url)
      } else {
        response = json({ error: 'Not Found' }, 404)
      }

      // CORS 헤더 추가
      Object.entries(corsHeaders).forEach(([k, v]) => response.headers.set(k, v))
      return response
    } catch (err) {
      return json({ error: err.message }, 500, corsHeaders)
    }
  },
}

/* ───── 유틸 ───── */
function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...extraHeaders,
    },
  })
}

function makeCorsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin)
  return {
    'Access-Control-Allow-Origin': allowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  }
}

function cached(key, ttl, fn) {
  const hit = cache.get(key)
  if (hit && Date.now() - hit.time < ttl) {
    return Promise.resolve(hit.data)
  }
  return fn().then((data) => {
    cache.set(key, { time: Date.now(), data })
    // 캐시 크기 제한
    if (cache.size > 50) {
      const first = cache.keys().next().value
      cache.delete(first)
    }
    return data
  })
}

async function fetchHtml(url) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept-Language': 'ko-KR,ko;q=0.9',
    },
    cf: { cacheTtl: 300, cacheEverything: false },
  })
  if (!res.ok) throw new Error(`Fetch 실패: ${res.status}`)
  return res.text()
}

/* ───── 시립대 수강신청 서버 시간 ───── */
// sugang.uos.ac.kr 의 HTTP Date 응답 헤더로 시립대 서버 시간 동기화.
// 네이비즘처럼 KST 기준 시립대 정확한 시간을 보여줄 수 있게 됨.
async function handleServerTime() {
  const targets = [
    'https://sugang.uos.ac.kr/',
    'https://wise.uos.ac.kr/index.do',
  ]
  for (const target of targets) {
    try {
      // HEAD 요청으로 빠르게 (본문 안 받음)
      const startedAt = Date.now()
      const res = await fetch(target, {
        method: 'HEAD',
        headers: { 'User-Agent': USER_AGENT },
        cf: { cacheTtl: 0, cacheEverything: false },
      })
      const elapsedMs = Date.now() - startedAt
      const serverDate = res.headers.get('date')
      if (!serverDate) continue
      const serverMs = new Date(serverDate).getTime()
      if (Number.isNaN(serverMs)) continue
      // 응답 받은 시점이 서버 Date에 round-trip 절반 만큼 지난 후
      const correctedServerMs = serverMs + Math.floor(elapsedMs / 2)
      return json({
        source: target,
        serverTime: new Date(correctedServerMs).toISOString(),
        serverTimeMs: correctedServerMs,
        responseTimeMs: elapsedMs,
        rawDateHeader: serverDate,
      })
    } catch {
      // 다음 후보 시도
    }
  }
  return json({ error: '시립대 서버 시간을 가져오지 못했어요' }, 502)
}

/* ───── 시립대 OpenAPI 프록시 ───── */
// 시립대 wise.uos.ac.kr/COM/ApiXxxx/list.do는 CORS 안 풀어줘서
// 브라우저에서 직접 호출 불가 → Worker가 대신 호출해서 JSON 그대로 전달.
async function handleUosApi(url) {
  // /api/uos/ApiTimeTable/list.do → ApiTimeTable/list.do
  const endpoint = url.pathname.replace(/^\/api\/uos\//, '')
  // 엔드포인트 검증: 시립대 API 패턴만 허용
  if (!/^Api[A-Za-z]+\/[a-z]+\.do$/.test(endpoint)) {
    return json({ error: '허용되지 않는 엔드포인트' }, 400)
  }

  const cacheKey = `uos-${endpoint}-${url.search}`
  const data = await cached(cacheKey, 10 * 60 * 1000, async () => {
    const upstreamUrl = `https://wise.uos.ac.kr/COM/${endpoint}${url.search}`
    const res = await fetch(upstreamUrl, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json',
        'Accept-Language': 'ko-KR,ko;q=0.9',
      },
      cf: { cacheTtl: 600, cacheEverything: false },
    })
    if (!res.ok) throw new Error(`시립대 API 오류: ${res.status}`)
    return res.json()
  })

  return json(data)
}

/* ───── 학식 ───── */
const RESTAURANTS = [
  { code: '020', name: '학생회관 1층', shortName: '학생회관' },
  { code: '010', name: '100주년기념관 이룸라운지', shortName: '이룸라운지' },
  { code: '030', name: '양식당', shortName: '양식당' },
  { code: '040', name: '자연과학관', shortName: '자연과학관' },
]

function parseDateLabel(text) {
  const m = text.match(/(\d{1,2})\/(\d{1,2})/)
  return m ? { month: parseInt(m[1], 10), day: parseInt(m[2], 10) } : null
}

function htmlToText(html) {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n/g, '\n')
    .trim()
}

async function fetchOneCafeteria(rstcde, targetMonth, targetDay) {
  const url = `https://www.uos.ac.kr/food/placeList.do?rstcde=${rstcde}&menuid=2000005006002000000`
  const html = await fetchHtml(url)

  // 주간 테이블 추출
  const weeklyMeals = {}
  const weeklyMatch = html.match(
    /<caption>[^<]*주간별[^<]*<\/caption>[\s\S]*?<tbody>([\s\S]*?)<\/tbody>/,
  )
  if (weeklyMatch) {
    const tbody = weeklyMatch[1]
    const rows = tbody.match(/<tr[^>]*>[\s\S]*?<\/tr>/g) || []
    rows.forEach((row) => {
      const cells = row.match(/<(th|td)[^>]*>([\s\S]*?)<\/\1>/g) || []
      if (cells.length < 7) return

      const cellTexts = cells.map((c) => {
        const inner = c.replace(/^<(th|td)[^>]*>/, '').replace(/<\/(th|td)>$/, '')
        return htmlToText(inner)
      })

      const date = parseDateLabel(cellTexts[0])
      if (!date) return

      weeklyMeals[`${date.month}-${date.day}`] = {
        breakfast: cellTexts[2] || null,
        lunch: cellTexts[4] || null,
        dinner: cellTexts[6] || null,
      }
    })
  }

  // 일별 fallback
  let dailyMeals = null
  const dailyMatch = html.match(
    /<caption>[^<]*날짜별[^<]*<\/caption>[\s\S]*?<tbody>([\s\S]*?)<\/tbody>/,
  )
  if (dailyMatch) {
    const tds = dailyMatch[1].match(/<td[^>]*>[\s\S]*?<\/td>/g) || []
    if (tds.length >= 3 && !tds[0].includes('글이 없습니다')) {
      dailyMeals = {
        breakfast: htmlToText(tds[0]) || null,
        lunch: htmlToText(tds[1]) || null,
        dinner: htmlToText(tds[2]) || null,
      }
    }
  }

  // 결과 결정
  let result = null
  if (targetMonth && targetDay) {
    result = weeklyMeals[`${targetMonth}-${targetDay}`] || null
  }
  if (!result && dailyMeals) result = dailyMeals
  if (!result) {
    const firstKey = Object.keys(weeklyMeals)[0]
    if (firstKey) result = weeklyMeals[firstKey]
  }

  const empty = !result || (!result.breakfast && !result.lunch && !result.dinner)
  return {
    rstcde,
    meals: result || { breakfast: null, lunch: null, dinner: null },
    empty,
    weeklyAvailable: Object.keys(weeklyMeals).length > 0,
  }
}

async function handleCafeteria(searchParams) {
  const date = (searchParams.get('date') || '').trim()
  if (date && !/^\d{8}$/.test(date)) {
    return json({ error: '날짜 형식: YYYYMMDD' }, 400)
  }

  let targetMonth, targetDay
  if (date) {
    targetMonth = parseInt(date.slice(4, 6), 10)
    targetDay = parseInt(date.slice(6, 8), 10)
  } else {
    const d = new Date()
    targetMonth = d.getMonth() + 1
    targetDay = d.getDate()
  }

  const cacheKey = `cafe-${date || 'today'}`
  const data = await cached(cacheKey, CACHE_TTL, async () => {
    const results = await Promise.allSettled(
      RESTAURANTS.map((r) => fetchOneCafeteria(r.code, targetMonth, targetDay)),
    )
    const restaurants = RESTAURANTS.map((r, i) => {
      const result = results[i]
      if (result.status === 'fulfilled') return { ...r, ...result.value }
      return {
        ...r,
        error: result.reason?.message || '실패',
        meals: { breakfast: null, lunch: null, dinner: null },
        empty: true,
      }
    })
    return {
      date:
        date ||
        `${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(
          2,
          '0',
        )}${String(new Date().getDate()).padStart(2, '0')}`,
      fetchedAt: new Date().toISOString(),
      restaurants,
    }
  })

  return json(data)
}

/* ───── 공지사항 ───── */
const NOTICE_BOARDS = {
  academic: { path: '/community/notice-academic', label: '학부공지' },
  general: { path: '/community/notice-general', label: '행사공지' },
}

async function handleNotice(searchParams) {
  const board = (searchParams.get('board') || 'academic').toString()
  const info = NOTICE_BOARDS[board]
  if (!info) return json({ error: '잘못된 게시판' }, 400)

  const cacheKey = `notice-${board}`
  const data = await cached(cacheKey, 10 * 60 * 1000, async () => {
    const html = await fetchHtml(`https://libe.uos.ac.kr${info.path}`)

    // 공지 행 추출 (테이블 형태)
    const rows = html.match(/<tr[^>]*>[\s\S]*?<\/tr>/g) || []
    const notices = []
    rows.forEach((row) => {
      if (row.includes('<th')) return // 헤더 행

      const tds = row.match(/<td[^>]*>[\s\S]*?<\/td>/g) || []
      if (tds.length < 4) return

      // 제목 + 링크
      const linkMatch = row.match(
        /<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/,
      )
      if (!linkMatch) return
      const href = linkMatch[1]
      const titleRaw = linkMatch[2]
      // span 안의 제목
      const titleSpan = titleRaw.match(/<span[^>]*>([^<]+)<\/span>/)
      const title = titleSpan ? titleSpan[1].trim() : htmlToText(titleRaw)
      if (!title) return

      const bbsidx = href.match(/bbsidx=(\d+)/)?.[1] || null

      // 카테고리 (학사/일반/장학)
      let category = '기타'
      const catMatch = row.match(/<td[^>]*>\s*(학사|일반|장학)\s*<\/td>/)
      if (catMatch) category = catMatch[1]

      // 날짜
      const dateMatch = row.match(/(\d{4}-\d{2}-\d{2})/)
      const date = dateMatch ? dateMatch[1] : ''

      // 조회수 (마지막 숫자 td)
      let views = null
      const numTds = tds
        .map((t) => htmlToText(t))
        .filter((t) => /^\d+$/.test(t))
      if (numTds.length) views = parseInt(numTds[numTds.length - 1], 10)

      const pinned = row.includes('class="noti"') || row.includes('>공지<')

      notices.push({
        id: bbsidx,
        title,
        category,
        date,
        views,
        url: href.startsWith('http') ? href : `https://libe.uos.ac.kr${href}`,
        pinned,
      })
    })

    return {
      board,
      boardLabel: info.label,
      notices,
      fetchedAt: new Date().toISOString(),
    }
  })

  return json(data)
}
