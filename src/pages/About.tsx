import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';
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

const VOICES = [
  {
    quote: "정보가 없는 건 아니에요. 근데 그 정보가 진짜인지 믿기가 힘들죠. 가보기 전까지는 늘 불안함이 앞서요.",
    contextParts: ["이 말이 '내일'의 출발점이었습니다. 불안을 없애는 건 더 많은 정보가 아니라, ", "더 믿을 수 있는 정보", "였습니다. 내일이 직접 현장에 나가 바퀴로 확인하기 시작한 이유입니다."],
    who: "휠체어 이용자 · 현장 인터뷰",
  },
  {
    quote: "경사로가 있다는 표시보다, 그 경사가 얼마나 가파른지가 더 중요해요. 그걸 아는 사람이 직접 가서 봐줘야 해요.",
    contextParts: ["그래서 내일은 '있다/없다'가 아닌 ", "'쓸 수 있다/없다'", "로 기준을 바꿨습니다. 경사도, 단차 높이, 통로 폭을 직접 측정하고 수치로 기록합니다."],
    who: "장애인 이동권 활동가 · 현장 인터뷰",
  },
  {
    quote: "축제를 즐기러 간 건데, 입구에서 발길을 돌릴 때의 기분을 설명하기가 어려워요.",
    contextParts: ["이 기분을 다시는 느끼지 않도록. 지도 한 장이 그 무게를 담을 수 있다고, 내일은 믿습니다. ", "수익을 쫓는 기업이 아닌, 사회적 가치를 쫓는 학생들의 순수한 열정", "입니다."],
    who: "휠체어 이용자 · 현장 인터뷰",
  },
];


export default function About() {
  useSEO({
    title: "브랜드 스토리 | 내일 - 무장애지도 전문 플랫폼",
    description: "휠체어 사용자도 즐길 수 있는 축제를 꿈꾸는 '내일'의 이야기. 왜 우리가 직접 현장에서 무장애지도를 제작하는지 그 이유를 들려드립니다.",
    url: 'https://naeilmap.com/about'
  });

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

        .diff-card {
           background: white;
           border: 1px solid #d8e4f2;
           padding: 40px;
           border-radius: 24px;
           transition: all 0.4s ease;
           box-shadow: 0 4px 20px rgba(0,0,0,0.02);
        }
        .diff-card:hover {
           transform: translateY(-10px);
           box-shadow: 0 20px 40px rgba(82, 165, 255, 0.1);
           border-color: #52a5ff;
        }

        .stat-num.blue { color: #52a5ff; }
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

      {/* DIFFERENCES SECTION */}
      <section id="diff" style={{ padding: "100px 36px", background: "inherit" }}>
        <div className="reveal sec-kicker">THE DIFFERENCE</div>
        <h2 className="reveal story-heading" style={{ marginBottom: 50 }}>'내일'은 무엇이 무엇이 다른가요?</h2>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }} className="diff-grid">
           <div className="reveal diff-card">
              <div className="mv-label" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "inherit", marginBottom: 14, textTransform: "uppercase" }}>Difference 01</div>
              <h3 style={{ fontSize: 22, fontWeight: 900, marginBottom: 16 }}>더 직관적인 무장애지도</h3>
              <p className="story-body" style={{ fontSize: 15 }}>
                무장애지도 위 픽토그램을 클릭하면 현장 사진은 물론 실제 휠체어 접근 가능 여부를 바로 확인할 수 있어요.<br/><br/>
                <strong>"가보기 전에도 현장의 모습을 생생하게"</strong>
              </p>
           </div>
           <div className="reveal diff-card" style={{ transitionDelay: '0.1s' }}>
              <div className="mv-label" style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "inherit", marginBottom: 14, textTransform: "uppercase" }}>Difference 02</div>
              <h3 style={{ fontSize: 22, fontWeight: 900, marginBottom: 16 }}>함께 만들어가는 정보</h3>
              <p className="story-body" style={{ fontSize: 15 }}>
                사용자가 직접 경험하고 제보한 현장의 디테일이 실시간으로 지도에 더해집니다.<br/><br/>
                <strong>"당신의 발걸음이 누군가에게는 새로운 길이 됩니다"</strong>
              </p>
           </div>
        </div>
      </section>

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
            <p style={{ marginTop: 16 }}>그래서 <span style={{ fontWeight: 700 }}>'내일'</span>은 책상이 아닌 현장에서 시작했습니다. 당사자와 함께, 휠체어 바퀴가 닿는 모든 곳의 배리어프리 접근성을 직접 확인하면서.</p>
          </div>
        </div>
      </section>

      {/* VOICE */}
      <section className="about-voice" aria-label="당사자의 목소리">
        <div style={{ maxWidth: 560, marginBottom: 48 }}>
          <div className="about-pill reveal">당사자의 목소리</div>
          <div className="reveal story-heading" style={{ marginTop: 12, marginBottom: 14, transitionDelay: '0.1s' }}>
            내일이 현장으로 나간<br />진짜 이유
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {VOICES.map((v, i) => (
            <div key={i} className="reveal voice-card" style={{ transitionDelay: `${i * 0.1 + 0.1}s` }}>
              <div className="voice-bar" />
              <div>
                <div className="voice-q">&ldquo;{v.quote}&rdquo;</div>
                <div className="voice-who" style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 500 }}>{v.who}</div>
              </div>
            </div>
          ))}
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
        <div style={{ fontFamily: "'Noto Serif KR', serif", fontSize: 17, fontWeight: 700 }}>
          내일 · 무장애 축제 지도
        </div>
        <div style={{ fontSize: 11, lineHeight: 1.75, textAlign: "right", opacity: 0.7 }}>
          비영리 학생 자치단체<br />장애인 문화 접근권 프로젝트
        </div>
      </footer>
    </div>
  );
}

