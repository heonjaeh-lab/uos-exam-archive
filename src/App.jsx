import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import SubjectPage from './pages/SubjectPage'
import AboutPage from './pages/AboutPage'
import TimetablePage from './pages/TimetablePage'
import CafeteriaPage from './pages/CafeteriaPage'
import NoticePage from './pages/NoticePage'
import ArchivePage from './pages/ArchivePage'
import ExamDetailPage from './pages/ExamDetailPage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'
import GpaPage from './pages/GpaPage'
import ShareViewPage from './pages/ShareViewPage'
import RegistrationHelperPage from './pages/RegistrationHelperPage'
import { pingBackend } from './api/uosPortal'

function App() {
  // 사이트 진입 직후 백엔드 깨우기 (Render 무료 플랜 cold start 대비).
  // 로그인 모달은 열 때만 깨워서 5-10초밖에 못 줄였음.
  // 사이트 진입 시점에 미리 깨우면 사용자가 메뉴 둘러보는 동안 warmup 완료.
  useEffect(() => {
    pingBackend().catch(() => {})
  }, [])

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/timetable" element={<TimetablePage />} />
        <Route path="/cafeteria" element={<CafeteriaPage />} />
        <Route path="/notice" element={<NoticePage />} />
        <Route path="/archive" element={<ArchivePage />} />
        <Route path="/exam/:id" element={<ExamDetailPage />} />
        <Route path="/subject/:subjectName" element={<SubjectPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/gpa" element={<GpaPage />} />
        <Route path="/share/:shareId" element={<ShareViewPage />} />
        <Route path="/registration" element={<RegistrationHelperPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </Layout>
  )
}

export default App
