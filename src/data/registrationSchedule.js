/**
 * 시립대 수강신청 일정
 *
 * 매학기 시립대 학사일정에서 가져와 업데이트.
 * 시간은 모두 KST(Asia/Seoul). 한국 시간 기준 ISO 문자열로 저장.
 *
 * 출처: 학사일정 공지 (https://www.uos.ac.kr)
 *
 * 업데이트 방법: 새 학기마다 events 배열에 항목 추가.
 */

// KST 시각을 UTC ISO 문자열로 변환 (서버 시간 비교용)
function kst(y, m, d, h = 0, min = 0) {
  // KST = UTC + 9 → UTC = KST - 9
  const utc = new Date(Date.UTC(y, m - 1, d, h - 9, min, 0))
  return utc.toISOString()
}

export const REGISTRATION_EVENTS = [
  // 2026-1학기 수강신청 (예시 — 실제 일정으로 매학기 갱신 필요)
  {
    id: '2026-1-priority',
    label: '예비수강신청',
    semester: '2026-1학기',
    startsAt: kst(2026, 2, 9, 10, 0),
    endsAt: kst(2026, 2, 11, 17, 0),
    notes: '본 수강신청 전 희망 강의 미리 담기',
  },
  {
    id: '2026-1-main-senior',
    label: '4학년 수강신청',
    semester: '2026-1학기',
    startsAt: kst(2026, 2, 16, 10, 0),
    endsAt: kst(2026, 2, 16, 23, 59),
    notes: '4학년 우선 신청일',
  },
  {
    id: '2026-1-main-junior',
    label: '3학년 수강신청',
    semester: '2026-1학기',
    startsAt: kst(2026, 2, 17, 10, 0),
    endsAt: kst(2026, 2, 17, 23, 59),
  },
  {
    id: '2026-1-main-sophomore',
    label: '2학년 수강신청',
    semester: '2026-1학기',
    startsAt: kst(2026, 2, 18, 10, 0),
    endsAt: kst(2026, 2, 18, 23, 59),
  },
  {
    id: '2026-1-main-freshman',
    label: '1학년 수강신청',
    semester: '2026-1학기',
    startsAt: kst(2026, 2, 19, 10, 0),
    endsAt: kst(2026, 2, 19, 23, 59),
  },
  {
    id: '2026-1-add-drop',
    label: '수강 정정 / 보강',
    semester: '2026-1학기',
    startsAt: kst(2026, 3, 2, 10, 0),
    endsAt: kst(2026, 3, 6, 17, 0),
    notes: '강의 추가/변경/취소',
  },
  // 2026-2학기 (TBD — 학사일정 발표 시 업데이트)
  {
    id: '2026-2-priority',
    label: '예비수강신청',
    semester: '2026-2학기',
    startsAt: kst(2026, 8, 10, 10, 0),
    endsAt: kst(2026, 8, 12, 17, 0),
    notes: '잠정 일정 — 학사일정 발표 시 갱신 필요',
    tentative: true,
  },
]

/**
 * 다음 곧 다가올 이벤트 찾기
 * @param {number} nowMs - 시립대 서버 시간 (ms)
 * @returns {Object|null}
 */
export function findNextRegistrationEvent(nowMs) {
  const events = REGISTRATION_EVENTS.map((e) => ({
    ...e,
    startsAtMs: new Date(e.startsAt).getTime(),
    endsAtMs: new Date(e.endsAt).getTime(),
  })).sort((a, b) => a.startsAtMs - b.startsAtMs)

  // 진행 중인 이벤트 우선
  const ongoing = events.find((e) => nowMs >= e.startsAtMs && nowMs <= e.endsAtMs)
  if (ongoing) return { ...ongoing, status: 'ongoing' }

  // 다음 예정 이벤트
  const upcoming = events.find((e) => e.startsAtMs > nowMs)
  if (upcoming) return { ...upcoming, status: 'upcoming' }

  return null
}
