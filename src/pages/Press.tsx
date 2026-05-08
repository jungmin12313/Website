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
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {pressList.length === 0 && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-500)' }}>
              등록된 보도자료가 없습니다.
            </div>
          )}
          {pressList.map(article => (
            <a 
              key={article.id}
              href={article.link}
              target="_blank"
              rel="noreferrer"
              style={{ padding: '1.5rem', border: '1px solid var(--gray-200)', borderRadius: '8px', textDecoration: 'none', color: 'inherit', transition: 'transform 0.2s, box-shadow 0.2s', display: 'block' }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>{article.title}</h3>
              </div>
              <div style={{ display: 'flex', gap: '1rem', color: 'var(--gray-500)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--primary-color)' }}>{article.publisher}</span>
                <span>{article.date}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
