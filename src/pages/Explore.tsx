import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { MapPin, Calendar } from 'lucide-react'
import { getFestivals } from '../firebaseUtils'
import type { Festival } from '../types'
import SEO from '../components/SEO'
import './FestivalList.css' // 스타일 재사용

const REGIONS: Record<string, string> = {
  seoul: '서울',
  gyeonggi: '경기',
  incheon: '인천',
  gangwon: '강원',
  chungcheong: '충청',
  jeolla: '전라',
  gyeongsang: '경상',
  jeju: '제주',
  all: '전국'
}

const THEMES: Record<string, { name: string; keywords: string[] }> = {
  wheelchair: { name: '휠체어 접근 가능', keywords: ['경사로', '휠체어', '엘리베이터', '단차 없음'] },
  stroller: { name: '유아차 동반', keywords: ['유아차', '유모차', '수유실', '기저귀'] },
  blind: { name: '시각장애인 편의', keywords: ['점자', '음성', '안내견'] },
  deaf: { name: '청각장애인 편의', keywords: ['수어', '자막', '시각 알람'] }
}

export default function Explore() {
  const { region = 'all', theme } = useParams<{ region: string; theme?: string }>()
  const [festivals, setFestivals] = useState<Festival[]>([])
  const [loading, setLoading] = useState(true)

  const regionName = REGIONS[region] || '전국'
  const themeData = theme ? THEMES[theme] : null
  const themeName = themeData ? themeData.name : '무장애'

  const pageTitle = `${regionName} ${themeName} 축제 일정 및 지도 | 내일`
  const pageDesc = `${regionName} 지역에서 열리는 ${themeName} 축제 정보를 모아보세요. NAEILMAP이 실측한 완벽한 접근성 데이터를 제공합니다.`

  useEffect(() => {
    setLoading(true)
    getFestivals().then(data => {
      // 1. 지역 필터링
      let filtered = data
      if (regionName !== '전국') {
        filtered = filtered.filter(f => f.location.includes(regionName) || f.address.includes(regionName))
      }

      // 2. 테마 필터링 (핫스팟 기반)
      if (themeData) {
        filtered = filtered.filter(f => {
          return f.hotspots.some(h => {
            const txt = (h.label + ' ' + h.description?.join(' ')).toLowerCase()
            return themeData.keywords.some(kw => txt.includes(kw))
          })
        })
      }
      setFestivals(filtered)
    }).catch(console.error)
    .finally(() => setLoading(false))
  }, [regionName, themeData])

  return (
    <div className="festival-list-page" style={{ minHeight: '100vh', paddingBottom: '80px' }}>
      <SEO 
        title={pageTitle}
        description={pageDesc}
        schema={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "홈", "item": "https://naeilmap.com/" },
            { "@type": "ListItem", "position": 2, "name": "테마별 탐색", "item": "https://naeilmap.com/explore" },
            { "@type": "ListItem", "position": 3, "name": `${regionName} ${themeName} 축제`, "item": `https://naeilmap.com/explore/${region}/${theme || ''}` }
          ]
        }}
      />

      <div className="list-container" style={{ paddingTop: '20px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          {regionName} <span style={{ color: 'var(--primary)' }}>{themeName}</span> 축제
        </h1>
        <p style={{ color: 'var(--gray-600)', marginBottom: '2rem' }}>
          NAEILMAP이 직접 확인한 접근성 좋은 축제들을 만나보세요.
        </p>

        {loading ? (
          <div className="loading" style={{ height: '300px' }}>데이터를 불러오는 중입니다...</div>
        ) : festivals.length === 0 ? (
          <div className="empty-state" style={{ padding: '60px 0', textAlign: 'center' }}>
            <Calendar size={48} style={{ color: 'var(--gray-300)', margin: '0 auto 1rem' }} />
            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>아쉽게도 현재 예정된 축제가 없습니다</h3>
            <p style={{ color: 'var(--gray-500)' }}>다른 지역이나 테마를 검색해 보세요.</p>
          </div>
        ) : (
          <div className="festival-grid">
            {festivals.map(festival => (
              <Link to={`/map/${festival.id}`} key={festival.id} className="festival-card">
                <div className="festival-image">
                  <img src={festival.thumbnail || festival.mapImage} alt={festival.name} loading="lazy" />
                  <div className="status-badge status-active">
                    {festival.status === 'active' ? '진행중' : festival.status === 'soon' ? '예정' : '종료'}
                  </div>
                </div>
                <div className="festival-info">
                  <span className="location-tag"><MapPin size={12} /> {festival.location}</span>
                  <h3>{festival.name}</h3>
                  <div className="festival-meta">
                    <span className="date-tag"><Calendar size={12} /> {festival.startDate} ~ {festival.endDate}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div style={{ marginTop: '4rem', padding: '2rem', background: 'var(--gray-50)', borderRadius: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem' }}>💡 다른 인기 탐색어</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {Object.entries(REGIONS).filter(([k]) => k !== 'all' && k !== region).map(([k, v]) => (
              <Link key={k} to={`/explore/${k}/${theme || 'wheelchair'}`} style={{ padding: '8px 16px', background: '#fff', border: '1px solid var(--gray-200)', borderRadius: '100px', fontSize: '0.9rem', color: 'var(--gray-700)', textDecoration: 'none' }}>
                {v} {themeName} 축제
              </Link>
            ))}
            {Object.entries(THEMES).filter(([k]) => k !== theme).map(([k, v]) => (
              <Link key={k} to={`/explore/${region}/${k}`} style={{ padding: '8px 16px', background: '#fff', border: '1px solid var(--gray-200)', borderRadius: '100px', fontSize: '0.9rem', color: 'var(--gray-700)', textDecoration: 'none' }}>
                {regionName} {v.name} 축제
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
