import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Instagram, Youtube, Twitter, Linkedin } from 'lucide-react'
import festivalsData from '../../public/data/festivals.json'
import './Home.css'

export default function Home() {
  const [query, setQuery] = useState('')
  const [heroBg, setHeroBg] = useState(() => localStorage.getItem('naeil_hero_bg') || '')
  const navigate = useNavigate()

  useEffect(() => {
    const loadHero = () => {
      const savedHero = localStorage.getItem('naeil_hero_bg')
      if (savedHero) {
        setHeroBg(savedHero)
        console.log('Hero background loaded from storage')
      } else {
        setHeroBg('')
      }
    }

    loadHero()
    window.addEventListener('storage', loadHero)
    return () => window.removeEventListener('storage', loadHero)
  }, [])

  const handleSearch = () => {
    if (query.trim()) navigate(`/maps?q=${encodeURIComponent(query)}`)
  }

  // Get first 5 festivals for footer
  const footerFestivals = festivalsData.slice(0, 5)

  return (
    <div className="home">
      {/* 히어로 섹션 */}
      <section 
        className="hero" 
        style={heroBg ? { backgroundImage: `url("${heroBg}")`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
      >
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1 className="hero-title">모두의 더 나은 내일을 위해 내 일처럼</h1>
          <div className="search-bar">
            <input
              type="text"
              placeholder="검색어를 입력해주세요."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch}><Search size={20} /></button>
          </div>
        </div>
      </section>

      {/* 소개 섹션 */}
      <section className="intro-section">
        <div className="intro-inner">
          <div className="intro-card">
            <div className="intro-icon">♿</div>
            <h3>무장애지도</h3>
            <p>휠체어 이용 장애인이 축제를 안심하고 즐길 수 있도록 상세한 무장애 정보를 제공합니다.</p>
            <button className="btn-primary" onClick={() => navigate('/maps')}>지도 보기</button>
          </div>
          <div className="intro-card highlight">
            <div className="intro-icon">🗺️</div>
            <h3>당연한 축제가<br/>누군가에겐 도전이라면</h3>
            <p>우리는 함께 바꿔야 합니다.<br/>지금 이 순간에도, 누군가는 '들어가는 길'조차 찾지 못합니다.</p>
          </div>
          <div className="intro-card">
            <div className="intro-icon">📢</div>
            <h3>신고센터</h3>
            <p>축제 현장의 불편사항을 신고해주세요. 실시간으로 지도에 반영합니다.</p>
            <button className="btn-primary" onClick={() => navigate('/report')}>신고하기</button>
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <img src="/logo.png" alt="내일" className="footer-logo" />
            <p className="footer-tagline">
              장애에 구애받지 않고,<br/>
              모두가 즐길 수 있는,<br/>
              무장애축제지도를 만듭니다.
            </p>
            <div className="social-icons">
              <a href="https://www.instagram.com/naeil__official?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer">
                <Instagram size={20} />
              </a>
              <a href="#"><Youtube size={20} /></a>
              <a href="#"><Twitter size={20} /></a>
              <a href="#"><Linkedin size={20} /></a>
            </div>
          </div>

          <div className="footer-links">
            <div>
              <h4>무장애지도</h4>
              {footerFestivals.map(f => (
                <Link key={f.id} to={`/maps/${f.id}`}>{f.name}</Link>
              ))}
            </div>
            <div>
              <h4>축제캘린더</h4>
              <Link to="/calendar">현재 진행중인 축제</Link>
              <Link to="/calendar">월별 축제</Link>
              <Link to="/calendar">지역별 축제</Link>
            </div>
            <div>
              <h4>신고센터</h4>
              <Link to="/report">지도 수정사항 신고</Link>
              <a href="mailto:contact@naeil.org">축제 관계자</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
