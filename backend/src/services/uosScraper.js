/**
 * 서울시립대 포털 자동 로그인 + 시간표 스크래핑 (v2)
 *
 * Chrome MCP로 실제 시립대 WISE 시스템 분석 결과 반영:
 *
 * 1. 로그인 흐름
 *    portal.uos.ac.kr/user/login.face
 *      → sso.uos.ac.kr/svc/tk/Auth.eps (자동 SSO redirect)
 *      → 학번/비밀번호 입력 (ML4WebVKey가 자동 암호화)
 *      → SSO 인증 성공 → wise.uos.ac.kr/index.do
 *
 * 2. 데이터 가져오기 흐름
 *    "수강신청확인서" 메뉴 클릭 (사이드바)
 *      → 시스템이 자동으로 다음 API 호출:
 *         - SCH/SucrTlsnAplyCnfmPrt/onLoad.do (페이지 로드)
 *         - SCH/SucrTlsnAplyCnfmPrt/StdntInfo.do (학생 정보)
 *         - SCH/SucrTlsnAplyCnfmPrt/list.do (강의 리스트 ← 핵심)
 *      → 이 list.do의 JSON 응답을 Puppeteer가 가로채기
 *
 * 3. 핵심: 단순 API 호출은 "메뉴 권한 토큰" 없어서 403 됨.
 *    반드시 진짜 브라우저로 메뉴 클릭 흐름을 거쳐야 토큰 발급됨.
 */

import puppeteer from 'puppeteer'

const PORTAL_LOGIN_URL = 'https://portal.uos.ac.kr/user/login.face'
const WISE_INDEX_URL = 'https://wise.uos.ac.kr/index.do'

const PUPPETEER_OPTIONS = {
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--no-first-run',
    '--no-zygote',
  ],
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
}

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'

/**
 * WISE 응답에서 강의 행 배열 찾기
 *
 * 시립대 WISE(eXBuilder/.NET 기반) 응답 키는 메뉴마다 다름.
 * 가능한 후보를 순회하면서 행 배열을 찾고, 못 찾으면 최상위 키 중 첫 번째 배열을 사용.
 */
function extractRows(parsed) {
  if (!parsed) return []
  if (Array.isArray(parsed)) return parsed

  const candidateKeys = [
    'DS_LIST',
    'dsList',
    'ds_list',
    'DS_OUT',
    'DS_DATA',
    'list',
    'data',
    'rows',
    'items',
    'result',
    'resultList',
    'output',
  ]
  for (const k of candidateKeys) {
    if (Array.isArray(parsed[k]) && parsed[k].length > 0) return parsed[k]
  }
  // 후보 없으면 최상위 객체 중 첫 번째 배열 값 찾기
  for (const v of Object.values(parsed)) {
    if (Array.isArray(v) && v.length > 0) return v
    if (v && typeof v === 'object') {
      for (const vv of Object.values(v)) {
        if (Array.isArray(vv) && vv.length > 0) return vv
      }
    }
  }
  return []
}

/**
 * 시립대 포털 자동 로그인 + 시간표 데이터 가져오기
 *
 * @param {string} userId 학번
 * @param {string} password 포털 비밀번호
 * @returns {Promise<{success, data?, error?}>}
 */
