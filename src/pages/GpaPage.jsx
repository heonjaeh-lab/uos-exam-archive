import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'

const STORAGE_KEY = 'uos-timetable-v1'
const GRADES_KEY = 'uos-grades-v1'

// 시립대 학점 기준 (4.5 만점)
const GRADE_POINTS = {
  'A+': 4.5,
  A: 4.0,
  'A-': 3.5, // 사실상 시립대는 +/- 만 있음 — 호환용
  'B+': 3.5,
  B: 3.0,
  'B-': 2.5,
  'C+': 2.5,
  C: 2.0,
  'C-': 1.5,
  'D+': 1.5,
  D: 1.0,
  F: 0.0,
}
// 시립대 학부 표준: A+, A0, B+, B0, C+, C0, D+, D0, F + P/NP
const GRADE_OPTIONS = ['A+', 'A0', 'B+', 'B0', 'C+', 'C0', 'D+', 'D0', 'F', 'P', 'NP', '-']

// A0 → A, B0 → B 로 매핑
function gradeToPoint(g) {
  if (!g || g === '-' || g === 'P' || g === 'NP') return null
  const key = g.replace('0', '') // A0 → A
  return GRADE_POINTS[key] ?? null
}

function loadAllSemesters() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch {
    return {}
  }
}
function loadGrades() {
  try {
    return JSON.parse(localStorage.getItem(GRADES_KEY) || '{}')
  } catch {
    return {}
  }
}
function saveGrades(grades) {
  localStorage.setItem(GRADES_KEY, JSON.stringify(grades))
}

