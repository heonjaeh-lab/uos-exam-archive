export default function FilterBar({ filters, setFilters, subjects, examTypes, years }) {
  const handleChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const selectClass =
    'bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-uos-blue/30 focus:border-uos-blue'

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <select
        className={selectClass}
        value={filters.subject}
        onChange={e => handleChange('subject', e.target.value)}
      >
        <option value="">전체 과목</option>
        {subjects.map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <select
        className={selectClass}
        value={filters.examType}
        onChange={e => handleChange('examType', e.target.value)}
      >
        <option value="">전체 유형</option>
        {examTypes.map(t => (
          <option key={t} value={t}>{t}</option>
        ))}
      </select>

      <select
        className={selectClass}
        value={filters.year}
        onChange={e => handleChange('year', e.target.value)}
      >
        <option value="">전체 연도</option>
        {years.map(y => (
          <option key={y} value={y}>{y}년</option>
        ))}
      </select>

      {(filters.subject || filters.examType || filters.year || filters.search) && (
        <button
          onClick={() => setFilters({ subject: '', examType: '', year: '', search: '' })}
          className="text-sm text-gray-500 hover:text-red-500 transition-colors cursor-pointer bg-transparent border-none"
        >
          ✕ 필터 초기화
        </button>
      )}
    </div>
  )
}
