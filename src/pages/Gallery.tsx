import { useState, useEffect } from 'react'
import { getGallery } from '../firebaseUtils'
import type { GalleryImage } from '../types'
import { useSEO } from '../hooks/useSEO'
import './FestivalList.css'

export default function Gallery() {
  const [galleryList, setGalleryList] = useState<GalleryImage[]>([])
  
  useSEO({
    title: "갤러리 | 내일",
    description: "무장애지도에 등록된 다양한 현장 갤러리를 확인해보세요.",
    url: 'https://naeilmap.com/gallery'
  });

  useEffect(() => {
    getGallery().then(setGalleryList).catch(console.error)
  }, [])

  return (
    <div className="festival-list-page" style={{ padding: '40px 24px', minHeight: 'calc(100vh - var(--nav-height))' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>갤러리</h1>
        <p style={{ color: 'var(--gray-600)', marginBottom: '2.5rem' }}>생생한 현장 모습을 사진으로 만나보세요.</p>
        
        {galleryList.length === 0 ? (
          <div className="empty-state">
            <p>등록된 사진이 없습니다.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {galleryList.map(img => (
              <div key={img.id} style={{ borderRadius: '12px', overflow: 'hidden', background: '#fff', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', border: '1px solid var(--gray-200)' }}>
                <div style={{ position: 'relative', width: '100%', paddingTop: '75%', overflow: 'hidden', background: '#f8f9fa' }}>
                  <img 
                    src={img.url} 
                    alt={img.caption || '갤러리 이미지'} 
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy"
                  />
                </div>
                {img.caption && (
                  <div style={{ padding: '12px 16px' }}>
                    <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--gray-800)' }}>{img.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
