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

/**
 * 메뉴 텍스트 정리 — 음식 이름만 남기기
 *
 * 제거하는 것:
 *   - 영어 (Ramen, Cold noodles 등)
 *   - 시간 정보 (11:00~13:50)
 *   - 코너 표시 (A코너, B코너)
 *   - 칼로리 정보 (654 kcal / 31.2 g)
 *   - 식재료 원산지 (돈육:국내산)
 *   - 주의사항 (*식재료 조달...)
 *   - 가격 정보 (4,500원, (5,000원))
 */
function cleanMenu(text) {
  if (!text) return null

  // HTML 엔티티 디코드
  text = text
    .replace(/&#43;/g, '+')
    .replace(/&#64;/g, '@')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))

  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => {
      // 시간 정보 (08:30~09:30, 11:00~13:50 등)
      if (/^\d{1,2}:\d{2}(\s*~\s*\d{1,2}:\d{2})?$/.test(line)) return false
      // 칼로리/영양 정보
      if (/kcal|단백질|\d+\s*g\s*\/?\s*\d/i.test(line)) return false
      if (/^\d+\s*kcal/i.test(line)) return false
      // 주의사항 (*로 시작 또는 "변동될 수" 포함)
      if (line.startsWith('*') || line.includes('변동될 수')) return false
      // 코너 표시 (A코너, B 코너, NEW코너 등 — 공백 허용)
      if (/^[A-Z]?\s*코너$/.test(line) || /^코너$/.test(line)) return false
      // 식재료 원산지 (한글:한글산 형태 — "돈육:국산", "오징어:페루산,바지락,홍합:중국산" 등)
      // 콜론/세미콜론, 그리고 "산"으로 끝나는 한글 단어가 하나라도 있으면 원산지 정보
      if (/[가-힣]+\s*[:：;]\s*[가-힣]+산/.test(line)) return false
      // 식사 라벨이 단독으로 들어온 경우 (자연과학관 조식에 "중식 / 석식" 라벨이 들어감)
      if (/^(조식|중식|석식|아침|점심|저녁)(\s*[\/／,，]\s*(조식|중식|석식|아침|점심|저녁))*$/.test(line)) return false
      // 가격만 있는 줄 ((5,000원), 5,000원만)
      if (/^\(?\d{1,3}(,\d{3})*\s*원\)?$/.test(line)) return false
      // 운영/예약/안내 정보
      if (/운영시간|예약신청|신청방법|접수|회신|재료준비/.test(line)) return false
      // 가격 헤더 ("- 일반식 : 7,000원 -", "- 고급식A : 25,000원 -")
      if (/^-\s*.+:\s*\d+,?\d*\s*원\s*-$/.test(line)) return false
      // 이메일 주소 포함
      if (/@/.test(line) && /\.(com|kr|ac)/i.test(line)) return false
      // 시간 안내 (10~17시 등)
      if (/^\d+~\d+\s*시/.test(line)) return false

      // ─── 영어 라인 제거 (강화) ───────────────────────────────────
      const hangulCount = (line.match(/[가-힣]/g) || []).length
      const latinCount = (line.match(/[A-Za-z]/g) || []).length
      // 영어가 3자 이상이고 한글보다 많거나 비등하면 제거
      // (예: "Pepperoni Pizza/for2persons", "arancini con ragù with soda",
      //      "치즈볼Cheese ball(5개)" — 영어가 한글보다 많음)
      if (latinCount >= 3 && latinCount >= hangulCount) return false

      // ─── 식재료 원산지 인라인 표기 제거 ─────────────────────────
      // "돈육pork:국산", "청어알,날치알roe:외국산", "돈육pork,계육chicken:국산"
      // → 한글 바로 뒤에 영어가 붙고 ':'가 있으면 원산지 정보
      if (/[가-힣][A-Za-z]/.test(line) && /[:：]/.test(line)) return false

      // ─── 안내성 문장 제거 ───────────────────────────────────────
      // "간격으로 10~30개씩 조정합니다.", "~을 제공합니다", "~로 운영합니다"
      if (/(합니다|됩니다|드립니다|입니다|있습니다)\s*\.?\s*$/.test(line)) return false
      // "면류,밥류및 스테이크류는" — 조사로 끝나는 미완성 문장
      if (/^[가-힣].{2,}(는|은|이|가|을|를|와|과|및|에)\s*$/.test(line)) return false
      // 안내 키워드 포함
      if (/조정|변동|준비됩|제공됩|판매됩/.test(line)) return false

      return true
    })
    .map((line) => {
      // 메뉴 옆 영어 괄호 제거: "라면(Ramen) 2,500원" → "라면 2,500원"
      line = line.replace(/\(\s*[A-Za-z][A-Za-z\s,&./'-]*\)/g, '')
      // 메뉴 옆 영어 (괄호 없이): "냉면 Cold noodles" → "냉면"
      line = line.replace(/\s+[A-Z][a-z]+(\s+[a-z]+)*\s*$/g, '')
      // 한글 뒤 영어 바로 붙은 거: "치즈볼Cheese ball" → "치즈볼"
      line = line.replace(/([가-힣])[A-Za-z][A-Za-z\s,()&./'-]*$/g, '$1')
      // 영어:한글 패턴: "돈육pork:국산" → "" (식재료 정보)
      line = line.replace(/^[가-힣]+[A-Za-z]+\s*[:：].+$/, '')
      // 가격 옆 숫자+영어 잔재: "(2dumpling)" 제거
      line = line.replace(/\(\d+[a-z]+\)/gi, '')
      // 식재료 원산지 제거: "왕만두 돈육:국내산" → "왕만두", "튀김(오징어):중국산" → "튀김"
      line = line.replace(/\s+[가-힣]+\s*[:：]\s*(국내산|국산|미국산|중국산|호주산|러시아산|국내|국외)$/g, '')
      line = line.replace(/\s*\([가-힣]+\)\s*[:：]\s*(국내산|국산|미국산|중국산|호주산|러시아산)/g, '')
      // "왕만두 돈육:국내산" 처럼 식재료 정보 통째로 제거
      line = line.replace(/\s+[가-힣]+\s*[:：]\s*[가-힣]+$/g, '')
      // 가격 정보 제거: "라면 2,500원" → "라면"
      line = line.replace(/\s*\(?\d{1,3}(,\d{3})*\s*원\)?\s*$/g, '')
      // 옵션 정보 제거: "(토핑:치즈,떡,만두,공기밥)" 같은 거
      line = line.replace(/\([가-힣][^)]*\)/g, '')
      // 연속 공백 정리
      return line.replace(/\s+/g, ' ').trim()
    })
    .filter((line) => line.length > 0)
    // 옵션 괄호가 제거된 후 잔재로 남는 원산지 ("부대햄(돈육,계육):국내산" → "부대햄:국내산")
    .filter((line) => !/[가-힣]+\s*[:：;]\s*[가-힣]+산/.test(line))
    // 전체 중복 제거 (Set 활용)
    .filter((line, i, arr) => arr.indexOf(line) === i)

  return lines.length > 0 ? lines.join('\n') : null
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
        breakfast: cleanMenu(texts[2]),
        lunch: cleanMenu(texts[4]),
        dinner: cleanMenu(texts[6]),
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
