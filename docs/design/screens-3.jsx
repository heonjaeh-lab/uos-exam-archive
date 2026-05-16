/* screens-3.jsx — 검색 결과, 업로드, 마이페이지 (기능 최소) */

// ─── 검색 결과 ─────────────────────────────────────────────────
function ScreenSearch() {
  const results = [
    { type:'기말', y:'2024-2', course:'대학수학 Ⅰ', code:'MA1001', prof:'한태성',
      title:'대학수학 Ⅰ 2024-2학기 기말고사 (풀이 포함)',
      views:1247, dl:312, hasSol:true },
    { type:'중간', y:'2024-2', course:'대학수학 Ⅰ', code:'MA1001', prof:'한태성',
      title:'대학수학 Ⅰ 2024-2 중간고사',
      views:842, dl:201, hasSol:false },
    { type:'기말', y:'2024-1', course:'대학수학 Ⅰ', code:'MA1001', prof:'한태성',
      title:'대학수학 Ⅰ 2024-1 기말고사 + 학생 풀이',
      views:1521, dl:430, hasSol:true },
    { type:'기말', y:'2023-2', course:'대학수학 Ⅰ', code:'MA1001', prof:'한태성',
      title:'대학수학 Ⅰ 2023-2 기말고사',
      views:2104, dl:564, hasSol:true },
    { type:'중간', y:'2023-2', course:'대학수학 Ⅰ', code:'MA1001', prof:'한태성',
      title:'대학수학 Ⅰ 2023-2 중간고사',
      views:1832, dl:512, hasSol:false },
  ];

  return (
    <Screen active="archive">
      <section style={{background:'#fff', borderBottom:'1px solid var(--c-line)'}}>
        <div style={{maxWidth:1100, margin:'0 auto', padding:'18px 32px'}}>
          <div className="uos-search" style={{height:48, padding:'0 6px 0 16px'}}>
            <Icon.search cls="uos-icon--lg"/>
            <input style={{fontSize:16}} defaultValue="대학수학"/>
            <button className="uos-btn uos-btn--ghost" style={{width:32, padding:0}}>
              <Icon.x cls="uos-icon--sm"/>
            </button>
            <button className="uos-btn uos-btn--primary" style={{height:38, padding:'0 18px'}}>검색</button>
          </div>
        </div>
      </section>

      <div style={{maxWidth:1100, margin:'0 auto', padding:'20px 32px', display:'grid', gridTemplateColumns:'200px 1fr', gap:24}}>
        {/* Sidebar */}
        <aside style={{display:'flex', flexDirection:'column', gap:14}}>
          <div style={{fontSize:11.5, fontWeight:700, color:'var(--c-text-3)', letterSpacing:'0.08em'}}>유형</div>
          <div style={{display:'flex', flexDirection:'column', gap:2}}>
            {[
              {l:'전체', n:24, on:true},
              {l:'기말고사', n:9, on:false},
              {l:'중간고사', n:11, on:false},
              {l:'퀴즈', n:4, on:false},
            ].map((o,i)=>(
              <button key={i} style={{
                display:'flex', alignItems:'center', padding:'7px 10px',
                borderRadius:6, border:0, background: o.on?'var(--c-primary-50)':'transparent',
                color: o.on?'var(--c-primary-700)':'var(--c-text-2)',
                fontWeight: o.on?600:500,
                fontSize:13, textAlign:'left', cursor:'pointer',
              }}>
                <span style={{flex:1}}>{o.l}</span>
                <span className="uos-tabular" style={{fontSize:11, color: o.on?'var(--c-primary)':'var(--c-text-4)'}}>{o.n}</span>
              </button>
            ))}
          </div>
          <div style={{fontSize:11.5, fontWeight:700, color:'var(--c-text-3)', letterSpacing:'0.08em', marginTop:10}}>학년도</div>
          <div style={{display:'flex', flexDirection:'column', gap:6, fontSize:12.5, color:'var(--c-text-2)'}}>
            {[
              ['2024',12,true],['2023',7,true],['2022',3,false],['2021 이전',2,false],
            ].map(([l,n,on],i)=>(
              <label key={i} style={{display:'flex', alignItems:'center', gap:8}}>
                <input type="checkbox" defaultChecked={on} style={{accentColor:'var(--c-primary)'}}/>
                <span style={{flex:1}}>{l}</span>
                <span className="uos-tabular" style={{color:'var(--c-text-4)', fontSize:11}}>{n}</span>
              </label>
            ))}
          </div>
          <div style={{fontSize:11.5, fontWeight:700, color:'var(--c-text-3)', letterSpacing:'0.08em', marginTop:10}}>옵션</div>
          <div style={{display:'flex', flexDirection:'column', gap:6, fontSize:12.5, color:'var(--c-text-2)'}}>
            <label style={{display:'flex', alignItems:'center', gap:8}}>
              <input type="checkbox" defaultChecked style={{accentColor:'var(--c-primary)'}}/>
              풀이 포함만
            </label>
          </div>
        </aside>

        {/* Results */}
        <div style={{minWidth:0, display:'flex', flexDirection:'column', gap:12}}>
          <div style={{display:'flex', alignItems:'center', gap:8}}>
            <span style={{fontSize:13.5}}>
              <strong className="uos-tabular">24</strong>건 ·
              <strong style={{color:'var(--c-primary)', marginLeft:4}}>"대학수학"</strong>
            </span>
            <div style={{marginLeft:'auto'}}>
              <select className="uos-select" style={{height:32, fontSize:12.5, paddingLeft:10}}>
                <option>관련도 순</option>
                <option>최신순</option>
                <option>다운로드 순</option>
              </select>
            </div>
          </div>

          <div style={{display:'flex', flexDirection:'column', gap:10}}>
            {results.map((r,i)=>(
              <a key={i} href="#" className="uos-card" style={{
                padding:'14px 18px', textDecoration:'none', color:'var(--c-text)',
                display:'flex', gap:14,
              }}>
                <div className="uos-thumb" data-label="PDF" style={{width:72, height:92, flex:'0 0 72px', fontSize:10}}/>
                <div style={{flex:1, minWidth:0}}>
                  <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:6, flexWrap:'wrap'}}>
                    <span className={`uos-tag ${r.type==='기말'?'uos-tag--primary':'uos-tag--outline'}`}>{r.type}</span>
                    <span className="uos-tag uos-tag--outline" style={{fontFamily:'var(--ff-num)'}}>{r.code}</span>
                    <span className="uos-tag uos-tag--outline">{r.y}</span>
                    {r.hasSol && <span className="uos-tag uos-tag--success">풀이</span>}
                  </div>
                  <h3 style={{margin:0, fontSize:15, fontWeight:700, letterSpacing:'-0.01em', lineHeight:1.4}}>
                    {r.title}
                  </h3>
                  <div style={{fontSize:12.5, color:'var(--c-text-3)', marginTop:3}}>
                    {r.course} · {r.prof} 교수
                  </div>
                  <div style={{marginTop:8, display:'flex', alignItems:'center', gap:14, fontSize:11.5, color:'var(--c-text-3)'}}>
                    <span className="uos-tabular"><Icon.eye cls="uos-icon--sm"/> {r.views.toLocaleString()}</span>
                    <span className="uos-tabular"><Icon.download cls="uos-icon--sm"/> {r.dl.toLocaleString()}</span>
                  </div>
                </div>
                <div style={{flex:'0 0 auto', display:'flex', flexDirection:'column', justifyContent:'center', gap:6}}>
                  <button className="uos-btn uos-btn--sm uos-btn--primary"><Icon.download cls="uos-icon--sm"/> 받기</button>
                  <button className="uos-btn uos-btn--sm"><Icon.bookmark cls="uos-icon--sm"/> 저장</button>
                </div>
              </a>
            ))}
          </div>

          <div style={{display:'flex', alignItems:'center', justifyContent:'center', padding:'10px 0 4px'}}>
            <div className="uos-pagi">
              <button disabled><Icon.chevL cls="uos-icon--sm"/></button>
              <button aria-current="page">1</button>
              <button>2</button>
              <button>3</button>
              <button>4</button>
              <button>5</button>
              <button><Icon.chevR cls="uos-icon--sm"/></button>
            </div>
          </div>
        </div>
      </div>
    </Screen>
  );
}

