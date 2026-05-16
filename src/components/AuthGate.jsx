import { useState, useEffect } from 'react'
import { auth } from '../firebase'
import {
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth'

const UOS_DOMAIN = '@uos.ac.kr'

export default function AuthGate({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
    })
    return unsub
  }, [])

  useEffect(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      let emailFromStorage = localStorage.getItem('emailForSignIn')
      if (!emailFromStorage) {
        emailFromStorage = window.prompt('인증에 사용한 이메일을 입력해주세요:')
      }
      if (emailFromStorage) {
        signInWithEmailLink(auth, emailFromStorage, window.location.href)
          .then(() => {
            localStorage.removeItem('emailForSignIn')
            window.history.replaceState(null, '', window.location.pathname + window.location.hash)
          })
          .catch((err) => setError('인증 실패: ' + err.message))
      }
    }
  }, [])

  const handleSendLink = async () => {
    setError('')
    if (!email.trim()) {
      setError('포털 아이디를 입력해주세요.')
      return
    }

    const fullEmail = email.trim() + UOS_DOMAIN

    try {
      await sendSignInLinkToEmail(auth, fullEmail, {
        url: window.location.href,
        handleCodeInApp: true,
      })
      localStorage.setItem('emailForSignIn', fullEmail)
      setSent(true)
    } catch (err) {
      setError('메일 발송 실패: ' + err.message)
    }
  }

  const handleLogout = () => signOut(auth)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F6FA] flex items-center justify-center">
        <div className="w-12 h-12 border-2 border-gray-200 border-t-[#0B1526] rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#F5F6FA] flex items-center justify-center px-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-100 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-100 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 text-center max-w-sm w-full">
          {/* Logo */}
          <img
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt="Liberal & Cross"
            className="w-24 h-24 mx-auto mb-6 rounded-full"
          />

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-1 tracking-tight">
            UOS Archive
          </h1>
          <p className="text-sm text-gray-400 mb-8">
            서울시립대학교 자유융합대학
          </p>

          {/* Login Card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            {!sent ? (
              <>
                <p className="text-sm text-gray-500 mb-4">시립대 포털 아이디로 인증해주세요</p>
                <div className="flex items-center border border-gray-200 rounded-xl mb-3 focus-within:ring-2 focus-within:ring-[#0B1526]/20">
                  <input
                    type="text"
                    value={email}
                    onChange={e => setEmail(e.target.value.replace(/@.*$/, ''))}
                    onKeyDown={e => e.key === 'Enter' && handleSendLink()}
                    placeholder="포털 아이디"
                    className="flex-1 px-4 py-3 text-sm text-gray-900 placeholder-gray-300 focus:outline-none rounded-l-xl border-none bg-transparent"
                  />
                  <span className="text-sm text-gray-400 pr-4">@uos.ac.kr</span>
                </div>
                <button
                  onClick={handleSendLink}
                  disabled={!email}
                  className="w-full py-3 bg-[#0B1526] text-white text-sm font-semibold rounded-xl cursor-pointer disabled:opacity-30 border-none hover:bg-[#1a2744] transition-colors"
                >
                  인증 메일 받기
                </button>
              </>
            ) : (
              <div className="text-sm">
                <div className="bg-green-50 text-green-700 px-4 py-3 rounded-xl mb-4">
                  인증 메일을 발송했습니다!
                </div>
                <p className="text-gray-500">
                  <span className="text-gray-900 font-medium">{email}@uos.ac.kr</span>
                  <br />메일함에서 링크를 클릭해주세요.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-4 text-xs text-gray-400 hover:text-gray-600 bg-transparent border-none cursor-pointer"
                >
                  다른 아이디로 시도
                </button>
              </div>
            )}

            {error && (
              <p className="mt-3 text-xs text-red-500">{error}</p>
            )}
          </div>

          {/* Footer */}
          <p className="mt-8 text-[11px] text-gray-300">
            자유전공학부 학생 전용 서비스
          </p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {children}
      <button
        onClick={handleLogout}
        className="fixed bottom-4 right-4 bg-white text-gray-400 text-xs px-3 py-1.5 rounded-lg border border-gray-200 cursor-pointer hover:text-gray-600 hover:border-gray-300 transition-colors z-50"
      >
        로그아웃 ({user.email?.split('@')[0]})
      </button>
    </div>
  )
}
