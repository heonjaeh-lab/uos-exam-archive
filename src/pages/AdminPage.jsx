import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useUser } from '../utils/user'
import { isAdmin } from '../utils/admin'
import {
  fetchRecentVisits,
  fetchRecentLogins,
  fetchAllUsers,
  fetchTodayStats,
} from '../api/analytics'

function relativeTime(ts) {
  if (!ts) return '?'
  const date = ts.toDate ? ts.toDate() : new Date(ts)
  const diff = Date.now() - date.getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return '방금'
  if (min < 60) return `${min}분 전`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}시간 전`
  const day = Math.floor(hr / 24)
  return `${day}일 전`
}

function formatDate(ts) {
  if (!ts) return '?'
  const date = ts.toDate ? ts.toDate() : new Date(ts)
  return date.toLocaleString('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AdminPage() {
  const user = useUser()
  const [stats, setStats] = useState(null)
  const [visits, setVisits] = useState([])
  const [logins, setLogins] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!isAdmin(user)) return
    setLoading(true)
    Promise.all([
      fetchTodayStats(),
      fetchRecentVisits(100),
      fetchRecentLogins(50),
      fetchAllUsers(200),
    ])
      .then(([s, v, l, u]) => {
        setStats(s)
        setVisits(v)
        setLogins(l)
        setUsers(u)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user, refreshKey])

  // 비관리자 접근 차단
  if (!isAdmin(user)) {
    return (
      <div style={{ maxWidth: 480, margin: '60px auto', padding: '0 16px', textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🚫</div>
        <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700 }}>관리자만 접근 가능</h2>
        <p style={{ color: 'var(--c-text-3)', fontSize: 14, margin: '0 0 20px' }}>
          이 페이지는 사이트 운영자만 볼 수 있어요.
        </p>
        <Link to="/" className="uos-btn uos-btn--primary uos-btn--lg" style={{ textDecoration: 'none' }}>
          홈으로
        </Link>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '20px 16px 40px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--c-text-3)', fontWeight: 600, letterSpacing: '0.08em' }}>
            ADMIN
          </div>
          <h1 style={{ margin: '4px 0 0', fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>
            관리자 대시보드
          </h1>
        </div>
        <button
          onClick={() => setRefreshKey((k) => k + 1)}
          className="uos-btn"
          style={{ height: 36, fontSize: 13 }}
        >
          새로고침
        </button>
      </div>

      {loading && (
        <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--c-text-3)' }}>
          데이터 불러오는 중...
        </div>
      )}

      {!loading && (
        <>
          {/* 오늘 요약 */}
          <section
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 12,
              marginBottom: 20,
            }}
          >
            <StatCard label="24시간 방문" value={stats?.visitCount ?? 0} />
            <StatCard label="순방문자(고유)" value={stats?.uniqueVisitors ?? 0} highlight />
            <StatCard label="로그인 성공" value={stats?.loginCount ?? 0} />
          </section>

          {/* 사용자 목록 */}
          <section className="uos-card" style={{ marginBottom: 16 }}>
            <div className="uos-card__hd" style={{ padding: '14px 18px' }}>
              <h3 style={{ fontSize: 14 }}>사용자 ({users.length})</h3>
              <span className="uos-tag uos-tag--success uos-tag--dot">방문 누적</span>
            </div>
            {users.length === 0 ? (
              <Empty>아직 사용자 없음</Empty>
            ) : (
              <div style={{ overflow: 'auto' }}>
                <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                  <thead style={{ background: 'var(--c-bg-soft)' }}>
                    <tr>
                      <Th>아이디</Th>
                      <Th align="right">방문수</Th>
                      <Th>처음 방문</Th>
                      <Th>최근 방문</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} style={{ borderTop: '1px solid var(--c-line)' }}>
                        <Td bold>{u.studentId}</Td>
                        <Td align="right">{u.visitCount || 0}</Td>
                        <Td muted>{u.firstSeen ? formatDate(u.firstSeen) : '?'}</Td>
                        <Td muted>{u.lastSeen ? relativeTime(u.lastSeen) : '?'}</Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* 로그인 기록 */}
          <section className="uos-card" style={{ marginBottom: 16 }}>
            <div className="uos-card__hd" style={{ padding: '14px 18px' }}>
              <h3 style={{ fontSize: 14 }}>최근 로그인 ({logins.length})</h3>
            </div>
            {logins.length === 0 ? (
              <Empty>로그인 기록 없음</Empty>
            ) : (
              <div style={{ overflow: 'auto' }}>
                <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                  <thead style={{ background: 'var(--c-bg-soft)' }}>
                    <tr>
                      <Th>아이디</Th>
                      <Th>결과</Th>
                      <Th>시각</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {logins.map((l) => (
                      <tr key={l.id} style={{ borderTop: '1px solid var(--c-line)' }}>
                        <Td bold>{l.studentId}</Td>
                        <Td>
                          <span
                            className={`uos-tag ${l.success ? 'uos-tag--success' : 'uos-tag--warning'}`}
                            style={{ fontSize: 11 }}
                          >
                            {l.success ? '성공' : '실패'}
                          </span>
                        </Td>
                        <Td muted>{relativeTime(l.timestamp)}</Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* 방문 기록 */}
          <section className="uos-card">
            <div className="uos-card__hd" style={{ padding: '14px 18px' }}>
              <h3 style={{ fontSize: 14 }}>최근 방문 ({visits.length})</h3>
            </div>
            {visits.length === 0 ? (
              <Empty>방문 기록 없음</Empty>
            ) : (
              <div style={{ overflow: 'auto' }}>
                <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
                  <thead style={{ background: 'var(--c-bg-soft)' }}>
                    <tr>
                      <Th>아이디</Th>
                      <Th>페이지</Th>
                      <Th>시각</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {visits.map((v) => (
                      <tr key={v.id} style={{ borderTop: '1px solid var(--c-line)' }}>
                        <Td bold>{v.studentId}</Td>
                        <Td muted>{v.path}</Td>
                        <Td muted>{relativeTime(v.timestamp)}</Td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}

function StatCard({ label, value, highlight }) {
  return (
    <div
      className="uos-card"
      style={{
        padding: '16px 14px',
        textAlign: 'center',
        background: highlight ? 'linear-gradient(160deg, var(--c-primary-700), var(--c-primary))' : '#fff',
        color: highlight ? '#fff' : 'inherit',
        border: highlight ? 'none' : '1px solid var(--c-line)',
      }}
    >
      <div style={{ fontSize: 11, opacity: highlight ? 0.85 : 0.6, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }} className="uos-tabular">
        {value}
      </div>
    </div>
  )
}

function Th({ children, align = 'left' }) {
  return (
    <th
      style={{
        padding: '10px 14px',
        textAlign: align,
        fontSize: 11.5,
        fontWeight: 600,
        color: 'var(--c-text-3)',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
      }}
    >
      {children}
    </th>
  )
}

function Td({ children, align = 'left', bold, muted }) {
  return (
    <td
      style={{
        padding: '10px 14px',
        textAlign: align,
        fontWeight: bold ? 600 : 400,
        color: muted ? 'var(--c-text-3)' : 'inherit',
      }}
    >
      {children}
    </td>
  )
}

function Empty({ children }) {
  return (
    <div style={{ padding: '24px', textAlign: 'center', color: 'var(--c-text-3)', fontSize: 13 }}>
      {children}
    </div>
  )
}
