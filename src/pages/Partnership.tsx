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
      setFormData({ name: '', organization: '', contact: '', email: '', service: '', content: '' });
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
        title="기관·기업 제휴 | 내일 - 무장애 축제 지도"
        description="우리 기관의 접근성을 데이터로 증명하세요. '내일'은 휠체어가 실제로 닿을 수 있는지를 현장에서 직접 확인하고, 데이터로 만듭니다."
        url="https://naeilmap.com/partnership"
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
          모든 서비스는<br/>'무장애지도'에서 시작합니다
        </h2>
        <p className="reveal sec-desc" style={{ transitionDelay: '0.2s' }}>
          지금 여러분이 보고 계신 무장애지도는, 단순한 콘텐츠가 아니라 저희가 현장에서 직접 만든 데이터입니다. 이 데이터를 어디까지 활용하시느냐에 따라, 필요한 만큼 단계적으로 선택하실 수 있습니다.
        </p>

        <div className="service-list">
          <div className="reveal service-item">
            <h4>미니 진단</h4>
            <p>우리 시설 하나, 핵심 문제부터 가볍게 확인하고 싶다면</p>
          </div>
          <div className="reveal service-item">
            <h4>표준 패키지 <span className="service-badge">추천</span></h4>
            <p>무장애지도 제작부터 현장 진단, 개선 방향 제안까지 (무장애지도 제작이 포함된 기본 단위)</p>
          </div>
          <div className="reveal service-item">
            <h4>교육 포함 패키지</h4>
            <p>현장 개선과 함께, 구성원 인식 개선 워크숍까지</p>
          </div>
          <div className="reveal service-item">
            <h4>통합 리포트</h4>
            <p>여러 시설, 여러 지역을 한 번에 관리하고 싶다면</p>
          </div>
          
          <div className="reveal service-item service-sub-item">
            <h4>정기 구독형 관리 <span className="service-badge" style={{ background: 'var(--gray-600)', color: 'var(--white)' }}>준비중</span></h4>
            <p style={{ textAlign: 'center' }}>한 번의 진단으로 끝내지 않고, 매달 최신 상태로 유지하는 구독 서비스를 준비하고 있습니다.</p>
            <button className="btn-pill-blue" style={{ background: 'var(--gray-700)', padding: '12px 24px' }} onClick={() => scrollToForm('정기구독(준비중)')}>
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
          <h2 className="sec-heading" style={{ marginBottom: 0 }}>전남 광주 지역의 17개 기관이 현재 '내일'과 함께 하고 있습니다</h2>
          
          <div className="logo-grid">
            <div className="logo-item"><img src="/images/partners/partner1.png" alt="파트너 기관" /></div>
            <div className="logo-item"><img src="/images/partners/partner2.png" alt="파트너 기관" /></div>
            <div className="logo-item"><img src="/images/partners/partner3.png" alt="파트너 기관" /></div>
            <div className="logo-item"><img src="/images/partners/partner4.png" alt="파트너 기관" /></div>
            <div className="logo-item"><img src="/images/partners/partner5.png" alt="파트너 기관" /></div>
            <div className="logo-item"><img src="/images/partners/광주광역시_지체장애인협회.png" alt="광주광역시 지체장애인협회" /></div>
            <div className="logo-item"><img src="/images/partners/스크린샷 2026-08-01 031416.png" alt="추가 파트너 기관" /></div>
            <div className="logo-item"><img src="/images/partners/스크린샷 2026-08-01 031645.png" alt="추가 파트너 기관" /></div>
            <div className="logo-item"><img src="/images/partners/인액터스_전남.png" alt="인액터스 전남" /></div>
            <div className="logo-item"><img src="/images/partners/지속가능발전.png" alt="지속가능발전협의회" /></div>
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
              <input type="text" name="name" className="form-input" required value={formData.name} onChange={handleChange} placeholder="홍길동" />
            </div>
            
            <div className="form-group">
              <label className="form-label">기관/기업명 *</label>
              <input type="text" name="organization" className="form-input" required value={formData.organization} onChange={handleChange} placeholder="○○기관" />
            </div>

            <div className="form-group">
              <label className="form-label">연락처 *</label>
              <input type="text" name="contact" className="form-input" required value={formData.contact} onChange={handleChange} placeholder="010-0000-0000" />
            </div>

            <div className="form-group">
              <label className="form-label">이메일 *</label>
              <input type="email" name="email" className="form-input" required value={formData.email} onChange={handleChange} placeholder="email@example.com" />
            </div>

            <div className="form-group">
              <label className="form-label">관심 있는 서비스</label>
              <select name="service" className="form-select" value={formData.service} onChange={handleChange}>
                <option value="">선택해주세요</option>
                <option value="미니진단">미니 진단</option>
                <option value="표준패키지">표준 패키지</option>
                <option value="교육포함패키지">교육 포함 패키지</option>
                <option value="통합리포트">통합 리포트</option>
                <option value="정기구독(준비중)">정기구독 (준비중)</option>
                <option value="모름">아직 잘 모르겠어요</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">문의 내용</label>
              <textarea name="content" className="form-textarea" value={formData.content} onChange={handleChange} placeholder="자유롭게 작성해주세요"></textarea>
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
