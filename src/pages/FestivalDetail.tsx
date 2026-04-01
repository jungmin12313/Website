import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Calendar, MapPin, Phone, Instagram, Globe, DollarSign, 
  ChevronLeft, ChevronRight, Minus, Plus, Maximize,
  AlertCircle, X
} from 'lucide-react'
import { getFestivals, getReports } from '../firebaseUtils'
import type { Festival, Hotspot, Report } from '../types'
import HotspotModal from '../components/HotspotModal'
import { useSEO } from '../hooks/useSEO'
import './FestivalDetail.css'

type Tab = 'info' | 'map' | 'access'

export default function FestivalDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [festival, setFestival] = useState<Festival | null>(null)
  const [tab, setTab] = useState<Tab>('map')
  const [imgIdx, setImgIdx] = useState(0)
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [mapScale, setMapScale] = useState(0.5)
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 })
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [festData, reportData] = await Promise.all([
          getFestivals(),
          getReports()
        ])
        const found = festData.find(f => f.id === id)
        if (!found) navigate('/maps')
        else {
          setFestival(found)
          setReports(reportData.filter(r => r.festivalId === id && r.isApproved))
        }
      } catch (err) {
        console.error('Failed to load detail from Firebase:', err)
        navigate('/maps')
      }
    }
    loadData()
  }, [id, navigate])

  useSEO({
    title: festival ? `${festival.name} 무장애 정보 | 내일` : '무장애 축제 정보 불러오는 중 | 내일',
    description: festival ? `${festival.name}의 휠체어 접근성, 장애인 화장실, 경사로 정보를 확인하세요. 당사자와 함께 직접 조사한 믿을 수 있는 데이터입니다.` : '로딩 중...',
    url: festival ? `https://naeilmap.com/maps/${festival.id}` : 'https://naeilmap.com/maps'
  });

  if (!festival) return <div className="loading">불러오는 중...</div>

  return (
    <div className="detail-page">
      {festival && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              "itemListElement": [
                { "@type": "ListItem", "position": 1, "name": "홈", "item": "https://naeilmap.com/" },
                { "@type": "ListItem", "position": 2, "name": "무장애 축제 검색", "item": "https://naeilmap.com/maps" },
                { "@type": "ListItem", "position": 3, "name": festival.name, "item": `https://naeilmap.com/maps/${festival.id}` }
              ]
            })
          }}
        />
      )}
      {/* 탭 */}
      <div className="tab-bar">
        {(['map', 'info', 'access'] as Tab[]).map(t => (
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
            {(() => {
              const displayImages = festival.images.length > 0
                ? festival.images
                : (festival.thumbnail ? [festival.thumbnail] : [])
              return (
                <div className="info-slider">
                  <div className="slider-wrap">
                    <img
                      src={displayImages[imgIdx] || '/placeholder.svg'}
                      alt={festival.name}
                      onError={e => { (e.target as HTMLImageElement).src = '/placeholder.svg' }}
                    />
                    {displayImages.length > 1 && (
                      <>
                        <button className="slider-btn prev" onClick={() => setImgIdx(i => (i - 1 + displayImages.length) % displayImages.length)}>
                          <ChevronLeft size={18} />
                        </button>
                        <button className="slider-btn next" onClick={() => setImgIdx(i => (i + 1) % displayImages.length)}>
                          <ChevronRight size={18} />
                        </button>
                      </>
                    )}
                  </div>
                  <div className="slider-dots">
                    {(displayImages.length > 0 ? displayImages : ['']).map((_, i) => (
                      <span key={i} className={`dot ${i === imgIdx ? 'active' : ''}`} onClick={() => setImgIdx(i)} />
                    ))}
                  </div>
                </div>
              )
            })()}

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
                  <div className="info-row align-top description-row">
                    <Globe size={18} />
                    <div>
                      <p className="info-label">[행사소개]</p>
                      <p className="description-text">{festival.description}</p>
                    </div>
                  </div>
                )}
                {festival.programs && festival.programs.length > 0 && (
                  <div className="info-row align-top programs-row">
                    <Globe size={18} />
                    <div>
                      <p className="info-label">[주요 프로그램]</p>
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
          <div className="map-layout full-map">

            {/* 우측 지도 */}
            <div className="map-area">
              <div className="map-controls">
                <button onClick={() => setMapScale(s => Math.max(0.5, s - 0.25))} title="축소"><Minus size={16} /></button>
                <span>{Math.round(mapScale * 100)}%</span>
                <button onClick={() => setMapScale(s => Math.min(3, s + 0.25))} title="확대"><Plus size={16} /></button>
                <div className="control-divider" />
                <button onClick={() => festival.mapImage && window.open(festival.mapImage, '_blank')} title="원본 이미지 보기">
                  <Maximize size={16} />
                </button>
              </div>

              <div 
                className={`map-viewport ${isDragging ? 'dragging' : ''}`} 
                ref={mapRef}
                onMouseDown={(e) => {
                  if (!mapRef.current) return
                  setIsDragging(true)
                  setDragStart({
                    x: e.pageX,
                    y: e.pageY,
                    scrollLeft: mapRef.current.scrollLeft,
                    scrollTop: mapRef.current.scrollTop
                  })
                }}
                onMouseMove={(e) => {
                  if (!isDragging || !mapRef.current) return
                  e.preventDefault()
                  const dx = e.pageX - dragStart.x
                  const dy = e.pageY - dragStart.y
                  mapRef.current.scrollLeft = dragStart.scrollLeft - dx
                  mapRef.current.scrollTop = dragStart.scrollTop - dy
                }}
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
                onTouchStart={(e) => {
                  if (!mapRef.current) return
                  if (e.touches.length === 2) {
                    setIsDragging(false) // Stop dragging when pinching
                    const dist = Math.hypot(
                      e.touches[0].pageX - e.touches[1].pageX,
                      e.touches[0].pageY - e.touches[1].pageY
                    )
                    ;(mapRef.current as any)._lastDist = dist
                  } else {
                    setIsDragging(true)
                    const touch = e.touches[0]
                    setDragStart({
                      x: touch.pageX,
                      y: touch.pageY,
                      scrollLeft: mapRef.current.scrollLeft,
                      scrollTop: mapRef.current.scrollTop
                    })
                  }
                }}
                onTouchMove={(e) => {
                  if (!mapRef.current) return
                  if (e.touches.length === 2) {
                    const dist = Math.hypot(
                      e.touches[0].pageX - e.touches[1].pageX,
                      e.touches[0].pageY - e.touches[1].pageY
                    )
                    const lastDist = (mapRef.current as any)._lastDist || dist
                    const delta = dist / lastDist
                    const newScale = Math.max(0.5, Math.min(3, mapScale * delta))
                    if (Math.abs(newScale - mapScale) > 0.01) {
                      setMapScale(newScale)
                      ;(mapRef.current as any)._lastDist = dist
                    }
                  } else if (isDragging) {
                    const touch = e.touches[0]
                    const dx = touch.pageX - dragStart.x
                    const dy = touch.pageY - dragStart.y
                    mapRef.current.scrollLeft = dragStart.scrollLeft - dx
                    mapRef.current.scrollTop = dragStart.scrollTop - dy
                  }
                }}
                onTouchEnd={() => {
                  setIsDragging(false)
                  if (mapRef.current) delete (mapRef.current as any)._lastDist
                }}
              >
                <div 
                  className="map-scaler" 
                  style={{ 
                    width: imgSize.w ? `${imgSize.w * mapScale}px` : 'auto',
                    height: imgSize.h ? `${imgSize.h * mapScale}px` : 'auto'
                  }}
                >
                  <div 
                    className="map-image-wrap" 
                    style={{ 
                      transform: `scale(${mapScale})`,
                      transformOrigin: '0 0'
                    }}
                  >
                    {festival.mapImage ? (
                       <img
                        src={festival.mapImage}
                        alt="축제 무장애지도"
                        className="map-img"
                        onLoad={(e) => {
                          const img = e.currentTarget;
                          const viewport = mapRef.current;
                          setImgSize({ w: img.naturalWidth, h: img.naturalHeight });
                          if (viewport) {
                            const scaleX = (viewport.clientWidth - 40) / img.naturalWidth;
                            const scaleY = (viewport.clientHeight - 40) / img.naturalHeight;
                            const fitScale = Math.min(scaleX, scaleY, 1);
                            setMapScale(fitScale);
                          }
                        }}
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
                        className={`hotspot-btn ${hs.isReportBased ? 'report-pin' : 'info-pin'}`}
                        style={{ 
                          left: `${hs.x}%`, 
                          top: `${hs.y}%`,
                          zIndex: hs.isReportBased ? 12 : 10
                        }}
                        onClick={() => setSelectedHotspot(hs)}
                        title={hs.label}
                      />
                    ))}
                    
                    {/* 승인된 제보 아이콘 (빨간 느낌표) */}
                    {reports.map(r => (
                      <button
                        key={r.id}
                        className="report-pin-btn pulse"
                        style={{ 
                          left: `${r.x}%`, 
                          top: `${r.y}%`,
                          position: 'absolute',
                          transform: 'translate(-50%, -100%)',
                          background: 'none',
                          border: 'none',
                          color: 'var(--red)',
                          cursor: 'pointer',
                          zIndex: 10
                        }}
                        onClick={() => setSelectedReport(r)}
                        title="현장 변동사항 제보"
                      >
                        <AlertCircle size={24} color="#E53E3E" fill="white" />
                      </button>
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

      {/* 제보 상세 모달 (방문자용) */}
      {selectedReport && (
        <div className="report-modal-overlay" onClick={e => e.target === e.currentTarget && setSelectedReport(null)}>
          <div className="report-modal-box">
            <button className="modal-close" onClick={() => setSelectedReport(null)}><X size={20} /></button>
            <div className="report-modal-header">
              <AlertCircle size={24} color="#E53E3E" />
              <h3>현장 변동/불편사항 알림</h3>
            </div>
            <div className="report-modal-body">
              <div className="report-info-section">
                <p className="report-location"><MapPin size={14} /> {selectedReport.locationDetail || '상세 위치 정보 없음'}</p>
                <div className="report-text-content">
                  {selectedReport.content}
                </div>
              </div>
              
              {selectedReport.images && selectedReport.images.length > 0 && (
                <div className="report-gallery">
                  {selectedReport.images.map((img, i) => (
                    <img key={i} src={img} alt="현장 사진" onClick={() => window.open(img)} />
                  ))}
                </div>
              )}
              
              <p className="report-notice">
                * 위 내용은 방문자의 제보를 바탕으로 관리자가 승인한 현장 정보입니다. 이용에 참고하시기 바랍니다.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
