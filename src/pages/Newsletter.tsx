import { useState } from 'react'
import { Mail, Check, AlertCircle, ArrowRight, Sparkles, Calendar, Heart, Shield } from 'lucide-react'
import { useSEO } from '../hooks/useSEO'
import './Newsletter.css'

export default function Newsletter() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [error, setError] = useState('')

  useSEO({
    title: "뉴스레터 구독 | 내일",
    description: "내일이 전하는 생생한 무장애 축제 소식과 배리어프리 편의시설 정보를 메일로 정기 수신하세요.",
    url: 'https://naeilmap.com/newsletter'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim()) {
      setError('이름(또는 닉네임)을 입력해 주세요.')
      return
    }
    if (!email || !email.includes('@')) {
      setError('올바른 이메일 주소를 입력해 주세요.')
      return
    }
    if (!agreed) {
      setError('개인정보 수집 및 뉴스레터 수신동의에 체크해 주세요.')
      return
    }

    // Success transition
    setSubscribed(true)
  }

  return (
    <div className="newsletter-page">
      <div className="newsletter-container">
        {subscribed ? (
          <div className="newsletter-success-card fade-in">
            <div className="success-lottie-mock">
              <div className="success-circle-pulse">
                <Check size={48} className="success-icon-svg" />
              </div>
            </div>
            <h2>구독이 성공적으로 완료되었습니다!</h2>
            <p className="success-lead">
              안녕하세요 <strong>{name}</strong>님, 반갑습니다! <br />
              입력하신 <span>{email}</span> 주소로 내일의 첫 소식지를 곧 보내드릴게요.
            </p>
            <div className="success-benefits">
              <div className="benefit-badge">
                <Sparkles size={16} />
                <span>매월 2회 정기 발송</span>
              </div>
              <div className="benefit-badge">
                <Calendar size={16} />
                <span>축제 시즌 스페셜 리포트</span>
              </div>
            </div>
            <p className="success-note">
              * 메일이 도착하지 않았다면 스팸 메일함 혹은 프로모션 탭을 확인해 주세요.
            </p>
            <a href="/" className="back-home-btn">
              메인 홈으로 가기
              <ArrowRight size={16} />
            </a>
          </div>
        ) : (
          <div className="newsletter-split-layout">
            {/* Left Column: Copy & Brand benefits */}
            <div className="newsletter-intro">
              <div className="badge-tag">
                <Sparkles size={14} className="tag-icon" />
                <span>장벽 없는 내일 뉴스레터</span>
              </div>
              <h1>
                모두를 위한 축제 소식,<br />
                <strong>편안하게 메일로</strong> 받으세요
              </h1>
              <p className="intro-desc">
                매월 가장 따끈따끈한 전국의 무장애 축제 실측 접근성 정보와 배리어프리 편의시설 변화 소식을 콕 집어 전달해 드립니다.
              </p>

              <div className="benefit-cards-stack">
                <div className="b-card">
                  <div className="b-icon-wrap">
                    <Sparkles size={20} className="b-icon" />
                  </div>
                  <div className="b-text">
                    <h3>생생한 배리어프리 현장 실측 리포트</h3>
                    <p>직접 조사단이 현장 방문하여 확인한 실시간 단차, 경사도, 장애인 화장실 지도를 정리해 드립니다.</p>
                  </div>
                </div>

                <div className="b-card">
                  <div className="b-icon-wrap">
                    <Calendar size={20} className="b-icon" />
                  </div>
                  <div className="b-text">
                    <h3>시즌별 맞춤형 무장애 축제 추천</h3>
                    <p>휠체어, 실버 카트 사용자가 마음 편히 즐길 수 있는 이달의 대표 축제 소식을 선별해 드립니다.</p>
                  </div>
                </div>

                <div className="b-card">
                  <div className="b-icon-wrap">
                    <Heart size={20} className="b-icon" />
                  </div>
                  <div className="b-text">
                    <h3>장벽을 허무는 사람들의 이야기</h3>
                    <p>더 깊은 가치와 감동을 주는 무장애 기획자, 당사자들의 현장 단독 인터뷰를 전달합니다.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Subscription Form */}
            <div className="newsletter-form-container">
              <div className="form-card">
                <h3>소식 구독 신청하기</h3>
                <p className="form-sub">간단히 가입하고 장벽 없는 소식을 전해 받으세요.</p>

                {error && (
                  <div className="error-message-box">
                    <AlertCircle size={16} className="error-icon" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="actual-subscription-form">
                  <div className="input-field-group">
                    <label htmlFor="user-name">이름 또는 닉네임</label>
                    <input
                      id="user-name"
                      type="text"
                      placeholder="이름을 입력해 주세요"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="form-input-text"
                      required
                    />
                  </div>

                  <div className="input-field-group">
                    <label htmlFor="user-email">이메일 주소</label>
                    <input
                      id="user-email"
                      type="email"
                      placeholder="example@naver.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="form-input-text"
                      required
                    />
                  </div>

                  <div className="consent-checkbox-wrap">
                    <label className="checkbox-container">
                      <input
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="native-checkbox"
                      />
                      <span className="custom-checkmark">
                        {agreed && <Check size={12} className="check-svg" />}
                      </span>
                      <span className="consent-text">
                        개인정보 수집 및 정기 뉴스레터 수신 동의 (필수)
                      </span>
                    </label>
                    <div className="consent-detail-box">
                      - 수집항목: 이름, 이메일 주소 <br />
                      - 수집목적: 무장애 축제 뉴스레터 및 서비스 공지 발송 <br />
                      - 보유기간: 구독 취소 또는 서비스 종료 시까지 지체 없이 파기
                    </div>
                  </div>

                  <button type="submit" className="form-submit-btn">
                    <span>무료로 구독하기</span>
                    <Mail size={18} />
                  </button>
                </form>

                <div className="form-security-badge">
                  <Shield size={14} />
                  <span>개인정보는 엄격히 암호화되어 관리됩니다.</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