export default function GpaPage() {
  const [semesters, setSemesters] = useState({})
  const [grades, setGrades] = useState({})
  const [activeSemester, setActiveSemester] = useState(null)

  useEffect(() => {
    const sems = loadAllSemesters()
    setSemesters(sems)
    setGrades(loadGrades())
    // 가장 최근 학기 선택
    const keys = Object.keys(sems).sort()
    if (keys.length) setActiveSemester(keys[keys.length - 1])
  }, [])

  const setGrade = (semKey, courseKey, grade) => {
    setGrades((prev) => {
      const next = { ...prev, [semKey]: { ...(prev[semKey] || {}), [courseKey]: grade } }
      saveGrades(next)
      return next
    })
  }

  const courseKey = (c) => `${c.SUBJECT_NO}-${c.DVCL_NO}`

  // 학기별 GPA 계산
  const semesterGpas = useMemo(() => {
    const result = {}
    Object.entries(semesters).forEach(([semKey, courses]) => {
      let pts = 0
      let cr = 0
      ;(courses || []).forEach((c) => {
        const g = grades[semKey]?.[courseKey(c)]
        const p = gradeToPoint(g)
        if (p !== null && c.CREDIT) {
          pts += p * c.CREDIT
          cr += c.CREDIT
        }
      })
      result[semKey] = { gpa: cr > 0 ? pts / cr : null, credits: cr }
    })
    return result
  }, [semesters, grades])

  // 전체 GPA
  const totalGpa = useMemo(() => {
    let pts = 0
    let cr = 0
    Object.entries(semesters).forEach(([semKey, courses]) => {
      ;(courses || []).forEach((c) => {
        const g = grades[semKey]?.[courseKey(c)]
        const p = gradeToPoint(g)
        if (p !== null && c.CREDIT) {
          pts += p * c.CREDIT
          cr += c.CREDIT
        }
      })
    })
    return { gpa: cr > 0 ? pts / cr : null, credits: cr }
  }, [semesters, grades])

  const semKeys = Object.keys(semesters).sort()
  const activeCourses = activeSemester ? semesters[activeSemester] || [] : []

  if (semKeys.length === 0) {
    return (
      <div style={{ maxWidth: 480, margin: '60px auto', padding: '0 16px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📊</div>
        <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700 }}>저장된 시간표가 없어요</h2>
        <p style={{ color: 'var(--c-text-3)', fontSize: 14, margin: '0 0 20px' }}>
          시간표에 강의를 먼저 추가하면 학점 계산이 가능해요.
        </p>
        <Link to="/timetable" className="uos-btn uos-btn--primary uos-btn--lg" style={{ textDecoration: 'none' }}>
          시간표 만들러 가기
        </Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px 16px 40px' }}>
      {/* 헤더 */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: 'var(--c-text-3)', fontWeight: 600, letterSpacing: '0.08em' }}>
          GPA CALCULATOR
        </div>
        <h1 style={{ margin: '4px 0 0', fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>
          학점 계산기
        </h1>
        <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--c-text-3)' }}>
          저장된 시간표의 강의에 성적을 입력하면 자동으로 학점이 계산돼요. (시립대 4.5 만점 기준)
        </p>
      </div>

      {/* 종합 통계 */}
      <section
        className="uos-card"
        style={{
          padding: '20px 24px',
          marginBottom: 20,
          background: 'linear-gradient(135deg, var(--c-primary-700) 0%, var(--c-primary) 70%, var(--c-primary-600) 100%)',
          color: '#fff',
          border: 'none',
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <Stat label="전체 학점" value={totalGpa.gpa !== null ? totalGpa.gpa.toFixed(2) : '—'} unit="/4.5" />
          <Stat label="이수 학점" value={totalGpa.credits} unit="학점" />
          <Stat label="학기 수" value={semKeys.length} unit="학기" />
        </div>
      </section>

      {/* 학기 탭 */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto', paddingBottom: 4 }}>
        {semKeys.map((key) => {
          const sg = semesterGpas[key]
          const isActive = key === activeSemester
          return (
            <button
              key={key}
              onClick={() => setActiveSemester(key)}
              style={{
                padding: '8px 14px',
                borderRadius: 10,
                border: isActive ? '2px solid var(--c-primary)' : '1px solid var(--c-line)',
                background: isActive ? 'var(--c-primary-50)' : '#fff',
                color: 'inherit',
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {key}
              {sg?.gpa !== null && (
                <span style={{ marginLeft: 8, color: 'var(--c-primary-700)', fontWeight: 700 }}>
                  {sg.gpa.toFixed(2)}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* 강의 목록 */}
      <section className="uos-card">
        <div className="uos-card__hd" style={{ padding: '14px 18px' }}>
          <h3 style={{ fontSize: 14 }}>{activeSemester} 강의 ({activeCourses.length})</h3>
          {semesterGpas[activeSemester]?.gpa !== null && (
            <span className="uos-tag uos-tag--primary uos-tag--dot">
              평점 {semesterGpas[activeSemester].gpa.toFixed(2)} · {semesterGpas[activeSemester].credits}학점
            </span>
          )}
        </div>
        <div>
          {activeCourses.map((c, i) => {
            const key = courseKey(c)
            const current = grades[activeSemester]?.[key] || '-'
            return (
              <div
                key={key + i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 18px',
                  borderTop: '1px solid var(--c-line)',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{c.SUBJECT_NM || c.subjectNm}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--c-text-3)', marginTop: 2 }}>
                    {c.SUBJECT_NO} · {c.PROF_KOR_NM || c.profNm || ''} · {c.CREDIT || 0}학점
                  </div>
                </div>
                <select
                  value={current}
                  onChange={(e) => setGrade(activeSemester, key, e.target.value)}
                  style={{
                    padding: '6px 10px',
                    border: '1px solid var(--c-line)',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    background: '#fff',
                    cursor: 'pointer',
                    minWidth: 70,
                  }}
                >
                  {GRADE_OPTIONS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
            )
          })}
        </div>
      </section>

      <div style={{ marginTop: 20, fontSize: 11, color: 'var(--c-text-4)', textAlign: 'center' }}>
        P/NP는 학점 계산에서 제외됩니다. 입력한 성적은 본인 브라우저에만 저장돼요.
      </div>
    </div>
  )
}

function Stat({ label, value, unit }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 11, opacity: 0.85, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, marginTop: 2 }} className="uos-tabular">
        {value}
        {unit && <span style={{ fontSize: 12, opacity: 0.8, marginLeft: 2, fontWeight: 500 }}>{unit}</span>}
      </div>
    </div>
  )
}
