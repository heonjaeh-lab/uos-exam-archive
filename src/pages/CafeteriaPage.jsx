import { useState, useEffect, useMemo } from 'react'
import { fetchCafeterias } from '../api/cafeteria'

// 끼니별 아이콘 + 시간
const MEAL_INFO = [
  { key: 'breakfast', label: '조식', icon: '🌅', time: '08:00 - 09:30' },
  { key: 'lunch', label: '중식', icon: '🍱', time: '11:30 - 14:00' },
  { key: 'dinner', label: '석식', icon: '🌙', time: '17:00 - 18:30' },
]

function formatDateLabel(date) {
  const days = ['일', '월', '화', '수', '목', '금', '토']
  const yyyy = date.getFullYear()
  const mm = date.getMonth() + 1
  const dd = date.getDate()
  return `${yyyy}.${mm}.${dd} (${days[date.getDay()]})`
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
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">학식</h2>
        <p className="text-sm text-gray-500 mt-1">
          시립대 공식 학식 메뉴를 실시간으로
        </p>
      </div>

      {/* 날짜 선택 */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 flex items-center justify-between">
        <button
          onClick={() => setSelectedDate(addDays(selectedDate, -1))}
          className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg border-none bg-transparent cursor-pointer transition-colors"
        >
          ← 어제
        </button>
        <div className="text-center">
          <div className="text-lg font-semibold text-gray-900">
            {formatDateLabel(selectedDate)}
          </div>
          {!isToday && (
            <button
              onClick={() => setSelectedDate(new Date())}
              className="text-xs text-uos-blue hover:underline bg-transparent border-none cursor-pointer mt-0.5"
            >
              오늘로 돌아가기
            </button>
          )}
        </div>
        <button
          onClick={() => setSelectedDate(addDays(selectedDate, 1))}
          className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg border-none bg-transparent cursor-pointer transition-colors"
        >
          내일 →
        </button>
      </div>

      {/* 로딩 / 에러 */}
      {loading && (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-sm text-gray-500">
          학식 메뉴 불러오는 중...
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-sm text-rose-700">
          <strong>학식 로딩 실패</strong> — {error}
          <div className="text-xs text-rose-500 mt-1">
            (백엔드 서버가 깨어나는 중일 수 있어요. 30초 후 새로고침해주세요)
          </div>
        </div>
      )}

      {/* 식당별 카드 */}
      {!loading && !error && data?.restaurants && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {data.restaurants.map((r) => (
            <RestaurantCard key={r.code} restaurant={r} />
          ))}
        </div>
      )}
    </div>
  )
}

function RestaurantCard({ restaurant }) {
  const { name, meals, empty, error } = restaurant
  const hasAnyMeal = meals && (meals.breakfast || meals.lunch || meals.dinner)

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-3 border-b border-gray-100 bg-gradient-to-r from-uos-light to-white">
        <h3 className="text-base font-semibold text-gray-900">{name}</h3>
      </div>

      <div className="divide-y divide-gray-100">
        {error ? (
          <div className="p-5 text-sm text-rose-600">⚠️ {error}</div>
        ) : !hasAnyMeal ? (
          <div className="p-8 text-center text-sm text-gray-400">
            🍽️ 이 날은 운영하지 않거나 메뉴가 등록되지 않았어요
          </div>
        ) : (
          MEAL_INFO.map((meal) => {
            const menu = meals?.[meal.key]
            return (
              <div key={meal.key} className="p-4 flex items-start gap-3">
                <div className="text-2xl shrink-0">{meal.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <span className="font-semibold text-gray-900 text-sm">
                      {meal.label}
                    </span>
                    <span className="text-[10px] text-gray-400">{meal.time}</span>
                  </div>
                  {menu ? (
                    <div className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                      {menu}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-300">메뉴 없음</div>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
