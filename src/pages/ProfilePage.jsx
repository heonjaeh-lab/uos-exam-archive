import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUser, clearUser, isNumericStudentId } from '../utils/user'
import { getSessionAvatar } from '../utils/randomAvatar'

const TIMETABLE_KEY = 'uos-timetable-v1'

const SVG = ({ children, cls = '' }) => (
  <svg viewBox="0 0 24 24" className={`uos-icon ${cls}`}>{children}</svg>
)
const Icon = {
  user: (p) => <SVG {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-7 8-7s8 3 8 7"/></SVG>,
  cal: (p) => <SVG {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></SVG>,
  logout: (p) => <SVG {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></SVG>,
  trash: (p) => <SVG {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/></SVG>,
  refresh: (p) => <SVG {...p}><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></SVG>,
  chev: (p) => <SVG {...p}><polyline points="9 6 15 12 9 18"/></SVG>,
}

function loadAllSemesters() {
  try {
    return JSON.parse(localStorage.getItem(TIMETABLE_KEY) || '{}')
  } catch {
    return {}
  }
}

export default function ProfilePage() {
  const user = useUser()
  const navigate = useNavigate()
  const [confirmingLogout, setConfirmingLogout] = useState(false)
  const [confirmingReset, setConfirmingReset] = useState(false)

  // 시간표 통계 계산
  const stats = useMemo(() => {
    const all = loadAllSemesters()
    const semesters = Object.keys(all)
    const totalCourses = Object.values(all).reduce((sum, arr) => sum + (arr?.length || 0), 0)
    // 가장 최근 학기 (정렬: 키 형태가 "2026-1" 같다고 가정)
    const latestKey = semesters.sort().reverse()[0]
    const latestCourses = latestKey ? (all[latestKey] || []) : []
    const latestCredits = latestCourses.reduce((s, c) => s + (c.CREDIT || 0), 0)
    return {
      semesterCount: semesters.length,
      totalCourses,
      latestKey,
      latestCourseCount: latestCourses.length,
      latestCredits,
    }
  }, [])

  const savedAt = user?.savedAt ? new Date(user.savedAt) : null

  if (!user) {
    return (
      <div style={{ maxWidth: 480, margin: '60px auto', padding: '0 16px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>👤</div>
        <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700 }}>로그인이 필요해요</h2>
        <p style={{ color: 'var(--c-text-3)', fontSize: 14, margin: '0 0 20px' }}>
          시립대 포털로 로그인하면 프로필을 볼 수 있어요.
        </p>
        <Link
          to="/"
          className="uos-btn uos-btn--primary uos-btn--lg"
          style={{ textDecoration: 'none' }}
        >
          홈으로 가서 로그인
        </Link>
      </div>
    )
  }

  const handleLogout = () => {
    clearUser()
    navigate('/')
  }

  const handleResetTimetable = () => {
    localStorage.removeItem(TIMETABLE_KEY)
    setConfirmingReset(false)
    // 페이지 리렌더용 — useMemo는 마운트 시 한 번이라 강제 새로고침
    window.location.reload()
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '20px 16px 40px' }}>
      {/* 헤더 카드 */}
      <section
        className="uos-card"
        style={{
          padding: 0,
          overflow: 'hidden',
          background:
            'linear-gradient(135deg, var(--c-primary-700) 0%, var(--c-primary) 70%, var(--c-primary-600) 100%)',
          color: '#fff',
          border: 'none',
        }}
      >
        <div style={{ padding: '28px 24px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            className="uos-avatar uos-avatar--lg"
            style={{
              background: `url(${getSessionAvatar()}) center/cover, rgba(255,255,255,0.15)`,
              border: '2px solid rgba(255,255,255,0.4)',
              width: 64,
              height: 64,
            }}
            aria-label="프로필"
          />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 11, opacity: 0.8, letterSpacing: '0.08em', fontWeight: 600 }}>
              MY PROFILE
            </div>
            <h1 style={{ margin: '4px 0 4px', fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>
              {user.name || user.studentId}
            </h1>
            <div style={{ fontSize: 13, opacity: 0.85 }}>
              {isNumericStudentId(user.studentId)
                ? `자유전공학부 · ${user.studentId.slice(0, 4)}학번`
                : '자유전공학부'}
            </div>
          </div>
        </div>
      </section>

      {/* 시간표 통계 */}
      <section className="uos-card" style={{ marginTop: 16 }}>
        <div className="uos-card__hd" style={{ padding: '14px 18px' }}>
          <Icon.cal cls="uos-icon--sm" />
          <h3 style={{ fontSize: 14 }}>시간표</h3>
          <Link to="/timetable" className="more">관리하기 <Icon.chev cls="uos-icon--sm" /></Link>
        </div>
        <div
          style={{
            padding: '16px 18px',
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 10,
          }}
        >
          {[
            { n: stats.latestCourseCount, l: '이번 학기 강의' },
            { n: stats.latestCredits, l: '학점' },
            { n: stats.semesterCount, l: '저장된 학기' },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                background: 'var(--c-bg-soft)',
                border: '1px solid var(--c-line)',
                borderRadius: 10,
                padding: '14px 8px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 22, fontWeight: 700 }} className="uos-tabular">
                {s.n}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--c-text-3)', marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 계정 정보 */}
      <section className="uos-card" style={{ marginTop: 16 }}>
        <div className="uos-card__hd" style={{ padding: '14px 18px' }}>
          <Icon.user cls="uos-icon--sm" />
          <h3 style={{ fontSize: 14 }}>계정 정보</h3>
        </div>
        <div style={{ padding: '4px 18px 14px' }}>
          <Row label="포털 아이디" value={user.studentId} />
          {savedAt && (
            <Row
              label="로그인 시각"
              value={savedAt.toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
            />
          )}
          <Row label="자동 로그인" value="활성 (1년)" />
        </div>
      </section>

      {/* 액션 */}
      <section className="uos-card" style={{ marginTop: 16 }}>
        <div className="uos-card__hd" style={{ padding: '14px 18px' }}>
          <h3 style={{ fontSize: 14 }}>설정</h3>
        </div>
        <div style={{ padding: '4px 0 12px' }}>
          <ActionRow
            icon={<Icon.refresh />}
            label="시간표 다시 가져오기"
            description="포털에서 최신 시간표를 새로 받아와요"
            onClick={() => navigate('/timetable')}
          />
          {confirmingReset ? (
            <ConfirmRow
              icon={<Icon.trash />}
              question="저장된 시간표를 모두 삭제할까요?"
              onConfirm={handleResetTimetable}
              onCancel={() => setConfirmingReset(false)}
              danger
            />
          ) : (
            <ActionRow
              icon={<Icon.trash />}
              label="시간표 데이터 초기화"
              description="저장된 모든 학기 시간표를 삭제해요"
              onClick={() => setConfirmingReset(true)}
              danger
            />
          )}
          {confirmingLogout ? (
            <ConfirmRow
              icon={<Icon.logout />}
              question="정말 로그아웃할까요?"
              onConfirm={handleLogout}
              onCancel={() => setConfirmingLogout(false)}
              danger
            />
          ) : (
            <ActionRow
              icon={<Icon.logout />}
              label="로그아웃"
              description="다음 사용 시 다시 포털 로그인이 필요해요"
              onClick={() => setConfirmingLogout(true)}
            />
          )}
        </div>
      </section>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 0',
        borderBottom: '1px solid var(--c-line)',
        fontSize: 13.5,
      }}
    >
      <span style={{ color: 'var(--c-text-3)' }}>{label}</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
  )
}

function ActionRow({ icon, label, description, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        background: 'transparent',
        border: 0,
        textAlign: 'left',
        padding: '12px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        cursor: 'pointer',
        color: danger ? '#c92a2a' : 'inherit',
        borderTop: '1px solid var(--c-line)',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--c-bg-soft)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <span style={{ display: 'inline-flex', width: 20, height: 20, alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: 11.5, color: 'var(--c-text-3)', marginTop: 2 }}>{description}</div>
      </span>
      <Icon.chev cls="uos-icon--sm" />
    </button>
  )
}

function ConfirmRow({ icon, question, onConfirm, onCancel, danger }) {
  return (
    <div
      style={{
        padding: '12px 18px',
        background: danger ? '#fff5f5' : 'var(--c-bg-soft)',
        borderTop: '1px solid var(--c-line)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <span style={{ display: 'inline-flex', width: 20, height: 20, color: danger ? '#c92a2a' : 'inherit' }}>
        {icon}
      </span>
      <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{question}</span>
      <button
        onClick={onCancel}
        className="uos-btn"
        style={{ height: 32, padding: '0 12px', fontSize: 12 }}
      >
        취소
      </button>
      <button
        onClick={onConfirm}
        className="uos-btn"
        style={{
          height: 32,
          padding: '0 14px',
          fontSize: 12,
          background: danger ? '#c92a2a' : 'var(--c-primary)',
          color: '#fff',
          border: 'none',
        }}
      >
        확인
      </button>
    </div>
  )
}
