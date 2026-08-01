import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import './About.css';

"use client";

// 내일 · 무장애 축제 지도 — About 페이지

const STATS = [
  {
    num: "3.6%",
    label: ["장애인의 문화예술", "직접 참여율"],
    blue: true,
    isSmall: false,
  },
  {
    num: "당사자\n동행",
    label: ["휠체어 이용자와 함께", "현장에서 직접 조사"],
    blue: false,
    isSmall: true,
  },
  {
    num: "실측\n기록",
    label: ["경사도·단차·폭을", "수치로 검증"],
    blue: false,
    isSmall: true,
  },
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
      {/* JSON-LD 구조화 데이터 추가 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "무장애지도 | 모두가 참여할 수 있는 축제, 내일",
            "description": "무장애지도 전문 플랫폼 '내일' 교통약자도 함께 즐기는 전국 축제 배리어프리 접근성 정보를 제공합니다.",
            "url": "https://naeilmap.com",
            "foundingDate": "2024",
            "areaServed": "KR",
            "keywords": "무장애지도, 무장애 축제, 무장애축제지도, 배리어프리, 장애인 문화 접근성, 휠체어 축제 지도"
          })
        }}
      />
      
      <SEO 
        title="브랜드 스토리 | 내일 - 무장애지도 전문 플랫폼"
        description="휠체어 사용자도 즐길 수 있는 축제를 꿈꾸는 '내일'의 이야기. 왜 우리가 직접 현장에서 무장애지도를 제작하는지 그 이유를 들려드립니다."
        url="https://naeilmap.com/about"
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

        .stat-num.blue { color: var(--blue); }
        .stat-num.small { font-size: 22px; line-height: 1.3; }
      `}</style>

      {/* HERO */}
      <section className="about-hero" aria-label="프로젝트 소개">
        <div className="hero-ghost" aria-hidden="true">Naeil</div>
        <div className="about-pill reveal">문화 접근권 프로젝트</div>
        <h1 className="hero-headline reveal">
          모두의 <span style={{ color: "inherit" }}>내일</span>은,<br />
          모두가 함께하는<br />축제입니다
        </h1>
        <p className="reveal hero-sub" style={{ transitionDelay: '0.1s' }}>
          장애인의 문화예술 직접 참여율은 단 3.6%.<br />
          당연한 축제가 누군가에겐 큰 용기가 필요한 일이라면<br />
          <span style={{ fontWeight: 700 }}>내일</span>은 장애인·휠체어 사용자·노인 모두가 축제를 즐길 수 있도록 배리어프리 접근성 정보를 제공합니다.
        </p>
        <div className="reveal hero-cta" style={{ transitionDelay: '0.2s' }}>
          <Link to="/maps" className="btn-main">지도 보러 가기</Link>
          <a href="#diff" className="btn-ghost">차별점 확인하기 ➔</a>
        </div>
      </section>

      {/* STAT BAR */}
      <div className="stat-bar">
        {STATS.map((st, i) => (
          <div key={i} className="reveal stat-pill" style={{ transitionDelay: `${i * 0.1}s` }}>
            <div className={`stat-num ${st.blue ? 'blue' : ''} ${st.isSmall ? 'small' : ''}`}>
              {st.num.split("\n").map((line, j) => (
                <span key={j} style={{ display: "block" }}>{line}</span>
              ))}
            </div>
            <div className="stat-label">
              {st.label[0]}<br />{st.label[1]}
            </div>
          </div>
        ))}
      </div>



      {/* STORY */}
      <section id="story" className="about-story" aria-label="우리가 시작한 이유">
        <div className="reveal sec-kicker">우리가 시작한 이유</div>
        <div className="two-col">
          <div className="reveal story-heading">
            정보가 없는 게<br />아니었습니다.<br />
            그 정보가<br /><span>'진짜'인지</span><br />몰랐던 겁니다.
          </div>
          <div className="reveal story-body" style={{ transitionDelay: '0.1s' }}>
            <p>검색하면 나옵니다. '휠체어 이용 가능.' 하지만 그 한 줄이 얼마나 많은 실망을 담고 있는지, 내일은 직접 들었습니다.</p>
            <p style={{ marginTop: 16 }}>정보를 믿고 찾아간 축제 입구에는 경사로 대신 계단이, 화장실 표시 옆에는 잠긴 자물쇠가 있었습니다.</p>
            <p style={{ marginTop: 16 }}>그래서 <span style={{ fontWeight: 700 }}>'내일'</span>은 당사자와 함께, 휠체어 바퀴가 닿는 모든 곳의 배리어프리 접근성을 직접 확인하며 책상이 아닌 현장에서 시작했습니다.</p>
          </div>
        </div>
      </section>



      {/* CTA */}
      <section className="about-cta" aria-label="함께하기">
        <p className="reveal cta-big">모두에게 즐거운 축제의 <span>내일</span></p>
        <p className="reveal cta-sub" style={{ transitionDelay: '0.1s' }}>
          내일의 지도는 기술이 아닌 따뜻한 관심으로 채워집니다.<br />
          더 많은 이들이 문밖으로 나설 수 있도록,<br />
          지금 <span>'내일'</span>과 함께해주세요.
        </p>
        <a href="https://www.instagram.com/naeil__official?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className="reveal btn-white" style={{ transitionDelay: '0.2s' }}>지금 함께하기</a>
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

