import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import examsData from '../data/exams.json'

const SVG = ({ children, cls = '' }) => (
  <svg viewBox="0 0 24 24" className={`uos-icon ${cls}`}>{children}</svg>
)
const Icon = {
  search: (p) => <SVG {...p}><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></SVG>,
}

const TYPE_COLORS = {
  '중간고사': 'rgba(28,126,214,0.10)',
  '기말고사': 'rgba(121,80,242,0.10)',
  '퀴즈': 'rgba(12,166,120,0.10)',
  '강의노트': 'rgba(76,110,245,0.10)',
  '레포트': 'rgba(232,89,12,0.10)',
  '예비레포트': 'rgba(232,89,12,0.10)',
  '결과레포트': 'rgba(232,89,12,0.10)',
  '발표문': 'rgba(194,37,92,0.10)',
  '교재': 'rgba(232,89,12,0.10)',
  '과제': 'rgba(232,89,12,0.10)',
  '기출풀이': 'rgba(28,126,214,0.10)',
}

const TYPE_FG = {
  '중간고사': '#1864ab',
  '기말고사': '#5f3dc4',
  '퀴즈': '#087f5b',
  '강의노트': '#3b5bdb',
  '레포트': '#c44a06',
  '예비레포트': '#c44a06',
  '결과레포트': '#c44a06',
  '발표문': '#a61e4d',
  '교재': '#c44a06',
  '과제': '#c44a06',
  '기출풀이': '#1864ab',
}

function aggregateBySubject(exams) {
  const map = new Map()
  exams.forEach((e) => {
    const key = e.subject
    if (!map.has(key)) {
      map.set(key, {
        name: key, count: 0, years: new Set(), types: new Set(), professors: new Set(),
      })
    }
    const entry = map.get(key)
    entry.count++
    if (e.year) entry.years.add(e.year)
    if (e.examType) entry.types.add(e.examType)
    if (e.professor) entry.professors.add(e.professor)
  })
  return Array.from(map.values()).map((s) => ({
    ...s,
    latestYear: s.years.size ? Math.max(...s.years) : null,
    types: Array.from(s.types),
    professors: Array.from(s.professors),
  }))
}

const SORT_OPTIONS = [
  { value: 'count-desc', label: '자료 많은 순' },
  { value: 'name-asc', label: '가나다 순' },
  { value: 'year-desc', label: '최근 자료 순' },
]

export default function ArchivePage() {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('count-desc')

  const allSubjects = useMemo(() => aggregateBySubject(examsData), [])

  const filteredSubjects = useMemo(() => {
    let list = allSubjects
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.professors.some((p) => p?.toLowerCase().includes(q)),
      )
    }
    if (sort === 'count-desc') list = [...list].sort((a, b) => b.count - a.count)
    else if (sort === 'name-asc') list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    else if (sort === 'year-desc')
      list = [...list].sort((a, b) => (b.latestYear || 0) - (a.latestYear || 0))
    return list
  }, [allSubjects, search, sort])

  return (
    <div style={{ margin: '-24px -16px 0' }}>
      <section style={{ background: '#fff', borderBottom: '1px solid var(--c-line)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '20px 16px 16px' }}>
          <div className="uos-crumbs" style={{ marginBottom: 10 }}>
            <Link to="/">홈</Link>
            <span className="uos-crumbs__sep">›</span>
            <span className="uos-crumbs__current">기출 · 자료</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>
                기출 · 자료
              </h1>
              <div style={{ marginTop: 6, fontSize: 13, color: 'var(--c-text-3)' }}>
                자유전공학부 학생이 모은 자료 ·{' '}
                <strong style={{ color: 'var(--c-text)' }} className="uos-tabular">
                  {allSubjects.length}
                </strong>
                개 과목 ·{' '}
                <strong style={{ color: 'var(--c-text)' }} className="uos-tabular">
                  {examsData.length}
                </strong>
                개 자료
              </div>
            </div>
            <div className="uos-search" style={{ width: '100%', maxWidth: 320 }}>
              <Icon.search />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="과목명, 교수 검색"
              />
            </div>
          </div>
        </div>
      </section>

      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '20px 16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 14,
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ fontSize: 13, color: 'var(--c-text-3)' }}>
            <strong style={{ color: 'var(--c-text)' }} className="uos-tabular">
              {filteredSubjects.length}
            </strong>
            개 과목
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="uos-select"
            style={{ height: 36, fontSize: 13, paddingLeft: 12 }}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        {filteredSubjects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--c-text-3)' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🔍</div>
            <div style={{ fontSize: 14 }}>조회된 과목이 없어요</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredSubjects.map((s) => (
              <Link
                key={s.name}
                to={`/subject/${encodeURIComponent(s.name)}`}
                className="uos-card"
                style={{
                  padding: '18px 20px',
                  textDecoration: 'none',
                  color: 'var(--c-text)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <div
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    wordBreak: 'keep-all',
                    lineHeight: 1.3,
                  }}
                >
                  {s.name}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span
                    style={{ fontSize: 14, fontWeight: 700, color: 'var(--c-primary)' }}
                    className="uos-tabular"
                  >
                    {s.count}개 자료
                  </span>
                  {s.latestYear && (
                    <span style={{ fontSize: 11.5, color: 'var(--c-text-4)' }}>
                      · 최근 {s.latestYear}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
