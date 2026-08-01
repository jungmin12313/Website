import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, ChevronRight } from 'lucide-react'
import type { Festival } from '../types'
import defaultHero from '../assets/hero.png'
import SEO from '../components/SEO'
import './Home.css'

const VOICES = [
  {
    quote: "정보가 없는 건 아니에요. 근데 그 정보가 진짜인지 믿기가 힘들죠. 가보기 전까지는 늘 불안함이 앞서요.",
    contextParts: ["이 말이 '내일'의 출발점이었습니다. 불안을 없애는 건 더 많은 정보가 아니라, ", "더 믿을 수 있는 정보", "였습니다. 내일이 직접 현장에 나가 바퀴로 확인하기 시작한 이유입니다."],
    who: "휠체어 이용자 · 현장 인터뷰",
  },
  {
    quote: "경사로가 있다는 표시보다, 그 경사가 얼마나 가파른지가 더 중요해요. 그걸 아는 사람이 직접 가서 봐줘야 해요.",
    contextParts: ["그래서 내일은 '있다/없다'가 아닌 ", "'쓸 수 있다/없다'", "로 기준을 바꿨습니다. 경사도, 단차 높이, 통로 폭을 직접 측정하고 수치로 기록합니다."],
    who: "장애인 이동권 활동가 · 현장 인터뷰",
  },
  {
    quote: "축제를 즐기러 간 건데, 입구에서 발길을 돌릴 때의 기분을 설명하기가 어려워요.",
    contextParts: ["이 기분을 다시는 느끼지 않도록. 지도 한 장이 그 무게를 담을 수 있다고, 내일은 믿습니다. ", "수익을 쫓는 기업이 아닌, 사회적 가치를 쫓는 팀 '내일'의 순수한 열정", "입니다."],
    who: "휠체어 이용자 · 현장 인터뷰",
  },
];
export default function Home() {
  const [query, setQuery] = useState('')
  const [heroBg, setHeroBg] = useState(() => localStorage.getItem('naeil_hero_bg_cache') || '')
  const [mainFestivals, setMainFestivals] = useState<Festival[]>([])
  const navigate = useNavigate()



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
      <SEO 
        title="내일 - 무장애 축제 지도 | 우리 모두를 위한 배리어프리 축제 여행"
        description="무장애 축제 지도 플랫폼 '내일'은 휠체어 사용자, 고령자 등 교통약자를 위한 전국 축제장 무장애 접근성 정보를 제공합니다. 직접 조사한 무장애 축제 지로 평등하고 즐거운 문화를 누려보세요."
        url="https://naeilmap.com/"
      />
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
          <h1 className="hero-title" style={{ fontFamily: 'var(--font)', fontWeight: 800 }}>
            모두를 위한 무장애지도
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
            <button onClick={handleSearch} aria-label="검색"><Search size={20} /></button>
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

      {/* 스토리텔링 & 임팩트 대시보드 */}
      <section className="home-story-section">
        <div className="story-container">
          <div className="story-content">
            <h2 className="story-title">
              정보가 없는 것이 아닙니다.<br />
              그 정보가 <span className="highlight">'진짜'</span>인지 믿기 어려웠을 뿐입니다.
            </h2>
            <p className="story-desc">
              '내일'은 휠체어 이용자와 함께 현장에서 직접 바퀴를 굴리며 경사도와 단차를 측정합니다.<br />
              단순히 '있다/없다'가 아닌 '얼마나 가파른지, 직접 쓸 수 있는지'를 수치로 증명하는 <strong>가장 직관적이고 정확한 무장애지도</strong>입니다.
            </p>
          </div>

          <div className="impact-dashboard">
            <div className="impact-card">
              <div className="impact-number">524<span className="impact-unit">개+</span></div>
              <div className="impact-label">직접 실측한<br/><strong>접근성 데이터</strong></div>
            </div>
            <div className="impact-card">
              <div className="impact-number">100<span className="impact-unit">명+</span></div>
              <div className="impact-label">현장 조사에 동행한<br/><strong>시민과 당사자</strong></div>
            </div>
            <div className="impact-card">
              <div className="impact-number">17<span className="impact-unit">곳+</span></div>
              <div className="impact-label">함께 데이터를 구축하는<br/><strong>파트너 기관</strong></div>
            </div>
          </div>
        </div>
      </section>

      {/* DIFFERENCES SECTION */}
      <section id="diff" className="home-story-section" style={{ backgroundColor: 'var(--white)' }}>
        <div className="story-container">
          <div className="story-content reveal">
            <h2 className="story-title">
              '내일'은 <span className="highlight">무엇이 다른가요?</span>
            </h2>
          </div>
          
          <div style={{ display: "flex", gap: "2rem", justifyContent: "center", flexWrap: "wrap", marginTop: "1rem" }}>
             <div className="reveal diff-card" style={{ flex: "1 1 300px", maxWidth: "480px", textAlign: "left" }}>
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, color: "var(--blue)", marginBottom: 16 }}>DIFFERENCE 01</div>
                <h3 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 16, color: "var(--gray-900)" }}>더 직관적인 무장애지도</h3>
                <p style={{ fontSize: "1rem", color: "var(--gray-600)", lineHeight: 1.8 }}>
                  무장애지도 위 픽토그램을 클릭하면 현장 사진은 물론 실제 휠체어 접근 가능 여부를 바로 확인할 수 있어요.<br/><br/>
                  <strong style={{ color: 'var(--gray-800)' }}>"가보기 전에도 현장의 모습을 생생하게"</strong>
                </p>
             </div>
             <div className="reveal diff-card" style={{ transitionDelay: '0.1s', flex: "1 1 300px", maxWidth: "480px", textAlign: "left" }}>
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, color: "var(--blue)", marginBottom: 16 }}>DIFFERENCE 02</div>
                <h3 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 16, color: "var(--gray-900)" }}>함께 만들어가는 정보</h3>
                <p style={{ fontSize: "1rem", color: "var(--gray-600)", lineHeight: 1.8 }}>
                  사용자가 직접 경험하고 제보한 현장의 디테일이 실시간으로 지도에 더해집니다.<br/><br/>
                  <strong style={{ color: 'var(--gray-800)' }}>"당신의 발걸음이 누군가에게는 새로운 길이 됩니다"</strong>
                </p>
             </div>
          </div>
        </div>
      </section>

      {/* VOICE SECTION */}
      <section className="home-story-section" aria-label="당사자의 목소리">
        <div className="story-container">
          <div className="story-content reveal">
            <h2 className="story-title">
              내일이 현장으로 나간 <span className="highlight">진짜 이유</span>
            </h2>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", alignItems: "center", marginTop: "1rem" }}>
            {VOICES.map((v, i) => (
              <div key={i} className="reveal voice-card" style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className="voice-bar" />
                <div style={{ textAlign: "left" }}>
                  <div className="voice-q" style={{ fontSize: "1.25rem", fontWeight: 700, lineHeight: 1.6, color: "var(--gray-900)", marginBottom: "1rem" }}>
                    &ldquo;{v.quote}&rdquo;
                  </div>
                  <div className="voice-who" style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--blue)" }}>
                    {v.who}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
