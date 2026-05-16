import { useState, useEffect, useMemo } from 'react'
import { fetchCafeterias } from '../api/cafeteria'

const MEAL_INFO = [
  { key: 'breakfast', label: '조식', time: '07:30 — 09:30' },
  { key: 'lunch', label: '중식', time: '11:30 — 14:00' },
  { key: 'dinner', label: '석식', time: '17:00 — 18:30' },
]

const DAYS = ['일', '월', '화', '수', '목', '금', '토']

const SVG = ({ children, cls = '' }) => (
  <svg viewBox="0 0 24 24" className={`uos-icon ${cls}`}>{children}</svg>
)
const Icon = {
  chevL: (p) => <SVG {...p}><polyline points="15 6 9 12 15 18"/></SVG>,
  chevR: (p) => <SVG {...p}><polyline points="9 6 15 12 9 18"/></SVG>,
}

function formatDateLabel(date) {
  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${DAYS[date.getDay()]})`
}

function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

export default function CafeteriaPage() {
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchCafeterias(selectedDate)
      .then((res) => !cancelled && setData(res))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [selectedDate])

  const isToday = useMemo(() => {
    const today = new Date()
    return (
      selectedDate.getFullYear() === today.getFullYear() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getDate() === today.getDate()
    )
  }, [selectedDate])

  return (
    <div style={{ margin: '-24px -16px 0' }}>
      {/* 헤더 섹션 */}
      <section style={{ background: '#fff', borderBottom: '1px solid var(--c-line)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '20px 16px 16px' }}>
          <div className="uos-crumbs" style={{ marginBottom: 10 }}>
            <a href="#/">홈</a>
            <span className="uos-crumbs__sep">›</span>
            <span className="uos-crumbs__current">학식</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>학식 메뉴</h1>
              <div style={{ marginTop: 6, fontSize: 13, color: 'var(--c-text-3)' }}>
                <strong style={{ color: 'var(--c-text)' }}>{formatDateLabel(selectedDate)}</strong> · 4개 식당
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="uos-pagi">
                <button onClick={() => setSelectedDate(addDays(selectedDate, -1))} aria-label="어제">
                  <Icon.chevL cls="uos-icon--sm"/>
                </button>
                <button style={{ padding: '0 14px', fontWeight: 600 }}>
                  {formatDateLabel(selectedDate)}
                </button>
                <button onClick={() => setSelectedDate(addDays(selectedDate, 1))} aria-label="내일">
                  <Icon.chevR cls="uos-icon--sm"/>
                </button>
              </div>
              {!isToday && (
                <button onClick={() => setSelectedDate(new Date())} className="uos-btn uos-btn--sm">
                  오늘로
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 메인 */}
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 16px' }}>
        {loading && (
          <div className="uos-card">
            <div className="uos-card__bd" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--c-text-3)' }}>
              학식 메뉴 불러오는 중...
            </div>
          </div>
        )}

        {error && (
          <div className="uos-card" style={{ borderColor: '#fcc' }}>
            <div className="uos-card__bd" style={{ color: 'var(--c-danger)', fontSize: 13 }}>
              <strong>로딩 실패</strong> — {error}
              <div style={{ marginTop: 4, fontSize: 11.5, color: 'var(--c-text-3)' }}>
                백엔드 서버가 깨어나는 중일 수 있어요. 30초 후 다시 시도해주세요.
              </div>
            </div>
          </div>
        )}

        {!loading && !error && data?.restaurants && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {data.restaurants.map((r) => (
              <RestaurantCard key={r.code} restaurant={r} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function RestaurantCard({ restaurant }) {
  const { name, shortName, meals, empty, error } = restaurant
  const hasAnyMeal = meals && (meals.breakfast || meals.lunch || meals.dinner)

  return (
    <div className="uos-card" style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--c-line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em' }}>
            {shortName || name}
          </h3>
          {hasAnyMeal ? (
            <span className="uos-tag uos-tag--success">운영중</span>
          ) : (
            <span className="uos-tag uos-tag--outline">미운영</span>
          )}
        </div>
        {shortName && name !== shortName && (
          <div style={{ fontSize: 11.5, color: 'var(--c-text-3)', marginTop: 3 }}>{name}</div>
        )}
      </div>

      <div style={{ flex: 1 }}>
        {error ? (
          <div style={{ padding: 18, fontSize: 13, color: 'var(--c-danger)' }}>⚠️ {error}</div>
        ) : !hasAnyMeal ? (
          <div style={{ padding: '28px 18px', textAlign: 'center', color: 'var(--c-text-3)', fontSize: 13 }}>
            🍽️ 이 날은 메뉴가 등록되지 않았어요
          </div>
        ) : (
          MEAL_INFO.map((meal) => {
            const menu = meals?.[meal.key]
            const isMain = meal.key === 'lunch' && menu
            return (
              <div
                key={meal.key}
                style={{
                  padding: '12px 18px',
                  borderTop: '1px solid var(--c-line)',
                  background: isMain ? 'var(--c-primary-50)' : 'transparent',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 6 }}>
                  <span
                    className={`uos-tag ${isMain ? 'uos-tag--primary' : ''}`}
                    style={{ minWidth: 38, justifyContent: 'center' }}
                  >
                    {meal.label}
                  </span>
                  <span style={{ fontSize: 11, color: 'var(--c-text-4)' }} className="uos-tabular">
                    {meal.time}
                  </span>
                </div>
                {menu ? (
                  <div
                    style={{
                      fontSize: 13.5,
                      color: 'var(--c-text)',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-line',
                      paddingLeft: 4,
                    }}
                  >
                    {menu}
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: 'var(--c-text-4)', paddingLeft: 4 }}>메뉴 없음</div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
