/* shared.jsx — 공용 컴포넌트: TopBar, Icons, mock data */

// ─── Icons ─────────────────────────────────────────────────────
const Icon = {
  search: (p) => (
    <svg viewBox="0 0 24 24" className={`uos-icon ${p?.cls||''}`}>
      <circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>
    </svg>
  ),
  bell: (p) => (
    <svg viewBox="0 0 24 24" className={`uos-icon ${p?.cls||''}`}>
      <path d="M6 8a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6z"/>
      <path d="M10 19a2 2 0 0 0 4 0"/>
    </svg>
  ),
  user: (p) => (
    <svg viewBox="0 0 24 24" className={`uos-icon ${p?.cls||''}`}>
      <circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/>
    </svg>
  ),
  bookmark: (p) => (
    <svg viewBox="0 0 24 24" className={`uos-icon ${p?.cls||''}`}>
      <path d="M6 4h12v17l-6-4-6 4z"/>
    </svg>
  ),
  bookmarkFill: (p) => (
    <svg viewBox="0 0 24 24" className={`uos-icon ${p?.cls||''}`} fill="currentColor" stroke="currentColor">
      <path d="M6 4h12v17l-6-4-6 4z"/>
    </svg>
  ),
  download: (p) => (
    <svg viewBox="0 0 24 24" className={`uos-icon ${p?.cls||''}`}>
      <path d="M12 4v12"/><path d="M7 11l5 5 5-5"/><path d="M5 20h14"/>
    </svg>
  ),
  upload: (p) => (
    <svg viewBox="0 0 24 24" className={`uos-icon ${p?.cls||''}`}>
      <path d="M12 20V8"/><path d="M7 13l5-5 5 5"/><path d="M5 4h14"/>
    </svg>
  ),
  doc: (p) => (
    <svg viewBox="0 0 24 24" className={`uos-icon ${p?.cls||''}`}>
      <path d="M7 3h8l4 4v14H7z"/><path d="M15 3v5h4"/>
      <path d="M10 13h6"/><path d="M10 17h4"/>
    </svg>
  ),
  filter: (p) => (
    <svg viewBox="0 0 24 24" className={`uos-icon ${p?.cls||''}`}>
      <path d="M4 5h16M7 12h10M10 19h4"/>
    </svg>
  ),
  chevR: (p) => (
    <svg viewBox="0 0 24 24" className={`uos-icon ${p?.cls||''}`}>
      <polyline points="9 6 15 12 9 18"/>
    </svg>
  ),
  chevL: (p) => (
    <svg viewBox="0 0 24 24" className={`uos-icon ${p?.cls||''}`}>
      <polyline points="15 6 9 12 15 18"/>
    </svg>
  ),
  chevD: (p) => (
    <svg viewBox="0 0 24 24" className={`uos-icon ${p?.cls||''}`}>
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  ),
  plus: (p) => (
    <svg viewBox="0 0 24 24" className={`uos-icon ${p?.cls||''}`}>
      <path d="M12 5v14M5 12h14"/>
    </svg>
  ),
  x: (p) => (
    <svg viewBox="0 0 24 24" className={`uos-icon ${p?.cls||''}`}>
      <path d="M6 6l12 12M18 6L6 18"/>
    </svg>
  ),
  star: (p) => (
    <svg viewBox="0 0 24 24" className={`uos-icon ${p?.cls||''}`}>
      <path d="M12 3l2.6 5.6 6 .9-4.4 4.2 1 6.1L12 17l-5.2 2.8 1-6.1L3.4 9.5l6-.9z"/>
    </svg>
  ),
  eye: (p) => (
    <svg viewBox="0 0 24 24" className={`uos-icon ${p?.cls||''}`}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  check: (p) => (
    <svg viewBox="0 0 24 24" className={`uos-icon ${p?.cls||''}`}>
      <polyline points="4 12 10 18 20 6"/>
    </svg>
  ),
  pin: (p) => (
    <svg viewBox="0 0 24 24" className={`uos-icon ${p?.cls||''}`}>
      <path d="M12 2v8"/><path d="M5 10h14l-2 5H7z"/><path d="M12 15v7"/>
    </svg>
  ),
  cal: (p) => (
    <svg viewBox="0 0 24 24" className={`uos-icon ${p?.cls||''}`}>
      <rect x="3" y="5" width="18" height="16" rx="2"/>
      <path d="M3 9h18M8 3v4M16 3v4"/>
    </svg>
  ),
  edu: (p) => (
    <svg viewBox="0 0 24 24" className={`uos-icon ${p?.cls||''}`}>
      <path d="M3 9l9-4 9 4-9 4z"/><path d="M7 11v5c0 1 2 3 5 3s5-2 5-3v-5"/>
    </svg>
  ),
  beaker: (p) => (
    <svg viewBox="0 0 24 24" className={`uos-icon ${p?.cls||''}`}>
      <path d="M9 3v6L4 19a2 2 0 0 0 2 3h12a2 2 0 0 0 2-3l-5-10V3"/>
      <path d="M8 3h8"/>
    </svg>
  ),
  cpu: (p) => (
    <svg viewBox="0 0 24 24" className={`uos-icon ${p?.cls||''}`}>
      <rect x="6" y="6" width="12" height="12" rx="2"/>
      <rect x="9" y="9" width="6" height="6"/>
      <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>
    </svg>
  ),
  brush: (p) => (
    <svg viewBox="0 0 24 24" className={`uos-icon ${p?.cls||''}`}>
      <path d="M14 3l7 7-9 9-4 1 1-4z"/><path d="M12 5l7 7"/>
    </svg>
  ),
  scale: (p) => (
    <svg viewBox="0 0 24 24" className={`uos-icon ${p?.cls||''}`}>
      <path d="M12 3v18M5 7l-3 6h6zM19 7l-3 6h6zM5 7h14"/>
    </svg>
  ),
  globe: (p) => (
    <svg viewBox="0 0 24 24" className={`uos-icon ${p?.cls||''}`}>
      <circle cx="12" cy="12" r="9"/>
      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>
    </svg>
  ),
  trend: (p) => (
    <svg viewBox="0 0 24 24" className={`uos-icon ${p?.cls||''}`}>
      <polyline points="3 17 9 11 13 15 21 7"/>
      <polyline points="15 7 21 7 21 13"/>
    </svg>
  ),
  fire: (p) => (
    <svg viewBox="0 0 24 24" className={`uos-icon ${p?.cls||''}`}>
      <path d="M12 3s4 4 4 8-2 6-4 6-4-2-4-6c0-2 1-3 2-3 0 2 1 2 2 1z"/>
    </svg>
  ),
  heart: (p) => (
    <svg viewBox="0 0 24 24" className={`uos-icon ${p?.cls||''}`}>
      <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z"/>
    </svg>
  ),
  msg: (p) => (
    <svg viewBox="0 0 24 24" className={`uos-icon ${p?.cls||''}`}>
      <path d="M4 5h16v11H8l-4 4z"/>
    </svg>
  ),
  pdf: (p) => (
    <svg viewBox="0 0 24 24" className={`uos-icon ${p?.cls||''}`}>
      <path d="M7 3h8l4 4v14H7z"/><path d="M15 3v5h4"/>
      <text x="9" y="18" fontSize="6" fill="currentColor" stroke="none" fontWeight="700">PDF</text>
    </svg>
  ),
  sliders: (p) => (
    <svg viewBox="0 0 24 24" className={`uos-icon ${p?.cls||''}`}>
      <path d="M4 6h12M4 12h6M4 18h14"/>
      <circle cx="18" cy="6" r="2"/><circle cx="13" cy="12" r="2"/><circle cx="20" cy="18" r="2"/>
    </svg>
  ),
};

// ─── Logo ──────────────────────────────────────────────────────
function Logo() {
  return (
    <a className="uos-logo" href="#">
      <div className="uos-logo__mark">자1</div>
      <div className="uos-logo__type">
        <strong>자유 1 <span style={{fontWeight:500, color:'var(--c-text-3)'}}>· 자유전공학부 1학년</span></strong>
        <span>UOS FREE MAJOR · CLASS OF 2026</span>
      </div>
    </a>
  );
}

// ─── TopBar ────────────────────────────────────────────────────
function TopBar({ active = 'home', showSearch = true, loggedIn = true }) {
  const items = [
    { id: 'home', label: '홈' },
    { id: 'timetable', label: '시간표' },
    { id: 'meal', label: '학식' },
    { id: 'archive', label: '기출·자료' },
    { id: 'community', label: '커뮤니티' },
  ];
  return (
    <header className="uos-topbar">
      <div className="uos-topbar__utility">
        <span style={{color:'var(--c-text-4)'}}>자유전공학부 1학년 전용</span>
        <span className="dot"/>
        <a href="#">학사정보</a>
        <span className="dot"/>
        <a href="#">e-Class</a>
        <span className="dot"/>
        <a href="#">도서관</a>
        <span className="dot"/>
        <a href="#">학생회</a>
      </div>
      <div className="uos-topbar__main">
        <Logo/>
        <nav className="uos-nav">
          {items.map(i => (
            <a key={i.id} href="#" className={`uos-nav__item ${active===i.id?'uos-nav__item--active':''}`}>
              {i.label}
            </a>
          ))}
        </nav>
        <div className="uos-topbar__right">
          {showSearch && (
            <div className="uos-search" style={{width: 260}}>
              <Icon.search/>
              <input placeholder="과목 · 학식 · 자료 검색"/>
              <button className="uos-search__btn" aria-label="검색">
                <Icon.chevR cls="uos-icon--sm"/>
              </button>
            </div>
          )}
          {loggedIn ? (
            <>
              <button className="uos-btn uos-btn--ghost" style={{width: 36, padding: 0}} aria-label="알림">
                <Icon.bell/>
              </button>
              <div style={{display:'flex',alignItems:'center',gap:8, paddingLeft: 8, borderLeft:'1px solid var(--c-line)', marginLeft:4}}>
                <div className="uos-avatar">정현</div>
                <div style={{lineHeight:1.2}}>
                  <div style={{fontSize:13, fontWeight:600}}>정현재</div>
                  <div style={{fontSize:11, color:'var(--c-text-3)'}}>자유전공학부 · 26학번</div>
                </div>
              </div>
            </>
          ) : (
            <>
              <a href="#" className="uos-btn uos-btn--ghost">로그인</a>
              <a href="#" className="uos-btn uos-btn--primary">회원가입</a>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

// ─── Footer ────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{
      flex: '0 0 auto',
      background: '#0f172a',
      color: '#94a3b8',
      padding: '24px 32px',
      fontSize: 12,
      display: 'flex',
      alignItems: 'center',
      gap: 24,
      borderTop: '1px solid #1e293b',
    }}>
      <div style={{display:'flex',alignItems:'center',gap:10}}>
        <div style={{width:24,height:24,borderRadius:6,background:'#1e293b',display:'grid',placeItems:'center',fontWeight:700,fontSize:10,color:'#cbd5e1'}}>자1</div>
        <strong style={{color:'#e2e8f0',fontSize:13,fontWeight:600}}>자유 1</strong>
      </div>
      <span style={{color:'#475569'}}>·</span>
      <span>자유전공학부 26학번 동기 운영 · 비공식 프로젝트</span>
      <span style={{color:'#475569'}}>·</span>
      <a href="#" style={{color:'inherit'}}>이용약관</a>
      <a href="#" style={{color:'inherit'}}>학식 데이터 출처</a>
      <a href="#" style={{color:'inherit'}}>기여하기</a>
      <a href="#" style={{color:'inherit'}}>GitHub</a>
      <div style={{marginLeft:'auto', fontSize:11, color:'#64748b'}}>© 2026 자유1 contributors</div>
    </footer>
  );
}

// ─── Page chrome wrapper ───────────────────────────────────────
function Screen({ children, active, showSearch, loggedIn = true, hideFooter }) {
  return (
    <div className="uos-screen">
      <TopBar active={active} showSearch={showSearch} loggedIn={loggedIn}/>
      <div style={{flex:'1 1 auto', overflow:'auto'}}>
        {children}
      </div>
      {!hideFooter && <Footer/>}
    </div>
  );
}




// 전역 노출
Object.assign(window, {
  Icon, Logo, TopBar, Footer, Screen,
});
