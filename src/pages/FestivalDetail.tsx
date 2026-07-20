import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Calendar, MapPin, Phone, Instagram, Globe, DollarSign, 
  ChevronLeft, ChevronRight, Minus, Plus, Maximize, Minimize2,
  AlertCircle, X, RefreshCcw, Smartphone, Map, Layers
} from 'lucide-react'
import { getFestivals, getReports } from '../firebaseUtils'
import type { Festival, Hotspot, Report } from '../types'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import HotspotModal from '../components/HotspotModal'
import SEO from '../components/SEO'
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
  const [isFullScreen, setIsFullScreen] = useState(false)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [isPortrait, setIsPortrait] = useState(true)
  const [showRotateGuide, setShowRotateGuide] = useState(true)

  useEffect(() => {
    let timeoutId: any;
    const checkOrientation = () => {
      // iOS 등에서 orientationchange 직후 innerWidth가 늦게 갱신되는 버그 방지
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const mobile = window.matchMedia('(max-width: 1024px)').matches || window.innerWidth <= 1024;
        const portrait = window.matchMedia('(orientation: portrait)').matches;
        setIsMobile(mobile);
        setIsPortrait(portrait);
      }, 150);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);


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
    const isCurrentlyFullscreen = isFullScreen || !!(doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement)

    if (!isCurrentlyFullscreen) {
      if (el.requestFullscreen) {
        el.requestFullscreen().then(() => {
          if (window.screen && window.screen.orientation && window.screen.orientation.lock) {
            window.screen.orientation.lock('landscape').catch(() => {})
          }
        }).catch((err: any) => console.log('Native API error:', err))
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen()
      } else if (el.mozRequestFullScreen) {
        el.mozRequestFullScreen()
      } else if (el.msRequestFullscreen) {
        el.msRequestFullscreen()
      }
      setIsFullScreen(true)
    } else {
      if (doc.exitFullscreen && doc.fullscreenElement) {
        doc.exitFullscreen().then(() => {
          if (window.screen && window.screen.orientation && window.screen.orientation.unlock) {
            window.screen.orientation.unlock()
          }
        }).catch(() => {})
      } else if (doc.webkitExitFullscreen && doc.webkitFullscreenElement) {
        doc.webkitExitFullscreen()
      } else if (doc.mozCancelFullScreen && doc.mozFullScreenElement) {
        doc.mozCancelFullScreen()
      } else if (doc.msExitFullscreen && doc.msFullscreenElement) {
        doc.msExitFullscreen()
      }
      setIsFullScreen(false)
    }
  }

  // 전체화면 및 가로모드 시 바디 스크롤 잠금 & 글로벌 풀스크린 클래스 부여
  useEffect(() => {
    if (isFullScreen || (isMobile && !isPortrait)) {
      document.body.style.overflow = 'hidden'
      document.body.classList.add('has-fullscreen-map')
    } else {
      document.body.style.overflow = ''
      document.body.classList.remove('has-fullscreen-map')
    }
    return () => { 
      document.body.style.overflow = '' 
      document.body.classList.remove('has-fullscreen-map')
    }
  }, [isFullScreen, isMobile, isPortrait])

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



  if (!festival) return (
    <div className="loading">
      <SEO 
        title="무장애 축제 정보 불러오는 중 | 내일맵" 
        description="데이터를 불러오고 있습니다." 
        url="https://naeilmap.com/maps" 
      />
      불러오는 중...
    </div>
  )

  return (
    <div className="detail-page">
      <SEO 
        title={`${festival.name} 무장애 축제 지도 | 내일맵`}
        description={`${festival.name}의 휠체어 접근성, 장애인 화장실 정보를 무장애지도로 확인하세요. 내일(NAEIL)이 직접 조사한 배리어프리 데이터입니다.`}
        url={`https://naeilmap.com/maps/${festival.id}`}
        image={festival.thumbnail || festival.mapImage}
      />
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
              className={`map-area${isFullScreen ? ' is-fullscreen' : ''}${isMobile && !isPortrait ? ' mobile-landscape-fullscreen' : ''}`}
              ref={mapContainerRef}
            >
              {isMobile && isPortrait && showRotateGuide && (
                <div className="rotate-guide-overlay">
                  <button className="guide-close-btn" onClick={() => setShowRotateGuide(false)} aria-label="안내 닫기">
                    <X size={24} />
                  </button>
                  <div className="guide-content">
                    <div className="phone-icon-wrap">
                      <Smartphone size={48} className="phone-icon" />
                    </div>
                    <p>지도를 더 넓게 보시려면<br/>기기를 <strong>가로로 회전</strong>해주세요</p>
                  </div>
                </div>
              )}
              {(() => {
                const validMaps = (festival.mapImages || []).filter(url => url && url.trim() !== '')
                const maps = validMaps.length > 0 ? validMaps : (festival.mapImage ? [festival.mapImage] : [])
                if (maps.length > 1) {
                  return (
                    <div 
                      className="map-layer-toggle"
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      {maps.map((_, idx) => (
                        <button 
                          key={idx}
                          className={`map-layer-btn ${activeMapIndex === idx ? 'active' : ''}`}
                          onPointerDown={(e) => { e.stopPropagation(); setActiveMapIndex(idx); }}
                          onClick={(e) => { e.stopPropagation(); setActiveMapIndex(idx); }}
                          title={idx === 0 ? '앞면 지도' : '뒷면 지도'}
                        >
                          {idx === 0 ? <Map size={18} /> : <Layers size={18} />}
                          <span>{idx === 0 ? '앞면' : '뒷면'}</span>
                        </button>
                      ))}
                    </div>
                  )
                }
                return null
              })()}


              {/* 지도 뷰포트 및 컨트롤 */}
              <TransformWrapper
                initialScale={1}
                minScale={0.5}
                maxScale={4}
                centerOnInit={true}
                limitToBounds={true}
              >
                {({ zoomIn, zoomOut, resetTransform, state }) => (
                  <>
                    <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }} contentStyle={{ minWidth: '100%', minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div className="map-image-wrap" style={{ position: 'relative', display: 'inline-block' }}>
                        {(() => {
                          const validMaps = (festival.mapImages || []).filter(url => url && url.trim() !== '')
                          const maps = validMaps.length > 0 ? validMaps : (festival.mapImage ? [festival.mapImage] : [])
                          const currentMap = maps[activeMapIndex]
                          return currentMap ? (
                            <img
                              src={currentMap}
                              alt="축제 무장애지도"
                              className="map-img"
                              loading="lazy"
                              decoding="async"
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
                    </TransformComponent>

                    {/* 하단 컨트롤 */}
                    <div 
                      className="map-controls"
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <button 
                        type="button" 
                        onPointerDown={(e) => { e.stopPropagation(); zoomOut(); }}
                        onClick={(e) => { e.stopPropagation(); zoomOut(); }}
                        title="축소"
                      >
                        <Minus size={18} />
                      </button>
                      
                      <button 
                        type="button" 
                        className="reset-zoom-btn" 
                        onPointerDown={(e) => { e.stopPropagation(); resetTransform(); }}
                        onClick={(e) => { e.stopPropagation(); resetTransform(); }}
                        title="화면에 맞춤"
                      >
                        <RefreshCcw size={16} />
                      </button>

                      <span>{Math.round(state.scale * 100)}%</span>

                      <button 
                        type="button" 
                        onPointerDown={(e) => { e.stopPropagation(); zoomIn(); }}
                        onClick={(e) => { e.stopPropagation(); zoomIn(); }}
                        title="확대"
                      >
                        <Plus size={18} />
                      </button>

                      <div className="control-divider" />
                      <button 
                        type="button" 
                        onPointerDown={(e) => { e.stopPropagation(); toggleFullScreen(); }}
                        onClick={(e) => { e.stopPropagation(); toggleFullScreen(); }}
                        title={isFullScreen ? '전체화면 종료' : '전체화면'}
                      >
                        {isFullScreen ? <Minimize2 size={16} /> : <Maximize size={16} />}
                      </button>
                    </div>
                  </>
                )}
              </TransformWrapper>

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
                  <h3>{s.title || s.name}</h3>
                  {s.content ? (
                    <p style={{ whiteSpace: 'pre-line', lineHeight: '1.6', color: 'var(--gray-700)', marginTop: '0.5rem' }}>{s.content}</p>
                  ) : (
                    <ul>
                      {s.target && <li><strong>이용대상</strong>: {s.target}</li>}
                      {s.phone && <li><strong>이용방법</strong>: {s.phone}</li>}
                      {s.fee && <li><strong>이용요금</strong>: {s.fee}</li>}
                      {s.operator && <li><strong>운행</strong>: {s.operator}</li>}
                      {s.inquiry && <li><strong>기타문의</strong>: {s.inquiry}</li>}
                    </ul>
                  )}
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
