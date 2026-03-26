import { Link, useNavigate } from 'react-router-dom'
import { Instagram } from 'lucide-react'
import festivalsData from '../data/festivals.json'
import './Footer.css'

export default function Footer() {
  const navigate = useNavigate()
  const footerFestivals = festivalsData.slice(0, 5)

  const handleAdminClick = (e: React.MouseEvent) => {
    e.preventDefault()
    const code = window.prompt('관리자 인증 코드를 입력하세요.')
    if (code === 'naeil2025') {
      sessionStorage.setItem('naeil_admin_auth', 'true')
      navigate('/admin')
    } else if (code !== null) {
      alert('인증 코드가 올바르지 않습니다.')
    }
  }

  return (
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
              <Instagram size={24} />
            </a>
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
            <h4>소개</h4>
            <Link to="/about">'내일' 이야기</Link>
            <Link to="/story">인터뷰 및 소식</Link>
          </div>
          <div>
            <h4>고객지원</h4>
            <Link to="/report">지도 수정사항 제보</Link>
            <Link to="/calendar">축제 캘린더</Link>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <p className="copyright">© 2025 내일. All rights reserved.</p>
          <Link to="/admin" className="admin-subtle-link" onClick={handleAdminClick}>[관리자 페이지]</Link>
        </div>
      </div>
    </footer>
  )
}
