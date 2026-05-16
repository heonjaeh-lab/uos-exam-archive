import { useState, useEffect, useMemo } from 'react'
import { fetchNoticeBoard } from '../api/notice'

const BOARDS = [
  { key: 'academic', label: '학부공지' },
  { key: 'general', label: '행사공지' },
]

const CATEGORIES = ['전체', '학사', '일반', '장학']

const CATEGORY_TAG = {
  학사: 'uos-tag--primary',
  일반: '',
  장학: 'uos-tag--warning',
  기타: 'uos-tag--outline',
}

function daysAgo(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const diff = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return '오늘'
  if (diff === 1) return '어제'
  if (diff < 7) return `${diff}일 전`
  if (diff < 30) return `${Math.floor(diff / 7)}주 전`
  return dateStr.slice(5)
}

export default function NoticePage() {
  const [board, setBoard] = useState('academic')
  const [category, setCategory] = useState('전체')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchNoticeBoard(board)
      .then((res) => !cancelled && setData(res))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [board])

  const filteredNotices = useMemo(() => {
    if (!data?.notices) return []
    if (category === '전체') return data.notices
    return data.notices.filter((n) => n.category === category)
  }, [data, category])

  const pinned = filteredNotices.filter((n) => n.pinned)
  const regular = filteredNotices.filter((n) => !n.pinned)

  return (
    <div style={{ margin: '-24px -16px 0' }}>
      {/* 헤더 */}
      <section style={{ background: '#fff', borderBottom: '1px solid var(--c-line)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '20px 16px 16px' }}>
          <div className="uos-crumbs" style={{ marginBottom: 10 }}>
            <a href="#/">홈</a>
            <span className="uos-crumbs__sep">›</span>
            <span className="uos-crumbs__current">학부 공지</span>
          </div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>학부 공지</h1>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--c-text-3)' }}>
            자유전공학부 공지사항 · 실시간 업데이트
          </p>

          {/* 게시판 탭 */}
          <div style={{ display: 'flex', gap: 4, marginTop: 18, overflow: 'auto' }}>
            {BOARDS.map((b) => (
              <button
                key={b.key}
                onClick={() => setBoard(b.key)}
                style={{
                  padding: '8px 16px',
                  fontSize: 13,
                  fontWeight: board === b.key ? 700 : 500,
                  color: board === b.key ? '#fff' : 'var(--c-text-2)',
                  background: board === b.key ? 'var(--c-primary)' : 'var(--c-bg-soft)',
                  border: 0,
                  borderRadius: 20,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                }}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 본문 */}
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* 카테고리 필터 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className="uos-btn uos-btn--sm"
                style={{
                  background: category === c ? 'var(--c-text)' : '#fff',
                  color: category === c ? '#fff' : 'var(--c-text-2)',
                  borderColor: category === c ? 'var(--c-text)' : 'var(--c-line-strong)',
                }}
              >
                {c}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 12.5, color: 'var(--c-text-3)' }}>
            <strong style={{ color: 'var(--c-text)' }} className="uos-tabular">
              {filteredNotices.length}
            </strong>
            개 공지
          </div>
        </div>

        {loading && (
          <div className="uos-card">
            <div className="uos-card__bd" style={{ textAlign: 'center', padding: 30, color: 'var(--c-text-3)' }}>
              공지 불러오는 중...
            </div>
          </div>
        )}

        {error && (
          <div className="uos-card" style={{ borderColor: '#fcc' }}>
            <div className="uos-card__bd" style={{ color: 'var(--c-danger)', fontSize: 13 }}>
              <strong>로딩 실패</strong> — {error}
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* 고정 공지 */}
            {pinned.length > 0 && (
              <div className="uos-card" style={{ background: '#fffaf0', borderColor: '#ffe7ba' }}>
                <div className="uos-card__hd" style={{ background: '#fff4e6', borderBottom: '1px solid #ffe7ba' }}>
                  <h3 style={{ fontSize: 13, color: '#c44a06' }}>📌 고정 공지</h3>
                </div>
                <div className="uos-list">
                  {pinned.map((n) => <NoticeRow key={n.id || n.title} notice={n} />)}
                </div>
              </div>
            )}

            {/* 일반 공지 */}
            {regular.length > 0 && (
              <div className="uos-card">
                <div className="uos-list">
                  {regular.map((n) => <NoticeRow key={n.id || n.title} notice={n} />)}
                </div>
              </div>
            )}

            {filteredNotices.length === 0 && (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--c-text-3)', fontSize: 13 }}>
                해당 분류의 공지가 없어요
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

function NoticeRow({ notice }) {
  const tagCls = CATEGORY_TAG[notice.category] || CATEGORY_TAG.기타
  return (
    <a
      href={notice.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div
        className="uos-list__row"
        style={{ gridTemplateColumns: '48px 1fr auto', cursor: 'pointer' }}
      >
        <span className={`uos-tag ${tagCls}`} style={{ justifyContent: 'center' }}>
          {notice.category}
        </span>
        <span className="title uos-truncate" style={{ fontSize: 13.5 }}>
          {notice.title}
        </span>
        <span style={{ fontSize: 11.5, color: 'var(--c-text-4)' }} className="uos-tabular">
          {daysAgo(notice.date)}
        </span>
      </div>
    </a>
  )
}
