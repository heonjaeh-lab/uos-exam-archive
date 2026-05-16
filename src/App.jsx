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

function App() {
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
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </Layout>
  )
}

export default App
