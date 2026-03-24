import { useState } from 'react'
import { X, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react'
import type { Hotspot, Pictogram } from '../types'
import './HotspotModal.css'

interface Props {
  hotspot: Hotspot
  pictograms: Pictogram[]
  onClose: () => void
}

const PICTOGRAM_COLORS: Record<string, string> = {
  blue: '#5BA4CF',
  orange: '#E67E22',
  red: '#E74C3C',
  green: '#27AE60',
  gray: '#95A5A6',
}

export default function HotspotModal({ hotspot, pictograms, onClose }: Props) {
  const [photoIdx, setPhotoIdx] = useState(0)

  const pics = (hotspot.pictogramIds || [])
    .map(id => pictograms.find(p => p.id === id))
    .filter(Boolean) as Pictogram[]

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <button className="modal-close" onClick={onClose}><X size={20} /></button>

        <div className="modal-inner">
          {/* 왼쪽: 텍스트 */}
          <div className="modal-left">
            <h2 className="modal-title">{hotspot.label}</h2>

            {/* 픽토그램 뱃지 및 이미지 */}
            {((pics && pics.length > 0) || (hotspot.pictogramImages && hotspot.pictogramImages.length > 0)) && (
              <div className="modal-pics">
                {(pics || []).map(p => (
                  <div
                    key={p.id}
                    className="pic-badge"
                    style={{ background: PICTOGRAM_COLORS[p.color] }}
                    title={p.name}
                  >
                    <span className="pic-icon">♿</span>
                  </div>
                ))}
                {hotspot.pictogramImages?.map((img, i) => (
                  <img key={i} src={img} className="modal-pic-img" alt="pictogram icon" />
                ))}
              </div>
            )}

            {/* 설명 목록 */}
            <ul className="modal-desc">
              {(hotspot.description || []).map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>

            {/* 신고 안내 */}
            {hotspot.note && (
              <p className="modal-note">{hotspot.note}</p>
            )}

            <p className="modal-report">
              <AlertCircle size={13} />
              혹시 사용에 불편한 점이 생겼다면<br/>
              본 홈페이지 신고센터에 신고해주세요.
            </p>
          </div>

          {/* 오른쪽: 사진 슬라이더 */}
          {hotspot.photos && hotspot.photos.length > 0 && (
            <div className="modal-right">
              <div className="photo-slider">
                <img
                  src={hotspot.photos[photoIdx]}
                  alt={`${hotspot.label} 사진 ${photoIdx + 1}`}
                  onError={e => { (e.target as HTMLImageElement).src = '/placeholder.svg' }}
                />
                {hotspot.photos.length > 1 && (
                  <>
                    <button
                      className="slider-btn prev"
                      onClick={() => setPhotoIdx(i => (i - 1 + hotspot.photos.length) % hotspot.photos.length)}
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      className="slider-btn next"
                      onClick={() => setPhotoIdx(i => (i + 1) % hotspot.photos.length)}
                    >
                      <ChevronRight size={18} />
                    </button>
                    <div className="slider-dots">
                      {hotspot.photos.map((_, i) => (
                        <span
                          key={i}
                          className={`dot ${i === photoIdx ? 'active' : ''}`}
                          onClick={() => setPhotoIdx(i)}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
