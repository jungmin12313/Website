import { useState, useRef, useEffect } from 'react'
import { Plus, Trash2, Save, Upload, X, MapPin, Home, Calendar, Instagram, ShieldAlert, CheckCircle, Clock, User, Phone, AlertTriangle, Loader2, LogOut } from 'lucide-react'
import { auth } from '../firebase'
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth'
import type { Hotspot, Festival, Report } from '../types'
import { getFestivals, saveFestival as dbSave, deleteFestival as dbDelete, saveSetting, getSetting, getReports, deleteReport, saveReport } from '../firebaseUtils'
import './Admin.css'

const HERO_BG_STORAGE_KEY = 'naeil_hero_bg'

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'festivals' | 'hotspots' | 'hero' | 'reports'>('festivals')
  const [festivals, setFestivals] = useState<Festival[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [heroBg, setHeroBg] = useState<string>('')
  
  // Festival state
  const [editingFestival, setEditingFestival] = useState<Festival | null>(null)
  
  // Hotspot state
  const [selectedFestivalId, setSelectedFestivalId] = useState<string>('')
  const [hotspots, setHotspots] = useState<Hotspot[]>([])
  const [mapSrc, setMapSrc] = useState<string>('')
  const [adding, setAdding] = useState(false)
  const [editHs, setEditHs] = useState<Hotspot | null>(null)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [password, setPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 })
  const mapRef = useRef<HTMLDivElement>(null)
  const mapAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Firebase Auth State Listener
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthorized(true)
      } else {
        setIsAuthorized(false)
      }
    });

    // Load festivals
    getFestivals().then(data => {
      setFestivals(data)
    }).catch(err => {
      console.error('Failed to load from Firebase', err)
    })

    // Load reports
    getReports().then(setReports)

    getSetting(HERO_BG_STORAGE_KEY).then(savedHero => {
      if (savedHero) setHeroBg(savedHero)
    })

    return () => unsubscribe();
  }, [])

  const updateAndSave = async (f: Festival, successMsg?: string) => {
    try {
      await dbSave(f)
      setFestivals(prev => {
        const exists = prev.find(pf => pf.id === f.id)
        return exists ? prev.map(pf => pf.id === f.id ? f : pf) : [...prev, f]
      })
      if (successMsg) alert(successMsg)
      return true
    } catch (e) {
      console.error('Save error:', e)
      alert('데이터베이스 저장 실패 (용량 과다 또는 네트워크 문제)')
      return false
    }
  }

  // Helper visibility for storage usage
  const getStorageUsage = () => {
    const total = JSON.stringify(localStorage).length
    return (total / 1024 / 1024).toFixed(2) + ' MB'
  }

  const compressImage = (base64: string, maxWidth = 1200, quality = 0.7): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.src = base64
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        if (width > maxWidth) {
          height = (maxWidth / width) * height
          width = maxWidth
        }

        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
    })
  }

  const handleHeroBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = async () => {
      // 1MB(Base64) 제한을 피하기 위해 크기와 품질을 낮춤
      const compressed = await compressImage(reader.result as string, 1280, 0.6)
      setHeroBg(compressed)
      try {
        await saveSetting(HERO_BG_STORAGE_KEY, compressed)
        alert('배경사진이 클라우드에 변경되었습니다.')
      } catch (err) {
        alert('이미지 용량이 너무 커서 클라우드에 저장할 수 없습니다. 더 작은 사진을 선택해주세요.')
      }
    }
    reader.readAsDataURL(file)
  }

  // --- Festival Management ---
  const addNewFestival = () => {
    const newF: Festival = {
      id: `fest-${Date.now()}`,
      name: '새 축제',
      subtitle: '',
      startDate: '',
      endDate: '',
      location: '',
      address: '',
      fee: '',
      phone: '',
      instagram: '',
      status: 'soon',
      thumbnail: '',
      images: [],
      description: '',
      programs: [],
      mapImage: '',
      hotspots: [],
      transport: null,
      pictograms: [],
      category: ''
    }
    setEditingFestival(newF)
  }

  const saveFestival = async () => {
    if (!editingFestival) return
    
    // Validation
    if (!editingFestival.name.trim()) {
      alert('축제 이름은 필수 입력 항목입니다.')
      return
    }

    const success = await updateAndSave(editingFestival, '축제 정보가 클라우드에 저장되었습니다.')
    if (success) {
      const { logAction } = await import('../firebaseUtils')
      await logAction('SAVE_FESTIVAL', editingFestival.id, { name: editingFestival.name })
      setEditingFestival(null)
    }
  }

  const deleteFestival = async (id: string) => {
    if (!confirm('정말 축제를 삭제하시겠습니까?')) return
    try {
      await dbDelete(id)
      const { logAction } = await import('../firebaseUtils')
      await logAction('DELETE_FESTIVAL', id, {})
      setFestivals(prev => prev.filter(f => f.id !== id))
      if (selectedFestivalId === id) {
        setSelectedFestivalId('')
        setHotspots([])
        setMapSrc('')
      }
      alert('축제가 삭제되었습니다.')
    } catch (e) {
      alert('삭제에 실패했습니다.')
    }
  }

  // --- Hotspot Management ---
  const loadFestivalForHotspots = (id: string) => {
    const f = festivals.find(f => f.id === id)
    if (!f) return
    setSelectedFestivalId(id)
    setHotspots(f.hotspots || [])
    setMapSrc(f.mapImage || '')
  }

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!adding) return
    const rect = mapRef.current!.getBoundingClientRect()
    // Increase precision to 3 decimal places (0.001% accuracy)
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    const newHs: Hotspot = {
      id: `hs-${Date.now()}`,
      x: Math.round(x * 1000) / 1000,
      y: Math.round(y * 1000) / 1000,
      w: 4,
      h: 4,
      label: '',

      description: [],
      pictogramIds: [],
      photos: [],
      pictogramImages: [],
    }
    setEditHs(newHs)
    setAdding(false)
  }

  const saveHotspot = async (hsWithDesc: Hotspot) => {
    if (!selectedFestivalId) return
    
    // Validation
    if (!hsWithDesc.label.trim()) {
      alert('장소 이름은 필수 입력 항목입니다.')
      return
    }

    const festival = festivals.find(f => f.id === selectedFestivalId)
    if (!festival) return

    const hotspotExists = festival.hotspots?.some(h => h.id === hsWithDesc.id)
    const newHotspots = hotspotExists
      ? festival.hotspots.map(h => h.id === hsWithDesc.id ? hsWithDesc : h)
      : [...(festival.hotspots || []), hsWithDesc]

    const updatedFestival = { ...festival, hotspots: newHotspots }
    const success = await updateAndSave(updatedFestival, '핫스팟이 클라우드에 연동되었습니다.')
    if (success) {
      const { logAction } = await import('../firebaseUtils')
      await logAction('SAVE_HOTSPOT', hsWithDesc.id, { label: hsWithDesc.label, festivalId: selectedFestivalId })
      setHotspots(newHotspots)
      setEditHs(null)
    }
  }

  const deleteHotspot = async (id: string) => {
    if (!confirm('핫스팟을 삭제하시겠습니까?')) return
    
    const festival = festivals.find(f => f.id === selectedFestivalId)
    if (!festival) return

    const newHotspots = (festival.hotspots || []).filter(h => h.id !== id)
    const updatedFestival = { ...festival, hotspots: newHotspots }
    
    const success = await updateAndSave(updatedFestival)
    if (success) {
      setHotspots(newHotspots)
    }
  }

  const handleMapUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = async () => {
      const compressed = await compressImage(reader.result as string, 2560, 0.85)
      setMapSrc(compressed)
      
      const festival = festivals.find(f => f.id === selectedFestivalId)
      if (festival) {
        updateAndSave({ ...festival, mapImage: compressed })
      }
    }
    reader.readAsDataURL(file)
  }

  const handleManualSeed = async () => {
    if (!confirm('초기 데이터를 데이터베이스에 강제로 동기화하시겠습니까? 기존 데이터가 있으면 중복될 수 있습니다.')) return
    try {
      const r = await fetch('/data/festivals.json')
      const initialData: Festival[] = await r.json()
      const { seedInitialData: seed } = await import('../firebaseUtils')
      await seed(initialData)
      alert('초기 데이터 동기화 완료!')
      window.location.reload()
    } catch (err) {
      alert('동기화 실패: ' + err)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    try {
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@naeil.app';
      await signInWithEmailAndPassword(auth, adminEmail, password);
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        alert('비밀번호가 틀렸습니다.');
      } else {
        alert('로그인 중 오류가 발생했습니다. (Firebase Auth 설정 확인 필요)');
      }
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout error:', err);
    }
  }

  if (!isAuthorized) {
    return (
      <div className="admin-login-page">
        <div className="login-card">
          <div className="login-icon"><Calendar size={32} /></div>
          <h2>관리자 시스템 접속</h2>
          <p>보안을 위해 비밀번호를 입력해주세요.</p>
          <form onSubmit={handleLogin}>
            <input 
              type="password" 
              placeholder="비밀번호" 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              autoFocus
            />
            <button type="submit" disabled={loginLoading}>
              {loginLoading ? <Loader2 className="animate-spin" size={20} /> : '인증하기'}
            </button>
          </form>
          <p className="login-footer">접속 코드는 관리자에게 문의하세요.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-title-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1>어드민 시스템</h1>
            <button onClick={handleLogout} className="logout-btn" title="로그아웃" style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', padding: '4px', display: 'flex' }}><LogOut size={18} /></button>
            <button onClick={handleManualSeed} style={{ fontSize: '11px', background: '#f1f3f5', border: '1px solid #dee2e6', borderRadius: '4px', padding: '2px 8px', marginLeft: '8px', cursor: 'pointer', color: '#888' }}>DB 초기화</button>
          </div>
          <div className="admin-tabs">
            <div className="storage-info">
              사용 중: <span>{getStorageUsage()}</span>
            </div>
            <button className={`tab-btn ${activeTab === 'festivals' ? 'active' : ''}`} onClick={() => setActiveTab('festivals')}>
              <Calendar size={18} /> 축제 관리
            </button>
            <button className={`tab-btn ${activeTab === 'hotspots' ? 'active' : ''}`} onClick={() => setActiveTab('hotspots')}>
              <MapPin size={18} /> 핫스팟 설정
            </button>
            <button className={`tab-btn ${activeTab === 'hero' ? 'active' : ''}`} onClick={() => setActiveTab('hero')}>
              <Home size={18} /> 홈 배경사진
            </button>
            <button className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
              <ShieldAlert size={18} /> 제보 관리 {reports.length > 0 && <span className="tab-badge">{reports.length}</span>}
            </button>
          </div>
        </div>
      </div>

      <div className="admin-body">
        {activeTab === 'festivals' && (
          <div className="admin-management">
            <div className="admin-list-header">
              <h3>축제 목록 ({festivals.length})</h3>
              <button className="add-main-btn" onClick={addNewFestival}><Plus size={18} /> 새 축제 추가</button>
            </div>
            <div className="admin-festival-grid">
              {festivals.map(f => (
                <div key={f.id} className="admin-f-card">
                  <div className="f-card-info">
                    <strong>{f.name}</strong>
                    <span>{f.startDate} ~ {f.endDate}</span>
                  </div>
                  <div className="f-card-actions">
                    <button className="edit-f-btn" onClick={() => setEditingFestival(f)}>수정</button>
                    <button className="del-f-btn" onClick={() => deleteFestival(f.id)}><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'hotspots' && (
          <div className="hotspot-management">
            <div className="admin-sidebar">
              <div className="sidebar-section">
                <label className="sidebar-label">축제 선택</label>
                <select
                  value={selectedFestivalId}
                  onChange={e => loadFestivalForHotspots(e.target.value)}
                  className="admin-select"
                >
                  <option value="">-- 축제를 선택하세요 --</option>
                  {festivals.map(f => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              {selectedFestivalId && (
                <>
                  <div className="sidebar-section">
                    <label className="sidebar-label">지도 이미지 업로드</label>
                    <label className="upload-btn">
                      <Upload size={16} /> 이미지 선택
                      <input type="file" accept="image/*" onChange={handleMapUpload} style={{ display: 'none' }} />
                    </label>
                  </div>

                  <div className="sidebar-section">
                    <label className="sidebar-label">핫스팟 관리</label>
                    <button className={`add-btn ${adding ? 'active' : ''}`} onClick={() => setAdding(!adding)}>
                      <Plus size={16} /> {adding ? '클릭 취소' : '지도 위 위치 클릭해서 추가'}
                    </button>
                    <div className="hs-list">
                      {hotspots.map(hs => (
                        <div key={hs.id} className="hs-item">
                          <button className="hs-name" onClick={() => setEditHs(hs)}>{hs.label || '(이름 없음)'}</button>
                          <button className="hs-delete" onClick={() => deleteHotspot(hs.id)}><Trash2 size={14} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div 
              className={`admin-map-area ${isDragging ? 'dragging' : ''}`} 
              ref={mapAreaRef}
              onMouseDown={(e) => {
                if (!mapAreaRef.current) return
                const scrollLeft = mapAreaRef.current.scrollLeft
                const scrollTop = mapAreaRef.current.scrollTop
                setDragStart({
                  x: e.pageX,
                  y: e.pageY,
                  scrollLeft,
                  scrollTop
                })
                // Allow dragging even when adding a hotspot to help position the map

                setIsDragging(true)
              }}
              onMouseMove={(e) => {
                if (!isDragging || !mapAreaRef.current) return
                e.preventDefault()
                const dx = e.pageX - dragStart.x
                const dy = e.pageY - dragStart.y
                mapAreaRef.current.scrollLeft = dragStart.scrollLeft - dx
                mapAreaRef.current.scrollTop = dragStart.scrollTop - dy
              }}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
            >
              {!selectedFestivalId ? (
                <div className="admin-map-empty"><p>왼쪽에서 축제를 먼저 선택하세요</p></div>
              ) : (
                <div className={`admin-map ${adding ? 'cursor-crosshair' : ''}`} ref={mapRef} onClick={(e) => {
                  // Only handle adding if we didn't drag
                  if (isDragging) return;
                  // Even if isDragging is false, double check movement to be safe
                  if (Math.abs(e.pageX - dragStart.x) > 5 || Math.abs(e.pageY - dragStart.y) > 5) return;
                  handleMapClick(e);
                }}>
                  {mapSrc ? <img src={mapSrc} className="admin-map-img" /> : <div className="admin-map-placeholder">지도 이미지를 업로드하세요</div>}
                  {hotspots.map(hs => (
                    <button 
                      key={hs.id} 
                      className={`admin-hotspot ${adding ? 'adding-mode' : ''}`} 
                      style={{ 
                        left: `${hs.x}%`, 
                        top: `${hs.y}%`,
                        width: `${hs.w || 4}%`,
                        height: `${hs.h || 4}%`
                      }} 
                      onClick={e => { e.stopPropagation(); setEditHs(hs) }}
                    >

                      <span className="admin-hs-label">{hs.label}</span>
                    </button>
                  ))}
                  {reports.filter(r => r.festivalId === selectedFestivalId && r.x !== undefined && r.y !== undefined).map(r => (
                    <button 
                      key={r.id} 
                      className={`admin-report-pin ${r.status}`} 
                      style={{ 
                        left: `${r.x}%`, 
                        top: `${r.y}%`,
                        position: 'absolute',
                        transform: 'translate(-50%, -100%)',
                        background: 'none',
                        border: 'none',
                        color: r.status === 'resolved' ? '#27AE60' : '#fa5252',
                        cursor: 'pointer',
                        zIndex: 10,
                        opacity: r.isApproved ? 1 : 0.4
                      }} 
                      onClick={e => { e.stopPropagation(); setSelectedReport(r) }}
                      title={`${r.isApproved ? '[공개중] ' : '[비공개] '}${r.locationDetail || '민원 제보'}`}
                    >
                      <AlertTriangle size={24} fill={r.isApproved ? "currentColor" : "none"} color="currentColor" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'hero' && (
          <div className="hero-management">
            <h3>홈 배경사진 설정</h3>
            <div className="hero-preview-area">
              {heroBg ? (
                <img src={heroBg} className="hero-bg-preview" />
              ) : (
                <div className="hero-no-bg">기본 배경사진 사용 중</div>
              )}
            </div>
            <div className="hero-actions">
              <label className="upload-hero-btn">
                <Upload size={18} /> 사진 업로드
                <input type="file" accept="image/*" onChange={handleHeroBgUpload} style={{ display: 'none' }} />
              </label>
              {heroBg && (
                <button className="reset-hero-btn" onClick={() => { setHeroBg(''); saveSetting(HERO_BG_STORAGE_KEY, '') }}>
                  기본으로 초기화
                </button>
              )}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="reports-management">
            <div className="admin-list-header">
              <h3>민원 제보 내역 ({reports.length})</h3>
            </div>
            <div className="reports-grid">
              {reports.map(r => (
                <div key={r.id} className="report-card">
                  <div className="report-card-header">
                    <div className="report-meta">
                      <span className={`status-tag ${r.status}`}>{r.status === 'pending' ? '접수됨' : '처리완료'}</span>
                      <span className="report-date">{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                    <button className="del-report-btn" onClick={async () => {
                      if (confirm('제보를 삭제하시겠습니까?')) {
                        await deleteReport(r.id)
                        setReports(prev => prev.filter(pr => pr.id !== r.id))
                      }
                    }}><Trash2 size={16} /></button>
                  </div>
                  <div className="report-card-body">
                    <div className="report-subject">
                      <strong>{r.festivalName}</strong>
                      <p>{r.content}</p>
                    </div>
                    {r.images && r.images.length > 0 && (
                      <div className="report-images">
                        {r.images.map((img, i) => <img key={i} src={img} alt="report" onClick={() => window.open(img)} />)}
                      </div>
                    )}
                  </div>
                  <div className="report-card-footer">
                    <div className="reporter-info">
                      <span title="이름"><User size={12} /> {r.name}</span>
                      <span title="연락처"><Phone size={12} /> {r.contact}</span>
                    </div>
                    <button 
                      className={`status-toggle-btn ${r.status === 'resolved' ? 'resolved' : ''}`}
                      onClick={async () => {
                        const newStatus = r.status === 'pending' ? 'resolved' : 'pending'
                        const updated = { ...r, status: newStatus as any }
                        await saveReport(updated)
                        setReports(prev => prev.map(pr => pr.id === r.id ? updated : pr))
                      }}
                    >
                      {r.status === 'pending' ? <><CheckCircle size={14} /> 해결 처리</> : <><Clock size={14} /> 미해결로 되돌리기</>}
                    </button>
                  </div>
                </div>
              ))}
              {reports.length === 0 && <div className="admin-map-placeholder">접수된 제보가 없습니다.</div>}
            </div>
          </div>
        )}
      </div>

      {editingFestival && (
        <FestivalEditor 
          festival={editingFestival!} 
          onSave={saveFestival} 
          onClose={() => setEditingFestival(null)} 
          setFestival={setEditingFestival} 
          compressImage={compressImage}
        />
      )}

      {editHs && (
        <HotspotEditor 
          hotspot={editHs!} 
          mapSrc={mapSrc}
          otherHotspots={hotspots.filter(h => h.id !== editHs!.id)}
          onSave={saveHotspot} 
          onClose={() => setEditHs(null)} 
          compressImage={compressImage}
        />
      )}

      {/* Report Detail Modal */}
      {selectedReport && (
        <ReportDetailModal 
          report={selectedReport!} 
          onClose={() => setSelectedReport(null)}
          onStatusChange={async (status) => {
            if (!selectedReport) return;
            const updated = { ...selectedReport, status }
            await saveReport(updated)
            setReports(prev => prev.map(pr => pr.id === selectedReport.id ? updated : pr))
            setSelectedReport(updated)
          }}
          onDelete={async (id) => {
            if (confirm('제보를 삭제하시겠습니까?')) {
              await deleteReport(id)
              setReports(prev => prev.filter(pr => pr.id !== id))
              setSelectedReport(null)
            }
          }}
          onApproveChange={async (isApproved) => {
            if (!selectedReport) return;
            const updated = { ...selectedReport, isApproved }
            await saveReport(updated)
            setReports(prev => prev.map(pr => pr.id === selectedReport.id ? updated : pr))
            setSelectedReport(updated)
          }}
        />
      )}
    </div>
  )
}

function FestivalEditor({ 
  festival, 
  onSave, 
  onClose, 
  setFestival,
  compressImage
}: { 
  festival: Festival, 
  onSave: () => void, 
  onClose: () => void, 
  setFestival: React.Dispatch<React.SetStateAction<Festival | null>>,
  compressImage: (base64: string, maxWidth?: number, quality?: number) => Promise<string>
}) {
  const update = (field: keyof Festival, val: any) => setFestival(prev => prev ? ({ ...prev, [field]: val }) : prev)
  
  const handleThumbUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = async () => {
      const compressed = await compressImage(reader.result as string, 800, 0.7)
      update('thumbnail', compressed)
    }
    reader.readAsDataURL(file)
  }

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string, 1200, 0.7)
        setFestival(prev => prev ? ({ ...prev, images: [...prev.images, compressed] }) : prev)
      }
      reader.readAsDataURL(file)
    })
  }

  const removeGalleryImage = (index: number) => {
    setFestival(prev => prev ? ({ ...prev, images: prev.images.filter((_, i) => i !== index) }) : prev)
  }

  const addProgram = () => {
    update('programs', [...festival.programs, ''])
  }

  const updateProgram = (index: number, val: string) => {
    const newProgs = [...festival.programs]
    newProgs[index] = val
    update('programs', newProgs)
  }

  const removeProgram = (index: number) => {
    update('programs', festival.programs.filter((_, i) => i !== index))
  }

  return (
    <div className="editor-overlay">
      <div className="editor-panel extra-wide">
        <div className="editor-header"><h3>축제 정보 수정</h3><button onClick={onClose}><X size={20} /></button></div>
        <div className="editor-body grid-2">
          <div className="editor-scroll">
            <label className="required">축제 이름</label>
            <input 
              value={festival.name} 
              onChange={e => update('name', e.target.value)} 
              className={!festival.name.trim() ? 'error' : ''}
              placeholder="축제 명칭을 입력하세요"
            />
            
            <label>부제목</label>
            <input value={festival.subtitle} onChange={e => update('subtitle', e.target.value)} placeholder="예: 공주알밤과 떠나는 달콤한 여행!" />
            
            <div className="row">
              <div><label>시작일</label><input value={festival.startDate} onChange={e => update('startDate', e.target.value)} placeholder="2025-01-16" /></div>
              <div><label>종료일</label><input value={festival.endDate} onChange={e => update('endDate', e.target.value)} placeholder="2025-01-20" /></div>
            </div>

            <div className="row">
              <div>
                <label>지역 (필터용)</label>
                <select value={festival.location} onChange={e => update('location', e.target.value)}>
                  <option value="">선택하세요</option>
                  <option value="충청남도">충청남도</option>
                  <option value="전라남도">전라남도</option>
                  <option value="광주">광주</option>
                  <option value="전라북도">전라북도</option>
                </select>
              </div>
              <div>
                <label>카테고리</label>
                <input value={festival.category || ''} onChange={e => update('category', e.target.value)} placeholder="예: 전통축제" />
              </div>
            </div>

            <label>주소</label><input value={festival.address} onChange={e => update('address', e.target.value)} placeholder="정확한 주소를 입력하세요" />
            <label>입장료</label><input value={festival.fee} onChange={e => update('fee', e.target.value)} placeholder="예: 무료 / 부분 유료" />
            <label>문의처</label><input value={festival.phone} onChange={e => update('phone', e.target.value)} placeholder="예: 041-840-8401" />
            <div style={{display:'flex', alignItems:'center', gap: '0.5rem', marginBottom: '0.375rem'}}><label style={{margin:0}}>인스타그램 ID</label><Instagram size={14} color="#888" /></div>
            <input value={festival.instagram} onChange={e => update('instagram', e.target.value)} placeholder="예: gongju_gunbam" />
            
            <label>행사소개</label>
            <textarea 
              value={festival.description} 
              onChange={e => update('description', e.target.value)} 
              rows={5}
              placeholder="상세한 행사 설명을 입력하세요"
            />
          </div>

          <div className="editor-scroll">
            <label>상태</label>
            <select value={festival.status} onChange={e => update('status', e.target.value)}>
              <option value="active">진행중</option>
              <option value="soon">준비중</option>
              <option value="ended">종료됨</option>
            </select>

            <label style={{marginTop: '1rem'}}>썸네일 이미지 (목록용)</label>
            <div 
              className="thumb-preview f-thumb interactive"
              title="마우스 휠이나 드래그로 위아래 위치를 맞추세요"
              onMouseDown={(e) => {
                const startY = e.pageY;
                const startPos = festival.thumbnailPositionY ?? 50;
                const onMouseMove = (moveEvent: MouseEvent) => {
                  const delta = moveEvent.pageY - startY;
                  // Sensitive drag: divide by container height (approx 180px)
                  const next = Math.max(0, Math.min(100, startPos - (delta / 2)));
                  update('thumbnailPositionY', next);
                };
                const onMouseUp = () => {
                  document.removeEventListener('mousemove', onMouseMove);
                  document.removeEventListener('mouseup', onMouseUp);
                };
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
              }}
              onWheel={(e) => {
                const current = festival.thumbnailPositionY ?? 50;
                const next = Math.max(0, Math.min(100, current + (e.deltaY > 0 ? 5 : -5)));
                update('thumbnailPositionY', next);
              }}
            >
              {festival.thumbnail ? (
                <img 
                  src={festival.thumbnail} 
                  style={{ 
                    objectPosition: `center ${festival.thumbnailPositionY ?? 50}%`,
                    pointerEvents: 'none'
                  }} 
                />
              ) : (
                <div className="empty-thumb-text">이미지를 선택하세요</div>
              )}
            </div>
            
            <div className="thumb-pos-control">
              <label>세로 위치 조절 (목록 노출)</label>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value={festival.thumbnailPositionY ?? 50} 
                onChange={e => update('thumbnailPositionY', Number(e.target.value))}
              />
            </div>

            <label className="upload-inline-btn"><Upload size={14} /> 이미지 변경<input type="file" accept="image/*" onChange={handleThumbUpload} style={{ display: 'none' }} /></label>


            <label style={{marginTop: '1rem'}}>상세 갤러리 이미지 (기본정보 탭)</label>
            <div className="hs-photos-preview">
              {festival.images?.map((p, i) => (
                <div key={i} className="photo-wrapper">
                  <img src={p} alt={`gallery-${i}`} />
                  <button className="photo-remove-btn" onClick={() => removeGalleryImage(i)}><X size={12} /></button>
                </div>
              ))}
              <label className="add-photo-box mini"><Plus /><input type="file" multiple onChange={handleGalleryUpload} style={{ display: 'none' }} /></label>
            </div>

            <div className="programs-section" style={{marginTop: '1rem'}}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: '0.5rem'}}>
                <label style={{margin:0}}>주요 프로그램</label>
                <button className="add-item-btn" onClick={addProgram}><Plus size={14} /> 추가</button>
              </div>
              <div className="program-inputs">
                {festival.programs.map((p, i) => (
                  <div key={i} className="prog-row">
                    <span>{i+1}.</span>
                    <input value={p} onChange={e => updateProgram(i, e.target.value)} placeholder="프로그램 명칭" />
                    <button onClick={() => removeProgram(i)}><Trash2 size={14} /></button>
                  </div>
                ))}
                {festival.programs.length === 0 && <p className="empty-text">프로그램이 없습니다.</p>}
              </div>
            </div>
          </div>
        </div>
        <div className="editor-footer"><button className="editor-save" onClick={onSave}><Save size={16} /> 저장하기</button></div>
      </div>
    </div>
  )
}

function HotspotEditor({ 
  hotspot, 
  mapSrc,
  otherHotspots,
  onSave, 
  onClose,
  compressImage 
}: { 
  hotspot: Hotspot, 
  mapSrc: string,
  otherHotspots: Hotspot[],
  onSave: (hs: Hotspot) => void, 
  onClose: () => void,
  compressImage: (base64: string, maxWidth?: number, quality?: number) => Promise<string>
}) {
  const [hs, setHs] = useState<Hotspot>({ 
    ...hotspot, 
    pictogramImages: hotspot.pictogramImages || [] 
  })
  const [descText, setDescText] = useState(hotspot.description.join('\n'))
  const [activePreviewTab, setActivePreviewTab] = useState<'map' | 'modal'>('map')

  const handleHsPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string, 1000, 0.7)
        setHs(prev => ({ ...prev, photos: [...prev.photos, compressed] }))
      }
      reader.readAsDataURL(file)
    })
  }

  const handlePictogramUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string, 400, 0.9)
        setHs(prev => ({ ...prev, pictogramImages: [...prev.pictogramImages, compressed] }))
      }
      reader.readAsDataURL(file)
    })
  }

  const removePhoto = (index: number) => {
    setHs(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }))
  }

  const removePictogram = (index: number) => {
    setHs(prev => ({ ...prev, pictogramImages: prev.pictogramImages.filter((_, i) => i !== index) }))
  }

  const [dragMode, setDragMode] = useState<'none' | 'drawing' | 'moving'>('none')
  const [moveStart, setMoveStart] = useState({ x: 0, y: 0, hsX: 0, hsY: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)
  const miniMapRef = useRef<HTMLDivElement>(null)

  const currentDescLines = descText.split('\n').filter(Boolean)

  const handleMiniMapMouseDown = (e: React.MouseEvent) => {
    if (!miniMapRef.current) return
    const rect = miniMapRef.current.getBoundingClientRect()
    const curX = ((e.clientX - rect.left) / rect.width) * 100
    const curY = ((e.clientY - rect.top) / rect.height) * 100

    const width = hs.w || 4
    const height = hs.h || 4
    
    // Check if we already have a box and the click is inside it (hs.x, hs.y is CENTER)
    const isInside = curX >= (hs.x - width / 2) && curX <= (hs.x + width / 2) &&
                     curY >= (hs.y - height / 2) && curY <= (hs.y + height / 2)

    if (isInside) {
      setDragMode('moving')
      setMoveStart({ x: curX, y: curY, hsX: hs.x, hsY: hs.y })
    } else {
      setDragMode('drawing')
      setResizeStart({ x: curX, y: curY })
      // New drawing starts at this point as a 0-size box centered here
      setHs(prev => ({
        ...prev,
        x: Math.round(curX * 1000) / 1000,
        y: Math.round(curY * 1000) / 1000,
        w: 0,
        h: 0
      }))
    }
  }

  const handleMiniMapMouseMove = (e: React.MouseEvent) => {
    if (!miniMapRef.current) return
    const rect = miniMapRef.current.getBoundingClientRect()
    const curX = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
    const curY = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100))

    // Update hovering state if not dragging
    if (dragMode === 'none') {
      const width = hs.w || 4
      const height = hs.h || 4
      const inside = curX >= (hs.x - width / 2) && curX <= (hs.x + width / 2) &&
                     curY >= (hs.y - height / 2) && curY <= (hs.y + height / 2)
      setIsHovering(inside)
      return
    }

    if (dragMode === 'drawing') {
      const centerX = (resizeStart.x + curX) / 2
      const centerY = (resizeStart.y + curY) / 2
      const width = Math.abs(curX - resizeStart.x)
      const height = Math.abs(curY - resizeStart.y)

      setHs(prev => ({
        ...prev,
        x: Math.round(centerX * 1000) / 1000,
        y: Math.round(centerY * 1000) / 1000,
        w: Math.round(width * 1000) / 1000,
        h: Math.round(height * 1000) / 1000
      }))
    } else if (dragMode === 'moving') {
      const dx = curX - moveStart.x
      const dy = curY - moveStart.y
      
      let newX = moveStart.hsX + dx
      let newY = moveStart.hsY + dy
      
      const width = hs.w || 4
      const height = hs.h || 4
      
      // Boundary check for center point
      newX = Math.max(width / 2, Math.min(100 - width / 2, newX))
      newY = Math.max(height / 2, Math.min(100 - height / 2, newY))

      setHs(prev => ({
        ...prev,
        x: Math.round(newX * 1000) / 1000,
        y: Math.round(newY * 1000) / 1000
      }))
    }
  }

  const handleMiniMapMouseUp = () => {
    setDragMode('none')
  }

  return (
    <div className="editor-overlay">
      <div className="editor-panel extra-wide">
        <div className="editor-header"><h3>핫스팟 편집</h3><button onClick={onClose}><X size={20} /></button></div>
        <div className="editor-body split-view">
          <div className="editor-form">
            <label className="required">장소 이름</label>
            <input 
              value={hs.label} 
              onChange={e => setHs({ ...hs, label: e.target.value })} 
              className={!hs.label.trim() ? 'error' : ''}
              placeholder="예: 휠체어 리프트 입구"
            />
            
            <div className="row">
              <div>
                <label>X 위치 (%)</label>
                <input type="number" value={hs.x} onChange={e => setHs({ ...hs, x: Number(e.target.value) })} step="0.1" />
              </div>
              <div>
                <label>Y 위치 (%)</label>
                <input type="number" value={hs.y} onChange={e => setHs({ ...hs, y: Number(e.target.value) })} step="0.1" />
              </div>
            </div>

            <div className="row">
              <div>
                <label>너비 (W %)</label>
                <input type="number" value={hs.w || 4} onChange={e => setHs({ ...hs, w: Number(e.target.value) })} step="0.5" />
              </div>
              <div>
                <label>높이 (H %)</label>
                <input type="number" value={hs.h || 4} onChange={e => setHs({ ...hs, h: Number(e.target.value) })} step="0.5" />
              </div>
            </div>

            <label>설명 (줄바꿈 구분)</label>
            <textarea 
              rows={3} 
              value={descText} 
              onChange={e => setDescText(e.target.value)}
              placeholder="• 입구 진입 경사로: 약 5도(1/12)&#10;• 출입구 폭: 약 0.9M"
            />
            
            <div className="image-sections">
              <div className="img-section">
                <label>실제 장소 이미지</label>
                <div className="hs-photos-preview">
                  {hs.photos.map((p, i) => (
                    <div key={i} className="photo-wrapper">
                      <img src={p} alt={`hotspot-${i}`} />
                      <button className="photo-remove-btn" onClick={() => removePhoto(i)}><X size={12} /></button>
                    </div>
                  ))}
                  <label className="add-photo-box mini"><Plus /><input type="file" multiple onChange={handleHsPhotoUpload} style={{ display: 'none' }} /></label>
                </div>
              </div>

              <div className="img-section">
                <label>픽토그램 이미지 (아이콘)</label>
                <div className="hs-photos-preview">
                  {hs.pictogramImages.map((p, i) => (
                    <div key={i} className="photo-wrapper pic-wrap">
                      <img src={p} alt={`pic-${i}`} />
                      <button className="photo-remove-btn" onClick={() => removePictogram(i)}><X size={12} /></button>
                    </div>
                  ))}
                  <label className="add-photo-box mini"><Plus /><input type="file" multiple onChange={handlePictogramUpload} style={{ display: 'none' }} /></label>
                </div>
              </div>
            </div>

          </div>

          <div className="editor-preview-container">
            <div className="preview-tabs">
              <button className={activePreviewTab === 'map' ? 'active' : ''} onClick={() => setActivePreviewTab('map')}>위치 미리보기</button>
              <button className={activePreviewTab === 'modal' ? 'active' : ''} onClick={() => setActivePreviewTab('modal')}>팝업 상세 미리보기</button>
            </div>

            {activePreviewTab === 'map' ? (
              <div className="mini-map-container">
                {mapSrc ? (
                  <div 
                    className={`mini-map interactive ${isHovering ? 'can-move' : ''} ${dragMode === 'moving' ? 'is-moving' : ''}`} 
                    ref={miniMapRef}
                    onMouseDown={handleMiniMapMouseDown}
                    onMouseMove={handleMiniMapMouseMove}
                    onMouseUp={handleMiniMapMouseUp}
                    onMouseLeave={handleMiniMapMouseUp}
                  >
                    <img src={mapSrc} className="mini-map-img" alt="Map Preview" style={{ userSelect: 'none', pointerEvents: 'none' }} />
                    {otherHotspots.map(other => (
                      <div 
                        key={other.id} 
                        className="mini-hotspot other" 
                        style={{ 
                          left: `${other.x}%`, 
                          top: `${other.y}%`,
                          width: `${other.w || 4}%`,
                          height: `${other.h || 4}%`
                        }}
                      />
                    ))}
                    <div 
                      className={`mini-hotspot current ${dragMode !== 'none' ? '' : 'pulse'}`} 
                      style={{ 
                        left: `${hs.x}%`, 
                        top: `${hs.y}%`,
                        width: `${hs.w || 4}%`,
                        height: `${hs.h || 4}%`,
                        minWidth: dragMode !== 'none' ? 0 : '10px',
                        minHeight: dragMode !== 'none' ? 0 : '10px',
                        pointerEvents: 'none'
                      }}
                    >
                      {dragMode === 'none' && <span className="mini-hs-label">{hs.label || '현재 위치'}</span>}
                    </div>
                    {dragMode === 'none' && <div className="mini-map-hint">드래그하여 영역 설정 / 클릭 이동 가능</div>}
                  </div>
                ) : (
                  <div className="mini-map-placeholder">지도가 없습니다</div>
                )}
              </div>
            ) : (
              <div className="modal-preview-area">
                <div className="mock-modal">
                  <div className="mock-modal-content">
                    <div className="mock-modal-left">
                      <h2 className="mock-title">{hs.label || '장소 이름'}</h2>
                      <div className="mock-pictograms">
                        {hs.pictogramImages.map((img, i) => (
                          <img key={i} src={img} className="mock-pic-img" alt="pic" />
                        ))}
                      </div>
                      <ul className="mock-desc-list">
                        {currentDescLines.length > 0 ? currentDescLines.map((line, i) => (
                          <li key={i}>{line}</li>
                        )) : (
                          <li className="placeholder">설명을 입력하면 여기에 표시됩니다.</li>
                        )}
                      </ul>
                      <p className="mock-footer-note">*혹시 사용에 불편한 점이 생겼다면&#10;본 홈페이지 신고센터에 신고해주세요.</p>
                    </div>
                    <div className="mock-modal-right">
                      {hs.photos.length > 0 ? (
                        <div className="mock-slider">
                          <img src={hs.photos[0]} className="mock-main-img" alt="preview" />
                          <div className="mock-dots">
                            {hs.photos.map((_, i) => <span key={i} className={`mock-dot ${i === 0 ? 'active' : ''}`} />)}
                          </div>
                        </div>
                      ) : (
                        <div className="mock-img-placeholder">실제 장소 사진을 추가하세요</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="editor-footer"><button className="editor-save" onClick={() => onSave({ ...hs, description: currentDescLines })}><Save size={16} /> 저장</button></div>
      </div>
    </div>
  )
}

function ReportDetailModal({ 
  report, 
  onClose, 
  onStatusChange,
  onDelete,
  onApproveChange
}: { 
  report: Report, 
  onClose: () => void,
  onStatusChange: (status: 'pending' | 'resolved') => void,
  onDelete: (id: string) => void,
  onApproveChange: (isApproved: boolean) => void
}) {
  return (
    <div className="editor-overlay">
      <div className="editor-panel">
        <div className="editor-header">
          <h3>민원 제보 상세</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="editor-body">
          <div className="report-detail-row">
            <span className={`status-tag ${report.status}`}>{report.status === 'pending' ? '접수됨' : '처리완료'}</span>
            <span className="report-date">{new Date(report.createdAt).toLocaleString()}</span>
          </div>
          
          <div className="report-section">
            <label>제보자 정보</label>
            <div className="reporter-info-box">
              <p><User size={14} /> {report.name}</p>
              <p><Phone size={14} /> {report.contact}</p>
            </div>
          </div>

          <div className="report-section">
            <label>위치 정보</label>
            <p className="location-text"><MapPin size={14} /> {report.locationDetail || '상세 위치 설명 없음'}</p>
            {report.x !== undefined && <p className="coord-text">좌표: ({report.x.toFixed(2)}%, {report.y?.toFixed(2)}%)</p>}
          </div>

          <div className="report-section">
            <label>제보 내용</label>
            <div className="report-content-box">
              {report.content}
            </div>
          </div>

          {report.images && report.images.length > 0 && (
            <div className="report-section">
              <label>현장 사진 ({report.images.length})</label>
              <div className="report-images-preview">
                {report.images.map((img, i) => (
                  <img key={i} src={img} alt="report" onClick={() => window.open(img)} />
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="editor-footer" style={{ justifyContent: 'space-between' }}>
          <button className="del-f-btn" onClick={() => onDelete(report.id)} style={{ padding: '0.5rem 1rem' }}>
            <Trash2 size={16} /> 삭제
          </button>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              className={`status-toggle-btn ${report.isApproved ? 'approved' : ''}`}
              onClick={() => onApproveChange(!report.isApproved)}
              style={{ background: report.isApproved ? '#fa5252' : '#f1f3f5', color: report.isApproved ? 'white' : '#666' }}
            >
              {report.isApproved ? '공개 취소' : '방문자 지도에 공개'}
            </button>
            <button 
              className={`status-toggle-btn ${report.status === 'resolved' ? 'resolved' : ''}`}
              onClick={() => onStatusChange(report.status === 'pending' ? 'resolved' : 'pending')}
            >
              {report.status === 'pending' ? <><CheckCircle size={14} /> 해결 처리</> : <><Clock size={14} /> 미해결 처리</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
