import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';

"use client";

// 내일 · 무장애 축제 지도 — About 페이지

const C = {
  blue: "#52a5ff",
  blueDark: "#2b87e8",
  bluePale: "#e8f2ff",
  bluePillBg: "#deeeff",
  bluePillText: "#2b7fd4",
  bg: "#f0f5fb",
  white: "#ffffff",
  navy: "#1a2744",
  muted: "#6b7a99",
  border: "#d8e4f2",
};

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
    title: "서비스 소개 | 내일 무장애 축제 지도",
    description: "내일은 장애인·노인·휠체어 사용자 모두가 참여할 수 있는 무장애 축제 지도입니다. 전국 축제의 배리어프리 접근성 정보를 한눈에 확인하세요.",
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
    <>
      {/* JSON-LD 구조화 데이터 추가 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "내일(Naeil) · 무장애 축제 지도",
            "description": "장애인의 문화예술 접근성을 높이기 위해 휠체어 이용자와 함께 현장을 조사하는 비영리 학생 자치단체",
            "url": "https://naeilmap.com",
            "foundingDate": "2024",
            "areaServed": "KR",
            "keywords": "무장애 축제, 장애인 문화 접근성, 휠체어 축제 지도"
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
      `}</style>

      <div style={s.root}>

        {/* HERO */}
        <section style={s.hero} aria-label="프로젝트 소개">
          <div style={s.heroGhost} aria-hidden="true">Naeil</div>
          <div style={s.pill} className="reveal">문화 접근권 프로젝트</div>
          <h1 style={s.heroHeadline} className="reveal">
            모두의 <span style={{ color: "#1A1A1A" }}>내일</span>은,<br />
            모두가 함께하는<br />축제입니다
          </h1>
          <p className="reveal" style={{ ...s.heroSub, transitionDelay: '0.1s' }}>
            장애인의 문화예술 직접 참여율은 단 3.6%.<br />
            당연한 축제가 누군가에겐 큰 용기가 필요한 일이라면<br />
            <span style={{ color: "#1A1A1A", fontWeight: 700 }}>내일</span>은 장애인·휠체어 사용자·노인 모두가 축제를 즐길 수 있도록 배리어프리 접근성 정보를 제공합니다.
          </p>
          <div className="reveal" style={{ ...s.heroCta, transitionDelay: '0.2s' }}>
            <Link to="/maps" style={s.btnMain}>지도 보러 가기</Link>
            <a href="#diff" style={s.btnGhost}>차별점 확인하기 ➔</a>
          </div>
        </section>

        {/* STAT BAR */}
        <div style={s.statBar}>
          {STATS.map((st, i) => (
            <div key={i} className="reveal" style={{ ...s.statPill, transitionDelay: `${i * 0.1}s` }}>
              <div style={{
                ...s.statNum,
                ...(st.blue ? { color: C.blue } : {}),
                ...(st.isSmall ? { fontSize: 22, lineHeight: 1.3 } : {}),
              }}>
                {st.num.split("\n").map((line, j) => (
                  <span key={j} style={{ display: "block" }}>{line}</span>
                ))}
              </div>
              <div style={s.statLabel}>
                {st.label[0]}<br />{st.label[1]}
              </div>
            </div>
          ))}
        </div>

        {/* DIFFERENCES SECTION */}
        <section id="diff" style={{ padding: "100px 36px", background: C.white }}>
          <div style={s.secKicker} className="reveal">THE DIFFERENCE</div>
          <h2 style={{ ...s.storyHeading, marginBottom: 50 }} className="reveal">'내일'은 무엇이 무엇이 다른가요?</h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
             <div className="reveal diff-card">
                <div style={s.mvLabel}>Difference 01</div>
                <h3 style={{ fontSize: 22, fontWeight: 900, marginBottom: 16 }}>더 직관적인 무장애지도</h3>
                <p style={{ ...s.methodDesc, fontSize: 15 }}>
                  무장애지도 위 픽토그램을 클릭하면 현장 사진은 물론 실제 휠체어 접근 가능 여부를 바로 확인할 수 있어요.<br/><br/>
                  <strong>"가보기 전에도 현장의 모습을 생생하게"</strong>
                </p>
             </div>
             <div className="reveal diff-card" style={{ transitionDelay: '0.1s' }}>
                <div style={s.mvLabel}>Difference 02</div>
                <h3 style={{ fontSize: 22, fontWeight: 900, marginBottom: 16 }}>함께 만들어가는 정보</h3>
                <p style={{ ...s.methodDesc, fontSize: 15 }}>
                  사용자가 직접 경험하고 제보한 현장의 디테일이 실시간으로 지도에 더해집니다.<br/><br/>
                  <strong>"당신의 발걸음이 누군가에게는 새로운 길이 됩니다"</strong>
                </p>
             </div>
          </div>
        </section>

        {/* STORY */}
        <section id="story" style={s.story} aria-label="우리가 시작한 이유">
          <div style={s.secKicker} className="reveal">우리가 시작한 이유</div>
          <div style={s.twoCol}>
            <div style={s.storyHeading} className="reveal">
              정보가 없는 게<br />아니었습니다.<br />
              그 정보가<br /><span style={{ color: C.blue }}>'진짜'인지</span><br />몰랐던 겁니다.
            </div>
            <div className="reveal" style={{ ...s.storyBody, transitionDelay: '0.1s' }}>
              <p>검색하면 나옵니다. '휠체어 이용 가능.' 하지만 그 한 줄이 얼마나 많은 실망을 담고 있는지, 내일은 직접 들었습니다.</p>
              <p style={{ marginTop: 16 }}>정보를 믿고 찾아간 축제 입구에는 경사로 대신 계단이, 화장실 표시 옆에는 잠긴 자물쇠가 있었습니다.</p>
              <p style={{ marginTop: 16 }}>그래서 <span style={{ color: "#1A1A1A", fontWeight: 700 }}>'내일'</span>은 책상이 아닌 현장에서 시작했습니다. 당사자와 함께, 휠체어 바퀴가 닿는 모든 곳의 배리어프리 접근성을 직접 확인하면서.</p>
            </div>
          </div>
        </section>

        {/* VOICE */}
        <section style={s.voice} aria-label="당사자의 목소리">
          <div style={{ maxWidth: 560, marginBottom: 48 }}>
            <div style={s.pill} className="reveal">당사자의 목소리</div>
            <div className="reveal" style={{ ...s.storyHeading, marginTop: 12, marginBottom: 14, transitionDelay: '0.1s' }}>
              내일이 현장으로 나간<br />진짜 이유
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {VOICES.map((v, i) => (
              <div key={i} className="reveal" style={{ ...s.voiceCard, transitionDelay: `${i * 0.1 + 0.1}s` }}>
                <div style={s.voiceBar} />
                <div>
                  <div style={s.voiceQ}>&ldquo;{v.quote}&rdquo;</div>
                  <div style={s.voiceWho}>{v.who}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section style={s.cta} aria-label="함께하기">
          <p style={s.ctaBig} className="reveal">모두에게 즐거운 축제의 <span style={{ color: "white" }}>내일</span></p>
          <p className="reveal" style={{ ...(s.ctaSub as React.CSSProperties), transitionDelay: '0.1s' }}>
            내일의 지도는 기술이 아닌 따뜻한 관심으로 채워집니다.<br />
            더 많은 이들이 문밖으로 나설 수 있도록,<br />
            지금 <span style={{ color: "white", fontWeight: 700 }}>'내일'</span>과 함께해주세요.
          </p>
          <a href="https://www.instagram.com/naeil__official?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noopener noreferrer" className="reveal" style={{ ...s.btnWhite, transitionDelay: '0.2s' }}>지금 함께하기</a>
        </section>

        {/* FOOTER */}
        <footer style={s.footer}>
          <div style={{ fontFamily: "'Noto Serif KR', serif", fontSize: 17, fontWeight: 700, color: "#1A1A1A" }}>
            내일 · 무장애 축제 지도
          </div>
          <div style={{ fontSize: 11, color: C.muted, lineHeight: 1.75, textAlign: "right" }}>
            비영리 학생 자치단체<br />장애인 문화 접근권 프로젝트
          </div>
        </footer>

      </div>
    </>
  );
}

const s: Record<string, React.CSSProperties> = {
  root: { fontFamily: "'Noto Sans KR', sans-serif", background: C.bg, color: C.navy, maxWidth: 900, margin: "0 auto" },

  nav: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 36px", background: C.white, borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, zIndex: 20 },
  navLogo: { fontFamily: "'Noto Serif KR', serif", fontSize: 20, fontWeight: 700, color: C.navy, letterSpacing: -0.5 },
  navList: { listStyle: "none", display: "flex", gap: 28, margin: 0, padding: 0 },
  navLink: { fontSize: 13, color: C.muted, textDecoration: "none", fontWeight: 400 },

  hero: { background: C.white, padding: "100px 36px 0", position: "relative", overflow: "hidden" },
  heroGhost: { fontFamily: "'Noto Serif KR', serif", fontSize: "clamp(100px,20vw,180px)", fontWeight: 900, lineHeight: 0.85, color: C.blue, opacity: 0.055, position: "absolute", right: -10, top: 24, letterSpacing: -6, pointerEvents: "none", userSelect: "none" },
  pill: { display: "inline-block", background: C.bluePillBg, color: C.bluePillText, fontSize: 11, fontWeight: 500, letterSpacing: 0.5, padding: "5px 14px", borderRadius: 999, marginBottom: 28 },
  heroHeadline: { fontFamily: "'Noto Serif KR', serif", fontSize: "clamp(44px,8vw,68px)", fontWeight: 900, lineHeight: 1.06, letterSpacing: -2, color: C.navy },
  strikeLine: { position: "absolute", left: -2, right: -2, top: "52%", height: 6, background: C.blue, borderRadius: 2, transform: "rotate(-1.2deg)", display: "block" },
  heroSub: { marginTop: 26, maxWidth: 460, fontSize: 15, lineHeight: 1.9, color: C.muted, fontWeight: 300 },
  heroCta: { marginTop: 40, display: "flex", alignItems: "center", gap: 20, paddingBottom: 68 },
  btnMain: { background: C.blue, color: C.white, border: "none", padding: "13px 28px", borderRadius: 10, fontFamily: "inherit", fontSize: 14, fontWeight: 500, cursor: "pointer", textDecoration: "none", display: "inline-block" },
  btnGhost: { fontSize: 13, color: C.muted, background: "none", border: "none", fontFamily: "inherit", cursor: "pointer", textDecoration: "none" },

  statBar: { display: "flex", gap: 12, padding: "24px 36px", background: C.bg, borderTop: `1px solid ${C.border}`, borderBottom: `1px solid ${C.border}` },
  statPill: { background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 24px", flex: 1, minWidth: 0 },
  statNum: { fontFamily: "'Noto Serif KR', serif", fontSize: 32, fontWeight: 900, color: C.navy, letterSpacing: -1.5, lineHeight: 1, whiteSpace: "nowrap" },
  statLabel: { fontSize: 12, color: C.muted, marginTop: 8, lineHeight: 1.7, fontWeight: 300 },

  story: { padding: "88px 36px", background: C.white },
  secKicker: { fontSize: 11, letterSpacing: 2.5, textTransform: "uppercase", color: C.blue, marginBottom: 36, fontWeight: 500 },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 52, alignItems: "start" },
  storyHeading: { fontFamily: "'Noto Serif KR', serif", fontSize: 28, fontWeight: 700, lineHeight: 1.3, letterSpacing: -0.5, color: C.navy },
  storyBody: { fontSize: 15, lineHeight: 1.9, color: C.muted, fontWeight: 300 },

  mvRow: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, padding: "0 36px 88px", background: C.white },
  mvCard: { background: C.bluePale, borderRadius: 14, padding: 28, border: `1px solid ${C.bluePillBg}` },
  mvLabel: { fontSize: 11, fontWeight: 700, letterSpacing: 2, color: C.blue, marginBottom: 14, textTransform: "uppercase" },
  mvText: { fontSize: 17, fontWeight: 700, color: C.navy, lineHeight: 1.55 },

  voice: { padding: "88px 36px", background: C.bg },
  voiceCard: { background: C.white, borderRadius: 18, border: `1px solid ${C.border}`, padding: "32px 36px", display: "grid", gridTemplateColumns: "3px 1fr", gap: "0 22px" },
  voiceBar: { background: C.blue, borderRadius: 3 },
  voiceQ: { fontFamily: "'Noto Serif KR', serif", fontSize: 19, lineHeight: 1.6, color: C.navy, fontWeight: 700, marginBottom: 16 },
  voiceContext: { fontSize: 13, lineHeight: 1.9, color: C.muted, fontWeight: 300, paddingTop: 14, borderTop: `1px solid ${C.border}` },
  voiceWho: { marginTop: 12, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: C.blue, opacity: 0.75, fontWeight: 500 },

  method: { padding: "88px 36px", background: C.white, borderTop: `1px solid ${C.border}` },
  methodGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
  methodCard: { background: C.bg, borderRadius: 16, border: `1px solid ${C.border}`, padding: 28 },
  methodNum: { fontFamily: "'Noto Serif KR', serif", fontSize: 44, fontWeight: 900, color: C.blue, lineHeight: 1, letterSpacing: -2, opacity: 0.22, marginBottom: 14 },
  methodTitle: { fontSize: 15, fontWeight: 700, color: C.navy, marginBottom: 10 },
  methodDesc: { fontSize: 13, lineHeight: 1.85, color: C.muted, fontWeight: 300 },

  cta: { background: C.blue, padding: "88px 36px", textAlign: "center" },
  ctaBig: { fontFamily: "'Noto Serif KR', serif", fontSize: "clamp(26px,4.5vw,44px)", fontWeight: 700, lineHeight: 1.3, letterSpacing: -1, color: C.white, maxWidth: 580, margin: "0 auto 16px" },
  ctaSub: { fontSize: 14, lineHeight: 1.95, color: "rgba(255,255,255,0.78)", fontWeight: 300, maxWidth: 420, margin: "0 auto 36px" },
  btnWhite: { background: C.white, color: C.blue, border: "none", padding: "14px 32px", borderRadius: 10, fontFamily: "inherit", fontSize: 14, fontWeight: 700, cursor: "pointer", textDecoration: "none", display: "inline-block" },

  footer: { padding: 36, background: C.white, borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" },
};
