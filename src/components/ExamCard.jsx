import { Link } from 'react-router-dom'

const examTypeColors = {
  '중간고사': 'bg-blue-50 text-blue-600 border-blue-200',
  '기말고사': 'bg-purple-50 text-purple-600 border-purple-200',
  '퀴즈': 'bg-emerald-50 text-emerald-600 border-emerald-200',
  '과제': 'bg-yellow-50 text-yellow-600 border-yellow-200',
  '강의노트': 'bg-teal-50 text-teal-600 border-teal-200',
  '발표문': 'bg-orange-50 text-orange-600 border-orange-200',
  '예비레포트': 'bg-cyan-50 text-cyan-600 border-cyan-200',
  '결과레포트': 'bg-indigo-50 text-indigo-600 border-indigo-200',
  '레포트': 'bg-pink-50 text-pink-600 border-pink-200',
  '교재': 'bg-amber-50 text-amber-600 border-amber-200',
}

const buttonLabels = {
  '강의노트': '노트 보기',
  '발표문': '발표문 보기',
  '예비레포트': '레포트 보기',
  '결과레포트': '레포트 보기',
  '레포트': '레포트 보기',
  '교재': '교재 보기',
}

export default function ExamCard({ exam }) {
  const hasFile = exam.fileName && exam.fileName.length > 0
  const hasAnswer = exam.answerFileName && exam.answerFileName.length > 0
  const colorClass = examTypeColors[exam.examType] || 'bg-gray-50 text-gray-600 border-gray-200'
  const basePath = import.meta.env.BASE_URL
  const label = buttonLabels[exam.examType] || '문제 보기'

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-200 hover:shadow-sm transition-all flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <Link
          to={`/subject/${encodeURIComponent(exam.subject)}`}
          className="text-[15px] font-semibold text-gray-900 no-underline hover:text-uos-blue transition-colors leading-snug"
        >
          {exam.title || exam.subject}
        </Link>
        <span className={`text-[11px] px-2.5 py-0.5 rounded-md font-medium border shrink-0 ml-2 ${colorClass}`}>
          {exam.examType}
        </span>
      </div>

      <div className="text-sm text-gray-400 space-y-0.5 flex-1">
        {exam.professor && (
          <p className="m-0">{exam.professor} 교수</p>
        )}
        <p className="m-0">{exam.tags?.includes('기출문제') ? `${exam.year}년 ` : ''}{exam.semester === 0 ? '1학년' : `${exam.semester}학기`}</p>
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {exam.tags.map(tag => (
          <span key={tag} className="text-[11px] bg-gray-50 text-gray-500 px-2 py-0.5 rounded-md">
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-50 space-y-2">
        {hasFile ? (
          <a
            href={exam.fileName.startsWith('http') ? exam.fileName : `${basePath}exams/${exam.fileName}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-1.5 bg-[#0B1526] text-white text-sm font-medium py-2.5 rounded-xl no-underline hover:bg-[#1a2744] transition-colors"
          >
            {label}
          </a>
        ) : !hasAnswer ? (
          <div className="w-full text-center text-sm text-gray-300 py-2">
            준비 중
          </div>
        ) : null}
        {hasAnswer && (
          <a
            href={`${basePath}exams/${exam.answerFileName}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-flex items-center justify-center gap-1.5 bg-white text-[#0B1526] text-sm font-medium py-2.5 rounded-xl no-underline border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            모범답안
          </a>
        )}
      </div>
    </div>
  )
}
