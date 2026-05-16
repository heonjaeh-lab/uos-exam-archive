import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import SubjectPage from './pages/SubjectPage'
import AboutPage from './pages/AboutPage'
import AiPage from './pages/AiPage'
import TimetablePage from './pages/TimetablePage'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/timetable" element={<TimetablePage />} />
        <Route path="/subject/:subjectName" element={<SubjectPage />} />
        <Route path="/ai" element={<AiPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </Layout>
  )
}

export default App
