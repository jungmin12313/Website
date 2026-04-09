import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ChevronRight } from 'lucide-react'
import type { Festival } from '../types'
import defaultHero from '../assets/hero.png'
import { useSEO } from '../hooks/useSEO'
import './Home.css'

export default function Home() {
  const [query, setQuery] = useState('')
  const [heroBg, setHeroBg] = useState(() => localStorage.getItem('naeil_hero_bg_cache') || '')
  const [mainFestivals, setMainFestivals] = useState<Festival[]>([])
  const navigate = useNavigate()

  useSEO({
    title: '내일 | 무장애 축제 지도',
    description: '장애인, 노인, 휠체어 사용자 모두가 즐길 수 있는 무장애 축제 지도. 내일(NAEIL)은 배리어프리 축제 접근성 정보를 제공합니다.',
    url: 'https://naeilmap.com/'
  });

  useEffect(() => {
    // Firebase 함수들을 동적 임포트하여 초기 번들 크기 감소 및 실행 지연 방지
    const loadData = async () => {
      try {
        const { getSetting, getFestivals } = await import('../firebaseUtils');
        
        getSetting('naeil_hero_bg').then(savedHero => {
          if (savedHero) {
            setHeroBg(savedHero);
            localStorage.setItem('naeil_hero_bg_cache', savedHero); // 캐시 업데이트
          }
        });

        getFestivals().then(fests => {
          const onMain = fests.filter(f => f.showOnMain === true && (f.thumbnail || f.mapImage));
          setMainFestivals(onMain.slice(0, 3));
        });
      } catch (err) {
        console.error('Failed to load data:', err);
      }
    };

    loadData();
  }, [])

  const handleSearch = () => {
    if (query.trim()) navigate(`/maps?q=${encodeURIComponent(query)}`)
  }

  return (
    <div className="home">
      {/* 히어로 섹션 */}
      <section className="hero">
        <img 
          src={heroBg || defaultHero} 
          alt="무장애 축제 지도 내일 배경" 
          fetchPriority="high" 
          decoding="async"
          width="1920" 
          height="1080" 
          className={`hero-img ${heroBg ? 'loaded' : ''}`}
        />
        <div className="hero-overlay" style={{ zIndex: 1 }} />
        <div className="hero-content">
          <h1 className="hero-title">
            모두를 위한 무장애 축제 지도, 내일
          </h1>
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

          {mainFestivals.length > 0 && (
            <div className="latest-maps-container">
              {mainFestivals.map(fest => (
                <div key={fest.id} className="latest-map-widget glass-card" onClick={() => navigate(`/maps/${fest.id}`)}>
                  <div className="widget-map-img" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, border: '2px solid rgba(255, 255, 255, 0.8)' }}>
                    <img 
                      src={fest.thumbnail || fest.mapImage} 
                      alt={fest.name} 
                      width="90"
                      height="90"
                      loading="lazy"
                      decoding="async"
                      style={{ 
                        objectFit: 'contain', 
                        width: '100%', 
                        height: '100%', 
                        transform: fest.thumbnail ? `scale(${(fest.thumbnailZoom || 100) / 100})` : 'none' 
                      }} 
                    />
                  </div>
                  
                  <div className="widget-content">
                    <div className="widget-header">
                      <span className="pulse-dot"></span>
                      <span className="widget-badge-text">방금 전 업데이트 됨</span>
                    </div>
                    <div className="widget-info">
                      <strong>{fest.name}</strong>
                      <p>{fest.address}</p>
                    </div>
                  </div>

                  <div className="widget-arrow">
                    <ChevronRight size={24} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
