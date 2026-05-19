/**
 * 서울시립대 OpenAPI 클라이언트
 *
 * 시립대 wise.uos.ac.kr/COM/* 는 CORS 안 풀어줘서 브라우저에서 직접 호출 불가.
 *
 * Cloudflare Worker 프록시가 있으면 개발/프로덕션 모두 우선 사용.
 * wise.uos.ac.kr이 일부 해외/클라우드 IP를 차단해서 Vite 직접 프록시는 fallback으로만 둔다.
 */

const API_KEY = import.meta.env.VITE_UOS_API_KEY
const CRAWLER_URL = import.meta.env.VITE_CRAWLER_URL || ''

const BASE_URL = CRAWLER_URL
  ? `${CRAWLER_URL}/api/uos`
  : import.meta.env.DEV
    ? '/uos-api'
    : '/api/uos'

/**
 * 쿼리스트링으로 변환
 */
function toQuery(params) {
  return Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null && v !== '')
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')
}

/**
 * 시립대 API 공통 호출 함수
 */
async function callApi(endpoint, params = {}) {
  if (!API_KEY) throw new Error('UOS API 키가 설정되지 않았어요.')

  const query = toQuery({ apiKey: API_KEY, ...params })
  const url = `${BASE_URL}/${endpoint}?${query}`

  const res = await fetch(url)
  const text = await res.text()

  if (!res.ok) {
    throw new Error(`UOS API 오류 ${res.status}: ${text.slice(0, 120)}`)
  }

  try {
    return JSON.parse(text)
  } catch {
    throw new Error(`UOS API 응답을 JSON으로 해석하지 못했어요: ${text.slice(0, 120)}`)
  }
}

/**
 * 시간표 조회
 * @param {string|number} year 학년도 (예: 2026)
 * @param {string|number} term 학기 (10: 1학기, 20: 2학기)
 */
export async function fetchTimetable(year, term) {
  const data = await callApi('ApiTimeTable/list.do', { year, term })
  return data.INFO || []
}

/**
 * 수업계획서 조회
 */
export async function fetchCoursePlan(year, term, subjectNo, dvclNo) {
  const data = await callApi('ApiCoursePlan/list.do', {
    year, term, subjectNo, dvclNo,
  })
  return data
}

/**
 * 건물 & 강의실 조회
 */
export async function fetchBuildings() {
  const data = await callApi('ApiBldg/list.do')
  return data
}

/**
 * 학과 조회
 * @param {string} deptNm 부서명 (선택)
 * @param {string} openYn 'Y'면 현재 운영 학과만
 */
export async function fetchDepartments(deptNm, openYn = 'Y') {
  const data = await callApi('ApiDept/list.do', { deptNm, openYn })
  return data
}

/**
 * 과목 조회
 */
export async function fetchSubjects({ year, term, subjectNm, subjectNo, dvclNo, subjectDiv, deptCd, profNm, univGdhlDeptCd }) {
  const data = await callApi('ApiSubject/list.do', {
    year, term, subjectNm, subjectNo, dvclNo, subjectDiv, deptCd, profNm, univGdhlDeptCd,
  })
  return data
}

/**
 * 학기 코드
 */
export const TERM = {
  SPRING: '10', // 1학기
  FALL: '20',   // 2학기
}

/**
 * 과목 구분 코드
 */
export const SUBJECT_DIV = {
  '01': '교양선택',
  '02': '교양필수',
  '03': '전공필수',
  '04': '전공선택',
  '05': '일반선택',
  '06': 'ROTC',
  '07': '교직',
  '08': '교환학점',
  '09': '선수',
  '10': '기초선택',
  '11': '공통선택',
}
