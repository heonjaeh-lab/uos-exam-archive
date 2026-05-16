/* screens-4.jsx — 시간표, 학식 (기능 최소) */

// ─── 시간표 ────────────────────────────────────────────────────
function ScreenTimetable() {
  const days = ['월','화','수','목','금'];
  const slots = 18; // 9:00 ~ 18:00 (30분 단위)

  const blockByCell = {};
  timetableBlocks.forEach((b,bi)=>{
    for(let k=0; k<b.dur; k++){
      blockByCell[`${b.day}-${b.start+k}`] = { ...b, isStart: k===0, blockIndex: bi };
    }
  });

  return (
    <Screen active="timetable">
      <section style={{borderBottom:'1px solid var(--c-line)', background:'#fff'}}>
        <div style={{maxWidth:1280, margin:'0 auto', padding:'20px 32px 16px'}}>
          <div className="uos-crumbs" style={{marginBottom:10}}>
            <a href="#">홈</a>
            <span className="uos-crumbs__sep">›</span>
            <span className="uos-crumbs__current">시간표</span>
          </div>
          <div style={{display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:16}}>
            <div>
              <h1 style={{margin:0, fontSize:24, fontWeight:700, letterSpacing:'-0.02em'}}>2025-1학기 시간표 <span style={{fontWeight:500, color:'var(--c-text-3)', fontSize:15}}>· 17학점</span></h1>
              <div style={{marginTop:6, fontSize:13, color:'var(--c-text-3)'}}>
                7과목 · 마지막 수정 어제 21:14
              </div>
            </div>
            <div style={{display:'flex', gap:8}}>
              <select className="uos-select" style={{height:36, paddingLeft:12, paddingRight:30}}>
                <option>2025년 1학기</option>
                <option>2024년 2학기</option>
                <option>2024년 1학기</option>
              </select>
              <button className="uos-btn"><Icon.download cls="uos-icon--sm"/> 이미지 저장</button>
              <button className="uos-btn uos-btn--primary"><Icon.plus cls="uos-icon--sm"/> 과목 추가</button>
            </div>
          </div>
        </div>
      </section>

      <div style={{maxWidth:1280, margin:'0 auto', padding:'24px 32px', display:'grid', gridTemplateColumns:'1fr 300px', gap:24}}>
        {/* 시간표 그리드 */}
        <div className="uos-card" style={{padding:0, overflow:'hidden'}}>
          <div style={{padding:'12px 16px', borderBottom:'1px solid var(--c-line)', display:'flex', alignItems:'center', gap:8}}>
            <Icon.cal cls="uos-icon--sm"/>
            <strong style={{fontSize:13.5}}>주간 시간표</strong>
            <span className="uos-muted" style={{fontSize:12}}>· 09:00 — 18:00</span>
          </div>
          <div style={{
            display:'grid',
            gridTemplateColumns:'60px repeat(5, 1fr)',
            gridTemplateRows:`32px repeat(${slots}, 28px)`,
          }}>
            <div style={{background:'var(--c-bg-soft)', borderBottom:'1px solid var(--c-line)', borderRight:'1px solid var(--c-line)'}}/>
            {days.map((d,i)=>(
              <div key={d} style={{
                background:'var(--c-bg-soft)',
                borderBottom:'1px solid var(--c-line)',
                borderRight: i<4?'1px solid var(--c-line)':'0',
                display:'grid', placeItems:'center',
                fontSize:12.5, fontWeight:700, color:'var(--c-text-2)',
                letterSpacing:'0.04em',
              }}>{d}</div>
            ))}
            {Array.from({length:slots}).map((_,si)=>{
              const isHour = si%2===0;
              const hour = 9 + si/2;
              return (
                <React.Fragment key={si}>
                  <div style={{
                    borderRight:'1px solid var(--c-line)',
                    borderBottom: isHour && si<slots-1 ? '1px solid var(--c-line)' : '1px dashed var(--c-bg-muted)',
                    paddingRight:8, paddingTop:isHour?2:0,
                    fontSize:10.5, color:'var(--c-text-4)',
                    textAlign:'right',
                    fontVariantNumeric:'tabular-nums',
                  }}>{isHour?`${hour}:00`:''}</div>
                  {days.map((_,di)=>{
                    const cell = blockByCell[`${di}-${si}`];
                    const baseStyle = {
                      borderRight: di<4?'1px solid var(--c-line)':'0',
                      borderBottom: isHour ? '1px solid var(--c-line)' : '1px dashed var(--c-bg-muted)',
                      position:'relative',
                    };
                    if (cell?.isStart) {
                      const c = cell.course;
                      const startH = 9 + Math.floor(cell.start/2);
                      const startM = cell.start%2 ? '30' : '00';
                      const endH = 9 + Math.floor((cell.start+cell.dur)/2);
                      const endM = (cell.start+cell.dur)%2 ? '30' : '00';
                      return (
                        <div key={di} style={baseStyle}>
                          <div style={{
                            position:'absolute',
                            top:2, left:2, right:2,
                            height:`calc(${cell.dur * 28}px - 4px)`,
                            background: `color-mix(in oklab, ${c.color} 12%, white)`,
                            borderLeft: `3px solid ${c.color}`,
                            borderRadius:5,
                            padding:'5px 8px',
                            overflow:'hidden',
                            color: c.color,
                            zIndex:1,
                          }}>
                            <div style={{fontSize:12, fontWeight:700, color: `color-mix(in oklab, ${c.color} 75%, black)`, lineHeight:1.2}}>{c.name}</div>
                            <div style={{fontSize:10.5, color:'var(--c-text-3)', marginTop:2}}>{c.prof} · {c.code}</div>
                            <div style={{fontSize:10, color:'var(--c-text-4)', marginTop:1, fontFamily:'var(--ff-num)'}}>
                              {String(startH).padStart(2,'0')}:{startM} — {String(endH).padStart(2,'0')}:{endM}
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return <div key={di} style={baseStyle}/>;
                  })}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* 사이드 — 수강 과목만 */}
        <aside style={{display:'flex', flexDirection:'column', gap:16, minWidth:0}}>
          <div className="uos-card">
            <div className="uos-card__hd" style={{padding:'14px 18px'}}>
              <h3 style={{fontSize:13.5}}>수강 과목 <span style={{color:'var(--c-text-3)', fontWeight:500, marginLeft:4}} className="uos-tabular">{myCourses.length}</span></h3>
            </div>
            <div style={{padding:'0 0 8px'}}>
              {myCourses.map((c,i)=>(
                <div key={c.id} style={{display:'flex', alignItems:'center', gap:10, padding:'10px 18px', borderTop:i>0?'1px solid var(--c-line)':'0'}}>
                  <div style={{width:4, alignSelf:'stretch', borderRadius:2, background:c.color, minHeight:34}}/>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontSize:13, fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{c.name}</div>
                    <div style={{fontSize:11, color:'var(--c-text-3)', marginTop:1, fontFamily:'var(--ff-num)'}}>{c.code} · {c.prof}</div>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <div style={{fontSize:11, color:'var(--c-text-3)'}}>{c.credit}학점</div>
                    <button style={{border:0, background:'transparent', color:'var(--c-text-4)', cursor:'pointer', padding:0, marginTop:2}}>
                      <Icon.x cls="uos-icon--sm"/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{padding:'10px 14px', borderTop:'1px solid var(--c-line)'}}>
              <button className="uos-btn uos-btn--sm" style={{width:'100%'}}>
                <Icon.plus cls="uos-icon--sm"/> 과목 검색
              </button>
            </div>
          </div>
        </aside>
      </div>
    </Screen>
  );
}


// ─── 학식 정보 ─────────────────────────────────────────────────
function ScreenCafeteria() {
  const today = '5월 16일 (금)';
  return (
    <Screen active="meal">
      <section style={{background:'#fff', borderBottom:'1px solid var(--c-line)'}}>
        <div style={{maxWidth:1280, margin:'0 auto', padding:'20px 32px 16px'}}>
          <div className="uos-crumbs" style={{marginBottom:10}}>
            <a href="#">홈</a>
            <span className="uos-crumbs__sep">›</span>
            <span className="uos-crumbs__current">학식</span>
          </div>
          <div style={{display:'flex', alignItems:'flex-end', justifyContent:'space-between', gap:16}}>
            <div>
              <h1 style={{margin:0, fontSize:24, fontWeight:700, letterSpacing:'-0.02em'}}>학식 메뉴</h1>
              <div style={{marginTop:6, fontSize:13, color:'var(--c-text-3)'}}>
                <strong style={{color:'var(--c-text)'}}>{today}</strong> · 4개 식당
              </div>
            </div>
            <div style={{display:'flex', gap:8, alignItems:'center'}}>
              <div className="uos-pagi">
                <button><Icon.chevL cls="uos-icon--sm"/></button>
                <button style={{padding:'0 14px', fontWeight:600}}>{today}</button>
                <button><Icon.chevR cls="uos-icon--sm"/></button>
              </div>
              <button className="uos-btn">오늘로</button>
            </div>
          </div>
        </div>
      </section>

      <main style={{maxWidth:1280, margin:'0 auto', padding:'24px 32px', display:'grid', gridTemplateColumns:'1fr 320px', gap:24}}>
        {/* 식당별 메뉴 */}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, minWidth:0}}>
          {cafeterias.map((c,i)=>(
            <div key={c.id} className="uos-card" style={{
              display:'flex', flexDirection:'column', minWidth:0,
              opacity: c.open ? 1 : 0.85,
            }}>
              <div style={{padding:'14px 18px', borderBottom:'1px solid var(--c-line)', display:'flex', alignItems:'center', gap:10}}>
                <div style={{
                  width:36, height:36, borderRadius:8,
                  background:`color-mix(in oklab, ${i===0?'var(--c-primary)':i===1?'#0ca678':i===2?'#e8590c':'#7950f2'} 12%, white)`,
                  color:i===0?'var(--c-primary)':i===1?'#0ca678':i===2?'#e8590c':'#7950f2',
                  display:'grid', placeItems:'center',
                  fontSize:14, fontWeight:700,
                }}>{c.name[0]}</div>
                <div style={{flex:1, minWidth:0}}>
                  <strong style={{fontSize:15, letterSpacing:'-0.01em'}}>{c.name}</strong>
                  <div style={{fontSize:11.5, color:'var(--c-text-3)', marginTop:1}}>{c.sub} · {c.hours}</div>
                </div>
              </div>
              <div style={{padding:'12px 18px 14px', flex:1, display:'flex', flexDirection:'column', gap:10}}>
                {c.meals.map((m,mi)=>(
                  <div key={mi} style={{
                    padding:'10px 12px',
                    border:'1px solid var(--c-line)',
                    borderRadius:8,
                    background:'#fff',
                  }}>
                    <div style={{display:'flex', alignItems:'center', gap:6, marginBottom:4}}>
                      <span style={{fontSize:11, fontWeight:700, color:'var(--c-text-3)', letterSpacing:'0.06em'}}>{m.kind.toUpperCase()}</span>
                      <span style={{marginLeft:'auto', fontSize:11, color:'var(--c-text-3)'}} className="uos-tabular">{m.price}</span>
                    </div>
                    <div style={{fontSize:13, fontWeight:600, lineHeight:1.4}}>
                      {m.items.slice(0,2).join(' · ')}
                    </div>
                    <div style={{fontSize:11.5, color:'var(--c-text-3)', marginTop:2, lineHeight:1.5}}>
                      + {m.items.slice(2).join(' · ')}
                    </div>
                  </div>
                ))}
              </div>
              {!c.open && (
                <div style={{padding:'8px 18px', background:'#fff4e6', color:'#c44a06', fontSize:11.5, borderTop:'1px solid #ffd8a8'}}>
                  ⓘ 오늘 중식 미운영
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 사이드 — 주간 메뉴만 */}
        <aside style={{display:'flex', flexDirection:'column', gap:16}}>
          <div className="uos-card">
            <div className="uos-card__hd" style={{padding:'14px 18px'}}>
              <h3 style={{fontSize:13.5}}>이번 주 학생회관 중식</h3>
            </div>
            <div style={{padding:'2px 0 10px'}}>
              {[
                { d:'월 05.12', m:'된장찌개 · 고등어구이', t:false },
                { d:'화 05.13', m:'카레라이스 · 단호박튀김', t:false },
                { d:'수 05.14', m:'우삼겹덮밥 · 미소장국', t:false },
                { d:'목 05.15', m:'비빔밥 · 유부장국', t:false },
                { d:'금 05.16', m:'김치제육볶음 · 계란찜', t:true },
              ].map((r,i)=>(
                <div key={i} style={{display:'flex', alignItems:'center', gap:10, padding:'9px 18px', background:r.t?'var(--c-primary-50)':'transparent'}}>
                  <div style={{fontSize:11.5, fontWeight:r.t?700:500, color:r.t?'var(--c-primary-700)':'var(--c-text-3)', width:56}} className="uos-tabular">{r.d}</div>
                  <div style={{flex:1, fontSize:12.5, color:r.t?'var(--c-text)':'var(--c-text-2)', fontWeight:r.t?600:400}}>{r.m}</div>
                  {r.t && <span className="uos-tag uos-tag--primary" style={{fontSize:10}}>오늘</span>}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </Screen>
  );
}

Object.assign(window, { ScreenTimetable, ScreenCafeteria });
