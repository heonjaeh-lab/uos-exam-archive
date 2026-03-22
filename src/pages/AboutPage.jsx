export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">소개</h2>

      <div className="space-y-5">
        <section className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-3">이 사이트는?</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            서울시립대학교 자유융합대학 자유전공학부 학생들을 위한 족보 아카이브입니다.
            선배들이 정리한 기출문제, 강의노트, 퀴즈, 레포트 등을 과목별로 쉽게 찾아볼 수 있습니다.
          </p>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-1">등록된 과목</h3>
          <p className="text-xs text-gray-400 mb-3">과목은 계속 추가 중입니다.</p>
          <div className="flex flex-wrap gap-2">
            {['수학 1', '수학 2', '물리학및실험1', '물리학및실험2', '고전과함께하는비판적토론', '대학영어(S)', '대학영어(W)', '인공지능수학기초', 'C프로그래밍', '인간과환경', '교재모음'].map(subject => (
              <span key={subject} className="text-xs bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg border border-gray-100">
                {subject}
              </span>
            ))}
          </div>
        </section>

        <section className="bg-[#FFF8F0] rounded-2xl p-6 border border-orange-100">
          <h3 className="text-base font-semibold text-gray-900 mb-3">주의사항</h3>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex gap-2">
              <span className="text-orange-400 shrink-0">&#8226;</span>
              <span>본 사이트는 <strong>자유전공학부 학생 전용</strong>입니다. 타 학부/학과 학생에게 공유하지 마세요.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-orange-400 shrink-0">&#8226;</span>
              <span>저작권에 문제가 있는 자료는 삭제될 수 있습니다.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-orange-400 shrink-0">&#8226;</span>
              <span>교수님의 요청이 있을 경우 해당 자료는 즉시 삭제됩니다.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-orange-400 shrink-0">&#8226;</span>
              <span>상업적 목적으로 사용하지 마세요.</span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  )
}
