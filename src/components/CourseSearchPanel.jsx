import { useState, useMemo } from 'react'

/**
 * 강의 검색/필터 패널
 *
 * @param {Array} allCourses 시간표 API에서 받은 모든 강의
 * @param {Array} addedCourses 이미 추가된 강의들
 * @param {function} onAdd 강의 추가 콜백
 */
export default function CourseSearchPanel({ allCourses = [], addedCourses = [], onAdd }) {
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [divFilter, setDivFilter] = useState('')

  // 학과 / 과목구분 목록
  const departments = useMemo(() => {
    return [...new Set(allCourses.map((c) => c.SUB_DEPT))].filter(Boolean).sort()
  }, [allCourses])

  const divisions = useMemo(() => {
    return [...new Set(allCourses.map((c) => c.SUBJECT_DIV))].filter(Boolean).sort()
  }, [allCourses])

  // 이미 추가된 강의 키 집합 (중복 방지)
  const addedKeys = useMemo(() => {
    return new Set(addedCourses.map((c) => `${c.SUBJECT_NO}-${c.DVCL_NO}`))
  }, [addedCourses])

  // 필터링된 강의 목록 (최대 50개만 표시 - 성능)
  const filtered = useMemo(() => {
    if (!search && !deptFilter && !divFilter) return []
    const lower = search.trim().toLowerCase()
    const results = allCourses.filter((c) => {
      if (lower) {
        const hay = `${c.SUBJECT_NM} ${c.PROF_KOR_NM} ${c.SUBJECT_NO}`.toLowerCase()
        if (!hay.includes(lower)) return false
      }
      if (deptFilter && c.SUB_DEPT !== deptFilter) return false
      if (divFilter && c.SUBJECT_DIV !== divFilter) return false
      return true
    })
    return results.slice(0, 100)
  }, [allCourses, search, deptFilter, divFilter])

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <h3 className="text-base font-semibold text-gray-900 mb-4">강의 검색</h3>

      {/* 검색바 */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="과목명, 교수명, 학수번호로 검색"
        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-uos-blue mb-3"
      />

      {/* 필터 */}
      <div className="flex flex-wrap gap-2 mb-4">
        <select
          value={divFilter}
          onChange={(e) => setDivFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-none focus:border-uos-blue"
        >
          <option value="">전체 구분</option>
          {divisions.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-xs text-gray-700 focus:outline-none focus:border-uos-blue flex-1 min-w-[140px]"
        >
          <option value="">전체 학과</option>
          {departments.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      {/* 결과 카운트 */}
      <div className="text-xs text-gray-500 mb-2">
        {(!search && !deptFilter && !divFilter)
          ? '검색어 또는 필터를 입력하세요'
          : `${filtered.length}개 결과${filtered.length === 100 ? ' (100개까지만 표시)' : ''}`}
      </div>

      {/* 결과 리스트 */}
      <div className="space-y-2 max-h-[480px] overflow-y-auto">
        {filtered.map((c) => {
          const key = `${c.SUBJECT_NO}-${c.DVCL_NO}`
          const alreadyAdded = addedKeys.has(key)
          return (
            <div
              key={key}
              className={`border rounded-lg p-3 text-sm transition-all ${
                alreadyAdded
                  ? 'border-gray-200 bg-gray-50 opacity-60'
                  : 'border-gray-200 hover:border-uos-blue hover:bg-uos-light/40 cursor-pointer'
              }`}
              onClick={() => !alreadyAdded && onAdd && onAdd(c)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">{c.SUBJECT_NM}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {c.PROF_KOR_NM} · {c.SUB_DEPT} · {c.CREDIT}학점
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    {c.CLASS_NM || '시간 미정'} · 분반 {c.DVCL_NO}
                  </div>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${
                  c.SUBJECT_DIV?.includes('필수') ? 'bg-rose-50 text-rose-700' : 'bg-blue-50 text-blue-700'
                }`}>
                  {c.SUBJECT_DIV}
                </span>
              </div>
              {alreadyAdded && (
                <div className="text-[10px] text-gray-400 mt-1">이미 추가됨</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
