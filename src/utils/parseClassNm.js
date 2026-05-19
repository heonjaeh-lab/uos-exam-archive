/**
 * CLASS_NM 필드 파서
 *
 * 시립대 API의 CLASS_NM 형식:
 *   "월[6,7,8]/5-227"        → 월요일 6,7,8교시 / 5호관 227호
 *   "월[7,8,9]/8-101,2"      → 월요일 7,8,9교시 / 8호관 101,102호 (병합 강의실)
 *   "금[2,3,4]/33-B103"      → 금요일 2,3,4교시 / 33호관 지하103호
 *   null                     → 시간/강의실 미정 (대학원 일부)
 *
 * 한 강의에 여러 시간대가 있을 수 있어 ' ' 또는 ',' 로 구분된 경우도 있음.
 */

const DAY_MAP = {
  월: 'MON',
  화: 'TUE',
  수: 'WED',
  목: 'THU',
  금: 'FRI',
  토: 'SAT',
  일: 'SUN',
}

const DAY_LABEL = {
  MON: '월',
  TUE: '화',
  WED: '수',
  THU: '목',
  FRI: '금',
  SAT: '토',
  SUN: '일',
}

/**
 * CLASS_NM 문자열을 시간 블록 배열로 파싱
 *
 * @param {string|null} classNm
 * @returns {Array<{day, dayLabel, periods, room}>} 시간 블록 배열
 */
export function parseClassNm(classNm) {
  if (!classNm || typeof classNm !== 'string') return []

  const blocks = []
  // 패턴: 요일[교시들]/강의실
  // 강의실 값 안에도 쉼표가 들어갈 수 있어서 다음 ",요일[" 전까지를 한 블록으로 본다.
  const regex = /([월화수목금토일])\[([0-9,\s]+)\]\/(.+?)(?=,[월화수목금토일]\[|$)/g
  let match

  while ((match = regex.exec(classNm)) !== null) {
    const [, dayKor, periodsStr, room] = match
    const day = DAY_MAP[dayKor]
    const periods = periodsStr.split(',').map((p) => parseInt(p, 10)).filter(Boolean)
    blocks.push({
      day,
      dayLabel: dayKor,
      periods,
      room: room.trim(),
    })
  }

  return blocks
}

/**
 * 두 강의가 시간이 겹치는지 검사
 */
export function isConflicting(blocksA, blocksB) {
  for (const a of blocksA) {
    for (const b of blocksB) {
      if (a.day !== b.day) continue
      const overlap = a.periods.some((p) => b.periods.includes(p))
      if (overlap) return true
    }
  }
  return false
}

export { DAY_LABEL, DAY_MAP }
