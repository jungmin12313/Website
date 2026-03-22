import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

// 내일 · 인터뷰 아티클 페이지

const C = {
  blue: "#52a5ff",
  blueDark: "#2b87e8",
  bg: "#f0f5fb",
  white: "#ffffff",
  navy: "#1a2744",
  muted: "#6b7a99",
  border: "#d8e4f2",
};

export default function Story() {
  useEffect(() => {
    document.title = "정보가 있어도 믿기 힘들다 — 휠체어 이용자 인터뷰 · 내일";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "97.4%가 TV 앞에 머무는 이유. 휠체어 이용자와 장애인 이동권 활동가를 직접 만나 들은 이야기입니다.");
    }

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
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;700;900&family=Noto+Sans+KR:wght@300;400;500;700;900&display=swap');
        
        .reveal {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1), 
                      transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
        }
        
        .reveal.visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      <div style={s.root}>
        {/* HEADER 섹션 */}
        <section style={s.header} aria-label="아티클 정보">
          <div style={s.tagRow} className="reveal">
            <span style={s.tag}>휠체어</span>
            <span style={s.tag}>축제</span>
            <span style={s.tag}>접근성</span>
          </div>
          <h1 className="reveal" style={{ ...s.title, transitionDelay: '0.1s' }}>
            정보가 있어도 믿기 힘들다<br />
            — 휠체어 이용자 인터뷰
          </h1>
          <div className="reveal" style={{ ...s.date, transitionDelay: '0.2s' }}>2025. 03. 22</div>
        </section>

        {/* 본문 섹션 */}
        <section style={s.content} aria-label="인터뷰 본문">
          <div className="reveal">
            <div style={s.voiceBar} />
            <p style={s.paragraph}>
              "정보가 없는 건 아니에요. 인터넷을 조금만 검색해도 '무장애'라는 단어가 붙은 여행지가 쏟아지죠. 하지만 그 정보를 진짜라고 믿기가 너무 힘들어요. 입구에 경사로가 있다고 해서 갔는데, 막상 가보니 턱이 10cm나 있거나 경사로 앞에 짐이 쌓여 있는 경우가 허다하거든요."
            </p>
            <p style={s.paragraph}>
              휠체어 이용자 A씨의 말은 묵직했습니다. 그에게 나들이는 즐거움이 아닌 '도전'이었고, 그 도전의 승패는 운에 맡겨져 있었습니다. 이동권 활동가 B씨 역시 고개를 끄덕였습니다. "있다고 표시하는 것보다, 실제로 쓸 수 있느냐가 중요해요. 그걸 아는 사람이 직접 가서 봐줘야 하죠."
            </p>
          </div>

          <div className="reveal" style={{ transitionDelay: '0.2s', marginTop: 40 }}>
            <h2 style={s.subHeading}>우리가 현장으로 나가는 이유</h2>
            <p style={s.paragraph}>
              그래서 '내일' 팀은 책상을 떠나 축제 현장으로 나갔습니다. 여름의 뙤약볕과 겨울의 칼바람 속에서도 우리가 바퀴를 굴리며 실측을 멈추지 않는 이유입니다. 97.4%의 장애인이 문화생활에 직접 참여하지 못하고 TV 앞에 머무는 현실. 우리는 그 침묵의 벽을 신뢰할 수 있는 데이터로 허물고자 합니다.
            </p>
            <p style={s.paragraph}>
              단차가 몇 cm인지, 화장실의 안전 손잡이가 양쪽에 있는지, 통로의 폭이 휠체어 두 대가 지나갈 수 있는지. 누군가에게는 사소한 숫자가 누군가에게는 외출을 결심하게 만드는 결정적인 정보가 됩니다.
            </p>
          </div>
        </section>

        {/* 하단 CTA */}
        <section style={s.cta} aria-label="지도로 이동">
          <p style={s.ctaText} className="reveal">당신이 보고 싶은 것을,<br />두려움 없이 보러 갈 권리.</p>
          <div className="reveal" style={{ transitionDelay: '0.2s' }}>
            <Link to="/maps" style={s.btnMain}>무장애 축제 지도 보러가기</Link>
          </div>
        </section>
      </div>
    </>
  );
}

const s: Record<string, React.CSSProperties> = {
  root: { fontFamily: "'Noto Sans KR', sans-serif", background: C.bg, color: C.navy, maxWidth: 900, margin: "0 auto", paddingBottom: 80 },
  header: { padding: "100px 36px 60px", background: C.white, textAlign: "center" as const },
  tagRow: { display: "flex", gap: 8, justifyContent: "center", marginBottom: 20 },
  tag: { fontSize: 13, color: C.blue, background: "#e8f2ff", padding: "4px 12px", borderRadius: 999, fontWeight: 500 },
  title: { fontFamily: "'Noto Serif KR', serif", fontSize: "clamp(32px, 5vw, 48px)", fontWeight: 700, lineHeight: 1.3, color: C.navy, letterSpacing: -1 },
  date: { fontSize: 14, color: C.muted, marginTop: 20 },
  
  content: { padding: "60px 36px", background: C.bg },
  voiceBar: { width: 40, height: 4, background: C.blue, marginBottom: 30, borderRadius: 2 },
  paragraph: { fontSize: 16, lineHeight: 1.9, color: C.navy, marginBottom: 24, fontWeight: 300, wordBreak: "keep-all" as const },
  subHeading: { fontFamily: "'Noto Serif KR', serif", fontSize: 24, fontWeight: 700, marginBottom: 20, color: C.navy },

  cta: { background: C.blue, padding: "80px 36px", textAlign: "center" as const, borderRadius: 24, margin: "0 24px" },
  ctaText: { fontFamily: "'Noto Serif KR', serif", fontSize: 28, fontWeight: 700, color: C.white, marginBottom: 32, lineHeight: 1.4 },
  btnMain: { background: C.white, color: C.blue, padding: "14px 32px", borderRadius: 12, fontWeight: 700, textDecoration: "none", display: "inline-block" },
};
