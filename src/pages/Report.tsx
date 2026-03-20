import { useState, useEffect } from 'react'
import { Calendar, User, Phone, FileText, Camera, Send } from 'lucide-react'
import { getFestivals, saveReport } from '../firebaseUtils'
import type { Festival, Report } from '../types'

export default function ReportPage() {
  const [festivals, setFestivals] = useState<Festival[]>([])
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    festivalId: '',
    content: ''
  })
  const [images, setImages] = useState<string[]>([])

  useEffect(() => {
    getFestivals().then(setFestivals)
  }, [])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.contact || !formData.festivalId || !formData.content) {
      alert('모든 필수 항목을 입력해주세요.')
      return
    }

    setLoading(true)
    const selectedFestival = festivals.find(f => f.id === formData.festivalId)
    const newReport: Report = {
      id: `report-${Date.now()}`,
      ...formData,
      festivalName: selectedFestival?.name || '',
      images,
      createdAt: Date.now(),
      status: 'pending'
    }

    try {
      await saveReport(newReport)
      alert('신고가 접수되었습니다. 소중한 의견 감사합니다.')
      setFormData({ name: '', contact: '', festivalId: '', content: '' })
      setImages([])
    } catch (err) {
      alert('신고 접수 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '45rem', margin: '0 auto', padding: '4rem 1.5rem', minHeight: 'calc(100vh - var(--nav-height))' }}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#1a1a1a', letterSpacing: '-1px', marginBottom: '0.75rem' }}>신고센터</h1>
        <p style={{ color: '#666', fontSize: '1.0625rem' }}>축제 현장에서의 불편함을 알려주세요. 배리어프리 축제를 위해 최선을 다하겠습니다.</p>
      </div>

      <form onSubmit={handleSubmit} style={{ background: 'white', border: '1px solid #E9ECEF', borderRadius: '1.5rem', padding: '2.5rem', boxShadow: '0 20px 50px rgba(0,0,0,0.04)', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 700, color: '#495057', display: 'flex', alignItems: 'center', gap: '0.375rem' }}><User size={14} /> 이름 <span style={{ color: '#fa5252' }}>*</span></label>
            <input 
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              type="text" placeholder="성함을 입력하세요" style={{ border: '1px solid #dee2e6', borderRadius: '0.625rem', padding: '0.875rem 1rem', fontSize: '0.9375rem', outline: 'none', transition: 'border-color 0.2s' }} 
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 700, color: '#495057', display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Phone size={14} /> 연락처 <span style={{ color: '#fa5252' }}>*</span></label>
            <input 
              value={formData.contact}
              onChange={e => setFormData({ ...formData, contact: e.target.value })}
              type="tel" placeholder="010-0000-0000" style={{ border: '1px solid #dee2e6', borderRadius: '0.625rem', padding: '0.875rem 1rem', fontSize: '0.9375rem', outline: 'none' }} 
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 700, color: '#495057', display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Calendar size={14} /> 축제 선택 <span style={{ color: '#fa5252' }}>*</span></label>
          <select 
            value={formData.festivalId}
            onChange={e => setFormData({ ...formData, festivalId: e.target.value })}
            style={{ border: '1px solid #dee2e6', borderRadius: '0.625rem', padding: '0.875rem 1rem', fontSize: '0.9375rem', outline: 'none', background: 'white' }}
          >
            <option value="">축제를 선택해주세요</option>
            {festivals.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 700, color: '#495057', display: 'flex', alignItems: 'center', gap: '0.375rem' }}><FileText size={14} /> 불편사항 상세 내용 <span style={{ color: '#fa5252' }}>*</span></label>
          <textarea 
            value={formData.content}
            onChange={e => setFormData({ ...formData, content: e.target.value })}
            rows={5} placeholder="예: 무대를 보기에 휠체어석 앞이 막혀있어요. 특정 구간의 경사로가 너무 가팔라 이용이 힘들어요." 
            style={{ border: '1px solid #dee2e6', borderRadius: '0.625rem', padding: '1rem', fontSize: '0.9375rem', outline: 'none', resize: 'vertical', lineHeight: '1.6' }} 
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <label style={{ fontSize: '0.875rem', fontWeight: 700, color: '#495057', display: 'flex', alignItems: 'center', gap: '0.375rem' }}><Camera size={14} /> 증빙 사진 첨부 (선택)</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
            {images.map((img, i) => (
              <div key={i} style={{ position: 'relative', width: '5.5rem', height: '5.5rem' }}>
                <img src={img} alt="upload" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.5rem' }} />
                <button 
                  onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                  style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#fa5252', color: 'white', width: '1.25rem', height: '1.25rem', borderRadius: '50%', fontSize: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid white', padding: 0 }}
                >&times;</button>
              </div>
            ))}
            <label style={{ width: '5.5rem', height: '5.5rem', border: '2px dashed #dee2e6', borderRadius: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#adb5bd', fontSize: '0.75rem', cursor: 'pointer', gap: '0.25rem', transition: 'all 0.2s' }}>
              <Camera size={20} />
              <span>사진 추가</span>
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: 'none' }} />
            </label>
          </div>
        </div>

        <button 
          disabled={loading}
          type="submit" 
          style={{ 
            background: loading ? '#adb5bd' : '#1a1a1a', 
            color: 'white', 
            padding: '1rem', 
            borderRadius: '0.75rem', 
            fontSize: '1.0625rem', 
            fontWeight: 700, 
            cursor: loading ? 'not-allowed' : 'pointer', 
            border: 'none', 
            marginTop: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.625rem',
            transition: 'transform 0.2s'
          }}
        >
          <Send size={18} />
          {loading ? '제출 중...' : '소중한 의견 제보하기'}
        </button>
      </form>
    </div>
  )
}
