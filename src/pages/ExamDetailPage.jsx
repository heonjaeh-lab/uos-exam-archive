import { useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import examsData from '../data/exams.json'

const SVG = ({ children, cls = '' }) => (
  <svg viewBox="0 0 24 24" className={`uos-icon ${cls}`}>{children}</svg>
)
const Icon = {
  download: (p) => <SVG {...p}><path d="M12 4v12"/><path d="M7 11l5 5 5-5"/><path d="M5 20h14"/></SVG>,
  bookmark: (p) => <SVG {...p}><path d="M6 4h12v17l-6-4-6 4z"/></SVG>,
  pdf: (p) => <SVG {...p}><path d="M7 3h8l4 4v14H7z"/><path d="M15 3v5h4"/></SVG>,
  doc: (p) => <SVG {...p}><path d="M7 3h8l4 4v14H7z"/><path d="M15 3v5h4"/><path d="M10 13h6"/><path d="M10 17h4"/></SVG>,
  full: (p) => <SVG {...p}><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></SVG>,
  back: (p) => <SVG {...p}><polyline points="15 18 9 12 15 6"/></SVG>,
}

const TYPE_BG = {
  '중간고사': 'uos-tag--primary',
  '기말고사': 'uos-tag--primary',
  '퀴즈': 'uos-tag--success',
  '강의노트': '',
  '레포트': 'uos-tag--warning',
  '예비레포트': 'uos-tag--warning',
  '결과레포트': 'uos-tag--warning',
  '교재': 'uos-tag--warning',
  '발표문': '',
  '과제': 'uos-tag--warning',
  '기출풀이': 'uos-tag--primary',
}

export default function ExamDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const basePath = import.meta.env.BASE_URL

  const exam = useMemo(() => examsData.find((e) => String(e.id) === String(id)), [id])
  const sameSubject = useMemo(
    () =>
      examsData
        .filter((e) => exam && e.subject === exam.subject && e.id !== exam.id)
        .sort((a, b) => (b.year || 0) - (a.year || 0))
        .slice(0, 10),
    [exam],
  )

  if (!exam) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
        <h2 style={{ margin: 0, fontSize: 20 }}>자료를 찾을 수 없어요</h2>
        <p style={{ marginTop: 8, fontSize: 14, color: 'var(--c-text-3)' }}>
          id={id}에 해당하는 자료가 없네요.
        </p>
        <Link to="/archive" className="uos-btn uos-btn--primary" style={{ marginTop: 16, display: 'inline-flex' }}>
          기출·자료로 돌아가기
        </Link>
      </div>
    )
  }

  const hasFile = exam.fileName && exam.fileName.length > 0
  const hasAnswer = exam.answerFileName && exam.answerFileName.length > 0
  const fileUrl = hasFile
    ? exam.fileName.startsWith('http')
      ? exam.fileName
      : `${basePath}exams/${exam.fileName}`
    : null
  const answerUrl = hasAnswer ? `${basePath}exams/${exam.answerFileName}` : null

  const fileBaseName = hasFile ? exam.fileName.split('/').pop() : null

  return (
    <div style={{ margin: '-24px -16px 0' }}>
      {/* 헤더 */}
      <section style={{ background: '#fff', borderBottom: '1px solid var(--c-line)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '20px 16px 0' }}>
          <div className="uos-crumbs" style={{ marginBottom: 10 }}>
            <Link to="/">홈</Link>
            <span className="uos-crumbs__sep">›</span>
            <Link to="/archive">기출·자료</Link>
            <span className="uos-crumbs__sep">›</span>
            <Link to={`/subject/${encodeURIComponent(exam.subject)}`}>{exam.subject}</Link>
            <span className="uos-crumbs__sep">›</span>
            <span className="uos-crumbs__current uos-truncate" style={{ maxWidth: 220 }}>
              {exam.title || exam.examType}
            </span>
          </div>
        </div>
      </section>

      {/* 본문 */}
      <main
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '20px 16px 32px',
        }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
          {/* 메인 컬럼 */}
          <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* 자료 헤더 */}
            <div className="uos-card">
              <div style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span className={`uos-tag ${TYPE_BG[exam.examType] || ''}`}>{exam.examType}</span>
                  {exam.year && (
                    <span className="uos-tag uos-tag--outline">
                      {exam.year}-{exam.semester || ''}
                    </span>
                  )}
                  {hasAnswer && <span className="uos-tag uos-tag--success">풀이 포함</span>}
                  {exam.tags?.map((t) => (
                    <span key={t} className="uos-tag" style={{ fontSize: 10.5 }}>
                      {t}
                    </span>
                  ))}
                </div>
                <h1
                  style={{
                    margin: '4px 0 0',
                    fontSize: 22,
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    lineHeight: 1.3,
                    wordBreak: 'keep-all',
                  }}
                >
                  {exam.title || `${exam.subject} ${exam.examType}`}
                  {exam.professor && (
                    <span style={{ color: 'var(--c-text-3)', fontWeight: 500, fontSize: 15, marginLeft: 8 }}>
                      ({exam.professor} 교수)
                    </span>
                  )}
                </h1>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    fontSize: 12.5,
                    color: 'var(--c-text-3)',
                    marginTop: 2,
                    flexWrap: 'wrap',
                  }}
                >
                  <span>{exam.subject}</span>
                  {exam.uploadedAt && (
                    <>
                      <span>·</span>
                      <span>업로드 {exam.uploadedAt}</span>
                    </>
                  )}
                  <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                    {hasAnswer && (
                      <a
                        href={answerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="uos-btn uos-btn--sm"
                        style={{ textDecoration: 'none' }}
                      >
                        <Icon.doc cls="uos-icon--sm" /> 답안
                      </a>
                    )}
                    {fileUrl && (
                      <a
                        href={fileUrl}
                        download
                        className="uos-btn uos-btn--sm uos-btn--primary"
                        style={{ textDecoration: 'none' }}
                      >
                        <Icon.download cls="uos-icon--sm" /> 다운로드
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* PDF 뷰어 */}
            {hasFile ? (
              <div className="uos-card" style={{ padding: 0, overflow: 'hidden' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 16px',
                    borderBottom: '1px solid var(--c-line)',
                    background: 'var(--c-bg-soft)',
                    fontSize: 12.5,
                    flexWrap: 'wrap',
                    gap: 8,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                    <Icon.pdf cls="uos-icon--sm" />
                    <strong className="uos-truncate" style={{ maxWidth: 280 }}>
                      {fileBaseName}
                    </strong>
                  </div>
                  <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="uos-btn uos-btn--sm uos-btn--ghost"
                    style={{ textDecoration: 'none' }}
                  >
                    <Icon.full cls="uos-icon--sm" /> 새 탭에서 보기
                  </a>
                </div>

                {/* iframe PDF Viewer */}
                <div style={{ background: '#525659', minHeight: 600 }}>
                  <iframe
                    src={`${fileUrl}#view=FitH`}
                    title={exam.title || exam.subject}
                    style={{
                      width: '100%',
                      height: 'min(75vh, 800px)',
                      border: 0,
                      display: 'block',
                    }}
                  />
                </div>

                {/* 모바일 안내 */}
                <div
                  style={{
                    padding: '10px 16px',
                    fontSize: 11.5,
                    color: 'var(--c-text-4)',
                    textAlign: 'center',
                    borderTop: '1px solid var(--c-line)',
                  }}
                  className="sm:hidden"
                >
                  📱 모바일에서 잘 안 보이면 위 "새 탭에서 보기" 버튼을 눌러주세요
                </div>
              </div>
            ) : hasAnswer ? (
              <div className="uos-card">
                <div className="uos-card__bd" style={{ textAlign: 'center', padding: 30, color: 'var(--c-text-3)' }}>
                  문제 파일은 없지만 답안 자료가 있어요. 우측의 다운로드 버튼을 이용해주세요.
                </div>
              </div>
            ) : (
              <div className="uos-card">
                <div className="uos-card__bd" style={{ textAlign: 'center', padding: 30, color: 'var(--c-text-3)' }}>
                  파일이 아직 준비되지 않았어요
                </div>
              </div>
            )}
          </div>

          {/* 사이드바 */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
            <button
              onClick={() => navigate(-1)}
              className="uos-btn uos-btn--ghost"
              style={{ justifyContent: 'flex-start' }}
            >
              <Icon.back cls="uos-icon--sm" /> 뒤로
            </button>

            {/* 자료 정보 */}
            <section className="uos-card">
              <div className="uos-card__hd" style={{ padding: '14px 18px' }}>
                <h3 style={{ fontSize: 13.5 }}>자료 정보</h3>
              </div>
              <div style={{ padding: '4px 18px 16px', fontSize: 12.5 }}>
                {[
                  { k: '과목', v: exam.subject },
                  { k: '교수', v: exam.professor },
                  { k: '학년도', v: exam.year ? `${exam.year}-${exam.semester || ''}` : null },
                  { k: '유형', v: exam.examType },
                  { k: '풀이', v: hasAnswer ? '포함' : '미포함' },
                  { k: '파일', v: hasFile ? 'PDF' : '없음' },
                ]
                  .filter((r) => r.v != null)
                  .map((r, i, arr) => (
                    <div
                      key={r.k}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '8px 0',
                        borderBottom: i < arr.length - 1 ? '1px solid var(--c-line)' : '0',
                        gap: 12,
                      }}
                    >
                      <span className="uos-muted">{r.k}</span>
                      <span style={{ fontWeight: 500, textAlign: 'right' }}>{r.v}</span>
                    </div>
                  ))}
              </div>
            </section>

            {/* 같은 과목 자료 */}
            {sameSubject.length > 0 && (
              <section className="uos-card">
                <div className="uos-card__hd" style={{ padding: '14px 18px' }}>
                  <h3 style={{ fontSize: 13.5 }}>같은 과목 자료</h3>
                  <Link to={`/subject/${encodeURIComponent(exam.subject)}`} className="more">
                    전체 {sameSubject.length + 1}
                  </Link>
                </div>
                <div style={{ padding: '2px 0 6px' }}>
                  {sameSubject.map((r) => (
                    <Link
                      key={r.id}
                      to={`/exam/${r.id}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '10px 18px',
                        textDecoration: 'none',
                        color: 'var(--c-text)',
                        fontSize: 12.5,
                      }}
                    >
                      <Icon.doc cls="uos-icon--sm" />
                      <span className="uos-truncate" style={{ flex: 1 }}>
                        {r.title || r.examType}
                      </span>
                      {r.year && (
                        <span className="uos-tabular" style={{ color: 'var(--c-text-4)', fontSize: 11 }}>
                          {r.year}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </aside>
        </div>
      </main>
    </div>
  )
}