// ─── 업로드 (단일 폼) ──────────────────────────────────────────
function ScreenUpload() {
  return (
    <Screen active="archive">
      <div style={{maxWidth:780, margin:'0 auto', padding:'28px 32px 40px'}}>
        <div className="uos-crumbs" style={{marginBottom:8}}>
          <a href="#">홈</a>
          <span className="uos-crumbs__sep">›</span>
          <a href="#">기출·자료</a>
          <span className="uos-crumbs__sep">›</span>
          <span className="uos-crumbs__current">업로드</span>
        </div>
        <h1 style={{margin:0, fontSize:24, fontWeight:700, letterSpacing:'-0.02em'}}>기출문제 업로드</h1>
        <p style={{margin:'4px 0 22px', fontSize:13.5, color:'var(--c-text-3)'}}>
          PDF · PNG · JPG (최대 20MB). 저작권에 문제 없는 자료만 업로드해주세요.
        </p>

        <div className="uos-card">
          <div style={{padding:24, display:'flex', flexDirection:'column', gap:18}}>
            {/* Dropzone */}
            <div style={{
              border:'2px dashed var(--c-primary)',
              background:'var(--c-primary-50)',
              borderRadius:10,
              padding:'28px 20px',
              display:'flex', flexDirection:'column', alignItems:'center', gap:8,
              textAlign:'center',
            }}>
              <div style={{width:44, height:44, borderRadius:'50%', background:'#fff', display:'grid', placeItems:'center', color:'var(--c-primary)'}}>
                <Icon.upload cls="uos-icon--lg"/>
              </div>
              <div style={{fontSize:14.5, fontWeight:600}}>파일을 드래그하거나 클릭해서 선택</div>
              <div style={{fontSize:12, color:'var(--c-text-3)'}}>PDF, PNG, JPG · 최대 20MB</div>
              <button className="uos-btn uos-btn--primary uos-btn--sm" style={{marginTop:4}}>파일 선택</button>
            </div>

            {/* Selected file */}
            <div style={{display:'flex', alignItems:'center', gap:12, padding:'12px 14px', border:'1px solid var(--c-line)', borderRadius:8}}>
              <div style={{width:32, height:40, background:'#fee', borderRadius:4, display:'grid', placeItems:'center', color:'#c92a2a', fontSize:9, fontWeight:700}}>PDF</div>
              <div style={{flex:1, minWidth:0}}>
                <div style={{fontSize:13.5, fontWeight:600}}>MA1001-2024-2-final.pdf</div>
                <div style={{fontSize:11.5, color:'var(--c-text-3)', marginTop:2}}>
                  <span className="uos-tabular">1.8 MB</span> · <span className="uos-tabular">6페이지</span>
                </div>
              </div>
              <button className="uos-btn uos-btn--ghost uos-btn--sm" style={{width:28, padding:0}}>
                <Icon.x cls="uos-icon--sm"/>
              </button>
            </div>

            <div style={{height:1, background:'var(--c-line)', margin:'4px 0'}}/>

            <div className="uos-field">
              <label className="uos-field__label">과목 <span className="req">*</span></label>
              <select className="uos-select">
                <option>대학수학 Ⅰ (MA1001)</option>
                <option>일반물리학 Ⅰ (PH1001)</option>
                <option>사고와 표현 (GE1101)</option>
                <option>한국사의 이해 (HI1003)</option>
              </select>
            </div>

            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:14}}>
              <div className="uos-field">
                <label className="uos-field__label">학년도 <span className="req">*</span></label>
                <select className="uos-select">
                  <option>2024</option>
                  <option>2023</option>
                  <option>2022</option>
                </select>
              </div>
              <div className="uos-field">
                <label className="uos-field__label">학기 <span className="req">*</span></label>
                <select className="uos-select">
                  <option>2학기</option>
                  <option>1학기</option>
                </select>
              </div>
              <div className="uos-field">
                <label className="uos-field__label">시험 유형 <span className="req">*</span></label>
                <select className="uos-select">
                  <option>기말고사</option>
                  <option>중간고사</option>
                  <option>퀴즈</option>
                </select>
              </div>
            </div>

            <div className="uos-field">
              <label className="uos-field__label">담당 교수</label>
              <input className="uos-input" defaultValue="한태성" placeholder="예: 한태성"/>
            </div>

            <div className="uos-field">
              <label className="uos-field__label">제목</label>
              <input className="uos-input" defaultValue="대학수학 Ⅰ 2024-2학기 기말고사 (풀이 포함)"/>
            </div>

            <div className="uos-field">
              <label style={{display:'flex', alignItems:'center', gap:8, fontSize:13, color:'var(--c-text-2)'}}>
                <input type="checkbox" defaultChecked style={{accentColor:'var(--c-primary)'}}/>
                풀이/해설이 포함되어 있어요
              </label>
            </div>

            <div style={{display:'flex', gap:8, justifyContent:'flex-end', paddingTop:6}}>
              <button className="uos-btn">취소</button>
              <button className="uos-btn uos-btn--primary">업로드</button>
            </div>
          </div>
        </div>
      </div>
    </Screen>
  );
}

