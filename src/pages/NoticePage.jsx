import { useState, useEffect, useMemo } from 'react'
import { fetchNoticeBoard } from '../api/notice'

const BOARDS = [
  { key: 'academic', label: '학부공지' },
  { key: 'general', label: '행사공지' },
]

const CATEGORIES = ['전체', '학사', '일반', '장학']

const CATEGORY_COLORS = {
  학사: 'bg-blue-50 text-blue-700 border-blue-200',
  일반: 'bg-gray-50 text-gray-700 border-gray-200',
  장학: 'bg-amber-50 text-amber-700 border-amber-200',
  기타: 'bg-gray-50 text-gray-600 border-gray-200',
}

function daysAgo(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const diff = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return '오늘'
  if (diff === 1) return '어제'
  if (diff < 7) return `${diff}일 전`
  if (diff < 30) return `${Math.floor(diff / 7)}주 전`
  return dateStr
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
      .then((res) => {
        if (!cancelled) setData(res)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [board])

  const filteredNotices = useMemo(() => {
    if (!data?.notices) return []
    if (category === '전체') return data.notices
    return data.notices.filter((n) => n.category === category)
  }, [data, category])

  const pinned = filteredNotices.filter((n) => n.pinned)
  const regular = filteredNotices.filter((n) => !n.pinned)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">학부 공지</h2>
        <p className="text-sm text-gray-500 mt-1">
          자유전공학부 공지사항 - 실시간 업데이트
        </p>
      </div>

      {/* 게시판 탭 */}
      <div className="flex gap-2">
        {BOARDS.map((b) => (
          <button
            key={b.key}
            onClick={() => setBoard(b.key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg border transition-all cursor-pointer ${
              board === b.key
                ? 'bg-uos-blue text-white border-uos-blue'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            {b.label}
          </button>
        ))}
      </div>

      {/* 카테고리 필터 */}
      <div className="flex gap-1.5 flex-wrap">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3 py-1 text-xs rounded-full border transition-all cursor-pointer ${
              category === c
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading && (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-sm text-gray-500">
          공지 불러오는 중...
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-sm text-rose-700">
          {error}
        </div>
      )}

      {!loading && !error && data && (
        <>
          {/* 고정 공지 */}
          {pinned.length > 0 && (
            <div className="bg-amber-50/40 border border-amber-200 rounded-2xl overflow-hidden">
              <div className="px-4 py-2 text-xs font-semibold text-amber-800 border-b border-amber-200 bg-amber-50">
                📌 고정 공지
              </div>
              <div className="divide-y divide-amber-100">
                {pinned.map((n) => (
                  <NoticeRow key={n.id || n.title} notice={n} />
                ))}
              </div>
            </div>
          )}

          {/* 일반 공지 */}
          {regular.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="divide-y divide-gray-100">
                {regular.map((n) => (
                  <NoticeRow key={n.id || n.title} notice={n} />
                ))}
              </div>
            </div>
          )}

          {filteredNotices.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">
              해당 분류의 공지가 없어요
            </div>
          )}
        </>
      )}
    </div>
  )
}

function NoticeRow({ notice }) {
  const categoryClass = CATEGORY_COLORS[notice.category] || CATEGORY_COLORS.기타
  return (
    <a
      href={notice.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors no-underline"
    >
      <span
        className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${categoryClass}`}
      >
        {notice.category}
      </span>
      <span className="flex-1 min-w-0 text-sm text-gray-900 truncate">
        {notice.title}
      </span>
      <span className="shrink-0 text-xs text-gray-400 hidden sm:block">
        {daysAgo(notice.date)}
      </span>
      {notice.views !== null && (
        <span className="shrink-0 text-xs text-gray-300 hidden md:block">
          {notice.views}회
        </span>
      )}
    </a>
  )
}
