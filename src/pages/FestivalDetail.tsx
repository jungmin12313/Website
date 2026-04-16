import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Calendar, MapPin, Phone, Instagram, Globe, DollarSign, 
  ChevronLeft, ChevronRight, Minus, Plus, Maximize, Minimize2,
  AlertCircle, X, RefreshCcw
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
  const [activeMapIndex, setActiveMapIndex] = useState(0)
  const [imgIdx, setImgIdx] = useState(0)
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [mapScale, setMapScale] = useState(0.5)
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 })
  const [isFullScreen, setIsFullScreen] = useState(false)
  const mapRef = useRef<HTMLDivElement>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)

  // 전체화면 상태 변화 감지
  useEffect(() => {
    const handleFsChange = () => {
      const doc = document as any
      setIsFullScreen(!!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement))
    }
    document.addEventListener('fullscreenchange', handleFsChange)
    document.addEventListener('webkitfullscreenchange', handleFsChange)
    document.addEventListener('mozfullscreenchange', handleFsChange)
    document.addEventListener('MSFullscreenChange', handleFsChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange)
      document.removeEventListener('webkitfullscreenchange', handleFsChange)
      document.removeEventListener('mozfullscreenchange', handleFsChange)
      document.removeEventListener('MSFullscreenChange', handleFsChange)
    }
  }, [])

  // 전체화면 토글
  const toggleFullScreen = () => {
    const doc = document as any
    const el = mapContainerRef.current as any

    if (!doc.fullscreenElement && !doc.webkitFullscreenElement && !doc.mozFullScreenElement && !doc.msFullscreenElement) {
      if (el.requestFullscreen) {
        el.requestFullscreen().catch((err: any) => console.error(err))
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen()
      } else if (el.mozRequestFullScreen) {
        el.mozRequestFullScreen()
      } else if (el.msRequestFullscreen) {
        el.msRequestFullscreen()
      }
    } else {
      if (doc.exitFullscreen) {
        doc.exitFullscreen()
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen()
      } else if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen()
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen()
      }
    }
  }

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
    title: festival ? `${festival.name} | 무장애지도 전문 플랫폼 '내일'` : '무장애 축제 정보 불러오는 중 | 내일',
    description: festival ? `${festival.name}의 휠체어 접근성, 장애인 화장실, 경사로 정보를 상세한 무장애지도로 확인하세요. 내일(NAEIL)이 직접 조사한 데이터입니다.` : '로딩 중...',
    url: festival ? `https://naeilmap.com/maps/${festival.id}` : 'https://naeilmap.com/maps'
  })

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
                      style={{ 
                        objectFit: 'contain',
                        transform: `scale(${(festival.images.length > 0 ? (festival.galleryZoom || 100) : (festival.thumbnailZoom || 100)) / 100})`
                      }}
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
                  {displayImages.length > 1 && (
                    <div className="slider-dots">
                      {displayImages.map((_, i) => (
                        <span key={i} className={`dot ${i === imgIdx ? 'active' : ''}`} onClick={() => setImgIdx(i)} />
                      ))}
                    </div>
                  )}
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

            {/* 지도 영역 - ref를 여기에 연결해 전체화면 대상이 됨 */}
            <div
              className={`map-area${isFullScreen ? ' is-fullscreen' : ''}`}
              ref={mapContainerRef}
            >
              {(() => {
                const maps = festival.mapImages?.length ? festival.mapImages : (festival.mapImage ? [festival.mapImage] : [])
                if (maps.length > 1) {
                  return (
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', position: 'absolute', top: '0.75rem', left: '0.75rem', zIndex: 11 }}>
                      <button style={{ padding: '0.4rem 0.9rem', background: activeMapIndex === 0 ? 'var(--primary)' : 'white', color: activeMapIndex === 0 ? 'white' : 'var(--text-main)', border: '1px solid var(--border)', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.85rem' }} onClick={() => setActiveMapIndex(0)}>앞면 지도</button>
                      <button style={{ padding: '0.4rem 0.9rem', background: activeMapIndex === 1 ? 'var(--primary)' : 'white', color: activeMapIndex === 1 ? 'white' : 'var(--text-main)', border: '1px solid var(--border)', borderRadius: '0.5rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.85rem' }} onClick={() => setActiveMapIndex(1)}>뒷면 지도</button>
                    </div>
                  )
                }
                return null
              })()}


              {/* 지도 뷰포트 */}
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
                    setIsDragging(false)
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
                  // 핀치 줌 또는 드래그 중에는 브라우저 스크롤 방지
                  if (e.touches.length === 2 || isDragging) {
                    if (e.cancelable) e.preventDefault();
                  }

                  if (e.touches.length === 2) {
                    const dist = Math.hypot(
                      e.touches[0].pageX - e.touches[1].pageX,
                      e.touches[0].pageY - e.touches[1].pageY
                    )
                    const lastDist = (mapRef.current as any)._lastDist || dist
                    const delta = dist / lastDist
                    
                    if (Math.abs(dist - lastDist) > 1) { // 유의미한 움직임이 있을 때만 업데이트
                      setMapScale(prev => {
                        const newScale = prev * delta
                        return Math.max(0.2, Math.min(5, newScale)) // 범위 확장
                      })
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
                    {(() => {
                      const maps = festival.mapImages?.length ? festival.mapImages : (festival.mapImage ? [festival.mapImage] : [])
                      const currentMap = maps[activeMapIndex]
                      return currentMap ? (
                        <img
                          src={currentMap}
                          alt="축제 무장애지도"
                          className="map-img"
                          onLoad={(e) => {
                            const img = e.currentTarget
                            const viewport = mapRef.current
                            setImgSize({ w: img.naturalWidth, h: img.naturalHeight })
                            if (viewport) {
                              const scaleX = (viewport.clientWidth - 40) / img.naturalWidth
                              const scaleY = (viewport.clientHeight - 40) / img.naturalHeight
                              const fitScale = Math.min(scaleX, scaleY, 1)
                              setMapScale(fitScale)
                            }
                          }}
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                        />
                      ) : (
                        <div className="map-placeholder">
                          <p>지도 이미지가 준비 중입니다.</p>
                          <p className="map-placeholder-sub">어드민 페이지에서 지도를 업로드하고 핫스팟을 설정해주세요.</p>
                        </div>
                      )
                    })()}

                    {/* 핫스팟 */}
                    {festival.hotspots.filter(hs => (hs.mapIndex || 0) === activeMapIndex).map(hs => (
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

                    {/* 승인된 제보 아이콘 */}
                    {reports.filter(r => (r.mapIndex || 0) === activeMapIndex).map(r => (
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

              {/* 하단 컨트롤 - 뷰포트 다음에 위치하여 터치 이벤트 우선순위 확보 */}
              <div className="map-controls">
                <button 
                  type="button" 
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    setMapScale(s => Math.max(0.1, s - 0.1));
                  }} 
                  title="축소"
                >
                  <Minus size={18} />
                </button>
                
                <button 
                  type="button" 
                  className="reset-zoom-btn"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    if (mapRef.current) {
                      const img = mapRef.current.querySelector('.map-img') as HTMLImageElement;
                      if (img) {
                        const scaleX = (mapRef.current.clientWidth - 40) / img.naturalWidth;
                        const scaleY = (mapRef.current.clientHeight - 40) / img.naturalHeight;
                        const fitScale = Math.min(scaleX, scaleY, 1);
                        setMapScale(fitScale);
                        mapRef.current.scrollLeft = 0;
                        mapRef.current.scrollTop = 0;
                      }
                    }
                  }}
                  title="화면에 맞춤"
                >
                  <RefreshCcw size={16} />
                </button>

                <span>{Math.round(mapScale * 100)}%</span>

                <button 
                  type="button" 
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    setMapScale(s => Math.min(5, s + 0.1));
                  }} 
                  title="확대"
                >
                  <Plus size={18} />
                </button>

                <div className="control-divider" />
                <button type="button" onPointerDown={(e) => { e.stopPropagation(); toggleFullScreen(); }} title={isFullScreen ? '전체화면 종료' : '전체화면'}>
                  {isFullScreen ? <Minimize2 size={16} /> : <Maximize size={16} />}
                </button>
              </div>

              {/* 모달: map-area 안에 배치해야 전체화면에서도 보임 */}
              {selectedHotspot && (
                <HotspotModal
                  hotspot={selectedHotspot}
                  pictograms={festival.pictograms}
                  onClose={() => setSelectedHotspot(null)}
                />
              )}

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
    </div>
  )
}
