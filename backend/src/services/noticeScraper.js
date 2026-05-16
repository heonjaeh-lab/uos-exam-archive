/**
 * 시립대 자유전공학부 공지사항 크롤러
 *
 * 출처:
 *   학부공지: https://libe.uos.ac.kr/community/notice-academic
 *   행사공지: https://libe.uos.ac.kr/community/notice-general
 *
 * 페이지 구조 (테이블):
 *   <tr class="noti">
 *     <td>No / 공지</td>
 *     <td>분류 (학사/일반/장학)</td>
 *     <td class="title">제목 <a href="...?bbsidx=NNN"></a></td>
 *     <td>날짜</td>
 *     <td>조회수</td>
 *   </tr>
 */

import * as cheerio from 'cheerio'

const BASE = 'https://libe.uos.ac.kr'

export const NOTICE_BOARDS = {
  academic: { path: '/community/notice-academic', label: '학부공지' },
  general: { path: '/community/notice-general', label: '행사공지' },
}

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

/**
 * 공지 리스트 가져오기
 *
 * @param {'academic'|'general'} board 게시판 종류
 * @param {number} page 페이지 번호 (1-based)
 */
export async function fetchNotices(board = 'academic', page = 1) {
  const boardInfo = NOTICE_BOARDS[board]
  if (!boardInfo) throw new Error('알 수 없는 게시판: ' + board)

  const url = `${BASE}${boardInfo.path}${page > 1 ? `?page=${page}` : ''}`
  const res = await fetch(url, {
    headers: { 'User-Agent': USER_AGENT, 'Accept-Language': 'ko-KR,ko;q=0.9' },
  })
  if (!res.ok) throw new Error(`공지 페이지 응답 오류: ${res.status}`)

  const html = await res.text()
  const $ = cheerio.load(html)

  const notices = []
  $('tr').each((_, tr) => {
    const $tr = $(tr)
    // 헤더 행 제외
    if ($tr.find('th').length > 0) return

    const tds = $tr.find('td').toArray()
    if (tds.length < 4) return

    const $link = $tr.find('td.title a, td.noti-tit a').first()
    if ($link.length === 0) return

    const title = $link.find('span').last().text().trim() || $link.text().trim()
    if (!title) return

    const href = $link.attr('href') || ''
    const bbsidxMatch = href.match(/bbsidx=(\d+)/)
    const url = href.startsWith('http') ? href : `${BASE}${href}`

    // 분류 추출 (학사/일반/장학)
    let category = ''
    tds.forEach((td) => {
      const txt = $(td).text().trim()
      if (/^(학사|일반|장학)$/.test(txt)) category = txt
    })

    // 날짜 추출 (YYYY-MM-DD 패턴)
    let date = ''
    tds.forEach((td) => {
      const txt = $(td).text().trim()
      const m = txt.match(/(\d{4}-\d{2}-\d{2})/)
      if (m) date = m[1]
    })

    // 조회수 추출 (숫자만 있는 td 중 두 번째)
    let views = null
    const numbersOnly = tds
      .map((td) => $(td).text().trim())
      .filter((t) => /^\d+$/.test(t))
    if (numbersOnly.length > 0) views = parseInt(numbersOnly[numbersOnly.length - 1], 10)

    // 공지 (notice) 여부
    const isPinned = $tr.hasClass('noti') ||
      $tr.find('.notice').length > 0 ||
      tds.some((td) => $(td).text().trim() === '공지')

    notices.push({
      id: bbsidxMatch ? bbsidxMatch[1] : null,
      title,
      category: category || '기타',
      date,
      views,
      url,
      pinned: isPinned,
    })
  })

  return {
    board,
    boardLabel: boardInfo.label,
    page,
    notices,
    fetchedAt: new Date().toISOString(),
  }
}

/**
 * 모든 게시판 한꺼번에 가져오기
 */
export async function fetchAllBoards() {
  const results = await Promise.allSettled([
    fetchNotices('academic', 1),
    fetchNotices('general', 1),
  ])

  return {
    boards: results.map((r, i) => {
      const key = i === 0 ? 'academic' : 'general'
      if (r.status === 'fulfilled') return r.value
      return {
        board: key,
        boardLabel: NOTICE_BOARDS[key].label,
        error: r.reason?.message || '로딩 실패',
        notices: [],
      }
    }),
    fetchedAt: new Date().toISOString(),
  }
}
