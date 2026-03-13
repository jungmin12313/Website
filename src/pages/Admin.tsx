import { useState, useRef, useEffect } from 'react'
import { Plus, Trash2, Save, Upload, X, MapPin, Home, Calendar } from 'lucide-react'
import type { Hotspot, Festival } from '../types'
import './Admin.css'

const FESTIVALS_STORAGE_KEY = 'naeil_festivals_data'
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
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check auth
    if (sessionStorage.getItem('naeil_admin_auth') === 'true') {
      setIsAuthorized(true)
    }

    // Load festivals
    const savedFestivals = localStorage.getItem(FESTIVALS_STORAGE_KEY)
    if (savedFestivals) {
      setFestivals(JSON.parse(savedFestivals))
    } else {
      fetch('/data/festivals.json')
        .then(r => r.json())
        .then((data: Festival[]) => {
          setFestivals(data)
          localStorage.setItem(FESTIVALS_STORAGE_KEY, JSON.stringify(data))
        })
    }

    // Load hero bg
    const savedHero = localStorage.getItem(HERO_BG_STORAGE_KEY)
    if (savedHero) setHeroBg(savedHero)
  }, [])

  const saveToStorage = (data: Festival[]) => {
    try {
      setFestivals(data)
      localStorage.setItem(FESTIVALS_STORAGE_KEY, JSON.stringify(data))
      return true
    } catch (e) {
      console.error('Failed to save to localStorage:', e)
      alert('저장에 실패했습니다. 이미지 용량이 너무 크거나 브라우저 저장 공간이 부족할 수 있습니다.')
      return false
    }
  }

  const handleHeroBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      setHeroBg(base64)
      try {
        localStorage.setItem(HERO_BG_STORAGE_KEY, base64)
        alert('배경사진이 변경되었습니다.')
      } catch (err) {
        alert('이미지 용량이 너무 커서 저장할 수 없습니다.')
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
      pictograms: []
    }
    setEditingFestival(newF)
  }

  const saveFestival = () => {
    if (!editingFestival) return
    
    // Validation
    if (!editingFestival.name.trim()) {
      alert('축제 이름은 필수 입력 항목입니다.')
      return
    }

    setFestivals(prev => {
      const exists = prev.find(f => f.id === editingFestival.id)
      let updated: Festival[]
      if (exists) {
        updated = prev.map(f => f.id === editingFestival.id ? editingFestival : f)
      } else {
        updated = [...prev, editingFestival]
      }
      
      if (saveToStorage(updated)) {
        setEditingFestival(null)
        alert('축제 정보가 저장되었습니다.')
      }
      return updated
    })
  }

  const deleteFestival = (id: string) => {
    if (!confirm('정말 축제를 삭제하시겠습니까?')) return
    setFestivals(prev => {
      const updated = prev.filter(f => f.id !== id)
      if (saveToStorage(updated)) {
        if (selectedFestivalId === id) {
          setSelectedFestivalId('')
          setHotspots([])
          setMapSrc('')
        }
        alert('축제가 삭제되었습니다.')
      }
      return updated
    })
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
      label: '',
      description: [],
      pictogramIds: [],
      photos: [],
    }
    setEditHs(newHs)
    setAdding(false)
  }

  const saveHotspot = (hsWithDesc: Hotspot) => {
    if (!selectedFestivalId) return
    
    // Validation
    if (!hsWithDesc.label.trim()) {
      alert('장소 이름은 필수 입력 항목입니다.')
      return
    }

    setFestivals(prev => {
      const festival = prev.find(f => f.id === selectedFestivalId)
      if (!festival) return prev

      const hotspotExists = festival.hotspots?.some(h => h.id === hsWithDesc.id)
      const newHotspots = hotspotExists
        ? festival.hotspots.map(h => h.id === hsWithDesc.id ? hsWithDesc : h)
        : [...(festival.hotspots || []), hsWithDesc]

      const updated = prev.map(f => f.id === selectedFestivalId ? { ...f, hotspots: newHotspots } : f)
      
      if (saveToStorage(updated)) {
        setHotspots(newHotspots)
        setEditHs(null)
        alert('핫스팟이 저장되었습니다.')
      }
      return updated
    })
  }

  const deleteHotspot = (id: string) => {
    if (!confirm('핫스팟을 삭제하시겠습니까?')) return
    
    setFestivals(prev => {
      const festival = prev.find(f => f.id === selectedFestivalId)
      if (!festival) return prev

      const newHotspots = (festival.hotspots || []).filter(h => h.id !== id)
      const updated = prev.map(f => f.id === selectedFestivalId ? { ...f, hotspots: newHotspots } : f)
      
      if (saveToStorage(updated)) {
        setHotspots(newHotspots)
      }
      return updated
    })
  }

  const handleMapUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      setMapSrc(base64)
      
      setFestivals(prev => {
        const updated = prev.map(f => f.id === selectedFestivalId ? { ...f, mapImage: base64 } : f)
        saveToStorage(updated)
        return updated
      })
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

            <div className="admin-map-area">
              {!selectedFestivalId ? (
                <div className="admin-map-empty"><p>왼쪽에서 축제를 먼저 선택하세요</p></div>
              ) : (
                <div className={`admin-map ${adding ? 'cursor-crosshair' : ''}`} ref={mapRef} onClick={handleMapClick}>
                  {mapSrc ? <img src={mapSrc} className="admin-map-img" /> : <div className="admin-map-placeholder">지도 이미지를 업로드하세요</div>}
                  {hotspots.map(hs => (
                    <button key={hs.id} className="admin-hotspot" style={{ left: `${hs.x}%`, top: `${hs.y}%` }} onClick={e => { e.stopPropagation(); setEditHs(hs) }}>
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
                <button className="reset-hero-btn" onClick={() => { setHeroBg(''); localStorage.removeItem(HERO_BG_STORAGE_KEY) }}>
                  기본으로 초기화
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Festival Editor Modal */}
      {editingFestival && (
        <FestivalEditor festival={editingFestival} onSave={saveFestival} onClose={() => setEditingFestival(null)} setFestival={setEditingFestival} />
      )}

      {/* Hotspot Editor Modal */}
      {editHs && (
        <HotspotEditor hotspot={editHs} pictograms={festivals.find(f => f.id === selectedFestivalId)?.pictograms || []} onSave={saveHotspot} onClose={() => setEditHs(null)} />
      )}
    </div>
  )
}

function FestivalEditor({ festival, onSave, onClose, setFestival }: { festival: Festival, onSave: () => void, onClose: () => void, setFestival: React.Dispatch<React.SetStateAction<Festival | null>> }) {
  const update = (field: keyof Festival, val: any) => setFestival(prev => prev ? ({ ...prev, [field]: val }) : prev)
  
  const handleThumbUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => update('thumbnail', reader.result as string)
    reader.readAsDataURL(file)
  }

  return (
    <div className="editor-overlay">
      <div className="editor-panel wide">
        <div className="editor-header"><h3>축제 정보 수정</h3><button onClick={onClose}><X size={20} /></button></div>
        <div className="editor-body grid-2">
          <div>
            <label className="required">축제 이름</label>
            <input 
              value={festival.name} 
              onChange={e => update('name', e.target.value)} 
              className={!festival.name.trim() ? 'error' : ''}
              placeholder="축제 명칭을 입력하세요"
            />
            
            <label>부제목</label>
            <input value={festival.subtitle} onChange={e => update('subtitle', e.target.value)} />
            <div className="row">
              <div><label>시작일</label><input value={festival.startDate} onChange={e => update('startDate', e.target.value)} placeholder="0000.00.00" /></div>
              <div><label>종료일</label><input value={festival.endDate} onChange={e => update('endDate', e.target.value)} placeholder="0000.00.00" /></div>
            </div>
            <label>장소</label><input value={festival.location} onChange={e => update('location', e.target.value)} />
            <label>주소</label><input value={festival.address} onChange={e => update('address', e.target.value)} />
          </div>
          <div>
            <label>썸네일 이미지</label>
            <div className="thumb-preview">{festival.thumbnail && <img src={festival.thumbnail} />}</div>
            <label className="upload-inline-btn"><Upload size={14} /> 이미지 변경<input type="file" accept="image/*" onChange={handleThumbUpload} style={{ display: 'none' }} /></label>
            <label>문의처</label><input value={festival.phone} onChange={e => update('phone', e.target.value)} />
            <label>상태</label>
            <select value={festival.status} onChange={e => update('status', e.target.value)}>
              <option value="active">진행중</option>
              <option value="soon">준비중</option>
              <option value="ended">종료됨</option>
            </select>
          </div>
        </div>
        <div className="editor-footer"><button className="editor-save" onClick={onSave}><Save size={16} /> 저장하기</button></div>
      </div>
    </div>
  )
}

function HotspotEditor({ hotspot, pictograms, onSave, onClose }: { hotspot: Hotspot, pictograms: Festival['pictograms'], onSave: (hs: Hotspot) => void, onClose: () => void }) {
  const [hs, setHs] = useState<Hotspot>({ ...hotspot })
  const [descText, setDescText] = useState(hotspot.description.join('\n'))

  const togglePic = (id: string) => {
    setHs(prev => ({ ...prev, pictogramIds: prev.pictogramIds.includes(id) ? prev.pictogramIds.filter(p => p !== id) : [...prev.pictogramIds, id] }))
  }

  const handleHsPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => setHs(prev => ({ ...prev, photos: [...prev.photos, reader.result as string] }))
      reader.readAsDataURL(file)
    })
  }

  return (
    <div className="editor-overlay">
      <div className="editor-panel">
        <div className="editor-header"><h3>핫스팟 편집</h3><button onClick={onClose}><X size={20} /></button></div>
        <div className="editor-body">
          <label className="required">장소 이름</label>
          <input 
            value={hs.label} 
            onChange={e => setHs({ ...hs, label: e.target.value })} 
            className={!hs.label.trim() ? 'error' : ''}
            placeholder="예: 휠체어 리프트 입구"
          />
          <label>설명 (줄바꿈 구분)</label><textarea rows={4} value={descText} onChange={e => setDescText(e.target.value)} />
          <label>사진 추가</label>
          <div className="hs-photos-preview">{hs.photos.map((p, i) => <img key={i} src={p} />)}<label className="add-photo-box"><Plus /><input type="file" multiple onChange={handleHsPhotoUpload} style={{ display: 'none' }} /></label></div>
          <label>픽토그램</label>
          <div className="editor-pics">{pictograms.map(p => (
            <button key={p.id} className={`pic-toggle ${hs.pictogramIds.includes(p.id) ? 'selected' : ''}`} onClick={() => togglePic(p.id)}>{p.name}</button>
          ))}</div>
        </div>
        <div className="editor-footer"><button className="editor-save" onClick={() => onSave({ ...hs, description: descText.split('\n').filter(Boolean) })}><Save size={16} /> 저장</button></div>
      </div>
    </div>
  )
}
