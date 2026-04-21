import { useState, useEffect, useRef } from 'react'
import { Calendar, User, Phone, FileText, Camera, Send, MapPin, X, AlertTriangle } from 'lucide-react'
import { getFestivals, saveReport } from '../firebaseUtils'
import type { Festival, Report } from '../types'
import './Report.css'

export default function ReportPage() {
  const [festivals, setFestivals] = useState<Festival[]>([])
  const [selectedFestival, setSelectedFestival] = useState<Festival | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    festivalId: '',
    locationDetail: '',
    content: ''
  })
  const [coords, setCoords] = useState<{ x: number, y: number } | null>(null)
  const [selectedMapIndex, setSelectedMapIndex] = useState(0)
  const [images, setImages] = useState<string[]>([])
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getFestivals()
      .then(setFestivals)
      .catch(err => console.error('Failed to load festivals in report page:', err))
  }, [])

  useEffect(() => {
    const f = festivals.find(f => f.id === formData.festivalId)
    setSelectedFestival(f || null)
    if (!f) {
      setCoords(null)
      setSelectedMapIndex(0)
    }
  }, [formData.festivalId, festivals])

  const compressImage = (base64: string, maxWidth = 1000, quality = 0.7): Promise<string> => {
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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = async () => {
        const compressed = await compressImage(reader.result as string)
        setImages(prev => [...prev, compressed])
      }
      reader.readAsDataURL(file)
    })
  }

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current) return
    const rect = mapRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setCoords({ 
      x: Math.round(x * 1000) / 1000, 
      y: Math.round(y * 1000) / 1000 
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 1. Rate Limit Check (브루트포스/도배 방지)
    const lastSubmitStr = localStorage.getItem('naeil_last_report_submit')
    if (lastSubmitStr) {
      const diff = Date.now() - parseInt(lastSubmitStr)
      if (diff < 60000) { 
        alert('신고는 1분에 한 번만 가능합니다. 잠시 후 다시 시도해주세요.')
        return
      }
    }
    
    // 2. Input Validation (데이터 무결성 및 SQL/스크립트 공격 기초 방어)
    const name = formData.name.trim().substring(0, 20); // 길이 제한
    const contact = formData.contact.trim().substring(0, 20);
    const content = formData.content.trim().substring(0, 1000); // 대량 텍스트 공격 방지

    if (!name || !contact || !formData.festivalId || !content) {
      alert('모든 필수 항목을 입력해주세요.')
      return
    }

    setLoading(true)
    const newReport: Report = {
      id: `report-${Date.now()}`,
      name,
      contact,
      festivalId: formData.festivalId,
      locationDetail: formData.locationDetail.trim().substring(0, 100),
      content,
      x: coords?.x,
      y: coords?.y,
      mapIndex: selectedMapIndex,
      festivalName: selectedFestival?.name || '',
      images,
      createdAt: Date.now(),
      status: 'pending',
      isApproved: false
    }

    try {
      await saveReport(newReport)
      localStorage.setItem('naeil_last_report_submit', Date.now().toString())
      alert('신고가 접수되었습니다. 소중한 의견 감사합니다.')
      setFormData({ name: '', contact: '', festivalId: '', locationDetail: '', content: '' })
      setImages([])
      setCoords(null)
    } catch (err) {
      alert('신고 접수 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="report-page">
      <div className="report-header">
        <h1 className="report-title">신고센터</h1>
        <p className="report-subtitle">축제 현장에서의 불편함을 알려주세요. 배리어프리 축제를 위해 최선을 다하겠습니다.</p>
      </div>

      <form onSubmit={handleSubmit} className="report-form">
        <div className="form-grid">
          <div className="input-block">
            <label className="form-label"><User size={14} /> 이름 <span className="required-dot">*</span></label>
            <input 
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              type="text" placeholder="성함을 입력하세요" className="form-control" 
            />
          </div>
          <div className="input-block">
            <label className="form-label"><Phone size={14} /> 연락처 <span className="required-dot">*</span></label>
            <input 
              value={formData.contact}
              onChange={e => setFormData({ ...formData, contact: e.target.value })}
              type="tel" placeholder="010-0000-0000" className="form-control" 
            />
          </div>
        </div>

        <div className="input-block">
          <label className="form-label"><Calendar size={14} /> 축제 선택 <span className="required-dot">*</span></label>
          <select 
            value={formData.festivalId}
            onChange={e => setFormData({ ...formData, festivalId: e.target.value })}
            className="form-control"
          >
            <option value="">축제를 선택해주세요</option>
            {festivals.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>

        <div className="input-block">
          <label className="form-label"><MapPin size={14} /> 대략적인 위치 <span className="optional-text">(선택)</span></label>
          <input 
            value={formData.locationDetail}
            onChange={e => setFormData({ ...formData, locationDetail: e.target.value })}
            type="text" placeholder="예: 메인 무대 왼쪽 입구 근처, 푸드트럭 구역 끝쪽" className="form-control" 
          />
          
          {(() => {
            const maps = selectedFestival?.mapImages?.length ? selectedFestival.mapImages : (selectedFestival?.mapImage ? [selectedFestival.mapImage] : [])
            const currentMap = maps[selectedMapIndex]
            
            if (currentMap) {
              return (
                <div style={{ marginTop: '0.5rem' }}>
                  <p className="map-helper-text">지도에서 위치를 직접 클릭하면 관리자가 더 정확히 파악할 수 있습니다.</p>
                  
                  {maps.length > 1 && (
                    <div className="map-tab-container">
                      <button type="button" className={`map-tab-btn ${selectedMapIndex === 0 ? 'active' : ''}`} onClick={() => { setSelectedMapIndex(0); setCoords(null); }}>앞면 지도</button>
                      <button type="button" className={`map-tab-btn ${selectedMapIndex === 1 ? 'active' : ''}`} onClick={() => { setSelectedMapIndex(1); setCoords(null); }}>뒷면 지도</button>
                    </div>
                  )}

                  <div 
                    ref={mapRef}
                    onClick={handleMapClick}
                    className="map-interactive-area"
                  >
                    <img src={currentMap} alt="map" style={{ width: '100%', display: 'block' }} />
                    {coords && (
                      <div style={{ position: 'absolute', left: `${coords.x}%`, top: `${coords.y}%`, transform: 'translate(-50%, -100%)', color: '#fa5252' }}>
                        <AlertTriangle size={24} fill="#fa5252" color="white" />
                      </div>
                    )}
                  </div>
                  {coords && (
                    <button 
                      type="button"
                      onClick={() => setCoords(null)}
                      className="btn-cancel-coords"
                    >
                      <X size={12} /> 위치 선택 취소
                    </button>
                  )}
                </div>
              )
            }
            return null
          })()}
        </div>

        <div className="input-block">
          <label className="form-label"><FileText size={14} /> 불편사항 상세 내용 <span className="required-dot">*</span></label>
          <textarea 
            value={formData.content}
            onChange={e => setFormData({ ...formData, content: e.target.value })}
            rows={5} placeholder="예: 무대를 보기에 휠체어석 앞이 막혀있어요. 특정 구간의 경사로가 너무 가팔라 이용이 힘들어요." 
            className="form-control"
            style={{ resize: 'vertical', lineHeight: '1.6' }} 
          />
        </div>

        <div className="input-block">
          <label className="form-label"><Camera size={14} /> 증빙 사진 첨부 (선택)</label>
          <div className="image-upload-container">
            {images.map((img, i) => (
              <div key={i} className="image-preview">
                <img src={img} alt="upload" />
                <button 
                  type="button"
                  onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                  className="btn-remove-image"
                >&times;</button>
              </div>
            ))}
            <label className="image-upload-label">
              <Camera size={20} />
              <span>사진 추가</span>
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: 'none' }} />
            </label>
          </div>
        </div>

        <button 
          disabled={loading}
          type="submit" 
          className="btn-submit"
        >
          <Send size={18} />
          {loading ? '제출 중...' : '소중한 의견 제보하기'}
        </button>
      </form>
    </div>
  )
}

