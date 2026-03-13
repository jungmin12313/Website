import { useState, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Menu, X, Minus, Plus } from 'lucide-react'
import './Navbar.css'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [fontSize, setFontSize] = useState(100)
  const location = useLocation()
  const navigate = useNavigate()
  
  // Admin trigger logic
  const logoClickCount = useRef(0)
  const [adminHint, setAdminHint] = useState(0)

  const handleLogoClick = (e: React.MouseEvent) => {
    // Prevent default navigation for quick clicks
    logoClickCount.current += 1
    setAdminHint(logoClickCount.current)
    
    if (logoClickCount.current >= 5) {
      e.preventDefault()
      logoClickCount.current = 0
      setAdminHint(0)
      
      const code = window.prompt('관리자 인증 코드를 입력하세요.')
      if (code === 'naeil2025') {
        sessionStorage.setItem('naeil_admin_auth', 'true')
        navigate('/admin')
      } else if (code !== null) {
        alert('인증 코드가 올바르지 않습니다.')
      }
    }

    // Reset counter after 2 seconds of inactivity
    setTimeout(() => {
      if (logoClickCount.current > 0) {
        logoClickCount.current = 0
        setAdminHint(0)
      }
    }, 2000)
  }

  const changeFontSize = (delta: number) => {
    const next = Math.min(140, Math.max(80, fontSize + delta))
    setFontSize(next)
    document.documentElement.style.fontSize = `${next}%`
  }

  const navLinks = [
    { to: '/about', label: '소개' },
    { to: '/maps', label: '무장애지도' },
    { to: '/calendar', label: '축제 캘린더' },
    { to: '/report', label: '신고센터' },
  ]

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-left">
          <button className="menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <Link to="/" className="logo-link" onClick={handleLogoClick}>
            <img src="/logo.png" alt="내일" className="logo-img" />
            {adminHint > 0 && adminHint < 5 && (
              <span className="admin-trigger-hint">{adminHint}</span>
            )}
          </Link>
        </div>

        <div className="font-control">
          <span>화면크기</span>
          <button onClick={() => changeFontSize(-10)}><Minus size={14} /></button>
          <span className="divider">|</span>
          <button onClick={() => changeFontSize(10)}><Plus size={14} /></button>
        </div>

        <div className="navbar-links">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link ${location.pathname.startsWith(link.to) ? 'active' : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {menuOpen && (
        <div className="mobile-menu">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className="mobile-link"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
