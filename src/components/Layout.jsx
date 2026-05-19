import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { getSessionAvatar } from '../utils/randomAvatar'
import { useUser, isNumericStudentId } from '../utils/user'
import { isAdmin } from '../utils/admin'
import { logVisit } from '../api/analytics'

/* ─── Icons (시안 그대로) ───────────────────────────────────── */
const SVG = ({ children, cls = '' }) => (
  <svg viewBox="0 0 24 24" className={`uos-icon ${cls}`}>{children}</svg>
)
const Icon = {
  search: (p) => <SVG {...p}><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></SVG>,
  bell:   (p) => <SVG {...p}><path d="M6 8a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6z"/><path d="M10 19a2 2 0 0 0 4 0"/></SVG>,
  menu:   (p) => <SVG {...p}><path d="M3 6h18M3 12h18M3 18h18"/></SVG>,
  x:      (p) => <SVG {...p}><path d="M6 6l12 12M18 6L6 18"/></SVG>,
  chevR:  (p) => <SVG {...p}><polyline points="9 6 15 12 9 18"/></SVG>,
}

const NAV_ITEMS = [
  { to: '/', label: '홈' },
  { to: '/archive', label: '기출·자료' },
  { to: '/cafeteria', label: '학식' },
  { to: '/timetable', label: '시간표' },
  { to: '/notice', label: '공지' },
]

const UTILITY_LINKS = [
  { label: '온라인 강의실', href: 'https://uclass.uos.ac.kr/' },
  { label: '카피킬러',     href: 'https://uos.copykiller.com/' },
  { label: 'UOS AI Chat', href: 'https://aichat.uos.ac.kr/dashboard/chat' },
]

/* ─── Logo ───────────────────────────────────────────────────── */
function Logo() {
  const basePath = import.meta.env.BASE_URL
  return (
    <Link className="uos-logo" to="/">
      <div
        className="uos-logo__mark"
        style={{
          background: '#fff',
          border: '1px solid var(--c-primary-100)',
          padding: 2,
          overflow: 'hidden',
        }}
        aria-label="UOS Archive"
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            background: 'var(--c-primary-700)',
            WebkitMaskImage: `url(${basePath}logo.png)`,
            maskImage: `url(${basePath}logo.png)`,
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
          }}
        />
      </div>
      <div className="uos-logo__type">
        <strong>
          UOS Archive
          <span style={{ fontWeight: 500, color: 'var(--c-text-3)', marginLeft: 6 }}>
            · 자유전공학부
          </span>
        </strong>
      </div>
    </Link>
  )
}

