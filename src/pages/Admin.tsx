import { useState, useRef, useEffect } from 'react'
import { Plus, Trash2, Save, Upload, X, MapPin, Home, Calendar, Instagram } from 'lucide-react'
import type { Hotspot, Festival } from '../types'
import { getFestivals, saveFestival as dbSave, deleteFestival as dbDelete, saveSetting, getSetting } from '../firebaseUtils'
import './Admin.css'

const HERO_BG_STORAGE_KEY = 'naeil_hero_bg'

export default function Admin() {
  const [activeTab, setActiveTab] = useState<'festivals' | 'hotspots' | 'hero'>('festivals')
  const [festivals, setFestivals] = useState<Festival[]>([])
  const [heroBg, setHeroBg] = useState<string>('')
  
  // Festival state
  const [editingFestival, setEditingFestival] = useState<Festival | null>(null)
  
  // Hotspot state
  const [selectedFestivalId, setSelectedFestivalId] = useState<string>('')
  const [hotspots, setHotspots] = useState<Hotspot[]>([])
  const [mapSrc, setMapSrc] = useState<string>('')
  const [adding, setAdding] = useState(false)
  const [editHs, setEditHs] = useState<Hotspot | null>(null)
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [password, setPassword] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 })
  const mapRef = useRef<HTMLDivElement>(null)
  const mapAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check auth
    if (sessionStorage.getItem('naeil_admin_auth') === 'true') {
      setIsAuthorized(true)
    }

    // Load festivals
    getFestivals().then(data => {
      setFestivals(data)
    }).catch(err => {
      console.error('Failed to load from Firebase', err)
    })

    getSetting(HERO_BG_STORAGE_KEY).then(savedHero => {
      if (savedHero) setHeroBg(savedHero)
    })
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
      setEditingFestival(null)
    }
  }

  const deleteFestival = async (id: string) => {
    if (!confirm('정말 축제를 삭제하시겠습니까?')) return
    try {
      await dbDelete(id)
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
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    const newHs: Hotspot = {
      id: `hs-${Date.now()}`,
      x: Math.round(x * 100) / 100,
      y: Math.round(y * 100) / 100,
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

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'naeil2025') {
      setIsAuthorized(true)
      sessionStorage.setItem('naeil_admin_auth', 'true')
    } else {
      alert('비밀번호가 틀렸습니다.')
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
            <button type="submit">인증하기</button>
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
          <h1>어드민 시스템</h1>
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
                if (adding) return // Don't start dragging if we're adding a hotspot
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
                      className="admin-hotspot" 
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
      </div>

      {/* Festival Editor Modal */}
      {editingFestival && (
        <FestivalEditor 
          festival={editingFestival} 
          onSave={saveFestival} 
          onClose={() => setEditingFestival(null)} 
          setFestival={setEditingFestival} 
          compressImage={compressImage}
        />
      )}

      {/* Hotspot Editor Modal */}
      {editHs && (
        <HotspotEditor 
          hotspot={editHs} 
          mapSrc={mapSrc}
          otherHotspots={hotspots.filter(h => h.id !== editHs.id)}
          pictograms={festivals.find(f => f.id === selectedFestivalId)?.pictograms || []} 
          onSave={saveHotspot} 
          onClose={() => setEditHs(null)} 
          compressImage={compressImage}
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
            <div className="thumb-preview f-thumb">{festival.thumbnail && <img src={festival.thumbnail} />}</div>
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
  pictograms, 
  onSave, 
  onClose,
  compressImage 
}: { 
  hotspot: Hotspot, 
  mapSrc: string,
  otherHotspots: Hotspot[],
  pictograms: Festival['pictograms'], 
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

  const togglePic = (id: string) => {
    setHs(prev => ({ ...prev, pictogramIds: prev.pictogramIds.includes(id) ? prev.pictogramIds.filter(p => p !== id) : [...prev.pictogramIds, id] }))
  }

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

  const currentDescLines = descText.split('\n').filter(Boolean)

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

            <label>기존 픽토그램 선택 (선택 사항)</label>
            <div className="editor-pics">{pictograms.map(p => (
              <button key={p.id} className={`pic-toggle ${hs.pictogramIds.includes(p.id) ? 'selected' : ''}`} onClick={() => togglePic(p.id)}>{p.name}</button>
            ))}</div>
          </div>

          <div className="editor-preview-container">
            <div className="preview-tabs">
              <button className={activePreviewTab === 'map' ? 'active' : ''} onClick={() => setActivePreviewTab('map')}>위치 미리보기</button>
              <button className={activePreviewTab === 'modal' ? 'active' : ''} onClick={() => setActivePreviewTab('modal')}>팝업 상세 미리보기</button>
            </div>

            {activePreviewTab === 'map' ? (
              <div className="mini-map-container">
                {mapSrc ? (
                  <div className="mini-map">
                    <img src={mapSrc} className="mini-map-img" alt="Map Preview" />
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
                      className="mini-hotspot current pulse" 
                      style={{ 
                        left: `${hs.x}%`, 
                        top: `${hs.y}%`,
                        width: `${hs.w || 4}%`,
                        height: `${hs.h || 4}%`
                      }}
                    >
                      <span className="mini-hs-label">{hs.label || '현재 위치'}</span>
                    </div>
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
