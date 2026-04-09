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

  const navLinks = [
    { to: '/about', label: '소개' },
    { to: '/maps', label: '무장애지도' },
    { to: '/calendar', label: '축제 캘린더' },
    { to: '/report', label: '신고센터' },
  ]

  return (
    <>
      <nav className="navbar">
        <div className="navbar-inner">
          <div className="navbar-left">
            <button className="menu-btn" onClick={() => setMenuOpen(true)}>
              <Menu size={26} />
            </button>
            <Link to="/" className="logo-link">
              <picture>
                <source srcSet="/logo_minimal.webp" type="image/webp" />
                <img src="/logo_minimal.png" alt="내일" className="logo-img" width="100" height="30" loading="lazy" />
              </picture>
            </Link>
          </div>

          <div className="navbar-right">
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
            <picture>
              <source srcSet="/logo_minimal.webp" type="image/webp" />
              <img src="/logo_minimal.png" alt="내일" className="sidebar-logo" width="100" height="30" loading="lazy" />
            </picture>
            <button className="sidebar-close" onClick={() => setMenuOpen(false)}>
              <X size={28} />
            </button>
          </div>
          <div className="sidebar-links">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`sidebar-link ${location.pathname.startsWith(link.to) ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
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