/* ─── TopBar ─────────────────────────────────────────────────── */
function TopBar({ activePath, onOpenMobileNav }) {
  const user = useUser()
  return (
    <header className="uos-topbar sticky top-0 z-30">
      {/* 유틸리티 바 (데스크탑만) */}
      <div className="uos-topbar__utility uos-desktop-only">
        <span style={{ color: 'var(--c-text-4)' }}>자유전공학부 전용</span>
        {UTILITY_LINKS.map((l) => (
          <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <span className="dot" />
            <a href={l.href} target="_blank" rel="noopener noreferrer">{l.label}</a>
          </span>
        ))}
      </div>

      {/* 메인 바 */}
      <div className="uos-topbar__main">
        {/* 모바일 햄버거 */}
        <button
          onClick={onOpenMobileNav}
          className="uos-btn uos-btn--ghost uos-mobile-only"
          style={{ width: 36, padding: 0, flex: '0 0 auto' }}
          aria-label="메뉴 열기"
        >
          <Icon.menu />
        </button>

        <Logo />

        {/* 데스크탑 네비 */}
        <nav className="uos-nav uos-desktop-only">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.to === activePath ||
              (item.to !== '/' && activePath.startsWith(item.to))
            return (
              <Link
                key={item.label}
                to={item.to}
                className={`uos-nav__item ${isActive ? 'uos-nav__item--active' : ''}`}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="uos-topbar__right">
          <div className="uos-search uos-desktop-only" style={{ width: 200 }}>
            <Icon.search />
            <input placeholder="과목 · 학식 검색" />
          </div>
          <button className="uos-btn uos-btn--ghost" style={{ width: 36, padding: 0, flex: '0 0 auto' }} aria-label="알림">
            <Icon.bell />
          </button>
          {user ? (
            <Link
              to="/profile"
              className="uos-desktop-only"
              style={{
                alignItems: 'center',
                gap: 8,
                paddingLeft: 8,
                borderLeft: '1px solid var(--c-line)',
                marginLeft: 4,
                textDecoration: 'none',
                color: 'inherit',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: 8,
                transition: 'background .12s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--c-bg-soft)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              <div
                className="uos-avatar"
                style={{
                  background: `url(${getSessionAvatar()}) center/cover, var(--c-primary-50)`,
                }}
                aria-label="프로필"
              />
              <div style={{ lineHeight: 1.2 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>
                  {user.name || user.studentId}
                </div>
                <div style={{ fontSize: 11, color: 'var(--c-text-3)' }}>
                  {isNumericStudentId(user.studentId)
                    ? `자유전공 · ${user.studentId.slice(0, 4)}학번`
                    : '자유전공학부'}
                </div>
              </div>
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  )
}

/* ─── Mobile Nav Drawer ──────────────────────────────────────── */
function MobileNav({ open, onClose, activePath }) {
  const user = useUser()
  if (!open) return null
  const items = user ? [...NAV_ITEMS, { to: '/profile', label: '내 프로필' }] : NAV_ITEMS
  return (
    <div className="fixed inset-0 z-50 md:hidden" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl flex flex-col"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <Logo />
          <button onClick={onClose} className="uos-btn uos-btn--ghost" style={{ width: 36, padding: 0 }}>
            <Icon.x />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-2">
          {items.map((item) => {
            const isActive = item.to === activePath
            return (
              <Link
                key={item.label}
                to={item.to}
                onClick={onClose}
                className="block px-5 py-3 text-sm font-medium no-underline transition-colors"
                style={{
                  color: isActive ? 'var(--c-primary)' : 'var(--c-text)',
                  background: isActive ? 'var(--c-primary-50)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--c-primary)' : '3px solid transparent',
                }}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
        <div className="border-t border-gray-100 px-5 py-3 text-xs text-gray-500 space-y-1.5">
          {UTILITY_LINKS.map((l) => (
            <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" className="block no-underline text-gray-500 hover:text-uos-blue">
              {l.label} ↗
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ─── Footer ─────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer
      style={{
        background: 'linear-gradient(180deg, #fff 0%, var(--c-primary-50) 100%)',
        color: 'var(--c-text-2)',
        padding: '20px 24px',
        fontSize: 12,
        borderTop: '1px solid var(--c-line)',
      }}
    >
      <div className="max-w-[1400px] mx-auto flex flex-wrap items-center gap-x-5 gap-y-2">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              background: 'var(--c-primary-50)',
              border: '1px solid var(--c-primary-100)',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 700,
              fontSize: 10,
              color: 'var(--c-primary-700)',
            }}
          >
            자전
          </div>
          <strong style={{ color: 'var(--c-text)', fontSize: 13, fontWeight: 600 }}>UOS Archive</strong>
        </div>

        <div style={{ marginLeft: 'auto', fontSize: 11.5, color: 'var(--c-text-3)' }}>
          © 2026 made by{' '}
          <a
            href="https://www.instagram.com/je_noah/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: 'var(--c-primary)',
              fontWeight: 600,
              textDecoration: 'underline',
              textUnderlineOffset: 2,
            }}
          >
            je_noah
          </a>
        </div>
      </div>
    </footer>
  )
}

/* ─── Layout (default export) ────────────────────────────────── */
export default function Layout({ children }) {
  const location = useLocation()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const user = useUser()

  // 페이지 방문 자동 기록 (로그인된 사용자만, 관리자 본인 활동은 제외)
  // user 객체 전체 대신 studentId만 의존 — 토큰 갱신 시 객체 ref가 바뀌어도
  // 같은 학번이면 중복 발화하지 않도록.
  const userIdForLog = user?.studentId
  const adminFlag = isAdmin(user)
  useEffect(() => {
    if (!userIdForLog) return
    if (adminFlag) return
    logVisit({ studentId: userIdForLog, path: location.pathname })
  }, [userIdForLog, adminFlag, location.pathname])

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--c-bg-soft)' }}>
      <TopBar activePath={location.pathname} onOpenMobileNav={() => setMobileNavOpen(true)} />
      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} activePath={location.pathname} />

      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      <Footer />
    </div>
  )
}
