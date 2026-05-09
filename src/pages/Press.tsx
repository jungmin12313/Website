import { useState, useEffect } from 'react'
import { getPress } from '../firebaseUtils'
import type { PressArticle } from '../types'
import { useSEO } from '../hooks/useSEO'
import './About.css' // Using About.css for common styling

export default function Press() {
  const [pressList, setPressList] = useState<PressArticle[]>([])
  
  useSEO({
    title: "보도자료 | 내일",
    description: "내일 무장애지도의 관련 보도자료를 확인하세요.",
    url: 'https://naeilmap.com/press'
  });

  useEffect(() => {
    getPress().then(setPressList).catch(console.error)
  }, [])

  return (
    <div className="about-page" style={{ padding: '60px 24px', minHeight: 'calc(100vh - var(--nav-height))', background: 'var(--gray-50)' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', background: '#fff', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '1.5rem' }}>보도자료</h1>
        <p style={{ color: 'var(--gray-600)', marginBottom: '2rem' }}>내일과 관련된 최신 소식과 보도자료입니다.</p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {pressList.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-500)' }}>
              등록된 보도자료가 없습니다.
            </div>
          )}
          {pressList.map(article => (
            <a 
              key={article.id}
              href={article.link}
              target="_blank"
              rel="noreferrer"
              style={{ 
                display: 'flex', 
                gap: '1.5rem', 
                padding: '1.5rem', 
                border: '1px solid var(--gray-200)', 
                borderRadius: '12px', 
                textDecoration: 'none', 
                color: 'inherit', 
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                background: 'white',
                alignItems: 'center'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px -8px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = 'var(--primary-color)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'var(--gray-200)';
              }}
            >
              {article.image && (
                <div style={{ flexShrink: 0, width: '160px', height: '120px', borderRadius: '8px', overflow: 'hidden', background: '#f8fafc' }}>
                  <img src={article.image} alt={article.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem', color: 'var(--gray-500)', fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: 800, color: 'var(--primary-color)' }}>{article.publisher}</span>
                  <span>{article.date}</span>
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--gray-900)', lineHeight: 1.4 }}>{article.title}</h3>
                {article.content && (
                  <p style={{ color: 'var(--gray-600)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {article.content}
                  </p>
                )}
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
