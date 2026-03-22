import { useParams, Link } from 'react-router-dom'
import examsData from '../data/exams.json'
import ExamCard from '../components/ExamCard'

export default function SubjectPage() {
  const { subjectName } = useParams()
  const decodedName = decodeURIComponent(subjectName)
  const subjectExams = examsData
    .filter(e => e.subject === decodedName)
    .sort((a, b) => b.year - a.year || b.semester - a.semester)

  return (
    <div>
      <Link to="/" className="text-sm text-gray-500 no-underline hover:text-uos-blue mb-4 inline-block">
        ← 전체 목록으로
      </Link>

      <h2 className="text-2xl font-bold text-gray-900 mb-2">{decodedName}</h2>
      <p className="text-gray-500 mb-6">
        총 {subjectExams.length}개의 족보가 등록되어 있습니다
      </p>

      {subjectExams.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjectExams.map(exam => (
            <ExamCard key={exam.id} exam={exam} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <div className="text-4xl mb-3">📭</div>
          <p>아직 등록된 족보가 없습니다</p>
        </div>
      )}
    </div>
  )
}
