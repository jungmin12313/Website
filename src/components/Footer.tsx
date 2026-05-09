import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Instagram, Mail, X, Shield, FileText, Lock } from 'lucide-react'
import './Footer.css'

export default function Footer() {
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | null>(null)

  return (
    <footer className="footer">


      {/* 2. MAIN FOOTER CONTENT GRID */}
      <div className="footer-inner">
        {/* Column 1: Brand Info & SNS */}
        <div className="footer-brand">
          <Link to="/" className="f-logo-link">
            <img 
              src="/logo_transparent.png" 
              alt="내일 - 무장애지도" 
              className="footer-logo" 
              loading="lazy" 
              width="130" 
              height="45" 
            />
          </Link>
          <p className="footer-desc">
            장애인, 노인, 휠체어 사용자 모두가 불안함 없이 축제를 즐길 수 있도록 배리어프리 현장 기록을 지도 위에 담아냅니다.
          </p>
          <div className="footer-social-badges">
            <a href="mailto:jm56s@naver.com" className="social-badge-btn" aria-label="이메일 문의">
              <Mail size={16} />
              <span>문의하기</span>
            </a>
            <a 
              href="https://www.instagram.com/naeil__official" 
              className="social-badge-btn instagram"
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="내일 공식 인스타그램"
            >
              <Instagram size={16} />
              <span>@naeil__official</span>
            </a>
          </div>
        </div>

        {/* Column 2: Service Map */}
        <div className="f-col">
          <h4>서비스</h4>
          <Link to="/about" className="f-link">내일 이야기</Link>
          <Link to="/maps" className="f-link">무장애지도</Link>
          <Link to="/calendar" className="f-link">축제 캘린더</Link>
          <Link to="/gallery" className="f-link">축제 현장 갤러리</Link>
        </div>

        {/* Column 3: Community & Participation */}
        <div className="f-col">
          <h4>참여 및 소식</h4>
          <Link to="/story" className="f-link">인터뷰 및 소식</Link>
          <Link to="/press" className="f-link">보도자료</Link>
          <Link to="/newsletter" className="f-link">뉴스레터 구독</Link>
          <Link to="/report" className="f-link border-highlight">지도 정보 제보하기</Link>
        </div>
      </div>
      
      {/* 3. BOTTOM: LEGAL LINKS, COPYRIGHT & DETAILED PROJECT INFO */}
      <div className="footer-bottom">
        <div className="footer-bottom-inner">
          <div className="footer-legal-links">
            <button 
              onClick={() => setActiveModal('terms')} 
              className="legal-btn"
              aria-label="이용약관 보기"
            >
              <FileText size={14} className="legal-icon" />
              <span>이용약관</span>
            </button>
            <span className="legal-divider" />
            <button 
              onClick={() => setActiveModal('privacy')} 
              className="legal-btn priority"
              aria-label="개인정보처리방침 보기"
            >
              <Shield size={14} className="legal-icon" />
              <span>개인정보처리방침</span>
            </button>
          </div>

          <div className="footer-copyright-admin">
            <p className="copyright">© 2026 내일. All rights reserved.</p>
            <Link to="/admin" className="admin-subtle-link" aria-label="관리자 로그인 페이지로 이동">
              <Lock size={12} className="lock-icon" />
              <span>관리자 로그인</span>
            </Link>
          </div>
        </div>

        {/* Muted and Subordinate Project Info Block */}
        <div className="footer-project-info">
          <span>플랫폼명 : 무장애 축제 지도 '내일'</span>
          <span className="info-dot">•</span>
          <span>대표 : 신중민</span>
          <span className="info-dot">•</span>
          <span>프로젝트 : 교통약자의 문화예술 접근성 활성화</span>
          <span className="info-dot">•</span>
          <span>공식 연락처 : jm56s@naver.com</span>
        </div>
      </div>

      {/* 4. MODAL OVERLAY (SELF-CONTAINED) */}
      {activeModal && (
        <div className="footer-modal-overlay" onClick={() => setActiveModal(null)} role="dialog" aria-modal="true">
          <div className="footer-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                {activeModal === 'privacy' ? '개인정보처리방침' : '서비스 이용약관'}
              </h3>
              <button 
                className="modal-close-btn" 
                onClick={() => setActiveModal(null)}
                aria-label="닫기"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body-scroll">
              {activeModal === 'privacy' ? (
                <div className="legal-content">
                  <p className="legal-lead">
                    무장애 축제 지도 전문 플랫폼 '내일'(이하 '플랫폼')은 이용자의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 다음과 같은 처리방침을 두고 있습니다.
                  </p>
                  
                  <h4>1. 개인정보의 수집 및 이용 목적</h4>
                  <p>플랫폼은 다음의 목적을 위해 개인정보를 수집하고 이용합니다. 수집된 개인정보는 목적 외의 용도로는 사용되지 않으며, 이용 목적이 변경될 시에는 사전 동의를 구할 예정입니다.</p>
                  <ul>
                    <li><strong>지도 수정 및 신규 축제 정보 제보 처리</strong>: 제보 내용 확인, 사실 여부 검증을 위한 제보자 연락 및 처리결과 통보.</li>
                    <li><strong>문의 및 고충 처리</strong>: 민원인의 신원 확인, 민원사항 확인, 사실조사를 위한 연락·통지, 처리결과 통보.</li>
                    <li><strong>무장애 소식 이메일 뉴스레터 발송</strong>: 동의한 사용자에 한해 신규 배리어프리 축제 소식 및 서비스 업데이트 발송.</li>
                  </ul>

                  <h4>2. 수집하는 개인정보 항목</h4>
                  <ul>
                    <li><strong>필수 항목</strong>: 이메일 주소 (이메일 구독 신청 시)</li>
                    <li><strong>정보 제보 및 문의 시</strong>: 제보자 성명(또는 닉네임), 이메일 주소, 제보 관련 상세 텍스트 및 사진 정보</li>
                    <li><strong>자동 수집 항목</strong>: 서비스 이용 과정에서 IP 주소, 쿠키, 방문 일시, 기기 정보 등이 자동으로 생성되어 수집될 수 있습니다.</li>
                  </ul>

                  <h4>3. 개인정보의 보유 및 이용 기간</h4>
                  <p>이용자의 개인정보는 수집 및 이용 목적이 달성되면 지체 없이 파기합니다. 단, 다음의 정보는 명시한 기간 동안 보존합니다.</p>
                  <ul>
                    <li><strong>정보 제보 및 문의 내역</strong>: 제보 검증 및 플랫폼 운영 관리 목적으로 제출일로부터 1년 보존 후 파기</li>
                    <li><strong>이메일 구독 정보</strong>: 이용자가 구독 취소를 요청하거나 뉴스레터 발송 서비스를 종료할 때까지 보존</li>
                  </ul>

                  <h4>4. 동의를 거부할 권리 및 불이익</h4>
                  <p>이용자는 개인정보 수집 및 이용에 대한 동의를 거부할 권리가 있습니다. 단, 동의를 거부할 경우 뉴스레터 구독 서비스 및 상세 정보 제보 접수가 제한될 수 있습니다.</p>
                </div>
              ) : (
                <div className="legal-content">
                  <p className="legal-lead">
                    본 약관은 무장애 축제 지도 전문 플랫폼 '내일'(이하 '플랫폼')이 제공하는 지도 정보 서비스 및 관련 제반 서비스(이하 '서비스')를 이용함에 있어, 플랫폼과 이용자 간의 권리, 의무 및 책임 사항을 규정함을 목적으로 합니다.
                  </p>

                  <h4>1. 서비스의 목적과 내용</h4>
                  <p>플랫폼은 교통약자(장애인, 노인, 영유아 동반자, 임산부 등)를 포함한 모든 사람들이 문화예술 행사와 축제를 걱정 없이 누릴 수 있도록 현장 실측 데이터(경사도, 단차, 장애인 화장실 유무 등) 기반의 무장애 축제 접근성 정보를 제공합니다.</p>

                  <h4>2. 정보 제공의 책임 및 한계</h4>
                  <ul>
                    <li>플랫폼 내의 배리어프리 실측 데이터는 당사자 동행 및 현장 조사를 바탕으로 정성껏 구축되었습니다.</li>
                    <li>다만, 축제 현장의 기상 조건, 임시 경사로 철거, 주최측의 공간 배치 임시 변경 등 실시간 현장 변동 상황에 따라 실제 조건과 지도 상 정보에 차이가 발생할 수 있습니다.</li>
                    <li>따라서 이용자는 중요한 일정의 경우 방문 전 축제 주최측에 최종 접근성을 확인하시는 것을 권장하며, 플랫폼은 정보의 일시적 불일치로 인해 발생하는 간접적 손해에 대해 법적 책임을 지지 않습니다.</li>
                  </ul>

                  <h4>3. 서비스의 변경 및 중단</h4>
                  <p>플랫폼은 양질의 서비스를 지속적으로 제공하기 위해 시스템 점검, 서버 증설, 버그 수정 등의 사유로 서비스를 일시 중단하거나 개편할 수 있습니다. 비상 상황이 아닌 한 사전에 웹사이트 팝업 또는 소셜미디어를 통해 공지합니다.</p>

                  <h4>4. 사용자의 의무 및 저작권</h4>
                  <ul>
                    <li>사용자는 플랫폼이 제공하는 무장애 데이터 및 실측 이미지 자료를 상업적 목적으로 무단 복제, 전재, 가공, 배포할 수 없습니다.</li>
                    <li>이용자가 작성하여 등록한 제보 글 및 사진 등의 저작권은 해당 작성자에게 귀속되며, 플랫폼은 공익적 가치 전파를 위해 본 서비스 내에서 전시 및 노출할 수 있는 권리를 가집니다.</li>
                  </ul>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="modal-confirm-btn" onClick={() => setActiveModal(null)}>
                확인 및 닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  )
}


