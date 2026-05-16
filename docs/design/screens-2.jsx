/* screens-2.jsx — 과목 목록, 기출문제 상세 (기능 최소) */

// ─── 과목 목록 ─────────────────────────────────────────────────
function ScreenCourseList() {
  const courses = [
    { code:'GE1101', name:'사고와 표현',         prof:'박정원',   area:'언어와 표현',   count:14, latest:'2024-2' },
    { code:'GE1102', name:'사고와 표현 (심화)',  prof:'김수정',   area:'언어와 표현',   count:8,  latest:'2024-2' },
    { code:'EN1101', name:'대학영어 입문',        prof:'J. Miller', area:'언어와 표현',   count:9,  latest:'2024-2' },
    { code:'EN1102', name:'대학영어 Ⅰ',          prof:'J. Miller', area:'언어와 표현',   count:11, latest:'2024-2' },
    { code:'EN1103', name:'대학영어 Ⅱ',          prof:'S. Cho',    area:'언어와 표현',   count:7,  latest:'2024-1' },
    { code:'MA1001', name:'대학수학 Ⅰ',          prof:'한태성 외', area:'자연과 기술',   count:24, latest:'2024-2' },
    { code:'MA1002', name:'대학수학 Ⅱ',          prof:'한태성 외', area:'자연과 기술',   count:18, latest:'2024-2' },
    { code:'PH1001', name:'일반물리학 Ⅰ',        prof:'서민호',    area:'자연과 기술',   count:16, latest:'2024-2' },
    { code:'PH1002', name:'일반물리학 Ⅱ',        prof:'서민호',    area:'자연과 기술',   count:9,  latest:'2024-1' },
    { code:'CH1001', name:'일반화학 Ⅰ',          prof:'정유나',    area:'자연과 기술',   count:12, latest:'2024-2' },
    { code:'HI1003', name:'한국사의 이해',        prof:'장민호',    area:'사상과 역사',   count:13, latest:'2024-2' },
    { code:'PS1002', name:'정치학 원론',          prof:'안주영',    area:'사회와 문화',   count:9,  latest:'2024-2' },
    { code:'EC1001', name:'경제학 입문',          prof:'최영준',    area:'사회와 문화',   count:11, latest:'2024-2' },
    { code:'PY1001', name:'심리학의 이해',        prof:'박지혜',    area:'사회와 문화',   count:10, latest:'2024-2' },
    { code:'FM1001', name:'자유전공 세미나 Ⅰ',   prof:'정유나 외', area:'자유전공 핵심', count:5,  latest:'2024-2' },
  ];

  const areaNames = ['전체','자유전공 핵심','언어와 표현','자연과 기술','사상과 역사','사회와 문화','인간과 환경','예술과 스포츠'];
  const [sel, setSel] = React.useState('전체');

  return (
    <Screen active="archive">
      <section style={{borderBottom:'1px solid var(--c-line)', background:'#fff'}}>
        <div style={{maxWidth:1280, margin:'0 auto', padding:'20px 32px 0'}}>
          <div className="uos-crumbs" style={{marginBottom:10}}>
            <a href="#">홈</a>
            <span className="uos-crumbs__sep">›</span>
            <span className="uos-crumbs__current">기출·자료</span>
          </div>
          <div style={{display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:16}}>
            <div>
              <h1 style={{margin:0, fontSize:24, fontWeight:700, letterSpacing:'-0.02em'}}>1학년 과목 목록</h1>
              <div style={{marginTop:6, fontSize:13, color:'var(--c-text-3)'}}>
                자유전공학부 1학년이 듣는 교양·기초 과목 <strong style={{color:'var(--c-text)'}} className="uos-tabular">62</strong>개
              </div>
            </div>
            <div className="uos-search" style={{width:320}}>
              <Icon.search/>
              <input placeholder="과목명, 교수, 과목코드"/>
            </div>
          </div>

          {/* 영역 탭 */}
          <div style={{display:'flex', gap:4, marginTop:18, overflow:'auto'}}>
            {areaNames.map(t=>(
              <button key={t} onClick={()=>setSel(t)} style={{
                padding:'8px 14px',
                fontSize:13,
                fontWeight: sel===t?700:500,
                color: sel===t?'#fff':'var(--c-text-2)',
                background: sel===t?'var(--c-primary)':'var(--c-bg-soft)',
                border:0, borderRadius:20,
                whiteSpace:'nowrap', cursor:'pointer',
              }}>{t}</button>
            ))}
          </div>
        </div>
      </section>

      <div style={{maxWidth:1280, margin:'0 auto', padding:'20px 32px', display:'flex', flexDirection:'column', gap:14}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
          <div style={{fontSize:13, color:'var(--c-text-3)'}}>
            <strong style={{color:'var(--c-text)'}} className="uos-tabular">{sel==='전체'?courses.length:courses.filter(c=>c.area===sel).length}</strong>개 과목
          </div>
          <div style={{display:'flex', alignItems:'center', gap:8}}>
            <select className="uos-select" style={{height:32, fontSize:12.5, paddingLeft:10}}>
              <option>자료 많은 순</option>
              <option>가나다순</option>
              <option>최근 업로드 순</option>
            </select>
          </div>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:12}}>
          {(sel==='전체' ? courses : courses.filter(c=>c.area===sel)).map(c=>(
            <a key={c.code} href="#" className="uos-card" style={{
              padding:'16px 18px', textDecoration:'none', color:'var(--c-text)',
              display:'flex', flexDirection:'column', gap:8,
            }}>
              <div style={{display:'flex', alignItems:'center', gap:6, flexWrap:'wrap'}}>
                <span className="uos-tag uos-tag--outline" style={{fontFamily:'var(--ff-num)'}}>{c.code}</span>
                <span className="uos-tag">{c.area}</span>
              </div>
              <div>
                <div style={{fontSize:16, fontWeight:700, letterSpacing:'-0.02em'}}>{c.name}</div>
                <div style={{fontSize:12.5, color:'var(--c-text-3)', marginTop:2}}>{c.prof} 교수</div>
              </div>
              <div style={{marginTop:6, display:'flex', alignItems:'baseline', gap:6}}>
                <span style={{fontSize:13, fontWeight:600, color:'var(--c-primary)'}} className="uos-tabular">
                  {c.count}개 자료
                </span>
                <span style={{fontSize:11.5, color:'var(--c-text-4)'}}>· 최근 {c.latest}</span>
              </div>
            </a>
          ))}
        </div>

        <div style={{display:'flex', alignItems:'center', justifyContent:'center', padding:'8px 0'}}>
          <div className="uos-pagi">
            <button disabled><Icon.chevL cls="uos-icon--sm"/></button>
            <button aria-current="page">1</button>
            <button>2</button>
            <button>3</button>
            <button><Icon.chevR cls="uos-icon--sm"/></button>
          </div>
        </div>
      </div>
    </Screen>
  );
}

