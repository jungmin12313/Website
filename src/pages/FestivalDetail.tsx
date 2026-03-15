import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Phone, Instagram, Globe, DollarSign, ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react'
import type { Festival, Hotspot } from '../types'
import HotspotModal from '../components/HotspotModal'
import './FestivalDetail.css'

type Tab = 'info' | 'map' | 'access'

export default function FestivalDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [festival, setFestival] = useState<Festival | null>(null)
  const [tab, setTab] = useState<Tab>('info')
  const [imgIdx, setImgIdx] = useState(0)
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null)
  const [mapScale, setMapScale] = useState(1)
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem('naeil_festivals_data')
    if (saved) {
      const data = JSON.parse(saved)
      const found = data.find((f: Festival) => f.id === id)
      if (!found) navigate('/maps')
      else setFestival(found)
    } else {
      fetch('/data/festivals.json')
        .then(r => r.json())
        .then((data: Festival[]) => {
          localStorage.setItem('naeil_festivals_data', JSON.stringify(data))
          const found = data.find(f => f.id === id)
          if (!found) navigate('/maps')
          else setFestival(found)
        })
    }
  }, [id, navigate])

  if (!festival) return <div className="loading">불러오는 중...</div>

  return (
    <div className="detail-page">
      {/* 탭 */}
      <div className="tab-bar">
        {(['info', 'map', 'access'] as Tab[]).map(t => (
          <button
            key={t}
            className={`tab-btn ${tab === t ? 'active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'info' ? '기본정보' : t === 'map' ? '지도' : '무장애 편의정보'}
          </button>
        ))}
      </div>

      {/* 기본정보 탭 */}
      {tab === 'info' && (
        <div className="tab-content info-tab">
          <div className="info-layout">
            {/* 사진 슬라이더 */}
            <div className="info-slider">
              <div className="slider-wrap">
                <img
                  src={festival.images[imgIdx] || '/placeholder.svg'}
                  alt={festival.name}
                  onError={e => { (e.target as HTMLImageElement).src = '/placeholder.svg' }}
                />
                {festival.images.length > 1 && (
                  <>
                    <button className="slider-btn prev" onClick={() => setImgIdx(i => (i - 1 + festival.images.length) % festival.images.length)}>
                      <ChevronLeft size={18} />
                    </button>
                    <button className="slider-btn next" onClick={() => setImgIdx(i => (i + 1) % festival.images.length)}>
                      <ChevronRight size={18} />
                    </button>
                  </>
                )}
              </div>
              <div className="slider-dots">
                {(festival.images.length > 0 ? festival.images : ['']).map((_, i) => (
                  <span key={i} className={`dot ${i === imgIdx ? 'active' : ''}`} onClick={() => setImgIdx(i)} />
                ))}
              </div>
            </div>

            {/* 상세 정보 */}
            <div className="info-content">
              {festival.subtitle && <p className="info-subtitle">{festival.subtitle}</p>}
              <h1 className="info-title">{festival.name}</h1>

              <div className="info-rows">
                <div className="info-row">
                  <Calendar size={18} />
                  <span>{festival.startDate} ~ {festival.endDate}</span>
                </div>
                <div className="info-row">
                  <MapPin size={18} />
                  <span>{festival.address}</span>
                </div>
                <div className="info-row">
                  <DollarSign size={18} />
                  <span>{festival.fee}</span>
                </div>
                {festival.phone && (
                  <div className="info-row">
                    <Phone size={18} />
                    <span>{festival.phone}</span>
                  </div>
                )}
                {festival.instagram && (
                  <div className="info-row">
                    <Instagram size={18} />
                    <span>{festival.instagram}</span>
                  </div>
                )}
                {festival.description && (
                  <div className="info-row align-top">
                    <Globe size={18} />
                    <div>
                      <p className="info-label">[행사내용]</p>
                      {festival.programs.map((p, i) => (
                        <p key={i} className="program-item">{i + 1}. {p}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 지도 탭 */}
      {tab === 'map' && (
        <div className="tab-content map-tab">
          <div className="map-layout">
            {/* 좌측 범례 */}
            <div className="map-legend">
              <div className="legend-header">
                <span>🌰</span>
                <strong>{festival.name}</strong>
              </div>
              <p className="legend-period">기간: {festival.startDate}~{festival.endDate}</p>
              <p className="legend-addr">장소: {festival.address}</p>
              {festival.description && (
                <p className="legend-desc">{festival.description.slice(0, 120)}...</p>
              )}
            </div>

            {/* 우측 지도 */}
            <div className="map-area">
              <div className="map-controls">
                <button onClick={() => setMapScale(s => Math.max(0.5, s - 0.25))}><Minus size={16} /></button>
                <span>{Math.round(mapScale * 100)}%</span>
                <button onClick={() => setMapScale(s => Math.min(3, s + 0.25))}><Plus size={16} /></button>
              </div>

              <div className="map-viewport" ref={mapRef}>
                <div className="map-scaler" style={{ transform: `scale(${mapScale})` }}>
                  <div className="map-image-wrap">
                    {festival.mapImage ? (
                      <img
                        src={festival.mapImage}
                        alt="축제 무장애지도"
                        className="map-img"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                    ) : (
                      <div className="map-placeholder">
                        <p>지도 이미지가 준비 중입니다.</p>
                        <p className="map-placeholder-sub">어드민 페이지에서 지도를 업로드하고 핫스팟을 설정해주세요.</p>
                      </div>
                    )}

                    {/* 핫스팟 */}
                    {festival.hotspots.map(hs => (
                      <button
                        key={hs.id}
                        className="hotspot-btn"
                        style={{ 
                          left: `${hs.x}%`, 
                          top: `${hs.y}%`,
                          width: `${hs.w || 4}%`,
                          height: `${hs.h || 4}%`
                        }}
                        onClick={() => setSelectedHotspot(hs)}
                        title={hs.label}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 편의정보 탭 */}
      {tab === 'access' && (
        <div className="tab-content access-tab">
          {festival.transport ? (
            <div className="transport-card">
              <h2>무장애 교통정보</h2>
              <p className="transport-route">{festival.transport.description}</p>
              {festival.transport.services.map((s, i) => (
                <div key={i} className="transport-service">
                  <h3>{s.name}</h3>
                  <ul>
                    <li><strong>이용대상</strong>: {s.target}</li>
                    <li><strong>이용방법</strong>: {s.phone}</li>
                    <li><strong>이용요금</strong>: {s.fee}</li>
                    <li><strong>운행</strong>: {s.operator}</li>
                    <li><strong>기타문의</strong>: {s.inquiry}</li>
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">교통정보가 준비 중입니다.</div>
          )}
        </div>
      )}

      {/* 핫스팟 모달 */}
      {selectedHotspot && (
        <HotspotModal
          hotspot={selectedHotspot}
          pictograms={festival.pictograms}
          onClose={() => setSelectedHotspot(null)}
        />
      )}
    </div>
  )
}
