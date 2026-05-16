import { useState, useRef, useEffect } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'

const subjectPrompts = {
  '수학 1': '너는 서울시립대학교 교양수학 수학1 튜터야. 단원 1.4~10.8 (지수함수, 미분, 적분, 급수, 멱급수) 범위의 질문에 답해줘. 풀이 과정을 단계별로 설명하고, 한국어로 답변해.',
  '수학 2': '너는 서울시립대학교 교양수학 수학2 튜터야. 벡터, 편미분, 중적분, 선적분 등 다변수 미적분학 질문에 답해줘. 한국어로 답변해.',
  '물리학및실험1': '너는 서울시립대학교 물리학및실험1 튜터야. 역학 실험(직선운동, 포물선운동, 마찰력, 운동량보존, 단진동, 구심력, 토크, 회전관성) 관련 질문에 답해줘. 한국어로 답변해.',
  '물리학및실험2': '너는 서울시립대학교 물리학및실험2 튜터야. 전자기학 실험(멀티미터, 등전위, 전기용량, 회로, RC회로, 유도기전력, 자기력, 교류회로, 광학) 관련 질문에 답해줘. 한국어로 답변해.',
  'C프로그래밍': '너는 서울시립대학교 C프로그래밍 튜터야. C언어 문법, 포인터, 배열, 함수, 구조체 등의 질문에 답해줘. 코드는 주석을 달아서 설명해. 한국어로 답변해.',
  '인공지능수학기초': '너는 서울시립대학교 인공지능수학기초 튜터야. 선형대수, 확률, 최적화 등 AI에 필요한 수학 질문에 답해줘. 한국어로 답변해.',
}

const defaultPrompt = '너는 서울시립대학교 자유전공학부 학생들을 위한 AI 튜터야. 학생들의 공부를 도와줘. 한국어로 답변해.'

export default function AiChat({ subject }) {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '')
  const [showKeyInput, setShowKeyInput] = useState(!localStorage.getItem('gemini_api_key'))
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const chatEndRef = useRef(null)
  const fileInputRef = useRef(null)

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setImage(file)
    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result)
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setImage(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const saveKey = () => {
    localStorage.setItem('gemini_api_key', apiKey)
    setShowKeyInput(false)
  }

  const fileToBase64 = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result.split(',')[1])
      reader.readAsDataURL(file)
    })
  }

  const sendMessage = async () => {
    if ((!input.trim() && !image) || loading) return

    const userMsg = input.trim()
    const currentImage = image
    const currentPreview = imagePreview
    setInput('')
    removeImage()
    setMessages(prev => [...prev, { role: 'user', text: userMsg, image: currentPreview }])
    setLoading(true)

    try {
      const genAI = new GoogleGenerativeAI(apiKey)
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

      const systemPrompt = subjectPrompts[subject] || defaultPrompt

      const parts = []
      if (currentImage) {
        const base64 = await fileToBase64(currentImage)
        parts.push({ inlineData: { data: base64, mimeType: currentImage.type } })
      }
      parts.push({ text: userMsg || '이 문제를 풀어줘. 단계별로 자세히 설명해줘.' })

      const history = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text || '(이미지)' }],
      }))

      const chat = model.startChat({
        history: [
          { role: 'user', parts: [{ text: systemPrompt }] },
          { role: 'model', parts: [{ text: '네, 알겠습니다. 도와드리겠습니다!' }] },
          ...history,
        ],
      })

      const result = await chat.sendMessage(parts)
      const response = result.response.text()

      setMessages(prev => [...prev, { role: 'ai', text: response }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: `오류: ${err.message}. API 키를 확인해주세요.` }])
    }
    setLoading(false)
  }

  if (showKeyInput) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 mt-6">
        <h3 className="text-base font-semibold text-gray-900 mb-2">AI 튜터</h3>
        <p className="text-sm text-gray-500 mb-3">
          Gemini API 키를 입력하면 AI와 함께 공부할 수 있어요.
        </p>
        <div className="text-xs text-gray-400 bg-gray-50 rounded-xl p-4 mb-4 space-y-1.5">
          <p className="m-0 font-medium text-gray-500">API 키 발급 방법:</p>
          <p className="m-0">1. <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-uos-blue no-underline hover:underline">Google AI Studio</a> 접속 (Google 계정 로그인)</p>
          <p className="m-0">2. "API 키 만들기" 클릭</p>
          <p className="m-0">3. 생성된 키를 아래에 붙여넣기</p>
          <p className="m-0 text-gray-300">* 키는 본인 브라우저에만 저장되며 외부로 전송되지 않습니다.</p>
        </div>
        <div className="flex gap-2">
          <input
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="API 키 입력..."
            className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-uos-blue/30"
          />
          <button
            onClick={saveKey}
            disabled={!apiKey}
            className="px-4 py-2 bg-[#0B1526] text-white text-sm font-medium rounded-xl cursor-pointer disabled:opacity-40 border-none"
          >
            저장
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 mt-6 flex flex-col" style={{ height: '500px' }}>
      {/* Header */}
      <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 m-0">
          AI 튜터 {subject && `- ${subject}`}
        </h3>
        <button
          onClick={() => { setShowKeyInput(true); setMessages([]) }}
          className="text-xs text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer"
        >
          API 키 변경
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 text-sm py-10">
            <p className="mb-2">질문을 입력해보세요!</p>
            <p className="text-xs text-gray-300">예: "미분의 연쇄법칙 설명해줘"</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
              msg.role === 'user'
                ? 'bg-[#0B1526] text-white rounded-br-md'
                : 'bg-gray-50 text-gray-700 rounded-bl-md'
            }`}>
              {msg.image && (
                <img src={msg.image} alt="첨부 이미지" className="max-w-full rounded-lg mb-2" />
              )}
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-50 text-gray-400 px-4 py-2.5 rounded-2xl rounded-bl-md text-sm">
              생각 중...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-100">
        {imagePreview && (
          <div className="mb-2 relative inline-block">
            <img src={imagePreview} alt="미리보기" className="h-20 rounded-lg border border-gray-200" />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center cursor-pointer border-none leading-none"
            >
              ×
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-2.5 bg-gray-100 text-gray-600 text-sm rounded-xl cursor-pointer border border-gray-200 hover:bg-gray-200 transition-colors"
            title="이미지 첨부"
          >
            📷
          </button>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="질문을 입력하세요..."
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-uos-blue/30"
          />
          <button
            onClick={sendMessage}
            disabled={loading || (!input.trim() && !image)}
            className="px-4 py-2.5 bg-[#0B1526] text-white text-sm font-medium rounded-xl cursor-pointer disabled:opacity-40 border-none"
          >
            전송
          </button>
        </div>
      </div>
    </div>
  )
}
