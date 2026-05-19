import { useState, useEffect } from 'react'
import { loginAndFetchTimetable, pingBackend } from '../api/uosPortal'
import { saveUser } from '../utils/user'

const SVG = ({ children, cls = '' }) => (
  <svg viewBox="0 0 24 24" className={`uos-icon ${cls}`}>{children}</svg>
)
const Icon = {
  globe: (p) => <SVG {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></SVG>,
  x: (p) => <SVG {...p}><path d="M6 6l12 12M18 6L6 18"/></SVG>,
}

function formatPortalError(result) {
  const base = result?.error || '로그인 실패'
  const debug = result?.debug
  if (!debug) return base

  // 메뉴 탐색 단계 실패 → 사이드바 메뉴 텍스트들 같이 보여주기 (디버그용)
  if (debug.stage === 'findMenu' && Array.isArray(debug.menuTexts)) {
    const related = Array.isArray(debug.courseRelated) ? debug.courseRelated : []
    const relatedLine = related.length
      ? `수강/Course 관련: ${related.join(' | ')}`
      : '수강/Course 관련 메뉴 없음'
    const menuList = debug.menuTexts.length
      ? debug.menuTexts.slice(0, 60).join(' | ')
      : '(메뉴 텍스트 못 찾음)'
    const frameInfo = debug.frameCount
      ? `iframe ${debug.frameCount}개 발견`
      : 'iframe 없음'
    return `${base}\n\n현재 URL: ${debug.url || '?'}\n${frameInfo}\n\n${relatedLine}\n\n전체 메뉴: ${menuList}`
  }

  const dialogMessage = debug.dialogs?.map((d) => d.message).filter(Boolean).join('\n')
  if (dialogMessage) return `${base}\n\n포털 응답: ${dialogMessage}`

  if (debug.finalUrl?.includes('sso.uos.ac.kr/Login.eps')) {
    return `${base}\n\nSSO 로그인 화면에서 다시 멈췄어요. 포털 직접 로그인은 되는데 여기서만 실패하면 자동화가 비밀번호 전송 또는 로그인 버튼 흐름을 제대로 처리하지 못한 상태입니다.`
  }

  if (debug.finalUrl) {
    return `${base}\n\n멈춘 위치: ${debug.finalUrl}`
  }

  return base
}

/**
 * 시립대 포털 로그인 모달 (Claude Design 시안 적용)
 *
 * 데스크탑: 좌(브랜드 패널) + 우(로그인 폼) 가로 분할
 * 모바일: 폼만 표시 (브랜드 패널은 숨김)
 */
export default function PortalLoginModal({ open, onClose, onSuccess }) {
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [serverWarming, setServerWarming] = useState(false)

  // 모달 열릴 때 백엔드 미리 깨우기
  useEffect(() => {
    if (open) {
      setServerWarming(true)
      pingBackend().finally(() => setServerWarming(false))
    } else {
      setPassword('')
      setError('')
    }
  }, [open])

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!userId || !password) {
      setError('아이디와 비밀번호를 모두 입력해주세요.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await loginAndFetchTimetable(userId, password)
      if (result.success) {
        // 토큰까지 저장 (30일 유효) - 이후 시립대 호출 없이 자동 인증
        saveUser({ studentId: userId, token: result.token })
        onSuccess?.(result.data)
        setPassword('')
        onClose?.()
      } else {
        setError(formatPortalError(result))
      }
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
      onClick={(e) => e.target === e.currentTarget && !loading && onClose?.()}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden grid grid-cols-1 md:grid-cols-2"
        style={{ maxHeight: 'calc(100vh - 48px)' }}
      >
        {/* 좌측 브랜드 패널 (데스크탑만) */}
        <div
          className="hidden md:flex relative overflow-hidden text-white"
          style={{
            background:
              'linear-gradient(160deg, var(--c-primary-700) 0%, var(--c-primary) 65%, var(--c-primary-600) 100%)',
            padding: '56px 48px',
            flexDirection: 'column',
          }}
        >
          {/* 장식 원 */}
          <div
            style={{
              position: 'absolute',
              right: -80,
              top: -80,
              width: 360,
              height: 360,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              right: 60,
              bottom: -120,
              width: 240,
              height: 240,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)',
            }}
          />

          <div
            style={{
              fontSize: 13,
              opacity: 0.9,
              fontWeight: 500,
              position: 'relative',
              letterSpacing: '-0.01em',
            }}
          >
            시립대 자유전공학부 학생을 위한 아카이브
          </div>
          <h1
            style={{
              margin: '18px 0 16px',
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: '-0.025em',
              lineHeight: 1.25,
              position: 'relative',
            }}
          >
            오늘의 수업,<br />
            오늘의 학식,<br />
            그리고 시험 자료까지.
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: 14,
              opacity: 0.85,
              lineHeight: 1.65,
              maxWidth: 320,
              position: 'relative',
            }}
          >
            시간표·학식·기출자료를 한 자리에서.
          </p>
        </div>

        {/* 우측 로그인 폼 */}
        <div className="relative overflow-y-auto" style={{ padding: 28 }}>
          {/* 닫기 버튼 */}
          {!loading && (
            <button
              onClick={onClose}
              className="absolute top-3 right-3 uos-btn uos-btn--ghost"
              style={{ width: 32, padding: 0 }}
              aria-label="닫기"
            >
              <Icon.x />
            </button>
          )}

          <div style={{ maxWidth: 380, margin: '0 auto', paddingTop: 8 }}>
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--c-text-3)',
                  fontWeight: 600,
                  letterSpacing: '0.06em',
                }}
              >
                LOG IN
              </div>
              <h2
                style={{
                  margin: '6px 0 6px',
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: '-0.02em',
                }}
              >
                포털 자동 연동
              </h2>
              <div style={{ fontSize: 13, color: 'var(--c-text-3)' }}>
                시립대 포털 계정으로 시간표를 자동으로 가져와요.
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="uos-field">
                <label className="uos-field__label">
                  포털 아이디 <span className="req">*</span>
                </label>
                <input
                  className="uos-input"
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value.trim())}
                  placeholder="학번 또는 이메일"
                  autoComplete="username"
                  disabled={loading}
                />
              </div>

              <div className="uos-field">
                <label className="uos-field__label">
                  비밀번호 <span className="req">*</span>
                </label>
                <input
                  className="uos-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={loading}
                />
              </div>

              {error && (
                <div
                  style={{
                    background: '#fff5f5',
                    border: '1px solid #ffc9c9',
                    color: '#c92a2a',
                    padding: '10px 12px',
                    borderRadius: 8,
                    fontSize: 12.5,
                    whiteSpace: 'pre-line',
                  }}
                >
                  {error}
                </div>
              )}

              {serverWarming && !loading && (
                <div style={{ fontSize: 11.5, color: 'var(--c-text-4)', textAlign: 'center', marginTop: -4 }}>
                  서버 준비 중... (첫 사용 시 30초 정도)
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !userId || !password}
                className="uos-btn uos-btn--primary uos-btn--lg"
                style={{ marginTop: 4 }}
              >
                {loading ? (
                  <>
                    <span
                      style={{
                        width: 14,
                        height: 14,
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: '#fff',
                        borderRadius: '50%',
                        animation: 'spin 0.6s linear infinite',
                        display: 'inline-block',
                        marginRight: 6,
                      }}
                    />
                    포털 로그인 중... (10~30초)
                  </>
                ) : (
                  <>
                    <Icon.globe cls="uos-icon--sm" />
                    UOS 포털로 로그인
                  </>
                )}
              </button>

            </form>

            <p
              style={{
                marginTop: 18,
                fontSize: 10.5,
                color: 'var(--c-text-4)',
                textAlign: 'center',
                lineHeight: 1.6,
              }}
            >
              이 서비스는 시립대 공식 서비스가 아니에요.<br />
              입력한 정보는 시립대 포털 인증에만 사용되며 저장되지 않아요.
            </p>
          </div>
        </div>
      </div>

      {/* 스피너 애니메이션 */}
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
