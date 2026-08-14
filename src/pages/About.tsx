import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import './About.css';

"use client";

// 내일 · 무장애 데이터 — About 페이지 리뉴얼 (축제 + 데이터 종합)

const STATS = [
  {
    num: "524",
    unit: "개+",
    label: ["직접 실측한", "접근성 데이터"],
    blue: true,
  },
  {
    num: "100",
    unit: "명+",
    label: ["현장 조사에 동행한", "시민과 당사자"],
    blue: false,
  },
  {
    num: "17",
    unit: "곳+",
    label: ["함께 데이터를 구축하는", "파트너 기관"],
    blue: false,
  },
];

const DIFFERENCES = [
  {
    label: "DIFFERENCE 01",
    title: "당사자 중심 검증",
    desc: "\"있다/없다\"가 아닌 \"실제 휠체어로 이동 가능한지\"를 휠체어 이용자와 함께 현장에서 직접 확인합니다."
  },
  {
    label: "DIFFERENCE 02",
    title: "수치화된 데이터",
    desc: "단순한 \"경사로 있음\"이 아닌 경사도, 단차 높이, 통로 폭을 정확한 수치로 기록하여 신뢰할 수 있는 데이터를 만듭니다."
  }
];

export default function About() {

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    const revealElements = document.querySelectorAll('.reveal');
    revealElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="about-page">
      <SEO 
        title="브랜드 스토리 | 대한민국 접근성 데이터 플랫폼, 내일"
        description="축제에서 시작해 일상의 모든 접근성을 데이터로 만드는 '내일'의 이야기. 휠체어 바퀴가 닿는 곳의 정확한 데이터를 구축합니다."
        schema={[
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "홈", "item": "https://naeilmap.com/" },
              { "@type": "ListItem", "position": 2, "name": "브랜드 스토리", "item": "https://naeilmap.com/about" }
            ]
          },
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "내일 (NAEILMAP)",
            "url": "https://naeilmap.com/",
            "logo": "https://naeilmap.com/og-image.png",
            "description": "대한민국 접근성 데이터 플랫폼 및 무장애 지도 서비스",
            "knowsAbout": [
              "Barrier-free (무장애)",
              "Wheelchair Accessibility (휠체어 접근성)",
              "Universal Design (유니버설 디자인)"
            ],
            "sameAs": [
              "https://www.instagram.com/naeil__official"
            ],
            "memberOf": [
              {
                "@type": "Organization",
                "name": "함께하는 17곳 이상의 파트너 기관"
              }
            ]
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "무장애지도 '내일'은 어떤 서비스인가요?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "내일은 휠체어 이용자, 고령자, 영유아 동반자 등 교통약자를 위한 접근성 정보를 제공하는 지도 플랫폼입니다. 축제나 행사장 등의 장소에 대해 단순 '있다/없다'가 아닌 휠체어 접근 가능 여부를 정확히 수치로 기록하여 안내합니다."
                }
              },
              {
                "@type": "Question",
                "name": "접근성 데이터는 어떻게 실측되나요?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "휠체어 이용 당사자와 활동가들이 직접 현장에 나가서 경사도, 단차, 통로 폭 등을 실측하고 기록합니다. 이렇게 수집된 데이터는 '내일' 플랫폼에서 사진과 상세 수치 정보로 제공되어 높은 신뢰성을 자랑합니다."
                }
              },
              {
                "@type": "Question",
                "name": "일반 지도 앱의 편의시설 정보와 무엇이 다른가요?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "기존 지도 앱들은 기계적인 '장애인 화장실 유무'만 표기하는 경우가 많습니다. '내일'은 실제로 화장실까지 가는 길이 휠체어로 통과 가능한지, 경사로 각도가 너무 가파르지 않은지 등 당사자 관점에서의 세밀한 데이터를 제공합니다."
                }
              }
            ]
          }
        ]}
      />

      <style>{`
        .reveal {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.8s cubic-bezier(0.22, 1, 0.36, 1), 
                      transform 0.8s cubic-bezier(0.22, 1, 0.36, 1);
        }
        
        .reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      {/* 1. HERO */}
      <section className="about-hero" aria-label="프로젝트 소개">
        <div className="about-pill reveal">접근성 데이터 파트너</div>
        <h1 className="hero-headline reveal">
          모두의 내일을 위해,<br />
          접근성을 <span style={{ color: "var(--blue)" }}>데이터</span>로 증명합니다
        </h1>
        <p className="reveal hero-sub" style={{ transitionDelay: '0.1s' }}>
          가장 불확실한 현장인 '야외 축제'에서 시작된 내일의 무장애지도는,<br />
          이제 휠체어 바퀴가 닿는 모든 일상의 접근성을 정확한 수치로 기록하는 데이터 기준이 되고 있습니다.
        </p>
        <div className="reveal hero-cta" style={{ transitionDelay: '0.2s', display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/maps" className="btn-main">무장애지도 보기</Link>
          <Link to="/partnership" className="btn-ghost" style={{ background: 'white', border: '1px solid var(--gray-200)', color: 'var(--gray-900)' }}>데이터 제휴 알아보기 ➔</Link>
        </div>
      </section>

      {/* 2. ORIGIN & 3. IMPACT DASHBOARD */}
      <section className="about-story" style={{ backgroundColor: 'white' }}>
        <div className="story-container">
          <div className="story-content reveal" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <div className="sec-kicker">WHY WE STARTED</div>
            <h2 className="story-heading">
              정보가 없는 것이 아닙니다.<br />
              그 정보가 <span style={{ color: "var(--blue)" }}>'진짜'</span>인지 믿기 어려웠을 뿐입니다.
            </h2>
            <p className="story-body" style={{ marginTop: '1.5rem', marginBottom: '3rem' }}>
              검색하면 나오는 '휠체어 이용 가능'이라는 한 줄 뒤에 숨겨진 계단과 턱.<br />
              '내일'은 당사자와 함께 가장 변수가 많은 야외 축제 현장을 직접 누비며,<br />
              종이 위 행정 데이터가 아닌 '살아있는 현장 데이터'를 수집하기 시작했습니다.
            </p>
          </div>

          <div className="stat-bar" style={{ marginTop: '2rem' }}>
            {STATS.map((st, i) => (
              <div key={i} className="reveal stat-pill" style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className={`stat-num ${st.blue ? 'blue' : ''}`} style={{ color: st.blue ? 'var(--blue)' : 'inherit', whiteSpace: 'nowrap' }}>
                  {st.num}<span className="stat-unit">{st.unit}</span>
                </div>
                <div className="stat-label" style={{ marginTop: '1rem', color: 'var(--gray-600)' }}>
                  {st.label[0]}<br /><strong>{st.label[1]}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. DIFFERENCE */}
      <section className="about-story" style={{ backgroundColor: 'var(--gray-50)' }}>
        <div className="story-container">
          <div className="story-content reveal" style={{ textAlign: 'center' }}>
            <div className="sec-kicker">OUR DIFFERENCE</div>
            <h2 className="story-heading">
              내일의 지도는 기술이 아닌<br />여러분들의 <span style={{ color: "var(--blue)" }}>땀방울</span>로 그려집니다.
            </h2>
          </div>
          
          <div style={{ display: "flex", gap: "2rem", justifyContent: "center", flexWrap: "wrap", marginTop: "3rem" }}>
             {DIFFERENCES.map((diff, i) => (
               <div key={i} className="reveal stat-pill" style={{ transitionDelay: `${i * 0.1}s`, textAlign: "left", flex: "1 1 300px", maxWidth: "480px" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, color: "var(--blue)", marginBottom: 16 }}>{diff.label}</div>
                  <h3 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: 16, color: "var(--gray-900)" }}>{diff.title}</h3>
                  <p style={{ fontSize: "1rem", color: "var(--gray-600)", lineHeight: 1.8 }}>
                    {diff.desc}
                  </p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* 5. EXPANSION */}
      <section className="about-story" style={{ backgroundColor: 'white' }}>
        <div className="story-container">
          <div className="story-content reveal" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
            <div className="sec-kicker">BEYOND FESTIVALS</div>
            <h2 className="story-heading">
              축제 지도에서 시작된 내일,<br />
              이제 모든 공간의 <span style={{ color: "var(--blue)" }}>표준</span>이 됩니다.
            </h2>
            <p className="story-body" style={{ marginTop: '1.5rem' }}>
              축제와 행사를 넘어 실생활권 상권과 복잡한 실내 시설까지.<br />
              내일이 만든 접근성 데이터는 공공기관과 기업의 ESG 지표가 되고,<br />
              교통약자의 완벽한 이동권 보장을 위한 인프라로 진화하고 있습니다.
            </p>
          </div>
        </div>
      </section>

      {/* 6. CTA */}
      <section className="about-cta" aria-label="함께하기">
        <p className="reveal cta-big">내일과 함께 장벽 없는 세상을 만들어가세요.</p>
        <div className="reveal hero-cta" style={{ transitionDelay: '0.1s', display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '2.5rem' }}>
          <Link to="/maps" className="btn-main">지도에서 내일 경험하기</Link>
          <Link to="/partnership" className="btn-main" style={{ background: 'var(--gray-800)' }}>우리 기관 접근성 진단하기</Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="about-footer">
        <div style={{ fontFamily: "var(--font), sans-serif", fontSize: 17, fontWeight: 700 }}>
          내일 · 무장애 데이터
        </div>
        <div style={{ fontSize: 11, lineHeight: 1.75, textAlign: "right", opacity: 0.7 }}>
          장애인 이동권 개선 프로젝트
        </div>
      </footer>
    </div>
  );
}
