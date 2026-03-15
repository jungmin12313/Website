import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import FestivalList from './pages/FestivalList'
import FestivalDetail from './pages/FestivalDetail'
import Admin from './pages/Admin'
import About from './pages/About'
import Report from './pages/Report'
import './index.css'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/maps" element={<FestivalList />} />
        <Route path="/maps/:id" element={<FestivalDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/calendar" element={<FestivalList />} />
        <Route path="/report" element={<Report />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}
