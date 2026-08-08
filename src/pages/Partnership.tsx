import { useState, useEffect, useRef } from 'react';
import SEO from '../components/SEO';
import { savePartnershipInquiry } from '../firebaseUtils';
import './Partnership.css';

export default function Partnership() {
  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    contact: '',
    email: '',
    service: '',
    scale: '',
    content: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const formRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Scroll reveal logic
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await savePartnershipInquiry(formData);
      setFormData({ name: '', organization: '', contact: '', email: '', service: '', scale: '', content: '' });
      alert('문의가 성공적으로 접수되었습니다. 담당자가 확인 후 연락드리겠습니다.');
    } catch (error) {
      console.error('Failed to submit inquiry:', error);
      alert('문의 접수 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToForm = (servicePreselect?: string) => {
    if (servicePreselect) {
      setFormData(prev => ({ ...prev, service: servicePreselect }));
    }
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="partnership-page">
      <SEO 
        title="기관·기업 제휴 | 무장애 접근성 진단 및 데이터 제휴 - 내일"
        description="우리 기관의 접근성을 진단하고 ESG 지표를 높이세요. '내일'과 함께 신뢰할 수 있는 무장애 접근성 데이터를 구축하고 장벽 없는 환경을 조성할 수 있습니다."
        schema={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "홈", "item": "https://naeilmap.com/" },
            { "@type": "ListItem", "position": 2, "name": "기관·기업 제휴", "item": "https://naeilmap.com/partnership" }
          ]
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
      `}</style>

      {/* 1. 히어로 섹션 */}
      <section className="partnership-hero">
        <div className="partnership-badge reveal">접근성 데이터 파트너십</div>
        <h1 className="partnership-headline reveal" style={{ transitionDelay: '0.1s' }}>
          우리 기관의 접근성,<br />데이터로 증명하세요
        </h1>
        <p className="partnership-sub reveal" style={{ transitionDelay: '0.2s' }}>
          '내일'은 휠체어가 실제로 닿을 수 있는지를 현장에서 직접 확인하고, 데이터로 만듭니다.<br/>
          지도 제작을 넘어, 접근성 진단부터 지속적인 관리까지 함께합니다.
        </p>
        <div className="partnership-cta reveal" style={{ transitionDelay: '0.3s' }}>
          <button className="btn-pill-blue" onClick={() => scrollToForm()}>협업 문의하기</button>
          <a href="#service-lineup" className="text-link-arrow">서비스 살펴보기 ➔</a>
        </div>
      </section>

      {/* 2. 신뢰 스탯 바 */}
      <div className="stat-bar-partnership">
        <div className="reveal stat-pill" style={{ transitionDelay: '0.1s' }}>
          <div className="stat-num">17곳</div>
          <div className="stat-label">협력 기관 네트워크</div>
        </div>
        <div className="reveal stat-pill" style={{ transitionDelay: '0.2s' }}>
          <div className="stat-num blue">100명+</div>
          <div className="stat-label">현장 조사 참여 인원</div>
        </div>
        <div className="reveal stat-pill" style={{ transitionDelay: '0.3s' }}>
          <div className="stat-num">5관왕</div>
          <div className="stat-label">공인된 성과</div>
        </div>
      </div>

      {/* 3. 포트폴리오 */}
      <section className="partnership-section">
        <div className="reveal sec-kicker">THE PORTFOLIO</div>
        <h2 className="reveal sec-heading" style={{ transitionDelay: '0.1s' }}>
          '내일'은 하나의 공간에만<br/>머물지 않습니다
        </h2>
        <div className="portfolio-grid">
          <div className="reveal portfolio-card" style={{ transitionDelay: '0.2s' }}>
            <h3>실생활권</h3>
            <p>일상적으로 오가는 상권과 시설의 접근성을 데이터로 기록합니다.</p>
          </div>
          <div className="reveal portfolio-card" style={{ transitionDelay: '0.3s' }}>
            <h3>축제·행사</h3>
            <p>짧은 기간 많은 인파가 몰리는 야외 행사장의 접근 경로를 확인합니다.</p>
          </div>
          <div className="reveal portfolio-card" style={{ transitionDelay: '0.4s' }}>
            <h3>실내 시설</h3>
            <p>병원, 복합시설처럼 복잡한 실내 동선을 직접 걸으며 확인합니다.</p>
          </div>
        </div>
      </section>

      {/* 4. 서비스 라인업 */}
      <section id="service-lineup" className="partnership-section">
        <div className="reveal sec-kicker">THE SERVICE</div>
        <h2 className="reveal sec-heading" style={{ transitionDelay: '0.1s' }}>
          모든 변화는<br/>현장의 '정확한 데이터'에서 시작합니다
        </h2>
        <p className="reveal sec-desc" style={{ transitionDelay: '0.2s' }}>
          지금 여러분이 보고 계신 무장애지도 역시 단순한 콘텐츠가 아니라, 저희가 직접 발로 뛰어 만든 실측 데이터의 결과물입니다. 단일 시설의 가벼운 진단부터 무장애지도 제작, 지역구 단위의 전수조사까지 필요한 만큼 단계적으로 선택하실 수 있습니다.
        </p>

        <div className="service-list">
          <div className="reveal service-item">
            <h4>미니 진단 <span style={{ fontSize: '14px', color: 'var(--blue-600)', fontWeight: 600, marginLeft: '8px' }}>소규모 시설 맞춤형</span></h4>
            <p style={{ marginBottom: 4 }}>- 우리 시설 하나, 핵심 문제부터 가볍게 확인</p>
            <p style={{ color: 'var(--gray-600)', fontSize: '14px' }}>- (법적 편의시설 기준 + NAEIL 실질 점수 진단 리포트)</p>
          </div>
          <div className="reveal service-item">
            <h4>표준 패키지 <span className="service-badge">추천</span> <span style={{ fontSize: '14px', color: 'var(--blue-600)', fontWeight: 600, marginLeft: '8px' }}>지자체/기관 수의계약 표준</span></h4>
            <p style={{ marginBottom: 4 }}>- 무장애지도 제작부터 현장 진단, 개선 방향 제안까지</p>
            <p style={{ color: 'var(--gray-600)', fontSize: '14px' }}>- (축제장/1개 골목 상권 대상, 무장애지도 제작 포함)</p>
          </div>
          <div className="reveal service-item">
            <h4>교육 포함 패키지 <span className="service-badge" style={{ background: '#f59e0b', color: '#fff' }}>BEST SELLER</span> <span style={{ fontSize: '14px', color: 'var(--blue-600)', fontWeight: 600, marginLeft: '8px' }}>사업비/인식개선 통합 성과형</span></h4>
            <p style={{ marginBottom: 4 }}>- 현장 개선과 함께, 구성원 인식 개선 워크숍까지</p>
            <p style={{ color: 'var(--gray-600)', fontSize: '14px' }}>- (표준 패키지 전체 + 데이터 기반 맞춤형 강연 포함)</p>
          </div>
          <div className="reveal service-item">
            <h4>통합 리포트 <span style={{ fontSize: '14px', color: 'var(--blue-600)', fontWeight: 600, marginLeft: '8px' }}>대형 프로젝트 / 컨설팅 용역형</span></h4>
            <p style={{ marginBottom: 4 }}>- 여러 시설, 여러 지역을 한 번에 관리하고 싶다면</p>
            <p style={{ color: 'var(--gray-600)', fontSize: '14px' }}>- (관내 전수조사 + NAEIL OS 자원배분 컨설팅)</p>
          </div>
          
          <div className="reveal service-item service-sub-item">
            <h4>정기 구독형 관리 <span className="service-badge" style={{ background: 'var(--gray-600)', color: 'var(--white)' }}>준비중</span> <span style={{ fontSize: '14px', color: 'var(--blue-600)', fontWeight: 600, marginLeft: '8px' }}>연간 데이터 최신화 & 지속 유지관리</span></h4>
            <p style={{ textAlign: 'center', marginBottom: 4 }}>- 한 번의 진단으로 끝나지 않고, 지속 유지하는 서비스</p>
            <p style={{ textAlign: 'center', color: 'var(--gray-600)', fontSize: '14px' }}>- (DB 실시간 업데이트, 웹 지도 유지보수, 성과 측정)</p>
            <button className="btn-pill-blue" style={{ background: 'var(--gray-700)', padding: '12px 24px', marginTop: 12 }} onClick={() => scrollToForm('정기구독(준비중)')}>
              오픈 소식 먼저 받아보기
            </button>
          </div>
        </div>
        
        <div className="reveal" style={{ marginTop: 24 }}>
          <button className="text-link-arrow" onClick={() => scrollToForm()} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>
            우리 기관에 맞는 방식이 궁금하다면 ➔ 문의하기
          </button>
        </div>
      </section>

      {/* 5. 차별점 */}
      <section className="partnership-section" style={{ background: 'inherit' }}>
        <div className="reveal sec-kicker">THE DIFFERENCE</div>
        <h2 className="reveal sec-heading" style={{ marginBottom: 50, transitionDelay: '0.1s' }}>
          '내일'의 접근성 데이터는 다릅니다
        </h2>
        
        <div className="diff-grid">
           <div className="reveal diff-card" style={{ transitionDelay: '0.2s' }}>
              <div className="diff-num">Difference 01</div>
              <h3>당사자가 직접 확인합니다</h3>
              <p>휠체어 이용자와 함께 현장에 나가, 실제로 접근 가능한지를 직접 확인합니다.</p>
           </div>
           <div className="reveal diff-card" style={{ transitionDelay: '0.3s' }}>
              <div className="diff-num">Difference 02</div>
              <h3>수치로 남깁니다</h3>
              <p>"경사로 있음" 대신, 경사도·단차·폭을 정확한 수치로 기록합니다.</p>
           </div>
           <div className="reveal diff-card" style={{ transitionDelay: '0.4s' }}>
              <div className="diff-num">Difference 03</div>
              <h3>한 번으로 끝나지 않습니다</h3>
              <p>제작으로 끝나지 않고, 진단·교육·지속 관리까지 이어지는 파트너십입니다.</p>
           </div>
        </div>
      </section>

      {/* 6. 함께하고 있는 기관 */}
      <section className="partnership-section">
        <div className="reveal logo-wall">
          <div className="sec-kicker">PARTNERS</div>
          <h2 className="sec-heading" style={{ marginBottom: 0 }}>광주·전남 17개 파트너가 '내일'과 함께 접근성을 데이터로 만들고 있습니다</h2>
          
          <div className="logo-grid">
            <div className="logo-item"><img src="/images/partners/partner1.png" alt="파트너 기관" /></div>
            <div className="logo-item"><img src="/images/partners/partner2.png" alt="파트너 기관" /></div>
            <div className="logo-item"><img src="/images/partners/partner3.png" alt="파트너 기관" /></div>
            <div className="logo-item"><img src="/images/partners/partner4.png" alt="파트너 기관" /></div>
            <div className="logo-item"><img src="/images/partners/partner5.png" alt="파트너 기관" /></div>
            <div className="logo-item"><img src="/images/partners/스크린샷 2026-08-01 031416.png" alt="추가 파트너 기관" /></div>
            <div className="logo-item"><img src="/images/partners/스크린샷 2026-08-01 031645.png" alt="추가 파트너 기관" /></div>
            <div className="logo-item"><img src="/images/partners/인액터스_전남.png" alt="인액터스 전남" /></div>
            <div className="logo-item"><img src="/images/partners/지속가능발전.png" alt="지속가능발전협의회" /></div>
            {/* 새로 추가된 로고들 (파일명 영문 간소화) */}
            <div className="logo-item"><img src="/images/partners/partner_rise.png" alt="조선이공대 RISE사업단" /></div>
            <div className="logo-item"><img src="/images/partners/head-logo.svg" alt="파트너 기관" /></div>
            <div className="logo-item"><img src="/images/partners/partner_logo_210321.png" alt="파트너 기관" /></div>
            <div className="logo-item"><img src="/images/partners/partner_new1.png" alt="추가 파트너 기관" /></div>
            <div className="logo-item"><img src="/images/partners/partner_new3.png" alt="추가 파트너 기관" /></div>
          </div>
        </div>
      </section>

      {/* 7. 문의 폼 */}
      <section className="contact-section" ref={formRef}>
        <div className="reveal contact-container">
          <h2 className="sec-heading" style={{ textAlign: 'center', marginBottom: 40 }}>협업을 제안해주세요</h2>
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">담당자 성함 *</label>
              <input type="text" name="name" className="form-input" required value={formData.name} onChange={handleChange} placeholder="[ 홍길동 ]" />
            </div>
            
            <div className="form-group">
              <label className="form-label">기관/기업명 *</label>
              <input type="text" name="organization" className="form-input" required value={formData.organization} onChange={handleChange} placeholder="[ OO구청 / OO재단 ]" />
            </div>

            <div className="form-group">
              <label className="form-label">연락처 *</label>
              <input type="text" name="contact" className="form-input" required value={formData.contact} onChange={handleChange} placeholder="[ 010-0000-0000 ]" />
            </div>

            <div className="form-group">
              <label className="form-label">이메일 *</label>
              <input type="email" name="email" className="form-input" required value={formData.email} onChange={handleChange} placeholder="[ email@example.com ]" />
            </div>

            <div className="form-group">
              <label className="form-label">관심 있는 서비스</label>
              <select name="service" className="form-select" value={formData.service} onChange={handleChange}>
                <option value="">선택해주세요</option>
                <option value="미니진단">1. 미니 진단 (단일 건물/시설 접근성 진단 리포트)</option>
                <option value="표준패키지">2. 표준 패키지 (축제/상권 무장애지도 제작 + 현장 개별 개선안) [추천]</option>
                <option value="교육포함패키지">3. 교육 포함 패키지 (지도 + 현장 개선안 + 임직원/주민 강연)</option>
                <option value="통합리포트">4. 통합 리포트 (동/구청 전역 전수조사 + 예산 우선순위 컨설팅)</option>
                <option value="단독강연">5. 단독 강연/워크숍 (데이터 기반 이동권 실태 강연)</option>
                <option value="정기구독">6. 정기구독 관리 (데이터 최신화 및 연간 유지보수)</option>
                <option value="모름">7. 아직 잘 모르겠어요 (맞춤 상담 희망)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">조사 희망 규모 (선택)</label>
              <select name="scale" className="form-select" value={formData.scale} onChange={handleChange}>
                <option value="">선택해주세요</option>
                <option value="단일시설">1. 단일 시설 / 1개 건물</option>
                <option value="축제행사장">2. 축제/행사장 (시설 30개 내외)</option>
                <option value="상권거리">3. 1개 골목 상권 / 거리 (시설 50개 내외)</option>
                <option value="동구청전역">4. 1개 동 / 구청 관내 전역 (시설 100개 이상)</option>
                <option value="모름">5. 잘 모르겠음 (상담 후 결정)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">문의 내용</label>
              <textarea name="content" className="form-textarea" value={formData.content} onChange={handleChange} placeholder="사업 목적, 희망 일정, 예산 범위 등을 자유롭게 작성해주시면&#10;더욱 정확한 맞춤 제안서와 견적을 안내해드립니다."></textarea>
            </div>

            <div style={{ textAlign: 'center', marginTop: 40 }}>
              <button type="submit" className="btn-pill-blue" disabled={isSubmitting} style={{ width: '100%', maxWidth: 300 }}>
                {isSubmitting ? '전송 중...' : '문의 보내기'}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* 8. 하단 마무리 */}
      <section className="bottom-cta reveal">
        <h2>'내일'은 지도를 그리는 팀이 아니라,<br/>접근성을 데이터로 시각화하는 파트너입니다.</h2>
        <button className="btn-pill-blue" onClick={() => scrollToForm()}>협업 문의하기</button>
      </section>
    </div>
  );
}
