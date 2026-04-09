import { useState, useRef, useEffect } from 'react'
import { Plus, Trash2, Upload, MapPin, Home, Calendar, ShieldAlert, Loader2, LogOut, X } from 'lucide-react'
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
  const [selectedMapIndex, setSelectedMapIndex] = useState<number>(0)
  const [hotspots, setHotspots] = useState<Hotspot[]>([])
  const [mapSrc, setMapSrc] = useState<string>('')
  const [adding, setAdding] = useState(false)
  const [editHs, setEditHs] = useState<Hotspot | null>(null)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [draggingHsId, setDraggingHsId] = useState<string | null>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 })
  const [selection, setSelection] = useState<{ x1: number, y1: number, x2: number, y2: number } | null>(null)
  const [isLocked, setIsLocked] = useState(true)
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
      setAuthLoading(false)
    });

    // Load festivals
    getFestivals().then(data => {
      setFestivals(data)
    }).catch(err => {
      console.error('Failed to load from Firebase', err)
    })

    // Load reports
    getReports().then(setReports).catch(err => console.error('Failed to load reports:', err))

    getSetting(HERO_BG_STORAGE_KEY).then(savedHero => {
      if (savedHero) setHeroBg(savedHero)
    }).catch(err => console.error('Failed to load hero settings:', err))

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

  const compressImage = (base64: string, maxWidth = 800, quality = 0.4): Promise<string> => {
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
        if (ctx) {
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          ctx.drawImage(img, 0, 0, width, height)
        }
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
    })
  }

  const handleHeroBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = async () => {
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
      category: '',
      showOnMain: false
    }
    setEditingFestival(newF)
  }

  const saveFestival = async () => {
    if (!editingFestival) return
    if (!editingFestival.name.trim()) return alert('축제 이름은 필수 입력 항목입니다.')
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

  const loadFestivalForHotspots = (id: string) => {
    const f = festivals.find(f => f.id === id)
    if (!f) return
    setSelectedFestivalId(id)
    setHotspots(f.hotspots || [])
    const maps = f.mapImages?.length ? f.mapImages : (f.mapImage ? [f.mapImage] : [])
    setMapSrc(maps[0] || '')
    setSelectedMapIndex(0)
  }

  const handleSelectionStart = (e: React.MouseEvent) => {
    if (adding) {
      if (!mapRef.current) return
      const rect = mapRef.current.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      setSelection({ x1: x, y1: y, x2: x, y2: y })
    } else {
      if (!mapAreaRef.current) return
      if ((e.target as HTMLElement).tagName === 'BUTTON') return // Don't drag when clicking buttons
      setDragStart({ x: e.pageX, y: e.pageY, scrollLeft: mapAreaRef.current.scrollLeft, scrollTop: mapAreaRef.current.scrollTop })
      setIsDragging(true)
    }
  }

  const handleSelectionMove = (e: React.MouseEvent) => {
    if (!adding || !selection || !mapRef.current) return
    const rect = mapRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setSelection({ ...selection, x2: x, y2: y })
  }

  const handleSelectionEnd = () => {
    if (!adding || !selection) return
    
    const x = (selection.x1 + selection.x2) / 2
    const y = (selection.y1 + selection.y2) / 2
    const w = Math.abs(selection.x1 - selection.x2)
    const h = Math.abs(selection.y1 - selection.y2)

    if (w < 0.5 || h < 0.5) {
      setSelection(null)
      return // Too small
    }

    if (editHs) {
      // Update existing working hotspot
      setEditHs({
        ...editHs,
        x: Math.round(x * 1000) / 1000,
        y: Math.round(y * 1000) / 1000,
        w: Math.round(w * 100) / 100,
        h: Math.round(h * 100) / 100,
      })
    } else {
      // Create new one
      const newHs: Hotspot = {
        id: `hs-${Date.now()}`,
        x: Math.round(x * 1000) / 1000,
        y: Math.round(y * 1000) / 1000,
        w: Math.round(w * 100) / 100,
        h: Math.round(h * 100) / 100,
        label: '',
        description: [],
        pictogramIds: [],
        photos: [],
        pictogramImages: [],
        mapIndex: selectedMapIndex
      }
      setEditHs(newHs)
    }
    setSelection(null)
  }

  const closeEditor = () => {
    setEditHs(null)
    setAdding(false)
  }

  const saveHotspot = async (hsWithDesc: Hotspot) => {
    if (!selectedFestivalId) return
    if (!hsWithDesc.label.trim()) return alert('장소 이름은 필수 입력 항목입니다.')
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
      closeEditor()
    }
  }

  const deleteHotspot = async (id: string) => {
    if (!confirm('핫스팟을 삭제하시겠습니까?')) return
    const festival = festivals.find(f => f.id === selectedFestivalId)
    if (!festival) return
    const newHotspots = (festival.hotspots || []).filter(h => h.id !== id)
    const updatedFestival = { ...festival, hotspots: newHotspots }
    if (await updateAndSave(updatedFestival)) setHotspots(newHotspots)
  }

  const convertReportToHotspot = async (report: Report) => {
    setActiveTab('hotspots')
    loadFestivalForHotspots(report.festivalId)
    
    const photosToConvert = (report.images || []).slice(0, 2);
    const compressedPhotos = await Promise.all(
      photosToConvert.map(img => compressImage(img, 500, 0.15))
    )

    const targetMapIdx = report.mapIndex || 0
    setSelectedMapIndex(targetMapIdx)
    const festival = festivals.find(f => f.id === report.festivalId)
    if (festival) {
      const maps = festival.mapImages?.length ? festival.mapImages : (festival.mapImage ? [festival.mapImage] : [])
      setMapSrc(maps[targetMapIdx] || '')
    }

    const newHs: Hotspot = {
      id: `hs-${Date.now()}`,
      x: report.x || 50,
      y: report.y || 50,
      w: 8,
      h: 8,
      label: `제보: ${report.locationDetail || '확인 필요'}`,
      description: [report.content],
      pictogramIds: [],
      photos: compressedPhotos,
      pictogramImages: [],
      isReportBased: true,
      mapIndex: targetMapIdx
    }
    
    setEditHs(newHs)
    setSelectedReport(null)
  }



  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return alert('이메일과 비밀번호를 모두 입력해주세요.')
    setLoginLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err: any) {
      console.error('Login error:', err.code)
      if (err.code === 'auth/invalid-credential') {
        alert('로그인 실패: 이메일 또는 비밀번호가 일치하지 않습니다.')
      } else if (err.code === 'auth/user-not-found') {
        alert('로그인 실패: 해당 계정이 존재하지 않습니다.')
      } else {
        alert('로그인 중 오류가 발생했습니다: ' + err.code)
      }
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = async () => {
    try { await signOut(auth); } catch (err) { console.error('Logout error:', err); }
  }

  if (authLoading) return <div className="admin-login-page"><Loader2 className="animate-spin" /></div>

  if (!isAuthorized) {
    return (
      <div className="admin-login-page">
        <div className="login-card">
          <div className="login-icon"><Calendar size={32} /></div>
          <h2>관리자 시스템</h2>
          <form onSubmit={handleLogin}>
            <input type="email" placeholder="관리자 이메일" value={email} onChange={e => setEmail(e.target.value)} />
            <input type="password" placeholder="비밀번호" value={password} onChange={e => setPassword(e.target.value)} />
            <button type="submit" disabled={loginLoading}>{loginLoading ? <Loader2 className="animate-spin" /> : '접속'}</button>
          </form>
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
            <button onClick={handleLogout} className="logout-btn" title="로그아웃"><LogOut size={18} /></button>
          </div>
          <div className="admin-tabs">
            <button className={`tab-btn ${activeTab === 'festivals' ? 'active' : ''}`} onClick={() => setActiveTab('festivals')}><Calendar size={18} /> 축제</button>
            <button className={`tab-btn ${activeTab === 'hotspots' ? 'active' : ''}`} onClick={() => setActiveTab('hotspots')}><MapPin size={18} /> 핫스팟</button>
            <button className={`tab-btn ${activeTab === 'hero' ? 'active' : ''}`} onClick={() => setActiveTab('hero')}><Home size={18} /> 배경</button>
            <button className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
              <ShieldAlert size={18} /> 제보 
              {reports.filter(r => r.status === 'pending').length > 0 && (
                <span className="tab-badge">{reports.filter(r => r.status === 'pending').length}</span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="admin-body">
        {activeTab === 'festivals' && (
          <div className="admin-management">
            <div className="admin-list-header">
              <h3>축제 목록</h3>
              <button className="add-main-btn" onClick={addNewFestival}><Plus size={18} /> 새 축제 추가</button>
            </div>
            <div className="admin-festival-grid">
              {festivals.length === 0 && <div className="empty-text" style={{ gridColumn: '1/-1' }}>등록된 축제가 없습니다.</div>}
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
              <span className="sidebar-label">축제 선택</span>
              <select className="admin-select" value={selectedFestivalId} onChange={e => loadFestivalForHotspots(e.target.value)}>
                <option value="">-- 축제 선택 --</option>
                {festivals.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
              
              {selectedFestivalId && (
                <>
                  {(() => {
                    const f = festivals.find(f => f.id === selectedFestivalId)
                    const maps = f?.mapImages?.length ? f.mapImages : (f?.mapImage ? [f.mapImage] : [])
                    if (maps.length > 1) {
                      return (
                        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                           <button className={`tab-btn ${selectedMapIndex === 0 ? 'active' : ''}`} style={{ flex: 1, minWidth: '45%', padding: '0.5rem' }} onClick={() => { setSelectedMapIndex(0); setMapSrc(maps[0] || '') }}>앞면 지도</button>
                           <button className={`tab-btn ${selectedMapIndex === 1 ? 'active' : ''}`} style={{ flex: 1, minWidth: '45%', padding: '0.5rem' }} onClick={() => { setSelectedMapIndex(1); setMapSrc(maps[1] || '') }}>뒷면 지도</button>
                        </div>
                      )
                    }
                    return null
                  })()}

                  
                  <span className="sidebar-label">핫스팟 도구</span>
                   <button className={`add-btn ${adding ? 'active' : ''}`} onClick={() => setAdding(!adding)}>
                    <MapPin size={16} /> {adding ? '지도 클릭하여 생성 중...' : '신규 핫스팟 생성'}
                  </button>

                  <div className="hs-tools">
                    <button className={`tool-btn ${!isLocked ? 'warn' : ''}`} onClick={() => setIsLocked(!isLocked)}>
                      {isLocked ? '🔒 위치 잠금 (안전)' : '🔓 위치 수정 모드 (드래그 가능)'}
                    </button>
                  </div>

                  <div className="hs-list">
                    <span className="sidebar-label">핫스팟 목록 ({hotspots.filter(h => (h.mapIndex || 0) === selectedMapIndex).length})</span>
                    {hotspots.filter(h => (h.mapIndex || 0) === selectedMapIndex).length === 0 && <div className="empty-text">장소가 없습니다.</div>}
                    {hotspots.filter(h => (h.mapIndex || 0) === selectedMapIndex).map(hs => (
                      <div key={hs.id} className="hs-item">
                    <button className="hs-name" onClick={() => { setEditHs(hs); setAdding(true); }}>{hs.label || '(이름없음)'}</button>
                    <button className="hs-delete" onClick={() => deleteHotspot(hs.id)}><Trash2 size={14} /></button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
            
            <div 
              className={`admin-map-area ${isDragging ? 'dragging' : ''}`} 
              ref={mapAreaRef}
              onMouseMove={(e) => {
                if (adding && selection) {
                  handleSelectionMove(e)
                  return
                }

                if (draggingHsId && mapRef.current) {
                  const rect = mapRef.current.getBoundingClientRect()
                  const x = ((e.clientX - rect.left) / rect.width) * 100
                  const y = ((e.clientY - rect.top) / rect.height) * 100
                  const nx = Math.min(100, Math.max(0, Math.round(x * 1000) / 1000))
                  const ny = Math.min(100, Math.max(0, Math.round(y * 1000) / 1000))
                  setHotspots(prev => prev.map(h => h.id === draggingHsId ? { ...h, x: nx, y: ny } : h))
                  return
                }

                if (!isDragging || !mapAreaRef.current) return
                const dx = e.pageX - dragStart.x; const dy = e.pageY - dragStart.y
                mapAreaRef.current.scrollLeft = dragStart.scrollLeft - dx; mapAreaRef.current.scrollTop = dragStart.scrollTop - dy
              }}
              onMouseUp={async () => {
                if (adding && selection) {
                  handleSelectionEnd()
                  return
                }
                if (draggingHsId && selectedFestivalId) {
                  const festival = festivals.find(f => f.id === selectedFestivalId)
                  if (festival) await updateAndSave({ ...festival, hotspots })
                }
                setIsDragging(false)
                setDraggingHsId(null)
              }}
              onMouseLeave={() => { setIsDragging(false); setDraggingHsId(null); setSelection(null) }}
            >
              <div 
                className="admin-map" 
                ref={mapRef} 
                onMouseDown={handleSelectionStart}
                style={{ 
                  cursor: adding ? 'crosshair' : (draggingHsId ? 'move' : (isLocked ? 'inherit' : 'pointer')),
                }}
              >
                {!mapSrc && <div className="admin-map-placeholder">지도를 업로드해주세요.</div>}
                {mapSrc && <img src={mapSrc} className="admin-map-img" draggable={false} />}
                
                {adding && selection && (
                  <div 
                    className="selection-box" 
                    style={{
                      position: 'absolute',
                      left: `${Math.min(selection.x1, selection.x2)}%`,
                      top: `${Math.min(selection.y1, selection.y2)}%`,
                      width: `${Math.abs(selection.x1 - selection.x2)}%`,
                      height: `${Math.abs(selection.y1 - selection.y2)}%`,
                      border: '1px dashed #5BA4CF',
                      background: 'rgba(91, 164, 207, 0.2)',
                      pointerEvents: 'none',
                      zIndex: 100
                    }}
                  />
                )}

                {hotspots.filter(h => (!editHs || h.id !== editHs.id) && (h.mapIndex || 0) === selectedMapIndex).map(hs => (
                  <button 
                    key={hs.id} 
                    className={`admin-hotspot ${hs.isReportBased ? 'report-pin' : ''} ${!isLocked ? 'editable' : ''}`} 
                    style={{ left: `${hs.x}%`, top: `${hs.y}%`, width: `${hs.w || 6}%`, height: `${hs.h || 6}%` }}
                    onMouseDown={(e) => { e.stopPropagation(); if(!adding && !isLocked) setDraggingHsId(hs.id) }}
                    onClick={e => { e.stopPropagation(); if(!adding && !draggingHsId) { setEditHs(hs); setAdding(true); } }}
                  >
                    <span className="admin-hs-label">{hs.label}</span>
                  </button>
                ))}

                {editHs && (
                  <div 
                    className="admin-hotspot is-editing is-high-priority" 
                    style={{ 
                      left: `${editHs.x}%`, 
                      top: `${editHs.y}%`, 
                      width: `${editHs.w || 6}%`, 
                      height: `${editHs.h || 6}%`,
                      pointerEvents: 'none'
                    }}
                  >
                    <span className="admin-hs-label" style={{ background: '#E53E3E' }}>{editHs.label || '편집 중...'}</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

        {activeTab === 'hero' && (
          <div className="hero-management">
            <div className="admin-list-header">
              <h3>배경사진 관리</h3>
            </div>
            <p className="description" style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1.5rem' }}>메인 페이지(Home)의 최상단 배경으로 노출되는 이미지입니다.</p>
            <div className="hero-preview-area">
              {!heroBg ? <div className="empty-text">설정된 배경이 없습니다.</div> : <img src={heroBg} className="hero-bg-preview" />}
            </div>
            <div className="hero-actions">
              <label className="upload-hero-btn"><Upload size={18} /> 사진 변경 (1MB 제한)<input type="file" onChange={handleHeroBgUpload} style={{ display: 'none' }} /></label>
              {heroBg && <button className="reset-hero-btn" onClick={() => { if(confirm('배경을 삭제하시겠습니까?')) { setHeroBg(''); saveSetting(HERO_BG_STORAGE_KEY, '') }}}>초기화</button>}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="reports-management">
            <div className="admin-list-header">
              <h3>사용자 제보 관리 ({reports.length})</h3>
            </div>
            <div className="reports-grid">
              {reports.length === 0 && <div className="empty-text" style={{ gridColumn: '1/-1' }}>접수된 제보가 없습니다.</div>}
              {reports.map(r => (
                <div key={r.id} className="report-card" onClick={() => setSelectedReport(r)}>
                  <div className="report-card-header">
                    <div className="report-meta">
                      <span className={`status-tag ${r.status}`}>{r.status === 'pending' ? '처리중' : '해결됨'}</span>
                      <span className="report-date">{new Date(r.createdAt).toLocaleString()}</span>
                    </div>
                    <button className="del-report-btn" onClick={(e) => { e.stopPropagation(); deleteReport(r.id).then(() => setReports(p => p.filter(v => v.id !== r.id))) }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="report-subject">
                    <strong>{r.festivalName} {r.locationDetail ? `- ${r.locationDetail}` : ''}</strong>
                    <p>{r.content.length > 100 ? r.content.substring(0, 100) + '...' : r.content}</p>
                  </div>
                  {r.images && r.images.length > 0 && (
                    <div className="report-images">
                      {r.images.slice(0, 4).map((img, i) => (
                        <img key={i} src={img} alt="제보사진" />
                      ))}
                      {r.images.length > 4 && <div className="more-imgs">+{r.images.length - 4}</div>}
                    </div>
                  )}
                  <div className="report-card-footer">
                    <div className="reporter-info">
                      <span>👤 {r.name}</span>
                      <span>📞 {r.contact}</span>
                    </div>
                    <button className={`status-toggle-btn ${r.status === 'resolved' ? 'resolved' : ''}`} onClick={(e) => {
                      e.stopPropagation()
                      const newStatus = r.status === 'pending' ? 'resolved' : 'pending'
                      saveReport({ ...r, status: newStatus }).then(() => setReports(p => p.map(v => v.id === r.id ? { ...r, status: newStatus } : v)))
                    }}>
                      {r.status === 'pending' ? '해결 완료로 변경' : '진행 중으로 변경'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {editingFestival && (
        <FestivalEditor 
          festival={editingFestival} 
          onClose={() => setEditingFestival(null)} 
          setFestival={setEditingFestival} 
          onSave={saveFestival} 
          compressImage={compressImage}
        />
      )}
      {editHs && (
        <HotspotEditor 
          hotspot={editHs} 
          mapSrc={mapSrc}
          allHotspots={hotspots}
          onSave={saveHotspot} 
          onClose={closeEditor} 
          onChange={setEditHs}
          compressImage={compressImage}
        />
      )}

      {selectedReport && (
        <ReportDetailModal 
          report={selectedReport} 
          onClose={() => setSelectedReport(null)} 
          onDelete={async (id: string) => { 
            if (confirm('제보를 삭제하시겠습니까?')){ 
              await deleteReport(id)
              setReports(p => p.filter(v => v.id !== id))
              setSelectedReport(null)
            }
          }} 
          onStatusChange={async (s: 'pending' | 'resolved') => { 
            const u = { ...selectedReport, status: s }
            await saveReport(u)
            setReports(p => p.map(v => v.id === u.id ? u : v))
            setSelectedReport(u)
          }} 
          onConvertToHotspot={() => convertReportToHotspot(selectedReport)} 
        />
      )}
    </div>
  )
}

// --- Sub-components (Editors) ---

interface FestivalEditorProps {
  festival: Festival
  onClose: () => void
  setFestival: React.Dispatch<React.SetStateAction<Festival | null>>
  onSave: () => void
  compressImage: (base64: string, maxWidth?: number, quality?: number) => Promise<string>
}

function FestivalEditor({ festival, onClose, setFestival, onSave, compressImage }: FestivalEditorProps) {
  const update = (field: string, val: any) => setFestival((prev: any) => (prev ? { ...prev, [field]: val } : null))
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'thumbnail' | 'images' | 'mapImage') => {
    const files = e.target.files
    if (!files || files.length === 0) return

    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string, field === 'mapImage' ? 1600 : 1200, 0.5)
        if (field === 'images') {
          update('images', [...(festival.images || []), compressed])
        } else {
          update(field, compressed)
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (idx: number) => {
    update('images', festival.images.filter((_, i) => i !== idx))
  }

  return (
    <div className="editor-overlay">
      <div className="editor-panel extra-wide">
        <div className="editor-header">
          <h3>축제 정보 수정</h3>
          <button onClick={onClose} className="close-btn"><X size={20} /></button>
        </div>
        <div className="editor-body split-view">
          <div className="editor-form">
            <div className="row">
              <div className="col">
                <label className="required">축제 이름</label>
                <input value={festival.name} onChange={e => update('name', e.target.value)} placeholder="축제 이름" />
              </div>
              <div className="col">
                <label>부제목</label>
                <input value={festival.subtitle} onChange={e => update('subtitle', e.target.value)} placeholder="부제목" />
              </div>
            </div>

            <div className="row">
              <div className="col">
                <label>시작일</label>
                <input type="date" value={festival.startDate} onChange={e => update('startDate', e.target.value)} />
              </div>
              <div className="col">
                <label>종료일</label>
                <input type="date" value={festival.endDate} onChange={e => update('endDate', e.target.value)} />
              </div>
            </div>

            <div className="row">
              <div className="col">
                <label>장소 명칭</label>
                <input value={festival.location} onChange={e => update('location', e.target.value)} placeholder="예: 한강 시민공원" />
              </div>
              <div className="col">
                <label>상세 주소</label>
                <input value={festival.address} onChange={e => update('address', e.target.value)} placeholder="도로명 주소 등" />
              </div>
            </div>

            <div className="row">
              <div className="col">
                <label>입장료/참가비</label>
                <input value={festival.fee} onChange={e => update('fee', e.target.value)} placeholder="예: 무료 (일부 유료)" />
              </div>
              <div className="col">
                <label>상태</label>
                <select value={festival.status} onChange={e => update('status', e.target.value)}>
                  <option value="active">진행 중</option>
                  <option value="soon">예정</option>
                  <option value="ended">종료</option>
                </select>
              </div>
            </div>

            <label>설명</label>
            <textarea value={festival.description} onChange={e => update('description', e.target.value)} placeholder="축제 상세 설명" rows={5} />

            <div className="row">
              <div className="col">
                <label>전화번호</label>
                <input value={festival.phone} onChange={e => update('phone', e.target.value)} placeholder="010-0000-0000" />
              </div>
              <div className="col">
                <label>인스타그램 ID</label>
                <input value={festival.instagram} onChange={e => update('instagram', e.target.value)} placeholder="@naeil_map" />
              </div>
            </div>
            
            <label>주요 프로그램 (한 줄에 하나씩)</label>
            <textarea 
              value={festival.programs?.join('\n') || ''} 
              onChange={e => update('programs', e.target.value.split('\n').filter(Boolean))} 
              placeholder="예: 불꽃놀이&#10;공연&#10;플리마켓" 
              rows={3} 
            />

            <label>카테고리</label>
            <input value={festival.category} onChange={e => update('category', e.target.value)} placeholder="꽃, 음식, 체험 등" />

            <div className="row" style={{ marginTop: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', background: '#f8f9fa', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e9ecef', fontWeight: 600 }}>
                <input type="checkbox" checked={!!festival.showOnMain} onChange={e => update('showOnMain', e.target.checked)} style={{ width: 'auto', margin: 0, transform: 'scale(1.2)' }} />
                🎯 메인 화면 최상단 위젯으로 노출하기 (최대 3개 권장)
              </label>
            </div>

            <div className="transport-section" style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid #e9ecef', borderRadius: '0.75rem', background: '#fcfcfc' }}>
              <h4 style={{ margin: '0 0 1rem 0', color: '#343a40' }}>무장애 편의정보 (교통/접근성)</h4>
              <label>전반적인 안내 설명</label>
              <textarea
                value={festival.transport?.description || ''}
                onChange={e => {
                  const currentParams = festival.transport || { description: '', services: [] }
                  update('transport', { ...currentParams, description: e.target.value })
                }}
                placeholder="예: 행사장까지 저상버스가 15분 간격으로 운행됩니다."
                rows={3}
              />
              <div style={{ marginTop: '1.5rem' }}>
                <label style={{ marginBottom: '0.5rem', display: 'block' }}>교통/편의 서비스 항목</label>
                {(festival.transport?.services || []).map((service, idx) => (
                  <div key={idx} style={{ background: '#fff', border: '1px solid #dee2e6', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem', position: 'relative' }}>
                    <button 
                      className="upload-inline-btn" 
                      style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.25rem 0.5rem', background: '#ffe3e3', color: '#c92a2a', border: 'none' }}
                      onClick={() => {
                        const newServices = festival.transport!.services.filter((_, i) => i !== idx)
                        update('transport', { ...festival.transport, services: newServices })
                      }}
                    >
                      삭제
                    </button>
                    <div className="row">
                      <div className="col">
                        <label>서비스명</label>
                        <input value={service.name} onChange={e => {
                          const newServices = [...festival.transport!.services]
                          newServices[idx] = { ...service, name: e.target.value }
                          update('transport', { ...festival.transport, services: newServices })
                        }} placeholder="예: 무장애 셔틀버스" />
                      </div>
                      <div className="col">
                        <label>이용대상</label>
                        <input value={service.target} onChange={e => {
                          const newServices = [...festival.transport!.services]
                          newServices[idx] = { ...service, target: e.target.value }
                          update('transport', { ...festival.transport, services: newServices })
                        }} placeholder="예: 휠체어 이용자 및 동반 1인" />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col">
                        <label>이용방법 및 수단</label>
                        <input value={service.phone} onChange={e => {
                          const newServices = [...festival.transport!.services]
                          newServices[idx] = { ...service, phone: e.target.value }
                          update('transport', { ...festival.transport, services: newServices })
                        }} placeholder="예: 사전 예약 (010-0000-0000)" />
                      </div>
                      <div className="col">
                        <label>이용요금</label>
                        <input value={service.fee} onChange={e => {
                          const newServices = [...festival.transport!.services]
                          newServices[idx] = { ...service, fee: e.target.value }
                          update('transport', { ...festival.transport, services: newServices })
                        }} placeholder="예: 무료" />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col">
                        <label>운행 정보 / 시간</label>
                        <input value={service.operator} onChange={e => {
                          const newServices = [...festival.transport!.services]
                          newServices[idx] = { ...service, operator: e.target.value }
                          update('transport', { ...festival.transport, services: newServices })
                        }} placeholder="예: 09:00 ~ 18:00 순환" />
                      </div>
                      <div className="col">
                        <label>기타 문의</label>
                        <input value={service.inquiry} onChange={e => {
                          const newServices = [...festival.transport!.services]
                          newServices[idx] = { ...service, inquiry: e.target.value }
                          update('transport', { ...festival.transport, services: newServices })
                        }} placeholder="예: 다산콜센터 120" />
                      </div>
                    </div>
                  </div>
                ))}
                <button 
                  className="add-main-btn" 
                  style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', background: '#339af0', color: 'white', borderRadius: '0.5rem', border: 'none', fontWeight: 600, cursor: 'pointer' }}
                  onClick={() => {
                    const currentTransport = festival.transport || { description: '', services: [] }
                    update('transport', {
                      ...currentTransport,
                      services: [...currentTransport.services, { name: '', target: '', phone: '', fee: '', operator: '', inquiry: '' }]
                    })
                  }}
                >
                  <Plus size={16} /> 서비스 항목 추가
                </button>
              </div>
            </div>
          </div>

          <div className="editor-preview">
            <label>대표 썸네일 (리스트 노출)</label>
            <div className="thumb-preview interactive" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {!festival.thumbnail ? (
                <label className="add-photo-box" style={{ width: '100%', height: '100%' }}>
                  <Plus /> 썸네일 업로드
                  <input type="file" onChange={e => handleImageUpload(e, 'thumbnail')} style={{ display: 'none' }} />
                </label>
              ) : (
                <img 
                  src={festival.thumbnail} 
                  style={{ 
                    objectFit: 'contain', 
                    width: '100%', 
                    height: '100%', 
                    transform: `scale(${(festival.thumbnailZoom || 100) / 100})` 
                  }} 
                  alt="thumbnail"
                />
              )}
            </div>
            {festival.thumbnail && (
              <div className="thumb-pos-control">
                <label>썸네일 크기 확대/축소 ({festival.thumbnailZoom || 100}%)</label>
                <input 
                  type="range" 
                  min="10" max="300" 
                  value={festival.thumbnailZoom || 100} 
                  onChange={e => update('thumbnailZoom', parseInt(e.target.value))} 
                />
                <button className="upload-inline-btn" onClick={() => update('thumbnail', '')}>썸네일 삭제</button>
              </div>
            )}

            <label>축제 갤러리 이미지 ({festival.images?.length || 0})</label>
            <div className="hs-photos-preview" style={{ marginBottom: festival.images?.length ? '0.5rem' : '1.5rem' }}>
              {festival.images?.map((img, i) => (
                <div key={i} className="photo-wrapper" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img 
                    src={img} 
                    alt="festival" 
                    style={{ 
                      objectFit: 'contain', 
                      width: '100%', 
                      height: '100%', 
                      transform: `scale(${(festival.galleryZoom || 100) / 100})` 
                    }} 
                  />
                  <button className="photo-remove-btn" onClick={() => removeImage(i)}><X size={10} /></button>
                </div>
              ))}
              <label className="add-photo-box">
                <Plus size={18} />
                <input type="file" multiple onChange={e => handleImageUpload(e, 'images')} style={{ display: 'none' }} />
              </label>
            </div>
            {festival.images && festival.images.length > 0 && (
              <div className="thumb-pos-control" style={{ marginBottom: '1.5rem' }}>
                <label>갤러리 이미지 크기 확대/축소 ({festival.galleryZoom || 100}%)</label>
                <input 
                  type="range" 
                  min="10" max="300" 
                  value={festival.galleryZoom || 100} 
                  onChange={e => update('galleryZoom', parseInt(e.target.value))} 
                />
              </div>
            )}

            <label>지도 배경 이미지</label>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {[0, 1].map(idx => {
                const maps = festival.mapImages?.length ? festival.mapImages : (festival.mapImage ? [festival.mapImage] : [])
                const mapUrl = maps[idx]
                return (
                  <div key={idx} style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#495057', marginBottom: '0.5rem' }}>{idx === 0 ? '앞면 지도' : '뒷면 지도'}</div>
                    {mapUrl ? (
                      <div className="map-img-preview" style={{ position: 'relative' }}>
                        <img src={mapUrl} style={{ width: '100%', borderRadius: '0.75rem', border: '1px solid #e9ecef' }} />
                        <button className="upload-inline-btn" onClick={() => {
                          const newMaps = [...maps]
                          newMaps[idx] = ''
                          update('mapImages', newMaps)
                          if(idx === 0) update('mapImage', '')
                        }} style={{ marginTop: '0.5rem' }}>지도 삭제</button>
                      </div>
                    ) : (
                      <label className="add-photo-box" style={{ width: '100%', padding: '2rem', height: 'auto' }}>
                        <Upload size={18} /> {idx === 0 ? '앞면 추가' : '뒷면 추가'}
                        <input type="file" onChange={e => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          const reader = new FileReader()
                          reader.onloadend = async () => {
                            const compressed = await compressImage(reader.result as string, 1600, 0.5)
                            const newMaps = [...maps]
                            newMaps[idx] = compressed
                            update('mapImages', newMaps)
                            if (idx === 0) update('mapImage', compressed)
                          }
                          reader.readAsDataURL(file)
                        }} style={{ display: 'none' }} />
                      </label>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        <div className="editor-footer">
          <button className="editor-save" onClick={onSave}><Upload size={18} /> 클라우드에 전체 저장</button>
          <button className="cancel-btn" onClick={onClose} style={{ padding: '0.875rem 1.5rem', borderRadius: '0.75rem', fontWeight: 700, background: '#f1f3f5' }}>취소</button>
        </div>
      </div>
    </div>
  )
}

interface HotspotEditorProps {
  hotspot: Hotspot
  mapSrc: string
  allHotspots: Hotspot[]
  onSave: (h: Hotspot) => void
  onClose: () => void
  onChange: (h: Hotspot) => void
  compressImage: any
}

function HotspotEditor({ hotspot, mapSrc, allHotspots, onSave, onClose, onChange, compressImage }: HotspotEditorProps) {
  const [hs, setHs] = useState(hotspot)
  const [descText, setDescText] = useState(hotspot.description.join('\n'))
  const [previewTab, setPreviewTab] = useState<'map' | 'modal' | 'info'>('map')
  const [isMiniDragging, setIsMiniDragging] = useState(false)
  const [miniSelection, setMiniSelection] = useState<{ x1: number, y1: number, x2: number, y2: number } | null>(null)
  const [miniZoom, setMiniZoom] = useState(1)
  const miniMapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setHs(hotspot)
    setDescText(hotspot.description.join('\n'))
  }, [hotspot.id])

  useEffect(() => {
    onChange(hs)
  }, [hs])

  const handleMiniMapStart = (e: React.MouseEvent) => {
    if (!miniMapRef.current) return
    const rect = miniMapRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setMiniSelection({ x1: x, y1: y, x2: x, y2: y })
    setIsMiniDragging(true)
  }

  const handleMiniMapMove = (e: React.MouseEvent) => {
    if (!isMiniDragging || !miniSelection || !miniMapRef.current) return
    const rect = miniMapRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setMiniSelection({ ...miniSelection, x2: x, y2: y })
  }

  const handleMiniMapEnd = () => {
    if (!isMiniDragging || !miniSelection) return
    const x = (miniSelection.x1 + miniSelection.x2) / 2
    const y = (miniSelection.y1 + miniSelection.y2) / 2
    const w = Math.abs(miniSelection.x1 - miniSelection.x2)
    const h = Math.abs(miniSelection.y1 - miniSelection.y2)

    if (w > 0.1 && h > 0.1) {
      setHs({
        ...hs,
        x: Math.round(x * 1000) / 1000,
        y: Math.round(y * 1000) / 1000,
        w: Math.round(w * 100) / 100,
        h: Math.round(h * 100) / 100
      })
    }
    setMiniSelection(null)
    setIsMiniDragging(false)
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string, 800, 0.3)
        setHs(prev => ({ ...prev, photos: [...prev.photos, compressed] }))
      }
      reader.readAsDataURL(file)
    })
  }

  const handlePictogramUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    Array.from(files).forEach(file => {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string, 200, 0.6)
        setHs(prev => ({ ...prev, pictogramImages: [...(prev.pictogramImages || []), compressed] }))
      }
      reader.readAsDataURL(file)
    })
  }

  return (
    <div className="editor-overlay">
      <div className="editor-panel extra-wide">
        <div className="editor-header">
          <h3>장소 상세 편집 ({hs.label || '새 장소'})</h3>
          <button onClick={onClose} className="close-btn"><X size={20} /></button>
        </div>
        <div className="editor-body split-view">
          <div className="editor-preview-container">
            <div className="preview-tabs">
              <button className={previewTab === 'map' ? 'active' : ''} onClick={() => setPreviewTab('map')}>지도 미리보기</button>
              <button className={previewTab === 'modal' ? 'active' : ''} onClick={() => setPreviewTab('modal')}>팝업 미리보기</button>
              <button className={previewTab === 'info' ? 'active' : ''} onClick={() => setPreviewTab('info')}>상세 정보</button>
            </div>

            {previewTab === 'map' && (
              <>
                <div className="mini-map-header">
                  <div className="mini-zoom-header">
                    <span>지도 확대: {Math.round(miniZoom * 100)}%</span>
                    <input 
                      type="range" min="1" max="4" step="0.25" 
                      value={miniZoom} onChange={e => setMiniZoom(parseFloat(e.target.value))} 
                    />
                  </div>
                </div>

                <div className="mini-map-container" onMouseUp={handleMiniMapEnd} onMouseLeave={handleMiniMapEnd}>
                  <div 
                    className="mini-map interactive" 
                    ref={miniMapRef} 
                    onMouseDown={handleMiniMapStart} 
                    onMouseMove={handleMiniMapMove}
                    style={{
                      width: `${miniZoom * 100}%`
                    }}
                  >
                    <img src={mapSrc} className="mini-map-img" draggable={false} />
                    
                    {allHotspots.filter(h => h.id !== hs.id).map(oh => (
                      <div key={oh.id} className="mini-hotspot other" style={{ left: `${oh.x}%`, top: `${oh.y}%`, width: `${oh.w || 6}%`, height: `${oh.h || 6}%` }} />
                    ))}

                    <div className={`mini-hotspot current ${!isMiniDragging ? 'pulse' : ''}`} style={{ left: `${hs.x}%`, top: `${hs.y}%`, width: `${hs.w || 6}%`, height: `${hs.h || 6}%` }}>
                      <span className="mini-hs-label">{hs.label || '편집 중'}</span>
                    </div>

                    {miniSelection && (
                      <div className="selection-box" style={{
                        position: 'absolute',
                        left: `${Math.min(miniSelection.x1, miniSelection.x2)}%`,
                        top: `${Math.min(miniSelection.y1, miniSelection.y2)}%`,
                        width: `${Math.abs(miniSelection.x1 - miniSelection.x2)}%`,
                        height: `${Math.abs(miniSelection.y1 - miniSelection.y2)}%`,
                        border: '1px dashed #5BA4CF',
                        background: 'rgba(91, 164, 207, 0.2)',
                        pointerEvents: 'none'
                      }} />
                    )}
                  </div>
                </div>

                <div className="mini-map-hint-box">
                  <ShieldAlert size={16} />
                  <span>지도 위를 드래그하여 위치와 크기를 잡으세요 (현재 설정이 즉시 반영됩니다)</span>
                </div>
              </>
            )}

            {previewTab === 'modal' && (
              <div className="modal-preview-area">
                <div className="mock-modal">
                  <div className={`mock-modal-content ${hs.photos.length >= 2 ? 'is-enhanced' : 'is-default'}`}>
                    <div className="mock-modal-left">
                      <h4 className="mock-title">{hs.label || '장소 이름'}</h4>
                      <div className="mock-pictograms">
                        {hs.pictogramImages?.map((p, i) => <img key={i} src={p} className="mock-pic-img" alt="icon" />)}
                      </div>
                      <ul className="mock-desc-list">
                        {descText.split('\n').filter(Boolean).length > 0 
                          ? descText.split('\n').filter(Boolean).map((line, i) => <li key={i}>{line}</li>)
                          : <li className="placeholder">설명 문구를 입력하면 여기에 노출됩니다.</li>
                        }
                      </ul>
                      <p className="mock-footer-note">{hs.note || '축제 전용 상세 노트를 입력하세요.'}</p>
                    </div>
                    <div className="mock-modal-right">
                      {hs.photos.length > 0 ? (
                        <div className="mock-slider">
                          <img src={hs.photos[0]} className="mock-main-img" />
                        </div>
                      ) : (
                        <div className="mock-img-placeholder">업로드된 사진이 없습니다</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {previewTab === 'info' && (
              <div className="info-guide-preview">
                <div className="guide-card">
                  <h5>💡 팁 / 가이드</h5>
                  <p>• 장소 사진은 최대 10장까지 권장합니다.</p>
                  <p>• 픽토그램은 1:1 정사각 비율 이미지를 권장합니다 (PNG 투명 배경).</p>
                  <p>• 드래그를 통해 영역을 보정하면 메인 지도에도 즉시 반영됩니다.</p>
                </div>
              </div>
            )}
          </div>

          <div className="editor-form">
            <label className="required">장소 이름 (Label)</label>
            <input value={hs.label} onChange={e => setHs({ ...hs, label: e.target.value })} placeholder="예: 무대 뒤 화장실" />

            <label>설명 목록 (한 줄에 하나씩)</label>
            <textarea 
              value={descText} 
              onChange={e => {
                setDescText(e.target.value)
                setHs({ ...hs, description: e.target.value.split('\n').filter(Boolean) })
              }} 
              placeholder="안내사항 입력" 
              rows={4} 
            />


            <div className="image-sections">
              <div className="img-section">
                <label>장소 사진 ({hs.photos.length})</label>
                <div className="hs-photos-preview">
                  {hs.photos.map((p, i) => (
                    <div key={i} className="photo-wrapper">
                      <img src={p} alt="hs" />
                      <button className="photo-remove-btn" onClick={() => setHs({ ...hs, photos: hs.photos.filter((_, idx) => idx !== i) })}><X size={10} /></button>
                    </div>
                  ))}
                  <label className="add-photo-box mini"><Plus size={18} /><input type="file" multiple onChange={handlePhotoUpload} style={{ display: 'none' }} /></label>
                </div>
              </div>

              <div className="img-section">
                <label>픽토그램 ({hs.pictogramImages?.length || 0})</label>
                <div className="hs-photos-preview">
                  {hs.pictogramImages?.map((p, i) => (
                    <div key={i} className="photo-wrapper pic-wrap">
                      <img src={p} alt="pic" />
                      <button className="photo-remove-btn" onClick={() => setHs({ ...hs, pictogramImages: hs.pictogramImages?.filter((_, idx) => idx !== i) })}><X size={10} /></button>
                    </div>
                  ))}
                  <label className="add-photo-box mini"><Plus size={14} /><input type="file" multiple onChange={handlePictogramUpload} style={{ display: 'none' }} /></label>
                </div>
              </div>
            </div>

            <label>추가 노트</label>
            <input value={hs.note || ''} onChange={e => setHs({ ...hs, note: e.target.value })} placeholder="주의사항 등" />
          </div>
        </div>
        <div className="editor-footer">
          <button className="editor-save" onClick={() => onSave(hs)}>저장</button>
          <button className="cancel-btn" onClick={onClose} style={{ padding: '0.875rem 1.5rem', borderRadius: '0.75rem', fontWeight: 700, background: '#f1f3f5' }}>취소</button>
        </div>
      </div>
    </div>
  )
}

interface ReportDetailModalProps {
  report: Report
  onClose: () => void
  onDelete: (id: string) => Promise<void>
  onStatusChange: (status: 'pending' | 'resolved') => Promise<void>
  onConvertToHotspot: () => void
}

function ReportDetailModal({ report, onClose, onDelete, onStatusChange, onConvertToHotspot }: ReportDetailModalProps) {
  return (
    <div className="editor-overlay">
      <div className="editor-panel wide">
        <div className="editor-header">
          <h3>제보 상세 확인</h3>
          <button onClick={onClose} className="close-btn"><X size={20} /></button>
        </div>
        <div className="editor-body">
          <div className="report-detail-row">
            <div className="report-meta">
              <span className={`status-tag ${report.status}`}>{report.status === 'pending' ? '처리 예정' : '해결 완료'}</span>
              <span className="report-date">{new Date(report.createdAt).toLocaleString()}</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                className={`status-toggle-btn ${report.status === 'resolved' ? 'resolved' : ''}`}
                onClick={() => onStatusChange(report.status === 'pending' ? 'resolved' : 'pending')}
              >
                {report.status === 'pending' ? '해결 완료로 표시' : '미해결로 복원'}
              </button>
              <button className="del-f-btn" onClick={() => onDelete(report.id)} style={{ padding: '0.5rem' }}><Trash2 size={20} /></button>
            </div>
          </div>

          <div className="report-section">
            <label>제보자 정보</label>
            <div className="reporter-info-box">
              <p>👤 <strong>{report.name}</strong></p>
              <p>📞 {report.contact}</p>
            </div>
          </div>

          <div className="report-section">
            <label>제보 대상 및 위치</label>
            <div className="reporter-info-box">
              <div className="location-text">📍 {report.festivalName} {report.locationDetail ? `- ${report.locationDetail}` : ''}</div>
              <div className="coord-text">좌표: X {report.x?.toFixed(1)}%, Y {report.y?.toFixed(1)}%</div>
            </div>
          </div>

          <div className="report-section">
            <label>제보 내용</label>
            <div className="report-content-box">{report.content}</div>
          </div>

          {report.images && report.images.length > 0 && (
            <div className="report-section">
              <label>현장 사진 ({report.images.length})</label>
              <div className="report-images-preview">
                {report.images.map((img, i) => (
                  <img key={i} src={img} alt="제보 사진" onClick={() => window.open(img)} />
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="editor-footer">
          <button className="editor-save" onClick={onConvertToHotspot}>📍 이 내용을 바탕으로 핫스팟 생성</button>
          <button className="cancel-btn" onClick={onClose} style={{ padding: '0.875rem 1.5rem', borderRadius: '0.75rem', fontWeight: 700, background: '#f1f3f5' }}>닫기</button>
        </div>
      </div>
    </div>
  )
}
