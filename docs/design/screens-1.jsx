/* screens-1.jsx — 로그인, 홈 (자유전공학부 1학년 맥락) */

// ─── 로그인 ────────────────────────────────────────────────────
function ScreenLogin() {
  return (
    <div className="uos-screen" style={{background:'var(--c-bg-soft)'}}>
      <header className="uos-topbar" style={{borderBottom:'1px solid var(--c-line)'}}>
        <div className="uos-topbar__main" style={{height:60}}>
          <Logo/>
          <div style={{marginLeft:'auto', display:'flex', gap:8, alignItems:'center', fontSize:12.5, color:'var(--c-text-3)'}}>
            도움이 필요하신가요?
            <a href="#" style={{color:'var(--c-primary)', textDecoration:'none', fontWeight:500}}>FAQ</a>
          </div>
        </div>
      </header>

      <div style={{flex:'1 1 auto', display:'grid', gridTemplateColumns:'1fr 1fr', overflow:'hidden'}}>
        {/* 좌측: 브랜드 패널 */}
        <div style={{
          background:'linear-gradient(160deg, var(--c-primary-700) 0%, var(--c-primary) 65%, var(--c-primary-600) 100%)',
          color:'#fff',
          padding:'56px 56px',
          display:'flex',
          flexDirection:'column',
          position:'relative',
          overflow:'hidden',
        }}>
          <div style={{position:'absolute', right:-80, top:-80, width:360, height:360, borderRadius:'50%', background:'rgba(255,255,255,0.06)'}}/>
          <div style={{position:'absolute', right:60, bottom:-120, width:240, height:240, borderRadius:'50%', background:'rgba(255,255,255,0.05)'}}/>

          <div style={{fontSize:12.5, letterSpacing:'0.18em', opacity:0.85, fontWeight:500}}>UOS · FREE MAJOR · CLASS OF 2026</div>
          <h1 style={{margin:'18px 0 16px', fontSize:38, fontWeight:700, letterSpacing:'-0.025em', lineHeight:1.2}}>
            오늘의 수업,<br/>오늘의 학식,<br/>그리고 시험 자료까지.
          </h1>
          <p style={{margin:0, fontSize:15, opacity:0.85, lineHeight:1.65, maxWidth:380}}>
            시립대 자유전공학부 1학년 26학번만 모인 학기 허브.<br/>
            시간표·학식·기출자료를 한 자리에서.
          </p>

          <div style={{marginTop:'auto', display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, position:'relative'}}>
            {[
              {n:'128', l:'26학번 자전 동기'},
              {n:'62',  l:'1학년 추천 과목'},
              {n:'341', l:'올라온 기출 자료'},
            ].map((s,i)=>(
              <div key={i} style={{background:'rgba(255,255,255,0.08)', borderRadius:10, padding:'14px 16px', backdropFilter:'blur(4px)'}}>
                <div style={{fontSize:24, fontWeight:700, letterSpacing:'-0.02em'}} className="uos-tabular">{s.n}</div>
                <div style={{fontSize:11.5, opacity:0.8, marginTop:2}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 우측: 로그인 폼 */}
        <div style={{display:'grid', placeItems:'center', padding:32}}>
          <div style={{width:'100%', maxWidth:380}}>
            <div style={{marginBottom:28}}>
              <div style={{fontSize:12, color:'var(--c-text-3)', fontWeight:500, letterSpacing:'0.04em'}}>LOG IN</div>
              <h2 style={{margin:'6px 0 8px', fontSize:26, fontWeight:700, letterSpacing:'-0.02em'}}>다시 만나서 반가워요</h2>
              <div style={{fontSize:13.5, color:'var(--c-text-3)'}}>UOS 포털 계정으로 로그인하세요. 26학번 자전만 접속할 수 있어요.</div>
            </div>

            <div style={{display:'flex', flexDirection:'column', gap:14}}>
              <div className="uos-field">
                <label className="uos-field__label">학번 (UOS ID) <span className="req">*</span></label>
                <input className="uos-input" placeholder="2026XXXX" defaultValue="20261234"/>
              </div>
              <div className="uos-field">
                <label className="uos-field__label">비밀번호 <span className="req">*</span></label>
                <input className="uos-input" type="password" placeholder="••••••••" defaultValue="••••••••••"/>
              </div>

              <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', fontSize:12.5, marginTop:2}}>
                <label style={{display:'flex', alignItems:'center', gap:6, color:'var(--c-text-2)'}}>
                  <input type="checkbox" defaultChecked style={{accentColor:'var(--c-primary)'}}/>
                  학번 기억하기
                </label>
                <a href="#" style={{color:'var(--c-primary)', textDecoration:'none', fontWeight:500}}>비밀번호 재발급</a>
              </div>

              <button className="uos-btn uos-btn--primary uos-btn--lg" style={{marginTop:6}}>
                로그인
              </button>

              <div style={{display:'flex', alignItems:'center', gap:12, margin:'14px 0', color:'var(--c-text-4)', fontSize:12}}>
                <div style={{flex:1, height:1, background:'var(--c-line)'}}/>
                또는
                <div style={{flex:1, height:1, background:'var(--c-line)'}}/>
              </div>

              <button className="uos-btn uos-btn--lg" style={{justifyContent:'flex-start', paddingLeft:14}}>
                <Icon.globe/>
                <span>UOS 포털 SSO로 연결</span>
              </button>

              <div style={{fontSize:12, color:'var(--c-text-3)', marginTop:20, lineHeight:1.6, padding:'12px 14px', background:'var(--c-primary-50)', borderRadius:8, borderLeft:'3px solid var(--c-primary)'}}>
                <strong style={{color:'var(--c-primary-700)'}}>접근 권한</strong> · 자유전공학부 26학번 학생만 로그인할 수 있어요. 학과 인증 정보는 포털 SSO에서 확인합니다.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── 홈/메인 ───────────────────────────────────────────────────
function ScreenHome() {
  const today = '5월 16일 (금)';
  return (
    <Screen active="home">
      {/* Hero */}
      <section style={{
        background:'linear-gradient(180deg, #fff 0%, var(--c-primary-50) 100%)',
        borderBottom:'1px solid var(--c-line)',
      }}>
        <div style={{maxWidth:1200, margin:'0 auto', padding:'36px 32px 32px'}}>
          <div style={{display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:32}}>
            <div>
              <div style={{display:'inline-flex', alignItems:'center', gap:6, padding:'4px 10px', background:'rgba(28,126,214,0.1)', color:'var(--c-primary-700)', borderRadius:20, fontSize:11.5, fontWeight:600, letterSpacing:'0.04em', marginBottom:12}}>
                2025-1학기 · 12주차 · 중간고사 기간
              </div>
              <h1 style={{margin:0, fontSize:30, fontWeight:700, letterSpacing:'-0.025em', lineHeight:1.25}}>
                자유전공학부 1학년의<br/>
                시간표·학식·기출을 <span style={{color:'var(--c-primary)'}}>한 자리에</span>.
              </h1>
              <p style={{margin:'10px 0 0', fontSize:14, color:'var(--c-text-2)', maxWidth:520}}>
                26학번 자전이 같이 쓰는 학기 허브.
              </p>
            </div>
            <div style={{display:'flex', gap:10, paddingBottom:6}}>
              <button className="uos-btn uos-btn--lg uos-btn--primary">
                <Icon.cal/> 내 시간표
              </button>
              <button className="uos-btn uos-btn--lg">
                <Icon.upload/> 자료 올리기
              </button>
            </div>
          </div>

          {/* 빠른 검색 */}
          <div style={{
            marginTop:22,
            display:'flex',
            alignItems:'center',
            background:'#fff',
            borderRadius:12,
            boxShadow:'0 6px 24px rgba(28,126,214,0.10), 0 1px 2px rgba(15,23,42,.04)',
            border:'1px solid var(--c-line)',
            padding:'6px',
          }}>
            <select className="uos-select" style={{height:48, border:0, boxShadow:'none', minWidth:140, fontWeight:500}}>
              <option>전체</option>
              <option>과목</option>
              <option>기출 자료</option>
              <option>학식 메뉴</option>
            </select>
            <div style={{width:1, height:24, background:'var(--c-line)'}}/>
            <div style={{flex:1, display:'flex', alignItems:'center', gap:10, padding:'0 16px'}}>
              <Icon.search cls="uos-icon--lg"/>
              <input
                style={{flex:1, border:0, outline:0, font:'inherit', fontSize:16, padding:'14px 0'}}
                placeholder="예: 대학수학 중간 · 사고와 표현 박정원 · 오늘 학생회관"
              />
              <div style={{display:'flex', gap:6}}>
                {['대학수학','일반물리','사고와 표현','오늘 학식'].map(s=>(
                  <span key={s} className="uos-tag" style={{cursor:'pointer'}}>#{s}</span>
                ))}
              </div>
            </div>
            <button className="uos-btn uos-btn--primary" style={{height:48, padding:'0 24px', fontSize:15, fontWeight:600}}>
              검색
            </button>
          </div>
        </div>
      </section>

      {/* 본문 */}
      <main style={{maxWidth:1200, margin:'0 auto', padding:'28px 32px 36px', display:'grid', gridTemplateColumns:'1fr 320px', gap:24}}>
        <div style={{display:'flex', flexDirection:'column', gap:22, minWidth:0}}>

          {/* Today row — 시간표 미리보기 + 학식 미리보기 */}
          <section style={{display:'grid', gridTemplateColumns:'1.3fr 1fr', gap:16}}>
            {/* 오늘의 시간표 */}
            <div className="uos-card" style={{display:'flex', flexDirection:'column'}}>
              <div className="uos-card__hd">
                <Icon.cal cls="uos-icon--sm"/>
                <h3>오늘의 수업</h3>
                <span className="uos-muted" style={{fontSize:12}}>{today}</span>
                <a href="#" className="more">전체 시간표 <Icon.chevR cls="uos-icon--sm"/></a>
              </div>
              <div className="uos-card__bd" style={{padding:'14px 16px 18px', display:'flex', flexDirection:'column', gap:8}}>
                {[
                  { time:'09:00 — 11:00', name:'대학영어 Ⅰ',    place:'법학관 207', prof:'J. Miller', color:'#0ca678', status:'next', dday:'10분 후' },
                  { time:'13:00 — 14:30', name:'일반물리학 Ⅰ',  place:'자연과학관 311', prof:'서민호',    color:'#e8590c', status:'later' },
                  { time:'15:00 — 16:30', name:'정치학 원론',    place:'인문학관 504', prof:'안주영',    color:'#c2255c', status:'later' },
                ].map((c,i)=>(
                  <div key={i} style={{
                    display:'grid', gridTemplateColumns:'92px 1fr auto', alignItems:'center', gap:14,
                    padding:'12px 14px',
                    background: c.status==='next' ? 'var(--c-primary-50)' : 'var(--c-bg-soft)',
                    border: c.status==='next' ? '1px solid var(--c-primary-100)' : '1px solid transparent',
                    borderLeft: `4px solid ${c.color}`,
                    borderRadius:8,
                  }}>
                    <div style={{lineHeight:1.3}}>
                      <div style={{fontSize:13, fontWeight:700, color:'var(--c-text)'}} className="uos-tabular">{c.time.split(' — ')[0]}</div>
                      <div style={{fontSize:11, color:'var(--c-text-3)'}} className="uos-tabular">— {c.time.split(' — ')[1]}</div>
                    </div>
                    <div style={{minWidth:0}}>
                      <div style={{fontSize:14, fontWeight:600, letterSpacing:'-0.01em'}}>{c.name}</div>
                      <div style={{fontSize:12, color:'var(--c-text-3)', marginTop:2}}>{c.prof} · {c.place}</div>
                    </div>
                    {c.status==='next' ? (
                      <span className="uos-tag uos-tag--primary uos-tabular">▶ {c.dday}</span>
                    ) : (
                      <span style={{fontSize:11, color:'var(--c-text-4)'}}>예정</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 오늘의 학식 */}
            <div className="uos-card">
              <div className="uos-card__hd">
                <Icon.fire cls="uos-icon--sm"/>
                <h3>오늘의 학식</h3>
                <a href="#" className="more">전체 식당 <Icon.chevR cls="uos-icon--sm"/></a>
              </div>
              <div className="uos-card__bd" style={{padding:'14px 16px 14px', display:'flex', flexDirection:'column', gap:10}}>
                <div style={{padding:'12px 14px', background:'var(--c-primary-50)', border:'1px solid var(--c-primary-100)', borderRadius:8}}>
                  <div style={{display:'flex', alignItems:'center', gap:6, fontSize:12, color:'var(--c-primary-700)', fontWeight:600}}>
                    학생회관 <span className="uos-tag uos-tag--primary">1순위</span> <span style={{marginLeft:'auto', color:'var(--c-text-3)', fontWeight:500}} className="uos-tabular">5,000원</span>
                  </div>
                  <div style={{fontSize:13.5, fontWeight:600, marginTop:4}}>김치제육볶음 · 계란찜</div>
                  <div style={{fontSize:11.5, color:'var(--c-text-3)', marginTop:2}}>+ 시금치무침 · 콩나물국 · 쌀밥/김치</div>
                  <div style={{display:'flex', alignItems:'center', gap:6, marginTop:8, fontSize:11.5}}>
                    <span style={{color:'#e8590c', fontWeight:600}}>★ 4.7</span>
                    <span className="uos-muted">· 32명이 좋아요</span>
                    <button className="uos-btn uos-btn--sm" style={{marginLeft:'auto', height:24, padding:'0 8px', fontSize:11}}>
                      <Icon.heart cls="uos-icon--sm"/> 추천
                    </button>
                  </div>
                </div>
                <div style={{display:'flex', flexDirection:'column', gap:8}}>
                  {[
                    { n:'인문학관 식당', m:'순두부찌개', p:'4,500원', r:'★ 4.1' },
                    { n:'공학관 식당',   m:'스파게티 미트소스', p:'5,500원', r:'★ 4.3' },
                  ].map((c,i)=>(
                    <div key={i} style={{display:'flex', alignItems:'center', gap:10, padding:'8px 12px', border:'1px solid var(--c-line)', borderRadius:8}}>
                      <div style={{flex:1, minWidth:0}}>
                        <div style={{fontSize:12, fontWeight:600}}>{c.n}</div>
                        <div style={{fontSize:11.5, color:'var(--c-text-3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{c.m}</div>
                      </div>
                      <span style={{fontSize:11.5, color:'#e8590c', fontWeight:600}}>{c.r}</span>
                      <span className="uos-tabular" style={{fontSize:11.5, color:'var(--c-text-3)'}}>{c.p}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 1학년 추천 영역 — 교양영역별 */}
          <section className="uos-card">
            <div className="uos-card__hd">
              <h3>1학년이 많이 듣는 교양 영역</h3>
              <span className="uos-muted" style={{fontSize:12.5}}>자유전공 졸업 요건과 함께</span>
              <a href="#" className="more">졸업 요건 가이드 <Icon.chevR cls="uos-icon--sm"/></a>
            </div>
            <div className="uos-card__bd" style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:10}}>
              {areas.map(a=>{
                const Ic = a.icon;
                return (
                  <a key={a.id} href="#" style={{
                    display:'flex', alignItems:'center', gap:12, padding:'14px 14px',
                    border:'1px solid var(--c-line)', borderRadius:10,
                    background: a.featured ? `color-mix(in oklab, ${a.tone} 5%, white)` : '#fff',
                    textDecoration:'none', color:'var(--c-text)',
                    position:'relative',
                  }}>
                    {a.featured && (
                      <span style={{position:'absolute', top:8, right:8, fontSize:10, color:a.tone, fontWeight:700, letterSpacing:'0.04em'}}>1학년 추천</span>
                    )}
                    <div style={{
                      width:38, height:38, borderRadius:8,
                      background:`color-mix(in oklab, ${a.tone} 12%, white)`,
                      color: a.tone,
                      display:'grid', placeItems:'center',
                    }}>
                      <Ic/>
                    </div>
                    <div style={{minWidth:0}}>
                      <div style={{fontSize:13.5, fontWeight:600, letterSpacing:'-0.01em'}}>{a.name}</div>
                      <div style={{fontSize:11.5, color:'var(--c-text-3)', marginTop:1}} className="uos-tabular">{a.courses}개 과목</div>
                    </div>
                  </a>
                );
              })}
            </div>
          </section>

          {/* 최근 업로드 */}
          <section className="uos-card">
            <div className="uos-card__hd">
              <h3>최근 올라온 기출 자료</h3>
              <span className="uos-tag uos-tag--success uos-tag--dot">실시간</span>
              <a href="#" className="more">더보기 <Icon.chevR cls="uos-icon--sm"/></a>
            </div>
            <div className="uos-list">
              {recentUploads.map((r,i)=>(
                <div key={r.id} className="uos-list__row" style={{gridTemplateColumns:'24px 1fr auto auto auto'}}>
                  <span className="idx">{i+1}</span>
                  <div style={{minWidth:0}}>
                    <div style={{display:'flex', alignItems:'center', gap:8}}>
                      <span className={`uos-tag ${r.type==='기말'?'uos-tag--primary':r.type==='퀴즈'?'uos-tag--warning':r.type==='기말예상'?'uos-tag--outline':''}`}>{r.type}</span>
                      <span className="title" style={{fontSize:13.5}}>{r.title}</span>
                      {r.hasSol && <span className="uos-tag uos-tag--success">풀이</span>}
                    </div>
                    <div className="meta" style={{marginTop:3, display:'flex', gap:10}}>
                      <span>{r.course} · {r.prof}</span>
                      <span>·</span>
                      <span>{r.uploader}</span>
                    </div>
                  </div>
                  <span className="uos-tabular" style={{color:'var(--c-text-3)', fontSize:12, display:'flex', alignItems:'center', gap:4}}>
                    <Icon.eye cls="uos-icon--sm"/>{r.views}
                  </span>
                  <span className="uos-tabular" style={{color:'var(--c-text-3)', fontSize:12, display:'flex', alignItems:'center', gap:4}}>
                    <Icon.bookmark cls="uos-icon--sm"/>{r.bookmarks}
                  </span>
                  <span style={{color:'var(--c-text-4)', fontSize:12, minWidth:60, textAlign:'right'}}>{r.when}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 1학년 인기 과목 */}
          <section className="uos-card">
            <div className="uos-card__hd">
              <h3>이번 주 1학년 인기 과목</h3>
              <Icon.fire cls="uos-icon--sm" />
              <a href="#" className="more">전체 랭킹 <Icon.chevR cls="uos-icon--sm"/></a>
            </div>
            <div className="uos-card__bd" style={{padding:0}}>
              <table style={{width:'100%', borderCollapse:'collapse', fontSize:13}}>
                <thead>
                  <tr style={{background:'var(--c-bg-soft)', color:'var(--c-text-3)', fontSize:11.5, letterSpacing:'0.04em', fontWeight:600}}>
                    <th style={{padding:'10px 16px', textAlign:'left', width:36}}>#</th>
                    <th style={{padding:'10px 8px', textAlign:'left'}}>과목</th>
                    <th style={{padding:'10px 8px', textAlign:'left'}}>영역</th>
                    <th style={{padding:'10px 8px', textAlign:'left'}}>담당</th>
                    <th style={{padding:'10px 8px', textAlign:'right'}}>자료</th>
                    <th style={{padding:'10px 16px 10px 8px', textAlign:'right', width:80}}>증감</th>
                  </tr>
                </thead>
                <tbody>
                  {popularCourses.map((c,i)=>(
                    <tr key={c.id} style={{borderTop:'1px solid var(--c-line)'}}>
                      <td style={{padding:'12px 16px', color:i<3?'var(--c-primary)':'var(--c-text-4)', fontWeight:700}} className="uos-tabular">{i+1}</td>
                      <td style={{padding:'12px 8px'}}>
                        <div style={{display:'flex', alignItems:'center', gap:8}}>
                          <span className="uos-tag uos-tag--outline" style={{fontFamily:'var(--ff-num)'}}>{c.code}</span>
                          <span style={{fontWeight:600}}>{c.name}</span>
                        </div>
                      </td>
                      <td style={{padding:'12px 8px', color:'var(--c-text-3)'}}>{c.area}</td>
                      <td style={{padding:'12px 8px', color:'var(--c-text-2)'}}>{c.prof}</td>
                      <td style={{padding:'12px 8px', textAlign:'right'}} className="uos-tabular">{c.count}</td>
                      <td style={{padding:'12px 16px 12px 8px', textAlign:'right'}} className="uos-tabular">
                        <span style={{color:c.trend>=0?'var(--c-success)':'var(--c-danger)', fontWeight:600, fontSize:12}}>
                          {c.trend>=0?'▲':'▼'} {Math.abs(c.trend)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* 사이드 */}
        <aside style={{display:'flex', flexDirection:'column', gap:18, minWidth:0}}>
          {/* 내 정보 카드 */}
          <section className="uos-card" style={{background:'linear-gradient(180deg, #fff 0%, var(--c-bg-soft) 100%)'}}>
            <div className="uos-card__bd">
              <div style={{display:'flex', alignItems:'center', gap:12}}>
                <div className="uos-avatar uos-avatar--lg">정현</div>
                <div style={{minWidth:0}}>
                  <div style={{fontSize:15, fontWeight:700}}>정현재 <span style={{color:'var(--c-text-3)', fontWeight:500, fontSize:12, marginLeft:4}}>26학번</span></div>
                  <div style={{fontSize:12, color:'var(--c-text-3)'}}>자유전공학부 · Lv.2 학기 동행자</div>
                </div>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginTop:16}}>
                {[
                  {n:'17', l:'수강 학점'},
                  {n:'4', l:'올린 자료'},
                  {n:'12', l:'북마크'},
                ].map((s,i)=>(
                  <div key={i} style={{background:'#fff', border:'1px solid var(--c-line)', borderRadius:8, padding:'10px 8px', textAlign:'center'}}>
                    <div style={{fontSize:18, fontWeight:700}} className="uos-tabular">{s.n}</div>
                    <div style={{fontSize:11, color:'var(--c-text-3)', marginTop:1}}>{s.l}</div>
                  </div>
                ))}
              </div>
              <button className="uos-btn" style={{width:'100%', marginTop:12}}>
                마이페이지 <Icon.chevR cls="uos-icon--sm"/>
              </button>
            </div>
          </section>

          {/* 공지 */}
          <section className="uos-card">
            <div className="uos-card__hd" style={{padding:'14px 18px'}}>
              <h3 style={{fontSize:14}}>자전 1학년 공지</h3>
              <a href="#" className="more">+</a>
            </div>
            <div style={{padding:'4px 0 8px'}}>
              {notices.map((n,i)=>(
                <a key={i} href="#" style={{display:'flex', alignItems:'center', gap:8, padding:'10px 18px', textDecoration:'none', color:'var(--c-text)', fontSize:13}}>
                  <span className={`uos-tag uos-tag--${n.tagType}`} style={{minWidth:48, justifyContent:'center'}}>{n.tag}</span>
                  <span style={{flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{n.title}</span>
                  <span style={{color:'var(--c-text-4)', fontSize:11.5}} className="uos-tabular">{n.date}</span>
                </a>
              ))}
            </div>
          </section>

          {/* 다가오는 시험 */}
          <section className="uos-card">
            <div className="uos-card__hd" style={{padding:'14px 18px'}}>
              <h3 style={{fontSize:14}}>내 다음 시험</h3>
              <Icon.cal cls="uos-icon--sm" />
            </div>
            <div className="uos-card__bd" style={{paddingTop:4}}>
              {[
                {d:'05.19', wd:'월', name:'대학수학 Ⅰ',  type:'중간', dday:'D-3'},
                {d:'05.21', wd:'수', name:'사고와 표현',   type:'중간', dday:'D-5'},
                {d:'05.23', wd:'금', name:'일반물리학 Ⅰ', type:'중간', dday:'D-7'},
                {d:'05.26', wd:'월', name:'한국사의 이해', type:'중간', dday:'D-10'},
              ].map((e,i)=>(
                <div key={i} style={{display:'flex', alignItems:'center', gap:12, padding:'10px 0', borderBottom: i<3?'1px solid var(--c-line)':'0'}}>
                  <div style={{width:42, textAlign:'center', padding:'2px 0', background:'var(--c-bg-soft)', borderRadius:6}}>
                    <div style={{fontSize:13, fontWeight:700}} className="uos-tabular">{e.d}</div>
                    <div style={{fontSize:10, color:'var(--c-text-3)'}}>{e.wd}</div>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:13, fontWeight:600}}>{e.name}</div>
                    <div style={{fontSize:11.5, color:'var(--c-text-3)'}}>{e.type}</div>
                  </div>
                  <span className="uos-tag uos-tag--primary uos-tabular">{e.dday}</span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </main>
    </Screen>
  );
}

Object.assign(window, { ScreenLogin, ScreenHome });
