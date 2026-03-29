import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { getSetting } from '../firebaseUtils'
import defaultHero from '../assets/hero.png'
import { useSEO } from '../hooks/useSEO'
import './Home.css'

export default function Home() {
  const [query, setQuery] = useState('')
  const [heroBg, setHeroBg] = useState('')
  const navigate = useNavigate()

  useSEO({
    title: '내일 | 모두가 축제를 참여하는 내일을 위해',
    description: '휠체어, 유아차, 어르신도 망설임 없이 즐길 수 있는 무장애 축제 정보',
    url: 'https://naeilmap.com/'
  });

  useEffect(() => {
    getSetting('naeil_hero_bg').then(savedHero => {
      if (savedHero) setHeroBg(savedHero)
    }).catch(err => console.error('Failed to load hero background:', err))
  }, [])

  const handleSearch = () => {
    if (query.trim()) navigate(`/maps?q=${encodeURIComponent(query)}`)
  }

  return (
    <div className="home">
      {/* 히어로 섹션 */}
      <section 
        className="hero" 
        style={{ 
          backgroundImage: `url("${heroBg || defaultHero}")`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center' 
        }}
      >
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1 className="hero-title">모두의 더 나은 내일을 위해 내 일처럼</h1>
          <div className="search-bar">
            <input
              type="text"
              placeholder="관심있는 장소나 축제를 검색해보세요!"
              aria-label="축제 검색"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
            <button onClick={handleSearch}><Search size={20} /></button>
          </div>
        </div>
      </section>
    </div>
  )
}
