import { useState, useEffect } from 'react'
import { getPress } from '../firebaseUtils'
import type { PressArticle } from '../types'
import { useSEO } from '../hooks/useSEO'
import './About.css' // Using About.css for common styling
import './Press.css' // Using Press.css for component styling

export default function Press() {
  const [pressList, setPressList] = useState<PressArticle[]>([])
  
  useSEO({
    title: "보도자료 | 내일",
    description: "내일 무장애지도의 관련 보도자료를 확인하세요.",
    url: 'https://naeilmap.com/press'
  });

  useEffect(() => {
    getPress().then(data => {
      // 옛날 기사부터 최상단에 오도록 날짜 기준 오름차순 정렬
      const sorted = data.sort((a, b) => a.date.localeCompare(b.date));
      setPressList(sorted);
    }).catch(console.error)
  }, [])

  return (
    <div className="about-page press-page">
      <div className="press-container">
        <h1 className="press-title">보도자료</h1>
        <p className="press-desc">'내일'과 관련된 최신 소식과 보도자료입니다.</p>
        
        <div className="press-list">
          {pressList.length === 0 && (
            <div className="press-empty">
              등록된 보도자료가 없습니다.
            </div>
          )}
          {pressList.map(article => (
            <a 
              key={article.id}
              href={article.link}
              target="_blank"
              rel="noreferrer"
              className="press-card"
            >
              {article.image && (
                <div className="press-image">
                  <img src={article.image} alt={article.title} />
                </div>
              )}
              <div className="press-content">
                <div className="press-meta">
                  <span className="press-publisher">{article.publisher}</span>
                  <span className="press-date">{article.date}</span>
                </div>
                <h3 className="press-item-title">{article.title}</h3>
                {article.content && (
                  <p className="press-preview">
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
