import { useState, useEffect, useRef } from 'react';
import { FileText, Download } from 'lucide-react';
import SEO from '../components/SEO';
import { savePartnershipInquiry } from '../firebaseUtils';
import './Partnership.css';

const packagesData = [
  {
    id: 1,
    tier: 'Tier 1',
    title: '[Tier 1] 미니 진단 패키지',
    tags: ['단일 시설·상권', '긴급 진단', '3일 납기'],
    subhead: '단일 시설·상권의 핵심 보행장벽을 정밀 실측하여 즉각적인 개선 도면을 도출하는 긴급 진단 솔루션',
    description: '* 복지관, 행사장 진입로, 골목 상권 등 특정 단일 구역의 단차·경사도를 디지털 계측기로 mm 단위 정밀 실측합니다.\n* 법령 적합성을 즉시 검토하여 3일 만에 시공용 약식도면과 예산 산출 근거 시트를 납품합니다. (실측 오차율 0%, 핵심 결함 100% 도출)',
    fileUrl: '/packages/[모두의내일]_솔루션소개서_Tier1.png',
    fileName: '[모두의내일]_솔루션소개서_Tier1.png',
    format: 'PNG'
  },
  {
    id: 2,
    tier: 'Tier 2',
    title: '[Tier 2] 패키지 + 강연',
    tags: ['참여형 워크숍', 'ESG 실천단', '데이터 플로깅'],
    subhead: '데이터 기반 이동권 강연과 현장 매핑 실습을 결합한 참여형 배리어프리 임팩트 워크숍',
    description: '* 수동적 주입식 교육을 넘어 초·중·고·대학생, 기업 ESG 실천단, 지자체 임직원이 직접 앱과 도구로 보행 장애물을 기록하는 데이터 플로깅 모델입니다.\n* 비전문가도 10분 만에 숙달 가능한 툴킷을 제공하며, 수집된 원천 데이터와 ESG 성과 결과 보고서(교육 만족도 98%, 인식 개선율 95%↑)를 함께 발간합니다.',
    fileUrl: '/packages/[모두의내일]_솔루션소개서_Tier2.png',
    fileName: '[모두의내일]_솔루션소개서_Tier2.png',
    format: 'PNG'
  },
  {
    id: 3,
    tier: 'Tier 3',
    title: '[Tier 3] 표준 지도 패키지',
    tags: ['추천', '축제·관광지', '온·오프라인 듀얼 배포'],
    subhead: '실측 데이터를 기반으로 보행 단절을 해소하는 온·오프라인 무장애지도 및 개선 리포트',
    description: '* 지자체 문화관광과, 축제 조직위, 복지관을 대상으로 권역 내 보행로와 편의시설을 전수 실측하여 휠체어·유아차가 이동 가능한 최적 우회 경로를 도출합니다.\n* 시각적 식별성을 극대화한 고대비 현장 배포용 리플릿과 스마트폰 모바일 UI 웹 지도를 동시에 공급합니다. (보행 단절 0건, 안전 우회 경로 100% 제공)',
    fileUrl: '/packages/[모두의내일]_솔루션소개서_Tier3.png',
    fileName: '[모두의내일]_솔루션소개서_Tier3.png',
    format: 'PNG',
    highlight: '추천'
  },
  {
    id: 4,
    tier: 'Tier 4',
    title: '[Tier 4] 통합 패키지: 보행환경 전수조사 및 예산 투입 컨설팅',
    tags: ['지자체 동·구청 전역', '전수조사 DB', '예산 우선순위'],
    subhead: '지자체(동·구청)를 대상으로 [전수조사 DB 구축] 및 효율적인 도로 정비 예산 집행을 위한 [우선순위 컨설팅] 솔루션 제안',
    description: '* 민원 사후 대응의 한계를 극복하기 위해 GIS 기반으로 관할 구역 가로망을 전수 실측(전수율 100%)하고 독자적 Scoring 알고리즘으로 위험도를 지수화합니다.\n* 감사와 의회 설득이 가능한 법령 기준 정량 DB와 도로 보수 공사비 산출 근거를 담은 최우선 정비 순위 컨설팅 리포트를 납품합니다.',
    fileUrl: '/packages/[모두의내일]_솔루션소개서_Tier4.png',
    fileName: '[모두의내일]_솔루션소개서_Tier4.png',
    format: 'PNG'
  },
  {
    id: 5,
    tier: 'Tier 5',
    title: '[Tier 5] 운영 구독 패키지',
    tags: ['상시 모니터링', '연간 최신화', '관리자 대시보드'],
    subhead: '보행환경 데이터의 연간 갱신과 모니터링 대시보드를 통한 지속 가능한 데이터 자산화',
    description: '* 1회성 인쇄물 제작에 그치지 않고, 공사 및 상권 변화로 바뀌는 도시 보행 데이터를 연 1회 이상 정기 재실측하여 상시 신뢰성을 보장합니다.\n* 관리자 전용 모니터링 웹 대시보드를 제공하여 보행환경 개선 전·후 성과를 수치화하고 정책 핵심 자산으로 영구 운용할 수 있도록 지원합니다.',
    fileUrl: '/packages/[모두의내일]_솔루션소개서_Tier5.png',
    fileName: '[모두의내일]_솔루션소개서_Tier5.png',
    format: 'PNG',
    hasInquiryBtn: true
  }
];

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
          <a href="#the-service" className="text-link-arrow">서비스 살펴보기 ➔</a>
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
      <section id="the-service" className="partnership-section" style={{ maxWidth: '100%', padding: '120px 24px', backgroundColor: '#f8fafc' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div className="reveal sec-kicker">THE SERVICE</div>
          <h2 className="reveal sec-heading" style={{ transitionDelay: '0.1s' }}>
            모든 변화는 현장의 '정확한 데이터'에서 시작합니다
          </h2>
          <p className="reveal sec-desc" style={{ transitionDelay: '0.2s', maxWidth: '800px' }}>
            지금 여러분이 보고 계신 무장애지도 역시 단순한 콘텐츠가 아니라, 직접 발로 뛰어 만든 실측 데이터의 결과물입니다. 
            단일 시설의 정밀 진단부터 무장애지도 제작, 전수조사 및 지속 구독 관리까지 맞춤형 솔루션 소개서를 다운로드하여 검토하세요.
          </p>

          <div className="service-download-list">
            {packagesData.map((pkg, idx) => (
              <div key={pkg.id} className="reveal download-card" style={{ transitionDelay: `${0.1 + idx * 0.1}s` }}>
                <div className="download-card-icon">
                  <FileText size={28} color="#2563eb" />
                </div>
                
                <div className="download-card-content">
                  <div className="download-card-tags">
                    {pkg.tags.map(tag => (
                      <span key={tag} className={`download-tag ${tag === pkg.highlight ? 'highlight' : ''}`}>{tag}</span>
                    ))}
                  </div>
                  <h3 className="download-card-title">{pkg.title}</h3>
                  {pkg.subhead && (
                    <h4 className="download-card-subhead">{pkg.subhead}</h4>
                  )}
                  <div className="download-card-desc">
                    {pkg.description.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>

                <div className="download-card-actions">
                  <div className="download-format">{pkg.format}</div>
                  <div className="download-buttons">
                    <a href={pkg.fileUrl} download={pkg.fileName} className="btn-download">
                      <Download size={18} /> 소개서 다운로드
                    </a>
                    {pkg.hasInquiryBtn && (
                      <button className="btn-outline" onClick={() => scrollToForm(pkg.tier)}>
                        도입 문의하기
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="reveal service-footer-note">
            <p>※ 각 패키지의 세부 과업 범위 및 견적은 대상 구역 규모에 따라 맞춤 조정되며, 상세 제안서 및 공문 발송은 하단 문의를 통해 신청 가능합니다.</p>
            <button className="text-link-arrow" onClick={() => scrollToForm()} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 16 }}>
              우리 기관에 맞는 맞춤형 견적이 궁금하다면? ➔ <span style={{ fontWeight: 700, color: 'var(--blue)' }}>협업 제안하러 가기</span>
            </button>
          </div>
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
                <option value="Tier 1">1. [Tier 1] 미니 진단 패키지</option>
                <option value="Tier 2">2. [Tier 2] 패키지 + 강연</option>
                <option value="Tier 3">3. [Tier 3] 표준 지도 패키지</option>
                <option value="Tier 4">4. [Tier 4] 통합 패키지: 보행환경 전수조사 및 예산 투입 컨설팅</option>
                <option value="Tier 5">5. [Tier 5] 운영 구독 패키지</option>
                <option value="모름">6. 아직 잘 모르겠어요 (맞춤 상담 희망)</option>
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
