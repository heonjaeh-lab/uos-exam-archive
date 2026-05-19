/**
 * 서울시립대 포털 자동 로그인 + 시간표 스크래핑 (v2)
 *
 * Chrome MCP로 실제 시립대 WISE 시스템 분석 결과 반영:
 *
 * 1. 로그인 흐름
 *    sso.uos.ac.kr/svc/tk/Auth.eps?ac=Y&id=portal&ifa=N
 *      → 학번/비밀번호 입력 (ML4WebVKey가 자동 암호화)
 *      → SSO 인증 성공 → wise.uos.ac.kr/index.do 명시 진입
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

const PORTAL_LOGIN_URL = 'https://sso.uos.ac.kr/svc/tk/Auth.eps?ac=Y&id=portal&ifa=N'
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
    // Render 무료 플랜(512MB) 메모리 최적화
    '--single-process', // 모든 렌더링을 단일 프로세스로 — RAM 절약
    '--disable-extensions',
    '--disable-default-apps',
    '--disable-background-networking',
    '--disable-background-timer-throttling',
    '--disable-renderer-backgrounding',
    '--disable-component-extensions-with-background-pages',
    '--disable-features=TranslateUI,BlinkGenPropertyTrees',
    '--mute-audio',
    '--no-default-browser-check',
    '--no-pings',
  ],
  executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
  // Chrome 시작 타임아웃 (Render에서 콜드 스타트 시 30초 부족할 수 있음)
  timeout: 60000,
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

const SUBJECT_FIELD_KEYS = [
  'SUBJECT_NO',
  'SUBJECTNO',
  'SUBJ_NO',
  'SBJT_NO',
  'SBJCT_NO',
  'COURSE_NO',
  'COURSE_CD',
  'SUBJECT_CD',
  'SBJT_CD',
  'SUB_NO',
]

const DVCL_FIELD_KEYS = [
  'DVCL_NO',
  'DVCLNO',
  'DIVCLS_NO',
  'CLASS_NO',
  'CLSS_NO',
  'BUNBAN',
  'TLSN_DVCL_NO',
  'OPEN_CLASS_NO',
]

const SUBJECT_NAME_KEYS = [
  'SUBJECT_NM',
  'SUBJECTNM',
  'SUBJ_NM',
  'SBJT_NM',
  'COURSE_NM',
  'KOR_SUBJECT_NM',
]

const PROF_NAME_KEYS = [
  'PROF_KOR_NM',
  'PROF_NM',
  'PROFESSOR_NM',
  'STAFF_NM',
  'EMP_NM',
]

const CLASS_NAME_KEYS = ['CLASS_NM', 'CLASSNM', 'TIME_ROOM', 'LECTURE_TIME', 'ROOM_NM']
const CREDIT_KEYS = ['CREDIT', 'PNT', 'POINT', 'CRD']

function normalizeKey(key) {
  return String(key || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
}

function readByKeys(row, keys) {
  if (!row || typeof row !== 'object' || Array.isArray(row)) return ''

  const wanted = new Set(keys.map(normalizeKey))
  for (const [key, value] of Object.entries(row)) {
    if (wanted.has(normalizeKey(key)) && value !== null && value !== undefined && value !== '') {
      return String(value).trim()
    }
  }
  return ''
}

function normalizeSubjectNo(value) {
  return String(value || '').replace(/\s+/g, '').toUpperCase()
}

function normalizeDvclNo(value) {
  const text = String(value || '').trim().toUpperCase()
  if (!text) return ''
  const match = text.match(/[A-Z0-9]+/)
  const token = match ? match[0] : text
  return token.replace(/^0+(?=\d)/, '')
}

function normalizePortalRow(row) {
  if (!row || typeof row !== 'object' || Array.isArray(row)) {
    return {
      subjectNo: '',
      dvclNo: '',
      subjectNm: '',
      profNm: '',
      classNm: '',
      credit: '',
    }
  }

  return {
    subjectNo: normalizeSubjectNo(readByKeys(row, SUBJECT_FIELD_KEYS)),
    dvclNo: normalizeDvclNo(readByKeys(row, DVCL_FIELD_KEYS)),
    subjectNm: readByKeys(row, SUBJECT_NAME_KEYS),
    profNm: readByKeys(row, PROF_NAME_KEYS),
    classNm: readByKeys(row, CLASS_NAME_KEYS),
    credit: readByKeys(row, CREDIT_KEYS),
  }
}

async function collectPageState(page) {
  return page
    .evaluate(() => {
      const text = (document.body?.innerText || '').trim()
      const inputs = Array.from(document.querySelectorAll('input')).map((i) => ({
        id: i.id || null,
        name: i.name || null,
        type: i.type || null,
        title: i.title || null,
        placeholder: i.placeholder || null,
      }))
      const buttons = Array.from(document.querySelectorAll('button, input[type="button"], input[type="submit"]'))
        .map((el) => ({
          id: el.id || null,
          type: el.type || null,
          title: el.title || null,
          text: (el.innerText || el.value || '').trim(),
          onclick: el.getAttribute('onclick') || null,
        }))
      const alerts = Array.from(
        document.querySelectorAll(
          '.alert, .error, .msg, [class*="error"], [class*="alert"], [class*="warn"]',
        ),
      )
        .map((el) => el.innerText?.trim())
        .filter(Boolean)
      return {
        url: location.href,
        title: document.title,
        bodySnippet: text.slice(0, 800),
        inputs: inputs.slice(0, 30),
        buttons: buttons.slice(0, 30),
        alerts: alerts.slice(0, 5),
        hasUserIdField: !!document.querySelector('#user_id'),
        hasPasswordField: !!document.querySelector('#user_password'),
      }
    })
    .catch(() => ({}))
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

    const dialogs = []
    const urlHistory = []
    page.on('framenavigated', (frame) => {
      if (frame === page.mainFrame()) urlHistory.push(frame.url())
    })
    page.on('dialog', async (dialog) => {
      dialogs.push({ type: dialog.type(), message: dialog.message() })
      await dialog.dismiss().catch(() => {})
    })

    // === 0. 리소스 차단 (이미지/폰트/광고) — 페이지 로드 단축 ===
    await page.setRequestInterception(true)
    page.on('request', (req) => {
      const type = req.resourceType()
      const url = req.url()
      // 로그인 페이지는 CSS display 상태가 탭/폼 동작에 영향을 줘서 stylesheet는 통과시킨다.
      if (type === 'image' || type === 'font' || type === 'media') {
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
        } catch {
          // 응답 본문 읽기 실패 무시
        }
      }
    })

    // === 2. 포털 로그인 페이지 진입 (SSO 자동 처리) ===
    // portal.uos.ac.kr → sso.uos.ac.kr 자동 리다이렉트 + Google Identity Services iframe 등
    // 외부 리소스가 networkidle을 늦춰서 form fields가 늦게 렌더됨.
    // 진단 결과: 필드 자체는 존재하나 15초 안에 못 찾음 → 타임아웃 확대.
    await page.goto(PORTAL_LOGIN_URL, {
      waitUntil: 'domcontentloaded', // SSO 리다이렉트 후 main frame DOM만 기다림
      timeout: 30000,
    })

    // 학번/비밀번호 입력 필드 대기 — DOM에 존재만 확인 (visible 체크 X)
    // 진단 결과: #user_id, #user_password는 DOM엔 항상 있지만 첫 진입 시
    // "Certification login" 탭이 활성화돼서 Basic login의 필드들이 display:none됨.
    // 따라서 visible:true로 기다리면 영원히 못 찾음 → 먼저 Basic login 탭 활성화.
    try {
      await page.waitForSelector('#user_id', { timeout: 30000 })
      await page.waitForSelector('#user_password', { timeout: 15000 })
    } catch {
      const diag = await collectPageState(page)
      return {
        success: false,
        error: '로그인 페이지의 아이디/비밀번호 입력 필드를 찾지 못했어요. 시립대 SSO 구조가 변경됐거나 서버 접속이 차단됐을 가능성.',
        debug: { stage: 'waitForLoginFields', ...diag },
      }
    }

    // === 2.5. Basic login 탭 활성화 ===
    // SSO 페이지는 일반 로그인/인증 로그인 탭으로 나뉜다. 일반 로그인 폼을 기준으로 조작한다.
    await page.evaluate(() => {
      const basicBox = document.querySelector('#content01')
      if (basicBox) basicBox.style.display = 'block'
      const certBox = document.querySelector('#content02')
      if (certBox) certBox.style.display = 'none'
    }).catch(() => {})

    await page.waitForSelector('form[name="loginFrm"] #user_id', { visible: true, timeout: 15000 })
    await page.waitForSelector('form[name="loginFrm"] #user_password', { visible: true, timeout: 15000 })

    // === 3. 학번/비밀번호 입력 (ML4WebVKey가 자동 암호화) ===
    await page.click('form[name="loginFrm"] #user_id', { clickCount: 3 })
    await page.keyboard.press('Backspace')
    await page.type('form[name="loginFrm"] #user_id', userId, { delay: 15 })
    await page.click('form[name="loginFrm"] #user_password', { clickCount: 3 })
    await page.keyboard.press('Backspace')
    await page.type('form[name="loginFrm"] #user_password', password, { delay: 15 })

    // === 4. 로그인 버튼 찾기 + 클릭 ===
    // 핵심: 시립대 포털은 ML4WebVKey JS가 form submit 이벤트에 훅해서
    // 비밀번호를 암호화함. 따라서 form.submit() 직접 호출이나 JS .click()으로는
    // 암호화가 안 걸리고 평문 비번이 전송됨 → 로그인 실패.
    //
    // 해결: Puppeteer native click (실제 마우스 이벤트)을 사용해서 모든 핸들러 트리거.

    // (1) 일반 로그인 폼 내부의 실제 submit 버튼을 우선 시도.
    // "Basic login" 탭 버튼도 onclick/login 텍스트를 가질 수 있어 범위를 form으로 제한한다.
    const knownSelectors = [
      'form[name="loginFrm"] .login_btn button[onclick*="doLogin"]',
      'form[name="loginFrm"] button[title="로그인"]',
      'form[name="loginFrm"] button[onclick*="doLogin"]',
      'button[onclick*="login" i]',
      'input[type="submit"]',
      '#loginBtn',
      '#btnLogin',
      '.btn_login',
      '.btnLogin',
      'a[onclick*="login" i]',
      'button.btn-login',
      'a.btn-login',
    ]
    let loginSelector = null
    for (const sel of knownSelectors) {
      const found = await page.$(sel)
      if (found) {
        loginSelector = sel
        break
      }
    }

    // (2) 그래도 못 찾으면 "로그인" 텍스트가 들어간 클릭 가능 요소 탐색
    if (!loginSelector) {
      const xpath = await page.evaluateHandle(() => {
        const all = Array.from(
          document.querySelectorAll(
            'form[name="loginFrm"] button, form[name="loginFrm"] a, form[name="loginFrm"] input[type="button"], form[name="loginFrm"] input[type="submit"], form[name="loginFrm"] [role="button"]',
          ),
        )
        const match = all.find((el) => {
          const t = (el.innerText || el.value || '').trim()
          return /^(로그인|LOGIN|Login|Log\s*in)$/.test(t)
        })
        if (match) {
          // 임시 id 부여
          if (!match.id) match.id = '__uos_login_btn__'
          return match.id
        }
        return null
      })
      const tempId = await xpath.jsonValue()
      if (tempId) loginSelector = `#${tempId}`
    }

    let loginClicked = false
    if (loginSelector) {
      try {
        // Puppeteer native click → 실제 mousedown/mouseup/click 이벤트 발생
        // → ML4WebVKey 같은 이벤트 핸들러가 정상 동작
        await Promise.allSettled([
          page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }),
          page.click(loginSelector),
        ])
        loginClicked = true
      } catch {
        loginClicked = false
      }
    }

    // (3) 그래도 안 되면 Enter 키 (form submit 트리거 — 핸들러도 같이 작동)
    if (!loginClicked) {
      await page.focus('#user_password')
      await Promise.allSettled([
        page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 30000 }),
        page.keyboard.press('Enter'),
      ])
    }

    await page.waitForNetworkIdle({ idleTime: 800, timeout: 10000 }).catch(() => {})

    // === 5. 로그인 결과 대기 + WISE 진입 시도 ===
    // SSO 성공 후 portal 메인에 머무를 수도 있으므로, 인증 세션을 들고 WISE로 명시 진입한다.
    const postLoginUrl = page.url()
    if (!postLoginUrl.includes('wise.uos.ac.kr')) {
      await page.goto(WISE_INDEX_URL, {
        waitUntil: 'domcontentloaded',
        timeout: 30000,
      }).catch(() => {})
      await page.waitForNetworkIdle({ idleTime: 800, timeout: 10000 }).catch(() => {})
    }

    // === 6. 로그인 실패 감지 ===
    const finalUrl = page.url()
    if (!finalUrl.includes('wise.uos.ac.kr')) {
      await page.waitForSelector('body', { timeout: 5000 }).catch(() => {})

      // 페이지 상태를 자세히 수집해서 디버그용으로 같이 반환
      const pageState = await collectPageState(page)

      // 알려진 에러 패턴 분류
      let errorMsg = null
      const allText =
        `${pageState.bodySnippet || ''} ${(pageState.alerts || []).join(' ')} ${dialogs
          .map((d) => d.message)
          .join(' ')}`.trim()
      const dialogText = dialogs.map((d) => d.message).filter(Boolean).join(' / ')
      if (dialogText.includes('No user corresponds')) {
        errorMsg = `포털이 해당 아이디를 찾지 못했다고 응답했어요: ${dialogText}`
      } else if (dialogText) {
        errorMsg = `포털 로그인 응답: ${dialogText}`
      } else if (
        allText.includes('일치하지 않') ||
        (allText.includes('확인') && allText.includes('아이디') && allText.includes('비밀번호'))
      ) {
        errorMsg = '포털이 아이디/비밀번호를 거부했어요. 직접 포털 웹 로그인 가능 여부를 한 번 확인해주세요.'
      }
      else if (allText.includes('잠금') || allText.includes('5회'))
        errorMsg = '계정이 잠겼을 수 있습니다. 포털에서 직접 확인해주세요.'
      else if (finalUrl.includes('Access') || allText.includes('차단'))
        errorMsg = '시립대 포털이 현재 서버 접속을 차단했어요. 백엔드 실행 위치/IP를 바꿔야 합니다.'
      else if (pageState.hasUserIdField) errorMsg = '로그인 폼에서 멈췄어요 — 버튼 클릭이 동작하지 않거나 인증이 거부됐을 가능성.'

      return {
        success: false,
        error: errorMsg || '로그인 실패. 아이디/비밀번호를 확인해주세요.',
        // 디버그용 - 어느 단계에서 멈췄는지 파악용
        debug: {
          loginSelector,
          loginClicked,
          postLoginUrl,
          finalUrl,
          dialogs,
          urlHistory: urlHistory.slice(-10),
          pageState,
        },
      }
    }

    // === 7. WISE 메인 페이지 로딩 대기 ===
    await page
      .waitForSelector('a, .cl-sidenavigation-item', { timeout: 10000 })
      .catch(() => {})
    await new Promise((r) => setTimeout(r, 800)) // 메뉴 트리 로딩 대기 (단축)

    // === 8. "수강신청확인서" 메뉴 클릭 ===
    const menuClicked = await page.evaluate(() => {
      const normalize = (value) => String(value || '').replace(/\s+/g, '')
      const candidates = Array.from(
        document.querySelectorAll('a, button, span, div, li, [role="button"], [role="treeitem"]'),
      )
      const item = candidates.find((el) => normalize(el.innerText || el.textContent) === '수강신청확인서')
      if (!item) return false

      const clickable =
        item.closest('a, button, [role="button"], [role="treeitem"], [onclick], li') || item
      clickable.click()
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
    } catch {
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
    // 정확한 키를 모르므로 후보를 모두 검사하고, 원본 객체와 표준화 필드를 함께 내려준다.
    const rows = extractRows(parsed)
    const coursesRaw = rows.map((row) => {
      if (row && typeof row === 'object') {
        return {
          raw: Object.values(row).map((v) => String(v ?? '')),
          row,
          normalized: normalizePortalRow(row),
        }
      }
      return {
        raw: [String(row ?? '')],
        row: null,
        normalized: normalizePortalRow(null),
      }
    })
    const courses = coursesRaw
      .map((course) => course.normalized)
      .filter((course) => course.subjectNo || course.subjectNm)

    return {
      success: true,
      data: {
        coursesRaw,
        courses,
        // 디버그용: 실제 raw 응답 (구조 파악 후 제거 예정)
        debug: {
          rawKeys: Object.keys(parsed || {}),
          rowCount: rows.length,
          sample: rows[0] || null,
          normalizedSample: courses[0] || null,
        },
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
