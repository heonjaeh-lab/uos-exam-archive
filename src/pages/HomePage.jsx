import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import examsData from '../data/exams.json'
import { fetchCafeterias } from '../api/cafeteria'
import { fetchNoticeBoard } from '../api/notice'
import { parseClassNm } from '../utils/parseClassNm'
import { getSessionAvatar } from '../utils/randomAvatar'
import { useUser, isNumericStudentId } from '../utils/user'
import PortalLoginModal from '../components/PortalLoginModal'

const STORAGE_KEY = 'uos-timetable-v1'

const PERIOD_TO_TIME = {
  1: '09:00', 2: '10:00', 3: '11:00', 4: '12:00', 5: '13:00',
  6: '14:00', 7: '15:00', 8: '16:00', 9: '17:00', 10: '18:00',
  11: '19:00', 12: '20:00', 13: '21:00', 14: '22:00',
}

const DAY_KEYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토']

const TODAY_LABEL_FORMAT = (() => {
  const d = new Date()
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${DAY_LABELS[d.getDay()]})`
})()

/* ─── 아이콘 ────────────────────────────────────────────── */
const SVG = ({ children, cls = '' }) => (
  <svg viewBox="0 0 24 24" className={`uos-icon ${cls}`}>{children}</svg>
)
const Icon = {
  cal: (p) => <SVG {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></SVG>,
  fire: (p) => <SVG {...p}><path d="M12 3s4 4 4 8-2 6-4 6-4-2-4-6c0-2 1-3 2-3 0 2 1 2 2 1z"/></SVG>,
  bell: (p) => <SVG {...p}><path d="M6 8a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6z"/><path d="M10 19a2 2 0 0 0 4 0"/></SVG>,
  search: (p) => <SVG {...p}><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></SVG>,
  upload: (p) => <SVG {...p}><path d="M12 20V8"/><path d="M7 13l5-5 5 5"/><path d="M5 4h14"/></SVG>,
  chevR: (p) => <SVG {...p}><polyline points="9 6 15 12 9 18"/></SVG>,
  eye: (p) => <SVG {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></SVG>,
  book: (p) => <SVG {...p}><path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2V5z"/><path d="M8 7h6M8 11h6M8 15h4"/></SVG>,
}

/* ─── 오늘의 시간표 위젯 ─────────────────────────────────── */
function TodayTimetableCard() {
  const [todayClasses, setTodayClasses] = useState([])

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      // 가장 최근 학기의 시간표 사용 (정렬해서 마지막)
      const keys = Object.keys(saved).sort()
      const latest = keys[keys.length - 1]
      if (!latest) return setTodayClasses([])
      const courses = saved[latest] || []

      // 오늘 요일에 해당하는 강의만 필터
      const today = DAY_KEYS[new Date().getDay()]
      const blocks = []
      courses.forEach((c) => {
        const parsedBlocks = parseClassNm(c.CLASS_NM)
        parsedBlocks.forEach((b) => {
          if (b.day === today) {
            blocks.push({
              ...b,
              course: c,
              startPeriod: Math.min(...b.periods),
              endPeriod: Math.max(...b.periods),
            })
          }
        })
      })
      blocks.sort((a, b) => a.startPeriod - b.startPeriod)
      setTodayClasses(blocks)
    } catch (e) {
      console.warn('시간표 로딩 실패', e)
    }
  }, [])

  return (
    <div className="uos-card" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="uos-card__hd">
        <Icon.cal cls="uos-icon--sm" />
        <h3>오늘의 수업</h3>
        <span className="uos-muted" style={{ fontSize: 12 }}>{TODAY_LABEL_FORMAT}</span>
        <Link to="/timetable" className="more">전체 시간표 <Icon.chevR cls="uos-icon--sm" /></Link>
      </div>
      <div className="uos-card__bd" style={{ padding: '14px 16px 18px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {todayClasses.length === 0 ? (
          <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--c-text-3)' }}>
            <img
              src={`${import.meta.env.BASE_URL}empty-timetable.png`}
              alt="시간표 비어있음"
              style={{ width: 120, height: 120, objectFit: 'contain', margin: '0 auto 8px' }}
            />
            <div style={{ fontSize: 13, marginBottom: 8 }}>오늘 수업이 없거나 시간표가 비어있어요</div>
            <Link to="/timetable" className="uos-btn uos-btn--sm uos-btn--primary" style={{ display: 'inline-flex' }}>
              시간표 등록하기
            </Link>
          </div>
        ) : (
          todayClasses.map((c, i) => {
            const startTime = PERIOD_TO_TIME[c.startPeriod]
            const endTime = PERIOD_TO_TIME[c.endPeriod + 1] || '미정'
            return (
              <div
                key={i}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '88px 1fr auto',
                  alignItems: 'center',
                  gap: 14,
                  padding: '12px 14px',
                  background: 'var(--c-bg-soft)',
                  borderLeft: '4px solid var(--c-primary)',
                  borderRadius: 8,
                }}
              >
                <div style={{ lineHeight: 1.3 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }} className="uos-tabular">{startTime}</div>
                  <div style={{ fontSize: 11, color: 'var(--c-text-3)' }} className="uos-tabular">— {endTime}</div>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em' }}>
                    {c.course.SUBJECT_NM}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--c-text-3)', marginTop: 2 }}>
                    {c.course.PROF_KOR_NM} · {c.room}
                  </div>
                </div>
                <span className="uos-tag uos-tag--outline">{c.course.CREDIT}학점</span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

/* ─── 오늘의 학식 위젯 ───────────────────────────────────── */
function TodayCafeteriaCard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCafeterias()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  // 점심(중식)이 있는 식당의 "오늘의 특별 메뉴" 추출
  // (양식당의 매일 반복되는 까스류는 자동 제외, 그날만의 특별 메뉴를 다 보여줌)
  const lunchToday = useMemo(() => {
    if (!data?.restaurants) return []
    return data.restaurants
      .filter((r) => r.meals?.lunch)
      .map((r) => {
        const highlights =
          Array.isArray(r.lunchHighlights) && r.lunchHighlights.length > 0
            ? r.lunchHighlights
            : r.meals.lunch
                .split('\n')
                .map((s) => s.trim())
                .filter(Boolean)
                .slice(0, 4)
        return {
          name: r.shortName || r.name,
          highlights,
          code: r.code,
        }
      })
      .slice(0, 4)
  }, [data])

  return (
    <div className="uos-card">
      <div className="uos-card__hd">
        <Icon.fire cls="uos-icon--sm" />
        <h3>오늘의 학식</h3>
        <Link to="/cafeteria" className="more">전체 식당 <Icon.chevR cls="uos-icon--sm" /></Link>
      </div>
      <div className="uos-card__bd" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading ? (
          <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--c-text-3)', fontSize: 13 }}>
            학식 메뉴 가져오는 중...
          </div>
        ) : lunchToday.length === 0 ? (
          <div style={{ padding: '20px 0', textAlign: 'center', color: 'var(--c-text-3)' }}>
            <img
              src={`${import.meta.env.BASE_URL}empty-cafeteria.png`}
              alt="운영 안 함"
              style={{ width: 120, height: 120, objectFit: 'contain', margin: '0 auto 6px' }}
            />
            <div style={{ fontSize: 13 }}>오늘은 학식 운영 X<br/>(주말/공휴일일 수 있어요)</div>
          </div>
        ) : (
          lunchToday.map((r, i) => (
            <Link
              key={i}
              to="/cafeteria"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                border: '1px solid var(--c-line)',
                borderRadius: 8,
                textDecoration: 'none',
                color: 'inherit',
                transition: 'background .12s, border-color .12s, transform .12s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--c-bg-soft)'
                e.currentTarget.style.borderColor = 'var(--c-primary-100, var(--c-line))'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.borderColor = 'var(--c-line)'
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, marginBottom: 2 }}>{r.name}</div>
                <div
                  style={{
                    fontSize: 11.5,
                    color: 'var(--c-text-3)',
                    lineHeight: 1.45,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {r.highlights.join(' · ')}
                </div>
              </div>
              <span className="uos-tag uos-tag--primary" style={{ flexShrink: 0 }}>중식</span>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}

/* ─── 최근 기출 자료 ────────────────────────────────────── */
function RecentExamsCard() {
  const recent = useMemo(() => {
    return [...examsData]
      .sort((a, b) => (b.year || 0) - (a.year || 0))
      .slice(0, 6)
  }, [])

  return (
    <section className="uos-card">
      <div className="uos-card__hd">
        <h3>최근 기출 자료</h3>
        <span className="uos-tag uos-tag--success uos-tag--dot">아카이브</span>
        <Link to="/archive" className="more">전체보기 <Icon.chevR cls="uos-icon--sm" /></Link>
      </div>
      <div>
        {recent.map((r, i) => (
          <Link
            key={r.id || i}
            to={`/subject/${encodeURIComponent(r.subject)}`}
            style={{
              display: 'block',
              textDecoration: 'none',
              color: 'inherit',
              padding: '12px 18px',
              borderTop: i === 0 ? '0' : '1px solid var(--c-line)',
              transition: 'background .1s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--c-bg-soft)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
              <span
                className={`uos-tag ${
                  r.examType === '기말' ? 'uos-tag--primary' : 'uos-tag--outline'
                }`}
              >
                {r.examType}
              </span>
              {r.year && (
                <span style={{ fontSize: 11, color: 'var(--c-text-4)' }} className="uos-tabular">
                  {r.year}
                </span>
              )}
            </div>
            <div
              className="uos-clamp-2"
              style={{
                fontSize: 13.5,
                fontWeight: 500,
                color: 'var(--c-text)',
                lineHeight: 1.4,
                wordBreak: 'keep-all',
              }}
            >
              {r.title || r.subject}
            </div>
            <div style={{ marginTop: 3, fontSize: 11.5, color: 'var(--c-text-3)' }}>
              {r.subject}
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

/* ─── 학부 공지 사이드 위젯 ──────────────────────────────── */
function NoticeSideCard() {
  const [notices, setNotices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNoticeBoard('academic')
      .then((data) => setNotices((data.notices || []).slice(0, 5)))
      .catch(() => setNotices([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="uos-card">
      <div className="uos-card__hd" style={{ padding: '14px 18px' }}>
        <Icon.bell cls="uos-icon--sm" />
        <h3 style={{ fontSize: 14 }}>학부 공지</h3>
        <Link to="/notice" className="more">+</Link>
      </div>
      <div style={{ padding: '4px 0 8px' }}>
        {loading ? (
          <div style={{ padding: 16, fontSize: 12, color: 'var(--c-text-3)' }}>불러오는 중...</div>
        ) : notices.length === 0 ? (
          <div style={{ padding: 16, fontSize: 12, color: 'var(--c-text-3)' }}>공지를 가져올 수 없어요</div>
        ) : (
          notices.map((n, i) => (
            <a
              key={n.id || i}
              href={n.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', textDecoration: 'none', color: 'var(--c-text)', fontSize: 13 }}
            >
              <span
                className={`uos-tag ${n.category === '학사' ? 'uos-tag--primary' : n.category === '장학' ? 'uos-tag--warning' : ''}`}
                style={{ minWidth: 36, justifyContent: 'center' }}
              >
                {n.category}
              </span>
              <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {n.title}
              </span>
              <span style={{ color: 'var(--c-text-4)', fontSize: 11.5 }} className="uos-tabular">
                {n.date?.slice(5) || ''}
              </span>
            </a>
          ))
        )}
      </div>
    </section>
  )
}

/* ─── 내 정보 카드 (로그인 사용자) ──────────────────────────── */
function MyInfoCard({ user }) {
  const [stats, setStats] = useState({ credits: 0, courseCount: 0, semesters: 0 })

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
      const keys = Object.keys(saved)
      let credits = 0
      let courseCount = 0
      keys.forEach((k) => {
        const courses = saved[k] || []
        courseCount += courses.length
        courses.forEach((c) => { credits += c.CREDIT || 0 })
      })
      setStats({ credits, courseCount, semesters: keys.length })
    } catch {}
  }, [])

  return (
    <section className="uos-card" style={{ background: 'linear-gradient(180deg, #fff 0%, var(--c-bg-soft) 100%)' }}>
      <div className="uos-card__bd">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            className="uos-avatar uos-avatar--lg"
            style={{
              background: `url(${getSessionAvatar()}) center/cover, var(--c-primary-50)`,
            }}
            aria-label="프로필"
          />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>
              {user?.name || user?.studentId}
            </div>
            <div style={{ fontSize: 12, color: 'var(--c-text-3)' }}>
              {isNumericStudentId(user?.studentId)
                ? `자유전공학부 · ${user.studentId.slice(0, 4)}학번`
                : '자유전공학부'}
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 16 }}>
          {[
            { n: stats.credits, l: '담은 학점' },
            { n: stats.courseCount, l: '수강 강의' },
            { n: stats.semesters, l: '저장 학기' },
          ].map((s, i) => (
            <div key={i} style={{ background: '#fff', border: '1px solid var(--c-line)', borderRadius: 8, padding: '10px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700 }} className="uos-tabular">{s.n}</div>
              <div style={{ fontSize: 11, color: 'var(--c-text-3)', marginTop: 1 }}>{s.l}</div>
            </div>
          ))}
        </div>
        <Link to="/timetable" className="uos-btn" style={{ width: '100%', marginTop: 12, textDecoration: 'none' }}>
          시간표 보기 <Icon.chevR cls="uos-icon--sm" />
        </Link>
      </div>
    </section>
  )
}

/* ─── 로그인 권유 카드 (비로그인) ───────────────────────────── */
function LoginPromptCard({ onLogin }) {
  return (
    <section
      className="uos-card"
      style={{
        background:
          'linear-gradient(160deg, var(--c-primary-700) 0%, var(--c-primary) 70%, var(--c-primary-600) 100%)',
        color: '#fff',
        border: 'none',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          right: -40,
          top: -40,
          width: 160,
          height: 160,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
        }}
      />
      <div className="uos-card__bd" style={{ position: 'relative' }}>
        <div
          style={{
            fontSize: 10.5,
            letterSpacing: '0.14em',
            opacity: 0.85,
            fontWeight: 600,
          }}
        >
          UOS PORTAL
        </div>
        <h3
          style={{
            margin: '6px 0 6px',
            fontSize: 17,
            fontWeight: 700,
            letterSpacing: '-0.02em',
            lineHeight: 1.3,
          }}
        >
          시립대 포털로 로그인하면<br />
          시간표가 자동으로 와요
        </h3>
        <ul style={{ margin: '8px 0 14px', paddingLeft: 18, fontSize: 12, opacity: 0.9, lineHeight: 1.7 }}>
          <li>본인 수강 강의 자동 등록</li>
          <li>다른 기기에서도 같은 시간표 동기화</li>
          <li>30일 자동 로그인 유지</li>
        </ul>
        <button
          onClick={onLogin}
          className="uos-btn"
          style={{
            width: '100%',
            background: '#fff',
            color: 'var(--c-primary-700)',
            border: 'none',
            fontWeight: 700,
          }}
        >
          시립대 포털 연동하기 <Icon.chevR cls="uos-icon--sm" />
        </button>
        <p
          style={{
            margin: '10px 0 0',
            fontSize: 10.5,
            opacity: 0.7,
            textAlign: 'center',
          }}
        >
          비밀번호는 저장되지 않아요 · 포털 아이디만 식별용으로 사용
        </p>
      </div>
    </section>
  )
}

/* ─── HomePage Main ──────────────────────────────────────── */
export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [loginModalOpen, setLoginModalOpen] = useState(false)
  const user = useUser()

  return (
    <div style={{ margin: '-24px -16px 0', paddingBottom: 20 }}>
      {/* Hero */}
      <section
        style={{
          background: 'linear-gradient(180deg, #fff 0%, var(--c-primary-50) 100%)',
          borderBottom: '1px solid var(--c-line)',
          padding: '36px 16px 32px',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap' }}>
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '4px 10px',
                background: 'rgba(28,126,214,0.1)', color: 'var(--c-primary-700)',
                borderRadius: 20, fontSize: 11.5, fontWeight: 600, letterSpacing: '0.04em',
                marginBottom: 12,
              }}>
                2026-1학기 · {TODAY_LABEL_FORMAT}
              </div>
              <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.25 }}>
                자유전공학부의<br />
                시간표·학식·기출·공지를 <span style={{ color: 'var(--c-primary)' }}>한 자리에</span>.
              </h1>
              <p style={{ margin: '10px 0 0', fontSize: 14, color: 'var(--c-text-2)', maxWidth: 520 }}>
                자전 학생들을 위한 모든것!
              </p>
            </div>
            <div
              style={{
                display: 'flex',
                gap: 8,
                paddingBottom: 6,
                flexWrap: 'wrap',
              }}
            >
              <Link to="/timetable" className="uos-btn uos-btn--lg uos-btn--primary" style={{ textDecoration: 'none', flex: '1 1 auto', justifyContent: 'center', minWidth: 0 }}>
                <Icon.cal /> 내 시간표
              </Link>
              <Link to="/cafeteria" className="uos-btn uos-btn--lg" style={{ textDecoration: 'none', flex: '1 1 auto', justifyContent: 'center', minWidth: 0 }}>
                <Icon.fire /> 오늘 학식
              </Link>
              <Link to="/archive" className="uos-btn uos-btn--lg" style={{ textDecoration: 'none', flex: '1 1 auto', justifyContent: 'center', minWidth: 0 }}>
                <Icon.book /> 족보
              </Link>
            </div>
          </div>

          {/* 빠른 검색 */}
          <form
            onSubmit={(e) => e.preventDefault()}
            style={{
              marginTop: 22,
              display: 'flex', alignItems: 'center',
              background: '#fff', borderRadius: 12,
              boxShadow: '0 6px 24px rgba(28,126,214,0.10), 0 1px 2px rgba(15,23,42,.04)',
              border: '1px solid var(--c-line)', padding: 6,
            }}
          >
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px' }}>
              <Icon.search cls="uos-icon--lg" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1, border: 0, outline: 0, font: 'inherit', fontSize: 16, padding: '14px 0', background: 'transparent' }}
                placeholder="예: 대학물리학 · 오늘학식"
              />
            </div>
            <button type="submit" className="uos-btn uos-btn--primary" style={{ height: 48, padding: '0 24px', fontSize: 15, fontWeight: 600 }}>
              검색
            </button>
          </form>
        </div>
      </section>

      {/* 본문 */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 16px 36px' }}>
        {/* 비로그인 사용자: 포털 CTA 카드를 본문 최상단으로 (모바일 우선 노출) */}
        {!user && (
          <div style={{ marginBottom: 20 }}>
            <LoginPromptCard onLogin={() => setLoginModalOpen(true)} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* 메인 컬럼 */}
          <div className="flex flex-col gap-5 min-w-0">
            {/* Today row */}
            <section className="grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-4">
              <TodayTimetableCard />
              <TodayCafeteriaCard />
            </section>

            {/* 최근 기출 자료 */}
            <RecentExamsCard />
          </div>

          {/* 사이드 */}
          <aside className="flex flex-col gap-4 min-w-0">
            {user && <MyInfoCard user={user} />}
            <NoticeSideCard />
          </aside>
        </div>
      </main>

      <PortalLoginModal
        open={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onSuccess={() => setLoginModalOpen(false)}
      />
    </div>
  )
}
