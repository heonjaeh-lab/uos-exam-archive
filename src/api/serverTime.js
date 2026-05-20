/**
 * 시립대 수강신청 서버 시간 동기화
 *
 * Cloudflare Worker가 sugang.uos.ac.kr의 Date 응답 헤더로 서버 시간을 받아옴.
 * 클라이언트는 한 번 받아서 offset(서버시간 - 로컬시간)를 저장하고,
 * 그 뒤로는 로컬 시계 + offset 으로 ms 단위 카운트다운.
 *
 * 사용자 컴퓨터 시계가 1초 빨라도 시립대 서버 기준으로 정확히 표시됨.
 */

const CRAWLER_URL = import.meta.env.VITE_CRAWLER_URL || ''

/**
 * 서버 시간 1회 호출 → offset 반환
 * @returns {Promise<{serverMs, offsetMs, responseTimeMs}>}
 */
export async function fetchServerTimeOffset() {
  if (!CRAWLER_URL) throw new Error('크롤러 URL이 설정되지 않았어요')
  const sentAt = Date.now()
  const res = await fetch(`${CRAWLER_URL}/api/server-time`)
  if (!res.ok) throw new Error(`서버 시간 조회 실패: ${res.status}`)
  const data = await res.json()
  const receivedAt = Date.now()
  // 네트워크 왕복 절반만큼 보정 + 우리가 받은 시점 기준 offset 계산
  const rtt = receivedAt - sentAt
  const correctedServerMs = data.serverTimeMs + Math.floor(rtt / 2)
  const offsetMs = correctedServerMs - receivedAt
  return {
    serverMs: correctedServerMs,
    offsetMs,
    responseTimeMs: data.responseTimeMs ?? 0,
    rawSource: data.source,
  }
}
