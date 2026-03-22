import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import examsData from '../data/exams.json'
import ExamCard from '../components/ExamCard'
import FilterBar from '../components/FilterBar'
import SearchBar from '../components/SearchBar'
import { matchesSearch } from '../data/subjectAliases'

const subjects = [...new Set(examsData.map(e => e.subject))].sort()
const examTypes = [...new Set(examsData.map(e => e.examType))].sort()
const years = [...new Set(examsData.map(e => e.year))].sort((a, b) => b - a)

export default function HomePage() {
  const [filters, setFilters] = useState({
    subject: '',
    examType: '',
    year: '',
    search: '',
  })

  const filteredExams = useMemo(() => {
    return examsData.filter(exam => {
      if (filters.subject && exam.subject !== filters.subject) return false
      if (filters.examType && exam.examType !== filters.examType) return false
      if (filters.year && exam.year !== Number(filters.year)) return false
      if (filters.search) {
        if (!matchesSearch(exam, filters.search)) return false
      }
      return true
    })
  }, [filters])

  return (
    <div>
      {/* Title */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        족보 아카이브
      </h2>

      {/* Filter Area */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
        <div className="space-y-4">
          <SearchBar value={filters.search} onChange={v => setFilters(prev => ({ ...prev, search: v }))} subjects={subjects} />
          <div className="flex flex-wrap gap-3 items-center justify-center">
            <FilterBar
              filters={filters}
              setFilters={setFilters}
              subjects={subjects}
              examTypes={examTypes}
              years={years}
            />
          </div>
        </div>
      </div>

      {/* Subject Quick Links */}
      <div className="flex flex-wrap gap-2 mb-6">
        {subjects.map(subject => (
          <Link
            key={subject}
            to={`/subject/${encodeURIComponent(subject)}`}
            className="text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg no-underline hover:bg-uos-blue hover:text-white hover:border-uos-blue transition-colors"
          >
            {subject}
          </Link>
        ))}
      </div>

      {/* Results Count */}
      <div className="text-sm text-gray-500 mb-4">
        총 <span className="font-semibold text-gray-700">{filteredExams.length}</span>개의 자료
      </div>

      {/* Exam Cards Grid */}
      {filteredExams.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExams.map(exam => (
            <ExamCard key={exam.id} exam={exam} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">🔍</div>
          <p>조회된 자료가 없습니다</p>
        </div>
      )}
    </div>
  )
}