// ─── 기출문제 상세 ─────────────────────────────────────────────
function ScreenExamDetail() {
  return (
    <Screen active="archive">
      <div style={{maxWidth:1100, margin:'0 auto', padding:'20px 32px 0'}}>
        <div className="uos-crumbs" style={{marginBottom:12}}>
          <a href="#">홈</a>
          <span className="uos-crumbs__sep">›</span>
          <a href="#">기출·자료</a>
          <span className="uos-crumbs__sep">›</span>
          <a href="#">대학수학 Ⅰ</a>
          <span className="uos-crumbs__sep">›</span>
          <span className="uos-crumbs__current">2024-2학기 기말고사</span>
        </div>
      </div>

      <div style={{maxWidth:1100, margin:'0 auto', padding:'8px 32px 32px', display:'grid', gridTemplateColumns:'1fr 300px', gap:24}}>
        <div style={{minWidth:0, display:'flex', flexDirection:'column', gap:16}}>
          {/* 헤더 */}
          <div className="uos-card">
            <div style={{padding:'20px 24px', display:'flex', flexDirection:'column', gap:10}}>
              <div style={{display:'flex', alignItems:'center', gap:8, flexWrap:'wrap'}}>
                <span className="uos-tag uos-tag--primary">기말고사</span>
                <span className="uos-tag uos-tag--outline">MA1001</span>
                <span className="uos-tag uos-tag--outline">2024-2</span>
                <span className="uos-tag uos-tag--success">풀이 포함</span>
              </div>
              <h1 style={{margin:'4px 0 0', fontSize:22, fontWeight:700, letterSpacing:'-0.02em', lineHeight:1.3}}>
                대학수학 Ⅰ · 2024-2학기 기말고사 <span style={{color:'var(--c-text-3)', fontWeight:500, fontSize:15}}>(한태성 교수)</span>
              </h1>
              <div style={{display:'flex', alignItems:'center', gap:14, fontSize:12.5, color:'var(--c-text-3)', marginTop:2}}>
                <span>김재현 업로드</span>
                <span>·</span>
                <span>2024.12.18</span>
                <span>·</span>
                <span className="uos-tabular"><Icon.eye cls="uos-icon--sm"/> 1,247</span>
                <span>·</span>
                <span className="uos-tabular"><Icon.download cls="uos-icon--sm"/> 312</span>
                <div style={{marginLeft:'auto', display:'flex', gap:6}}>
                  <button className="uos-btn uos-btn--sm">
                    <Icon.bookmark cls="uos-icon--sm"/> 북마크
                  </button>
                  <button className="uos-btn uos-btn--sm uos-btn--primary">
                    <Icon.download cls="uos-icon--sm"/> 다운로드
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* PDF Preview */}
          <div className="uos-card" style={{padding:0, overflow:'hidden'}}>
            <div style={{
              display:'flex', alignItems:'center', justifyContent:'space-between',
              padding:'10px 16px', borderBottom:'1px solid var(--c-line)',
              background:'var(--c-bg-soft)', fontSize:12.5,
            }}>
              <div style={{display:'flex', alignItems:'center', gap:8}}>
                <Icon.pdf cls="uos-icon--sm"/>
                <strong>MA1001-2024-2-final.pdf</strong>
                <span className="uos-muted">· 6 페이지 · 1.8MB</span>
              </div>
              <div className="uos-pagi" style={{fontSize:12}}>
                <button><Icon.chevL cls="uos-icon--sm"/></button>
                <span style={{padding:'0 8px', color:'var(--c-text-2)'}} className="uos-tabular">1 / 6</span>
                <button><Icon.chevR cls="uos-icon--sm"/></button>
                <span style={{width:1, height:16, background:'var(--c-line)', margin:'0 4px'}}/>
                <button style={{fontSize:11}}>전체화면</button>
              </div>
            </div>
            <div style={{background:'#eef2f7', padding:'24px', display:'flex', flexDirection:'column', gap:16, alignItems:'center', minHeight:600}}>
              <div style={{
                width:'min(100%, 480px)', aspectRatio:'1/1.34', background:'#fff',
                borderRadius:6, boxShadow:'0 8px 24px rgba(15,23,42,.08), 0 0 0 1px rgba(15,23,42,.06)',
                padding:'36px 40px', position:'relative', overflow:'hidden',
              }}>
                <div style={{textAlign:'center', borderBottom:'2px solid var(--c-text)', paddingBottom:10}}>
                  <div style={{fontSize:9, letterSpacing:'0.2em', color:'var(--c-text-3)'}}>2024학년도 2학기</div>
                  <div style={{fontSize:14, fontWeight:700, marginTop:4}}>대학수학 Ⅰ 기말고사 (MA1001)</div>
                  <div style={{fontSize:8.5, color:'var(--c-text-3)', marginTop:4, display:'flex', justifyContent:'space-between', padding:'0 8px'}}>
                    <span>담당교수: 한태성</span>
                    <span>시험시간: 90분</span>
                    <span>2024.12.17</span>
                  </div>
                </div>
                <div style={{marginTop:14, display:'flex', flexDirection:'column', gap:10, fontSize:9, lineHeight:1.65}}>
                  <p style={{margin:0}}><strong>문제 1.</strong> (10점) 다음 함수의 도함수를 구하시오.<br/>
                    f(x) = (x² + 1) · sin(2x)
                  </p>
                  <p style={{margin:0}}><strong>문제 2.</strong> (15점) 다음 극한값을 계산하시오.</p>
                  <div style={{padding:'8px 10px', background:'var(--c-bg-soft)', borderRadius:4, fontSize:10, fontFamily:'serif', textAlign:'center'}}>
                    lim<sub>x→0</sub> (sin 3x − 3x) / x³
                  </div>
                  <p style={{margin:0}}><strong>문제 3.</strong> (12점) 다음 적분을 계산하시오.</p>
                  <div style={{padding:'8px 10px', background:'var(--c-bg-soft)', borderRadius:4, fontSize:10, fontFamily:'serif', textAlign:'center'}}>
                    ∫₀^π x · cos(x) dx
                  </div>
                  <p style={{margin:0}}><strong>문제 4.</strong> (15점) 다음 함수가 구간 [0, 2]에서 평균값 정리(MVT)를 만족하는 c값을 구하시오.<br/>
                    f(x) = x³ − 3x + 2
                  </p>
                </div>
                <div style={{position:'absolute', bottom:14, left:0, right:0, textAlign:'center', fontSize:8, color:'var(--c-text-4)'}}>
                  — 1 페이지 / 6 페이지 —
                </div>
              </div>

              <div style={{display:'flex', alignItems:'center', gap:6}}>
                {[1,2,3,4,5,6].map(n=>(
                  <div key={n} style={{
                    width:36, height:48,
                    background: n===1?'#fff':'var(--c-bg-muted)',
                    border: n===1?'2px solid var(--c-primary)':'1px solid var(--c-line)',
                    borderRadius:3,
                    display:'grid', placeItems:'center',
                    fontSize:10,
                    color: n===1?'var(--c-primary-700)':'var(--c-text-4)',
                    fontWeight: n===1?700:500,
                  }} className="uos-tabular">{n}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 사이드 */}
        <aside style={{display:'flex', flexDirection:'column', gap:16, minWidth:0}}>
          <div className="uos-card">
            <div className="uos-card__hd" style={{padding:'14px 18px'}}>
              <h3 style={{fontSize:13.5}}>자료 정보</h3>
            </div>
            <div style={{padding:'4px 18px 16px', fontSize:12.5}}>
              {[
                {k:'과목', v:'대학수학 Ⅰ'},
                {k:'과목 코드', v:'MA1001'},
                {k:'담당 교수', v:'한태성'},
                {k:'학년도', v:'2024-2'},
                {k:'시험 유형', v:'기말고사'},
                {k:'풀이', v:'포함'},
                {k:'파일', v:'PDF · 1.8MB'},
              ].map((r,i)=>(
                <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom: i<6?'1px solid var(--c-line)':'0'}}>
                  <span className="uos-muted">{r.k}</span>
                  <span style={{fontWeight:500}}>{r.v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="uos-card">
            <div className="uos-card__hd" style={{padding:'14px 18px'}}>
              <h3 style={{fontSize:13.5}}>같은 과목 자료</h3>
              <a href="#" className="more">전체 24</a>
            </div>
            <div style={{padding:'2px 0 6px'}}>
              {[
                {t:'2024-2 중간고사', v:842},
                {t:'2024-1 기말고사', v:1521},
                {t:'2023-2 기말고사', v:2104},
                {t:'2023-2 중간고사', v:1832},
                {t:'2022-2 기말고사', v:1209},
              ].map((r,i)=>(
                <a key={i} href="#" style={{display:'flex', alignItems:'center', gap:8, padding:'9px 18px', textDecoration:'none', color:'var(--c-text)', fontSize:12.5}}>
                  <Icon.doc cls="uos-icon--sm" />
                  <span style={{flex:1}}>{r.t}</span>
                  <span className="uos-tabular" style={{color:'var(--c-text-4)', fontSize:11}}>{r.v.toLocaleString()}</span>
                </a>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </Screen>
  );
}

Object.assign(window, { ScreenCourseList, ScreenExamDetail });
