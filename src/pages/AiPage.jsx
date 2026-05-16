import { useState } from 'react'
import AiChat from '../components/AiChat'

const subjects = [
  '수학 1', '수학 2', '물리학및실험1', '물리학및실험2',
  'C프로그래밍', '인공지능수학기초',
]

export default function AiPage() {
  const [selected, setSelected] = useState('')

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">AI 튜터</h2>
      <p className="text-sm text-gray-400 text-center mb-6">과목을 선택하고 AI에게 질문해보세요</p>

      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {subjects.map(s => (
          <button
            key={s}
            onClick={() => setSelected(s)}
            className={`text-xs px-3 py-1.5 rounded-lg border cursor-pointer transition-colors ${
              selected === s
                ? 'bg-[#0B1526] text-white border-[#0B1526]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <AiChat subject={selected} />
    </div>
  )
}
