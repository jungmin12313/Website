import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import './index.css'

// 라우트 기반 코드 스플리팅으로 첫 접속 시 로딩 렌더링 최적화
const Home = lazy(() => import('./pages/Home'))
const FestivalList = lazy(() => import('./pages/FestivalList'))
const FestivalDetail = lazy(() => import('./pages/FestivalDetail'))
const Admin = lazy(() => import('./pages/Admin'))
const About = lazy(() => import('./pages/About'))
const Report = lazy(() => import('./pages/Report'))
const Calendar = lazy(() => import('./pages/Calendar'))

const Story = lazy(() => import('./pages/Story'))

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Navbar />
      <main className="main-content fade-in">
        <Suspense fallback={<div className="loading-fallback">로딩 중...</div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/maps" element={<FestivalList />} />
            <Route path="/maps/:id" element={<FestivalDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/story" element={<Story />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/report" element={<Report />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </BrowserRouter>
  )
}
