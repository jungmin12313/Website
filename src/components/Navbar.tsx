import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Sun, Moon } from 'lucide-react'
import './Navbar.css'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [isHighContrast, setIsHighContrast] = useState(() => localStorage.getItem('naeil_hcm') === 'true')
  const location = useLocation()

  useEffect(() => {
    if (isHighContrast) {
      document.body.setAttribute('data-theme', 'high-contrast')
    } else {
      document.body.removeAttribute('data-theme')
    }
    localStorage.setItem('naeil_hcm', String(isHighContrast))
  }, [isHighContrast])



  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="navbar-left">
            <button className="menu-btn" onClick={() => setMenuOpen(true)}>
              <Menu size={26} />
            </button>
            <Link to="/" className="logo-link">
              <img src="/logo_new.png" alt="내일 - 무장애지도" className="logo-img" width="100" height="30" loading="lazy" />
            </Link>
          </div>

          <div className="navbar-right">
            <div className="navbar-links">
              <Link to="/about" className={`nav-link ${location.pathname.startsWith('/about') ? 'active' : ''}`}>소개</Link>
              <Link to="/maps" className={`nav-link ${location.pathname.startsWith('/maps') ? 'active' : ''}`}>무장애지도</Link>
              <Link to="/calendar" className={`nav-link ${location.pathname.startsWith('/calendar') ? 'active' : ''}`}>축제 캘린더</Link>
              
              <Link to="/report" className={`nav-link ${location.pathname.startsWith('/report') ? 'active' : ''}`}>신고센터</Link>
              
              <div className="dropdown">
                <span className={`nav-link ${(location.pathname.startsWith('/press') || location.pathname.startsWith('/gallery')) ? 'active' : ''}`} style={{ cursor: 'pointer' }}>
                  소식
                </span>
                <div className="dropdown-content fade-in">
                  <Link to="/press" className="nav-link">보도자료</Link>
                  <Link to="/gallery" className="nav-link">갤러리</Link>
                </div>
              </div>
            </div>

            <button 
              className={`hcm-toggle ${isHighContrast ? 'active' : ''}`} 
              onClick={() => setIsHighContrast(!isHighContrast)}
              title="고대비 모드"
            >
              {isHighContrast ? <Sun size={20} /> : <Moon size={20} />}
              <span>고대비</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Slide-in Sidebar Menu */}
      <div className={`sidebar-overlay ${menuOpen ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>
        <div className={`sidebar ${menuOpen ? 'active' : ''}`} onClick={e => e.stopPropagation()}>
          <div className="sidebar-header">
            <img src="/logo_new.png" alt="내일 - 무장애지도" className="sidebar-logo" width="100" height="30" loading="lazy" />
            <button className="sidebar-close" onClick={() => setMenuOpen(false)}>
              <X size={28} />
            </button>
          </div>
          <div className="sidebar-links">
            <Link to="/about" className={`sidebar-link ${location.pathname.startsWith('/about') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>소개</Link>
            <Link to="/maps" className={`sidebar-link ${location.pathname.startsWith('/maps') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>무장애지도</Link>
            <Link to="/calendar" className={`sidebar-link ${location.pathname.startsWith('/calendar') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>축제 캘린더</Link>
            <Link to="/report" className={`sidebar-link ${location.pathname.startsWith('/report') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>신고센터</Link>
            <Link to="/press" className={`sidebar-link ${location.pathname.startsWith('/press') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>보도자료</Link>
            <Link to="/gallery" className={`sidebar-link ${location.pathname.startsWith('/gallery') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>갤러리</Link>
          </div>
          <div className="sidebar-footer">
            <button 
              className="hcm-toggle" 
              onClick={() => setIsHighContrast(!isHighContrast)}
            >
              {isHighContrast ? <Sun size={20} /> : <Moon size={20} />}
              고대비 모드 {isHighContrast ? '끄기' : '켜기'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