export async function loginAndFetchTimetable(userId, password) {
  if (!userId || !password) {
    return { success: false, error: '아이디와 비밀번호가 필요합니다.' }
  }

  let browser = null
  const capturedResponses = []

  try {
    browser = await puppeteer.launch(PUPPETEER_OPTIONS)
    const page = await browser.newPage()
    await page.setUserAgent(USER_AGENT)
    await page.setViewport({ width: 1400, height: 900 })

    // === 0. 리소스 차단 (이미지/폰트/CSS/광고) — 페이지 로드 3-5배 빨라짐 ===
    await page.setRequestInterception(true)
    page.on('request', (req) => {
      const type = req.resourceType()
      const url = req.url()
      // 핵심 리소스만 통과
      if (type === 'image' || type === 'stylesheet' || type === 'font' || type === 'media') {
        req.abort()
      } else if (
        url.includes('googletagmanager') ||
        url.includes('google-analytics') ||
        url.includes('doubleclick') ||
        url.includes('facebook.com') ||
        url.includes('beacon')
      ) {
        req.abort() // 추적 스크립트 차단
      } else {
        req.continue()
      }
    })

    // === 1. list.do 응답 가로채기 등록 ===
    page.on('response', async (response) => {
      const url = response.url()
      if (url.includes('/SucrTlsnAplyCnfmPrt/list.do')) {
        try {
          const text = await response.text()
          capturedResponses.push({ url, body: text })
        } catch (e) {
          // 응답 본문 읽기 실패 무시
        }
      }
    })

    // === 2. 포털 로그인 페이지 진입 (SSO 자동 처리) ===
    await page.goto(PORTAL_LOGIN_URL, {
      waitUntil: 'domcontentloaded', // networkidle2 → DOM만 (3-5초 절약)
      timeout: 25000,
    })

    // 학번/비밀번호 입력 필드 대기
    await page.waitForSelector('#user_id', { timeout: 15000 })
    await page.waitForSelector('#user_password', { timeout: 15000 })

    // === 3. 학번/비밀번호 입력 (ML4WebVKey가 자동 암호화) ===
    await page.type('#user_id', userId, { delay: 15 })
    await page.type('#user_password', password, { delay: 15 })

    // === 4. 로그인 버튼 클릭 ===
    // 시립대 페이지는 보통 form submit 또는 onclick 함수 호출
    const loginClicked = await page.evaluate(() => {
      const candidates = [
        document.querySelector('button[onclick*="login" i]'),
        document.querySelector('input[type="submit"]'),
        document.querySelector('#loginBtn, #btnLogin, .btn_login'),
        document.querySelector('a[onclick*="login" i]'),
      ].filter(Boolean)
      if (candidates[0]) {
        candidates[0].click()
        return true
      }
      // 폼 직접 submit
      const form = document.querySelector('form[name="loginFrm"], form#loginForm, form')
      if (form) {
        form.submit()
        return true
      }
      return false
    })

    if (!loginClicked) {
      // Enter 키로 폼 제출 시도
      await page.focus('#user_password')
      await page.keyboard.press('Enter')
    }

    // === 5. 로그인 결과 대기 (WISE 메인까지 이동) ===
    await page
      .waitForFunction(() => location.href.includes('wise.uos.ac.kr/index.do'), {
        timeout: 20000,
      })
      .catch(() => {})

    // === 6. 로그인 실패 감지 ===
    const finalUrl = page.url()
    if (!finalUrl.includes('wise.uos.ac.kr')) {
      const errorMsg = await page
        .evaluate(() => {
          const text = document.body.innerText || ''
          if (text.includes('일치하지 않')) return '아이디 또는 비밀번호가 일치하지 않습니다.'
          if (text.includes('잠금') || text.includes('5회')) return '계정이 잠겼을 수 있습니다. 포털에서 직접 확인해주세요.'
          return null
        })
        .catch(() => null)
      return {
        success: false,
        error: errorMsg || '로그인 실패. 아이디/비밀번호를 확인해주세요.',
      }
    }

    // === 7. WISE 메인 페이지 로딩 대기 ===
    await page
      .waitForSelector('a, .cl-sidenavigation-item', { timeout: 10000 })
      .catch(() => {})
    await new Promise((r) => setTimeout(r, 800)) // 메뉴 트리 로딩 대기 (단축)

    // === 8. "수강신청확인서" 메뉴 클릭 ===
    const menuClicked = await page.evaluate(() => {
      const link = Array.from(document.querySelectorAll('a')).find(
        (a) => a.innerText.trim() === '수강신청확인서',
      )
      if (!link) return false
      link.click()
      return true
    })

    if (!menuClicked) {
      return {
        success: false,
        error:
          '수강신청확인서 메뉴를 찾지 못했어요. 시립대 시스템 변경 가능성 있음.',
      }
    }

    // === 9. list.do 응답 도착 대기 (최대 15초) ===
    const start = Date.now()
    while (capturedResponses.length === 0 && Date.now() - start < 15000) {
      await new Promise((r) => setTimeout(r, 500))
    }

    if (capturedResponses.length === 0) {
      return {
        success: false,
        error: '시간표 데이터 응답을 받지 못했어요. 다시 시도해주세요.',
      }
    }

    // === 10. JSON 파싱 ===
    const lastResponse = capturedResponses[capturedResponses.length - 1]
    let parsed
    try {
      parsed = JSON.parse(lastResponse.body)
    } catch (e) {
      return {
        success: false,
        error: 'JSON 파싱 실패: ' + lastResponse.body.slice(0, 200),
      }
    }

    // 시스템 에러 감지
    if (parsed.ERRMSGINFO) {
      return {
        success: false,
        error: parsed.ERRMSGINFO.ERRMSG || '시립대 시스템 에러',
      }
    }

    // === 11. 프론트 호환 구조로 변환 ===
    // WISE/eXBuilder 응답은 보통 DS_LIST/dsList/list/data/rows 중 하나에 행 배열을 담음.
    // 정확한 키를 모르므로 후보를 모두 검사 + 평탄화해서 coursesRaw[].raw[] 형태로 변환.
    const rows = extractRows(parsed)
    const coursesRaw = rows.map((row) => {
      if (row && typeof row === 'object') {
        return { raw: Object.values(row).map((v) => String(v ?? '')) }
      }
      return { raw: [String(row ?? '')] }
    })

    return {
      success: true,
      data: {
        coursesRaw,
        // 디버그용: 실제 raw 응답 (구조 파악 후 제거 예정)
        debug: { rawKeys: Object.keys(parsed || {}), rowCount: rows.length, sample: rows[0] || null },
      },
    }
  } catch (error) {
    console.error('[uosScraper] 오류:', error.message)
    return {
      success: false,
      error: error.message || '알 수 없는 오류',
    }
  } finally {
    if (browser) {
      await browser.close().catch(() => {})
    }
  }
}
