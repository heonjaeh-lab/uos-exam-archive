/**
 * 한국 표준시(KST, Asia/Seoul) 기준 날짜 유틸
 *
 * 사용자가 해외(예: 독일)에 있어도 학교 운영 시간은 한국 시간이므로
 * "오늘 학식", "오늘 시간표", "오늘 날짜 표시" 등은 모두 한국 기준으로 계산해야 함.
 *
 * 핵심:
 *   - new Date() 자체는 UTC 절대 시각이라 동일
 *   - 단지 .getMonth() / .getDate() 같은 메서드가 로컬 타임존 기준으로 동작함
 *   - Intl.DateTimeFormat({ timeZone: 'Asia/Seoul' })로 한국 기준 부분 추출
 */

const TZ = 'Asia/Seoul'

/**
 * 한국 기준 현재 날짜/시각 정보 반환
 * @returns {{ year, month(1~12), day, dayOfWeek(0=일~6=토), hours, minutes }}
 */
export function koreaNow() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
    hour12: false,
  }).formatToParts(new Date())

  const o = {}
  for (const p of parts) {
    if (p.type !== 'literal') o[p.type] = p.value
  }

  const WEEKDAY = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
  return {
    year: parseInt(o.year, 10),
    month: parseInt(o.month, 10),
    day: parseInt(o.day, 10),
    dayOfWeek: WEEKDAY[o.weekday] ?? 0,
    hours: parseInt(o.hour, 10),
    minutes: parseInt(o.minute, 10),
  }
}

/**
 * 한국 기준 "오늘" Date 객체 (자정으로 정규화)
 * setDate 등 연산에 사용 가능. getDate()/getDay() 호출 시 결과는
 * 로컬 타임존이지만 KST로 보정되어있어서 같은 날짜를 가리킴.
 *
 * 주의: 정확한 KST datetime이 아니라 "한국에서 본 오늘" 을 표현하기 위한 객체.
 */
export function koreaToday() {
  const { year, month, day } = koreaNow()
  // 자정으로 정규화. month는 0-indexed.
  return new Date(year, month - 1, day)
}

/**
 * 주어진 Date 또는 YYYYMMDD 문자열을 한국 기준 (월, 일)로 분해
 * @param {Date|string|undefined} input
 */
export function toKoreaDateParts(input) {
  if (input instanceof Date) {
    // Date를 KST로 변환해서 부분 추출
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: TZ,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(input)
    const o = {}
    for (const p of parts) {
      if (p.type !== 'literal') o[p.type] = parseInt(p.value, 10)
    }
    return { year: o.year, month: o.month, day: o.day }
  }
  if (typeof input === 'string' && /^\d{8}$/.test(input)) {
    return {
      year: parseInt(input.slice(0, 4), 10),
      month: parseInt(input.slice(4, 6), 10),
      day: parseInt(input.slice(6, 8), 10),
    }
  }
  // 기본: 한국 기준 오늘
  const now = koreaNow()
  return { year: now.year, month: now.month, day: now.day }
}

/**
 * 한국 기준 요일 (0=일~6=토)
 */
export function koreaDayOfWeek(input) {
  if (input instanceof Date) {
    const wd = new Intl.DateTimeFormat('en-US', {
      timeZone: TZ,
      weekday: 'short',
    }).format(input)
    const WEEKDAY = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
    return WEEKDAY[wd] ?? 0
  }
  return koreaNow().dayOfWeek
}
