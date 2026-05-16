import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'

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
  { to: '/timetable', label: '시간표' },
  { to: '/cafeteria', label: '학식' },
  { to: '/notice', label: '공지' },
  { to: '/', archive: true, label: '기출·자료' }, // 임시 - 홈으로 (추후 archive 페이지 추가)
  { to: '/ai', label: 'AI튜터' },
]

const UTILITY_LINKS = [
  { label: '학사정보', href: 'https://wise.uos.ac.kr/' },
  { label: 'e-Class',  href: 'https://uclass.uos.ac.kr/' },
  { label: '도서관',   href: 'https://library.uos.ac.kr/' },
  { label: '포털',     href: 'https://portal.uos.ac.kr/' },
]

/* ─── Logo ───────────────────────────────────────────────────── */
function Logo() {
  return (
    <Link className="uos-logo" to="/">
      <div className="uos-logo__mark">자전</div>
      <div className="uos-logo__type">
        <strong>
          UOS Archive
          <span style={{ fontWeight: 500, color: 'var(--c-text-3)', marginLeft: 6 }}>
            · 자유전공학부
          </span>
        </strong>
        <span>UOS FREE MAJOR · ARCHIVE</span>
      </div>
    </Link>
  )
}

/* ─── TopBar ─────────────────────────────────────────────────── */
function TopBar({ activePath, onOpenMobileNav }) {
  return (
    <header className="uos-topbar sticky top-0 z-30">
      {/* 유틸리티 바 (데스크탑만) */}
      <div className="uos-topbar__utility hidden md:flex">
        <span style={{ color: 'var(--c-text-4)' }}>자유전공학부 전용</span>
        {UTILITY_LINKS.map((l, i) => (
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
          className="md:hidden uos-btn uos-btn--ghost"
          style={{ width: 36, padding: 0 }}
          aria-label="메뉴 열기"
        >
          <Icon.menu />
        </button>

        <Logo />

        {/* 데스크탑 네비 */}
        <nav className="uos-nav hidden md:flex">
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
          <div className="uos-search hidden lg:flex" style={{ width: 240 }}>
            <Icon.search />
            <input placeholder="과목 · 학식 · 자료 검색" />
            <button className="uos-search__btn" aria-label="검색">
              <Icon.chevR cls="uos-icon--sm" />
            </button>
          </div>
          <button className="uos-btn uos-btn--ghost" style={{ width: 36, padding: 0 }} aria-label="알림">
            <Icon.bell />
          </button>
          <div className="hidden sm:flex" style={{ alignItems: 'center', gap: 8, paddingLeft: 8, borderLeft: '1px solid var(--c-line)', marginLeft: 4 }}>
            <div className="uos-avatar">하헌</div>
            <div style={{ lineHeight: 1.2 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>하헌재</div>
              <div style={{ fontSize: 11, color: 'var(--c-text-3)' }}>자유전공학부 · 25학번</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

/* ─── Mobile Nav Drawer ──────────────────────────────────────── */
function MobileNav({ open, onClose, activePath }) {
  if (!open) return null
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
          {NAV_ITEMS.map((item) => {
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
        background: '#0f172a',
        color: '#94a3b8',
        padding: '28px 32px',
        fontSize: 12,
        borderTop: '1px solid #1e293b',
      }}
    >
      <div className="max-w-[1400px] mx-auto flex flex-wrap items-center gap-x-5 gap-y-2">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, background: '#1e293b', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 10, color: '#cbd5e1' }}>자전</div>
          <strong style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 600 }}>UOS Archive</strong>
        </div>
        <span style={{ color: '#475569' }}>·</span>
        <span>자유전공학부 학생 운영 · 비공식 프로젝트</span>
        <span style={{ color: '#475569' }} className="hidden sm:inline">·</span>
        <a href="https://github.com/heonjaeh-lab/uos-exam-archive" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>
          GitHub
        </a>
        <div style={{ marginLeft: 'auto', fontSize: 11, color: '#64748b' }}>
          © 2026 made by 하헌재
        </div>
      </div>
    </footer>
  )
}

/* ─── Layout (default export) ────────────────────────────────── */
export default function Layout({ children }) {
  const location = useLocation()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

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
