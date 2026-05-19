import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { fetchSharedTimetable } from '../utils/timetableShare'
import TimetableGrid from '../components/TimetableGrid'

export default function ShareViewPage() {
  const { shareId } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!shareId) return
    setLoading(true)
    fetchSharedTimetable(shareId)
      .then((d) => {
        if (!d) setError('공유 링크가 만료됐거나 잘못된 링크예요.')
        else setData(d)
      })
      .catch(() => setError('시간표를 불러오지 못했어요.'))
      .finally(() => setLoading(false))
  }, [shareId])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 16px', color: 'var(--c-text-3)' }}>
        시간표 불러오는 중...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ maxWidth: 480, margin: '60px auto', padding: '0 16px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔗</div>
        <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700 }}>{error}</h2>
        <Link to="/" className="uos-btn uos-btn--primary uos-btn--lg" style={{ textDecoration: 'none', marginTop: 16 }}>
          홈으로
        </Link>
      </div>
    )
  }

  const courses = data?.courses || []
  const totalCredits = courses.reduce((s, c) => s + (c.CREDIT || 0), 0)

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '20px 16px 40px' }}>
      {/* 헤더 */}
      <div
        style={{
          padding: '20px 24px',
          background: 'linear-gradient(135deg, var(--c-primary-700) 0%, var(--c-primary) 70%, var(--c-primary-600) 100%)',
          color: '#fff',
          borderRadius: 14,
          marginBottom: 20,
        }}
      >
        <div style={{ fontSize: 11, opacity: 0.8, letterSpacing: '0.1em', fontWeight: 600 }}>
          SHARED TIMETABLE
        </div>
        <h1 style={{ margin: '6px 0 4px', fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>
          {data.ownerName}님의 시간표
        </h1>
        <div style={{ fontSize: 13, opacity: 0.85 }}>
          {data.semesterKey} · {courses.length}개 강의 · {totalCredits}학점
        </div>
      </div>

      {/* 시간표 */}
      <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden' }}>
        <TimetableGrid courses={courses} readOnly />
      </div>

      {/* 안내 */}
      <div style={{ marginTop: 20, textAlign: 'center' }}>
        <Link
          to="/timetable"
          className="uos-btn uos-btn--primary uos-btn--lg"
          style={{ textDecoration: 'none' }}
        >
          내 시간표 만들러 가기
        </Link>
        <div style={{ fontSize: 11, color: 'var(--c-text-3)', marginTop: 10 }}>
          UOS Archive · 시립대 자유전공 종합 플랫폼
        </div>
      </div>
    </div>
  )
}
