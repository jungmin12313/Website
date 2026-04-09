import { Link } from 'react-router-dom'
import { Instagram, Mail } from 'lucide-react'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Link to="/" className="f-logo-link">
            <picture>
              <source srcSet="/logo.webp" type="image/webp" />
              <img src="/logo.png" alt="내일" className="footer-logo" loading="lazy" width="120" height="40" style={{ filter: 'contrast(1.2) brightness(0.9)' }} />
            </picture>
          </Link>
          <div className="footer-contact">
            <a href="mailto:jm56s@naver.com" className="contact-item">
              <Mail size={18} />
              <span>jm56s@naver.com</span>
            </a>
            <a 
              href="https://www.instagram.com/naeil__official" 
              className="contact-item"
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Instagram size={18} />
              <span>@naeil__official</span>
            </a>
          </div>
        </div>

        <div className="footer-links">
          <div className="f-col">
            <h4>서비스</h4>
            <Link to="/about">내일 이야기</Link>
            <Link to="/maps">무장애지도</Link>
            <Link to="/calendar">축제 캘린더</Link>
          </div>
          <div className="f-col">
            <h4>커뮤니티</h4>
            <Link to="/story">인터뷰 및 소식</Link>
            <Link to="/report">지도 수정 제보</Link>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <p className="copyright">© 2025 내일. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
