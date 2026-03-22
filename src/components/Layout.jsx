import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'

const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
)

const InfoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
)

const MenuIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="3" y1="6" x2="21" y2="6" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="18" x2="21" y2="18" />
  </svg>
)

const navItems = [
  { to: '/', label: '홈', Icon: HomeIcon },
  { to: '/about', label: '소개', Icon: InfoIcon },
]

export default function Layout({ children }) {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const basePath = import.meta.env.BASE_URL

  return (
    <div className="min-h-screen bg-[#F5F6FA] flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-[72px] bg-[#0B1526] flex flex-col items-center py-5 z-50 transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <Link to="/" className="mb-8 no-underline" onClick={() => setSidebarOpen(false)}>
          <img
            src={`${basePath}logo.png`}
            alt="Liberal & Cross"
            className="w-11 h-11 rounded-full bg-white p-0.5"
          />
        </Link>

        {/* Nav */}
        <nav className="flex flex-col gap-1 flex-1 w-full px-2">
          {navItems.map(({ to, label, Icon }) => {
            const isActive = location.pathname === to
            return (
              <Link
                key={to}
                to={to}
                onClick={() => setSidebarOpen(false)}
                className={`flex flex-col items-center gap-1 py-3 rounded-xl no-underline transition-all ${
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'text-gray-500 hover:bg-white/8 hover:text-gray-300'
                }`}
              >
                <Icon />
                <span className="text-[10px] font-medium tracking-wide">{label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="text-[9px] text-gray-600 text-center leading-tight tracking-wider">
          <p className="m-0">HEONJAE</p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
          <div className="px-6 py-3.5 flex items-center gap-4">
            <button
              className="lg:hidden text-gray-400 bg-transparent border-none cursor-pointer p-0.5"
              onClick={() => setSidebarOpen(true)}
            >
              <MenuIcon />
            </button>
            <nav className="flex items-center gap-2 text-sm text-gray-400">
              <Link to="/" className="no-underline text-gray-400 hover:text-uos-blue transition-colors">홈</Link>
              <span className="text-gray-300">/</span>
              <span className="text-gray-700 font-medium">
                {location.pathname === '/' ? '전체 족보' : location.pathname === '/about' ? '소개' : '과목별 보기'}
              </span>
            </nav>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-6 py-8 max-w-6xl w-full mx-auto">
          {children}
        </main>

        {/* Bottom footer */}
        <footer className="border-t border-gray-100 bg-white py-4 px-6">
          <p className="m-0 text-center text-xs text-gray-400">
            서울시립대학교 자유융합대학 족보 아카이브 &middot; made by Heonjae Ha
          </p>
        </footer>
      </div>
    </div>
  )
}
