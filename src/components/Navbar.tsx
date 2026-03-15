import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Minus, Plus, RotateCcw } from 'lucide-react'
import './Navbar.css'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [fontSize, setFontSize] = useState(() => Number(localStorage.getItem('naeil_font_size')) || 100)
  const location = useLocation()

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}%`
    localStorage.setItem('naeil_font_size', String(fontSize))
  }, [fontSize])

  const changeFontSize = (delta: number) => {
    const next = Math.min(150, Math.max(70, fontSize + delta))
    setFontSize(next)
  }

  const resetFontSize = () => setFontSize(100)

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
          <Link to="/" className="logo-link">
            <img src="/logo.png" alt="내일" className="logo-img" />
          </Link>
        </div>

        <div className="font-control">
          <span className="control-label">화면 크기</span>
          <div className="zoom-pill">
            <button onClick={() => changeFontSize(-10)} title="축소"><Minus size={16} /></button>
            <span className="zoom-value">{fontSize}%</span>
            <button onClick={() => changeFontSize(10)} title="확대"><Plus size={16} /></button>
            <button onClick={resetFontSize} className="reset-btn" title="초기화"><RotateCcw size={16} /></button>
          </div>
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
