/**
 * 서울시립대 OpenAPI 클라이언트
 *
 * 시립대 wise.uos.ac.kr/COM/* 는 CORS 안 풀어줘서 브라우저에서 직접 호출 불가.
 *
 * 개발 환경: Vite 프록시 사용 (/uos-api → https://wise.uos.ac.kr/COM)
 * 프로덕션 환경: Cloudflare Worker 프록시 (/api/uos/* → wise.uos.ac.kr/COM/*)
 */

const API_KEY = import.meta.env.VITE_UOS_API_KEY
const CRAWLER_URL = import.meta.env.VITE_CRAWLER_URL || ''

// 개발 환경: Vite 프록시, 프로덕션: Cloudflare Worker 프록시
const BASE_URL = import.meta.env.DEV
  ? '/uos-api'
  : `${CRAWLER_URL}/api/uos`

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
  const query = toQuery({ apiKey: API_KEY, ...params })
  const url = `${BASE_URL}/${endpoint}?${query}`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`UOS API 오류 ${res.status}`)

  const data = await res.json()
  return data
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
