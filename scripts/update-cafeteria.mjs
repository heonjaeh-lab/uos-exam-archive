#!/usr/bin/env node
/**
 * 학식 데이터 자동 수집 스크립트
 *
 * 시립대 본 도메인(www.uos.ac.kr)이 클라우드 호스팅 IP를 차단해서
 * Render/Cloudflare에서 fetch 안 됨.
 *
 * 해결: 관리자 컴퓨터(일반 ISP IP)에서 매일 실행 → Git push로 사이트 반영
 *
 * 실행 방법:
 *   node scripts/update-cafeteria.mjs
 *
 * 자동화: Claude Code Scheduled Task로 매일 11시 실행
 *
 * 결과:
 *   public/data/cafeteria.json 업데이트
 */

import { writeFile, mkdir } from 'fs/promises'
import { execSync } from 'child_process'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUTPUT_DIR = join(ROOT, 'public', 'data')
const OUTPUT_FILE = join(OUTPUT_DIR, 'cafeteria.json')

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

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

async function fetchOneCafeteria(rstcde) {
  const url = `https://www.uos.ac.kr/food/placeList.do?rstcde=${rstcde}&menuid=2000005006002000000`
  console.log(`📥 Fetching ${url}`)

  // Node.js fetch는 HTTP/2로 보내서 시립대가 504바이트 SSO 리다이렉트.
  // curl은 HTTP/1.1로 보내서 70KB 정상 응답. → curl로 우회.
  const html = execSync(
    `curl -s --http1.1 -A "${USER_AGENT}" -H "Accept-Language: ko-KR,ko;q=0.9" "${url}"`,
    { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 },
  )
  console.log(`   응답 크기: ${html.length} bytes, 주간별: ${html.includes('주간별')}`)
  if (html.length < 1000) throw new Error('응답 크기 비정상 (차단됨?)')

  // 주간 테이블 파싱
  const weekly = {}
  const m = html.match(
    /<caption>[^<]*주간별[^<]*<\/caption>[\s\S]*?<tbody>([\s\S]*?)<\/tbody>/,
  )
  if (!m) console.log(`   ⚠️ 주간 테이블 정규식 매칭 실패`)
  if (m) {
    const rows = m[1].match(/<tr[^>]*>[\s\S]*?<\/tr>/g) || []
    rows.forEach((row) => {
      const cells = row.match(/<(th|td)[^>]*>([\s\S]*?)<\/\1>/g) || []
      if (cells.length < 7) return
      const texts = cells.map((c) =>
        htmlToText(c.replace(/^<(th|td)[^>]*>/, '').replace(/<\/(th|td)>$/, '')),
      )
      const date = parseDateLabel(texts[0])
      if (!date) return
      weekly[`${date.month}-${date.day}`] = {
        breakfast: texts[2] || null,
        lunch: texts[4] || null,
        dinner: texts[6] || null,
      }
    })
  }

  return {
    rstcde,
    weeklyMeals: weekly,
    weeklyAvailable: Object.keys(weekly).length > 0,
  }
}

async function main() {
  console.log(`🍱 학식 데이터 수집 시작 (${new Date().toISOString()})`)

  // 4개 식당 병렬 fetch
  const results = await Promise.allSettled(
    RESTAURANTS.map((r) => fetchOneCafeteria(r.code)),
  )

  const data = {
    fetchedAt: new Date().toISOString(),
    restaurants: RESTAURANTS.map((r, i) => {
      const res = results[i]
      if (res.status === 'fulfilled') {
        return { ...r, ...res.value }
      }
      return {
        ...r,
        error: res.reason?.message || 'failed',
        weeklyMeals: {},
        weeklyAvailable: false,
      }
    }),
  }

  // 결과 통계
  const totalSlots = data.restaurants.reduce(
    (sum, r) => sum + Object.keys(r.weeklyMeals || {}).length,
    0,
  )
  console.log(`✅ 수집 완료 — 총 ${totalSlots}개 날짜 데이터`)

  // 저장
  await mkdir(OUTPUT_DIR, { recursive: true })
  await writeFile(OUTPUT_FILE, JSON.stringify(data, null, 2), 'utf-8')
  console.log(`💾 ${OUTPUT_FILE}`)

  // Git commit + push (변경사항 있을 때만)
  try {
    const status = execSync('git status --porcelain public/data/cafeteria.json', {
      cwd: ROOT,
      encoding: 'utf-8',
    }).trim()
    if (!status) {
      console.log('🤷 변경사항 없음 — 커밋 생략')
      return
    }
    execSync('git add public/data/cafeteria.json', { cwd: ROOT })
    execSync(
      `git commit -m "chore: update cafeteria data ($(date +%Y-%m-%d))"`,
      { cwd: ROOT, shell: '/bin/bash' },
    )
    execSync('git push', { cwd: ROOT })
    console.log('🚀 Git push 완료')
  } catch (err) {
    console.error('⚠️ Git push 실패:', err.message)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('❌ 에러:', err)
  process.exit(1)
})
