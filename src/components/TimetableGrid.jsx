import { useMemo } from 'react'
import { parseClassNm } from '../utils/parseClassNm'

// 교시별 시작 시간 (시립대 기준 1교시 09:00 시작, 50분 수업)
const PERIOD_TIMES = {
  1: '09:00',
  2: '10:00',
  3: '11:00',
  4: '12:00',
  5: '13:00',
  6: '14:00',
  7: '15:00',
  8: '16:00',
  9: '17:00',
  10: '18:00',
  11: '19:00',
  12: '20:00',
  13: '21:00',
  14: '22:00',
}

const DAYS = [
  { key: 'MON', label: '월' },
  { key: 'TUE', label: '화' },
  { key: 'WED', label: '수' },
  { key: 'THU', label: '목' },
  { key: 'FRI', label: '금' },
]

// 강의 카드 색상 팔레트 (파스텔)
const COLORS = [
  'bg-blue-100 text-blue-900 border-blue-300',
  'bg-emerald-100 text-emerald-900 border-emerald-300',
  'bg-amber-100 text-amber-900 border-amber-300',
  'bg-pink-100 text-pink-900 border-pink-300',
  'bg-violet-100 text-violet-900 border-violet-300',
  'bg-orange-100 text-orange-900 border-orange-300',
  'bg-cyan-100 text-cyan-900 border-cyan-300',
  'bg-rose-100 text-rose-900 border-rose-300',
]

function colorForKey(key, index) {
  return COLORS[index % COLORS.length]
}

/**
 * 시간표 그리드
 *
 * @param {Array} courses 추가된 강의 배열 (시립대 API 응답 형식)
 * @param {function} onRemove 강의 삭제 콜백 (course) => void
 */
export default function TimetableGrid({ courses = [], onRemove, minPeriod = 1, maxPeriod = 12 }) {
  // 강의별 색상과 파싱된 블록을 미리 계산
  const placedBlocks = useMemo(() => {
    const result = []
    courses.forEach((course, index) => {
      const blocks = parseClassNm(course.CLASS_NM)
      blocks.forEach((b) => {
        result.push({
          ...b,
          course,
          color: colorForKey(course.SUBJECT_NO + course.DVCL_NO, index),
        })
      })
    })
    return result
  }, [courses])

  // 실제로 사용되는 최대 교시 (없으면 12교시까지)
  const usedMaxPeriod = useMemo(() => {
    let max = maxPeriod
    placedBlocks.forEach((b) => {
      b.periods.forEach((p) => { if (p > max) max = p })
    })
    return Math.max(maxPeriod, max)
  }, [placedBlocks, maxPeriod])

  const periods = []
  for (let i = minPeriod; i <= usedMaxPeriod; i++) periods.push(i)

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <div className="min-w-[600px]">
          {/* 헤더 */}
          <div className="grid grid-cols-[60px_repeat(5,_1fr)] border-b border-gray-200 bg-gray-50">
            <div className="py-2 text-center text-xs font-medium text-gray-400">시간</div>
            {DAYS.map((d) => (
              <div key={d.key} className="py-2 text-center text-sm font-semibold text-gray-700">
                {d.label}
              </div>
            ))}
          </div>

          {/* 시간별 행 */}
          {periods.map((period) => (
            <div
              key={period}
              className="grid grid-cols-[60px_repeat(5,_1fr)] border-b border-gray-100 last:border-b-0 min-h-[56px]"
            >
              {/* 시간 라벨 */}
              <div className="flex flex-col items-center justify-center py-1 border-r border-gray-100">
                <span className="text-xs font-semibold text-gray-700">{period}</span>
                <span className="text-[10px] text-gray-400">{PERIOD_TIMES[period] || ''}</span>
              </div>

              {/* 각 요일 셀 */}
              {DAYS.map((d) => {
                const cellBlocks = placedBlocks.filter(
                  (b) => b.day === d.key && b.periods.includes(period),
                )
                // 같은 강의가 여러 교시에 걸쳐있을 때, 첫 교시에만 카드를 렌더
                const visibleBlock = cellBlocks.find((b) => Math.min(...b.periods) === period)
                const isOccupied = cellBlocks.length > 0
                const isFirstSlot = !!visibleBlock

                if (!isOccupied) {
                  return <div key={d.key} className="border-r border-gray-100 last:border-r-0" />
                }

                if (!isFirstSlot) {
                  // 같은 강의의 연속 교시 - 빈칸으로 두되 색상 유지
                  const continuedBlock = cellBlocks[0]
                  return (
                    <div
                      key={d.key}
                      className={`border-r border-gray-100 last:border-r-0 ${continuedBlock.color} opacity-90`}
                    />
                  )
                }

                const span = visibleBlock.periods.length
                return (
                  <div
                    key={d.key}
                    className={`border-r border-gray-100 last:border-r-0 p-1.5 cursor-pointer ${visibleBlock.color} relative group transition-all`}
                    style={{ gridRow: `span ${span}` }}
                    onClick={() => onRemove && onRemove(visibleBlock.course)}
                    title="클릭하면 시간표에서 제거"
                  >
                    <div className="text-xs font-semibold leading-tight line-clamp-2">
                      {visibleBlock.course.SUBJECT_NM}
                    </div>
                    <div className="text-[10px] mt-0.5 opacity-80 line-clamp-1">
                      {visibleBlock.room}
                    </div>
                    <div className="text-[10px] opacity-70 line-clamp-1">
                      {visibleBlock.course.PROF_KOR_NM}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
