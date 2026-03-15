import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import './index.css'

// 라우트 기반 코드 스플리팅으로 첫 접속 시 로딩 렌더링 최적화
const Home = lazy(() => import('./pages/Home'))
const FestivalList = lazy(() => import('./pages/FestivalList'))
const FestivalDetail = lazy(() => import('./pages/FestivalDetail'))
const Admin = lazy(() => import('./pages/Admin'))
const About = lazy(() => import('./pages/About'))
const Report = lazy(() => import('./pages/Report'))

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Suspense fallback={<div className="loading-fallback" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', width: '100vw' }}>로딩 중...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/maps" element={<FestivalList />} />
          <Route path="/maps/:id" element={<FestivalDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/calendar" element={<FestivalList />} />
          <Route path="/report" element={<Report />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </Suspense>
      <Footer />
    </BrowserRouter>
  )
}
