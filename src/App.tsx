import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import FestivalList from './pages/FestivalList'
import FestivalDetail from './pages/FestivalDetail'
import Admin from './pages/Admin'
import './index.css'

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/maps" element={<FestivalList />} />
        <Route path="/maps/:id" element={<FestivalDetail />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/calendar" element={<FestivalList />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  )
}

function AboutPage() {
  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>내일 소개</h1>
      <div style={{ background: '#EEF6FC', borderRadius: 16, padding: 32, marginBottom: 24, borderLeft: '4px solid #5BA4CF' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#2C6EA6', marginBottom: 8 }}>미션</h2>
        <p style={{ color: '#343A40', lineHeight: 1.8 }}>장애인의 문화 접근 장벽을 허문다.</p>
      </div>
      <div style={{ background: '#EEF6FC', borderRadius: 16, padding: 32, marginBottom: 24, borderLeft: '4px solid #5BA4CF' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#2C6EA6', marginBottom: 8 }}>비전</h2>
        <p style={{ color: '#343A40', lineHeight: 1.8 }}>무장애 축제 관광지도를 통해 휠체어 이용 장애인들의 문화생활 접근성을 향상시킨다.</p>
      </div>
      <div style={{ background: '#F8F9FA', borderRadius: 16, padding: 32 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>내일이 하는 일</h2>
        <p style={{ color: '#6C757D', lineHeight: 1.8 }}>교통약자이동편의증진법을 기반으로, 축제 현장을 직접 방문하여 무장애 접근성을 조사하고 픽토그램이 담긴 상세 지도를 제작합니다. 휠체어 이용 장애인이 안심하고 축제를 즐길 수 있도록 실질적인 정보를 제공합니다.</p>
      </div>
    </div>
  )
}

function ReportPage() {
  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '48px 24px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>신고센터</h1>
      <p style={{ color: '#6C757D', marginBottom: 32 }}>축제 현장에서 불편사항을 발견하셨나요? 신고해주시면 빠르게 반영하겠습니다.</p>
      <div style={{ background: 'white', border: '1px solid #E9ECEF', borderRadius: 16, padding: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {[
          { label: '이름', placeholder: '홍길동', type: 'text' },
          { label: '연락처', placeholder: '010-0000-0000', type: 'tel' },
        ].map(f => (
          <div key={f.label} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 14, fontWeight: 600 }}>{f.label}</label>
            <input type={f.type} placeholder={f.placeholder} style={{ border: '1px solid #E9ECEF', borderRadius: 8, padding: '10px 14px', fontSize: 14, fontFamily: 'Noto Sans KR, sans-serif', outline: 'none' }} />
          </div>
        ))}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 14, fontWeight: 600 }}>해당 축제</label>
          <select style={{ border: '1px solid #E9ECEF', borderRadius: 8, padding: '10px 14px', fontSize: 14, fontFamily: 'Noto Sans KR, sans-serif', outline: 'none' }}>
            <option>겨울공주 군밤축제</option>
            <option>강진청자축제</option>
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 14, fontWeight: 600 }}>신고 내용</label>
          <textarea rows={5} placeholder="불편하셨던 내용을 자세히 적어주세요." style={{ border: '1px solid #E9ECEF', borderRadius: 8, padding: '10px 14px', fontSize: 14, fontFamily: 'Noto Sans KR, sans-serif', outline: 'none', resize: 'vertical' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 14, fontWeight: 600 }}>사진 첨부 (선택)</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', border: '1.5px dashed #A8CCEC', borderRadius: 8, fontSize: 14, color: '#2C6EA6', cursor: 'pointer', background: '#EEF6FC' }}>
            📎 사진 선택
            <input type="file" accept="image/*" multiple style={{ display: 'none' }} />
          </label>
        </div>
        <button style={{ background: '#5BA4CF', color: 'white', padding: '12px', borderRadius: 8, fontSize: 15, fontWeight: 600, fontFamily: 'Noto Sans KR, sans-serif', cursor: 'pointer', border: 'none' }}>
          신고 제출
        </button>
      </div>
    </div>
  )
}
