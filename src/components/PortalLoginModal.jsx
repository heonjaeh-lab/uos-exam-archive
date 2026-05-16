import { useState, useEffect } from 'react'
import { loginAndFetchTimetable, pingBackend } from '../api/uosPortal'

/**
 * 시립대 포털 로그인 모달
 *
 * @param {boolean} open 모달 열림 여부
 * @param {function} onClose 닫기 콜백
 * @param {function} onSuccess (timetableData) => void
 */
export default function PortalLoginModal({ open, onClose, onSuccess }) {
  const [userId, setUserId] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [serverWarming, setServerWarming] = useState(false)

  // 모달 열릴 때 백엔드 서버 미리 깨우기
  useEffect(() => {
    if (open) {
      setServerWarming(true)
      pingBackend().finally(() => setServerWarming(false))
    } else {
      // 모달 닫힐 때 비밀번호 즉시 비우기 (메모리에 남기지 않음)
      setPassword('')
      setError('')
    }
  }, [open])

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!userId || !password) {
      setError('학번과 비밀번호를 모두 입력해주세요.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const result = await loginAndFetchTimetable(userId, password)
      if (result.success) {
        onSuccess?.(result.data)
        setPassword('') // 즉시 비밀번호 제거
        onClose?.()
      } else {
        setError(result.error || '로그인 실패')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
      onClick={(e) => e.target === e.currentTarget && !loading && onClose?.()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">포털 자동 연동</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              시립대 포털 계정으로 시간표를 자동으로 가져와요
            </p>
          </div>
          {!loading && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer text-2xl leading-none"
            >
              ×
            </button>
          )}
        </div>

        {/* 보안 안내 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4 text-xs text-blue-800">
          <div className="font-semibold mb-1">🔒 비밀번호는 저장되지 않아요</div>
          <ul className="space-y-0.5 list-disc list-inside text-blue-700">
            <li>시립대 포털 로그인에만 일회성으로 사용</li>
            <li>요청 후 메모리에서 즉시 삭제</li>
            <li>HTTPS로 암호화 전송</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">학번</label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value.replace(/\D/g, ''))}
              placeholder="예: 20251234"
              autoComplete="username"
              disabled={loading}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-uos-blue disabled:bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              포털 비밀번호
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="시립대 포털 비밀번호"
              autoComplete="current-password"
              disabled={loading}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-uos-blue disabled:bg-gray-50"
            />
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 text-xs text-rose-700 whitespace-pre-line">
              {error}
            </div>
          )}

          {serverWarming && !loading && (
            <div className="text-xs text-gray-400 text-center">
              서버 준비 중... (첫 사용 시 30초 정도 걸려요)
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !userId || !password}
            className="w-full py-3 bg-uos-blue text-white text-sm font-semibold rounded-lg hover:bg-uos-dark disabled:opacity-50 disabled:cursor-not-allowed border-none cursor-pointer transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>포털 로그인 중... (10~30초)</span>
              </>
            ) : (
              <span>시간표 가져오기</span>
            )}
          </button>
        </form>

        <p className="mt-4 text-[10px] text-gray-400 text-center leading-relaxed">
          이 서비스는 시립대 공식 서비스가 아닙니다.<br />
          입력한 정보는 시립대 포털 인증에만 사용되며 저장되지 않습니다.
        </p>
      </div>
    </div>
  )
}
