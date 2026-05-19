/**
 * 시립대 포털 자동 로그인 백엔드 클라이언트
 *
 * 백엔드 서버는 Puppeteer로 시립대 포털에 대신 로그인하고
 * 시간표를 가져와서 JSON으로 반환함.
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

/**
 * 시립대 포털 로그인 + 시간표 가져오기
 *
 * @param {string} userId 학번
 * @param {string} password 포털 비밀번호
 * @returns {Promise<{success, data?, error?}>}
 */
export async function loginAndFetchTimetable(userId, password) {
  try {
    const res = await fetch(`${BACKEND_URL}/api/login-and-fetch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, password }),
    })
    const text = await res.text()
    let data
    try {
      data = JSON.parse(text)
    } catch {
      return {
        success: false,
        error: `백엔드 응답을 처리하지 못했어요. (${res.status})`,
      }
    }

    if (!res.ok && !data?.error) {
      return {
        success: false,
        error: `백엔드 오류 ${res.status}`,
      }
    }

    return data
  } catch {
    return {
      success: false,
      error:
        '백엔드 서버에 연결할 수 없어요. 잠시 후 다시 시도해주세요.\n' +
        '(Render 무료 플랜은 첫 요청 시 30초 정도 깨우는 시간 필요)',
    }
  }
}

/**
 * 백엔드 헬스체크 (서버 깨우기용)
 * 사용자가 모달 열 때 미리 호출하면 첫 로그인이 빨라짐.
 */
export async function pingBackend() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/health`)
    return res.ok
  } catch {
    return false
  }
}