// ─── 마이페이지 (단순) ─────────────────────────────────────────
function ScreenMyPage() {
  return (
    <Screen active="home">
      <section style={{background:'#fff', borderBottom:'1px solid var(--c-line)'}}>
        <div style={{maxWidth:1100, margin:'0 auto', padding:'28px 32px 0'}}>
          <div className="uos-crumbs" style={{marginBottom:14}}>
            <a href="#">홈</a>
            <span className="uos-crumbs__sep">›</span>
            <span className="uos-crumbs__current">마이페이지</span>
          </div>
          <div style={{display:'flex', alignItems:'center', gap:20}}>
            <div className="uos-avatar uos-avatar--lg" style={{width:64, height:64, fontSize:20}}>정현</div>
            <div style={{flex:1}}>
              <h1 style={{margin:0, fontSize:22, fontWeight:700, letterSpacing:'-0.02em'}}>정현재</h1>
              <div style={{marginTop:4, fontSize:13, color:'var(--c-text-3)'}}>
                자유전공학부 · 26학번 · 가입 2026.03
              </div>
            </div>
            <button className="uos-btn"><Icon.user cls="uos-icon--sm"/> 프로필 설정</button>
          </div>

          <div style={{marginTop:22, display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12}}>
            {[
              {n:'4',  l:'올린 자료'},
              {n:'12', l:'북마크'},
              {n:'28', l:'다운로드'},
            ].map((s,i)=>(
              <div key={i} style={{background:'var(--c-bg-soft)', borderRadius:10, padding:'14px 16px'}}>
                <div style={{fontSize:11.5, color:'var(--c-text-3)', fontWeight:500}}>{s.l}</div>
                <div style={{fontSize:24, fontWeight:700, letterSpacing:'-0.02em', marginTop:2}} className="uos-tabular">{s.n}</div>
              </div>
            ))}
          </div>

          <div style={{marginTop:22, display:'flex', borderBottom:'1px solid var(--c-line)'}}>
            {[
              {l:'내 업로드', n:4, on:true},
              {l:'북마크', n:12},
              {l:'다운로드 기록', n:28},
              {l:'설정'},
            ].map((t,i)=>(
              <button key={i} style={{
                padding:'12px 18px', border:0, background:'transparent',
                color: t.on?'var(--c-text)':'var(--c-text-3)',
                fontWeight: t.on?700:500, fontSize:13.5,
                borderBottom: t.on?'2px solid var(--c-primary)':'2px solid transparent',
                marginBottom:-1, display:'inline-flex', alignItems:'center', gap:6,
              }}>{t.l} {t.n!==undefined && <span style={{color:t.on?'var(--c-primary)':'var(--c-text-4)', fontSize:11}} className="uos-tabular">{t.n}</span>}</button>
            ))}
          </div>
        </div>
      </section>

      <main style={{maxWidth:1100, margin:'0 auto', padding:'24px 32px'}}>
        <section className="uos-card">
          <div className="uos-list">
            {[
              {t:'대학수학 Ⅰ 2024-2 기말고사 (풀이 포함)', stat:'live',   v:142, dl:36, when:'어제'},
              {t:'사고와 표현 — 글쓰기 평가 기준 정리',     stat:'live',   v:67,  dl:14, when:'1주 전'},
              {t:'한국사의 이해 2024-1 중간',                stat:'review', v:0,   dl:0,  when:'어제'},
              {t:'정치학 원론 2023-2 기말',                  stat:'live',   v:88,  dl:21, when:'3주 전'},
            ].map((r,i)=>(
              <div key={i} className="uos-list__row" style={{gridTemplateColumns:'1fr 80px 90px 80px 60px'}}>
                <div style={{minWidth:0}}>
                  <div style={{fontSize:13.5, fontWeight:600, color:'var(--c-text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{r.t}</div>
                  <div style={{fontSize:11.5, color:'var(--c-text-3)', marginTop:2}}>{r.when}</div>
                </div>
                <span className={`uos-tag uos-tag--dot ${r.stat==='live'?'uos-tag--success':'uos-tag--warning'}`} style={{justifyContent:'center'}}>
                  {r.stat==='live'?'공개':'검토중'}
                </span>
                <span className="uos-tabular" style={{color:'var(--c-text-3)', fontSize:12, display:'flex', alignItems:'center', justifyContent:'flex-end', gap:4}}>
                  <Icon.eye cls="uos-icon--sm"/> {r.v.toLocaleString()}
                </span>
                <span className="uos-tabular" style={{color:'var(--c-text-3)', fontSize:12, display:'flex', alignItems:'center', justifyContent:'flex-end', gap:4}}>
                  <Icon.download cls="uos-icon--sm"/> {r.dl}
                </span>
                <button className="uos-btn uos-btn--ghost uos-btn--sm" style={{justifySelf:'end'}}>관리</button>
              </div>
            ))}
          </div>
        </section>
      </main>
    </Screen>
  );
}

Object.assign(window, { ScreenSearch, ScreenUpload, ScreenMyPage });
