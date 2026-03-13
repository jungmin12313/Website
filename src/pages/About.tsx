import './About.css'

export default function About() {
  return (
    <div className="about-page">
      {/* 히어로 섹션 */}
      <section className="about-hero">
        <span className="badge">비영리 학생 자치단체</span>
        <h1>우리는 '내 일'처럼 고민합니다.</h1>
        <p>
          당연한 축제가 누군가에겐 도전이 되지 않도록,<br />
          직접 발로 뛰며 무장애 축제 지도를 만드는 대학생들의 이야기입니다.
        </p>
      </section>

      {/* 첫 번째 섹션: 학생들의 열정 */}
      <section className="about-section">
        <div className="section-grid">
          <div className="section-image">
            <img src="/images/about/team.png" alt="내일 팀 회의" />
          </div>
          <div className="section-text">
            <span className="badge badge-active">OUR STORY</span>
            <h2>"왜 장애인은 축제에 오기 힘들까?"</h2>
            <p>
              저희는 평범한 대학생들입니다. 축제의 활기와 즐거움을 사랑하는 동아리 부원들이었죠.
              어느 날 한 축제장에서 휠체어를 타고 입구에서 발을 돌리는 분을 보게 되었습니다.
              화려한 무대 뒤편, 턱 높은 화장실과 좁은 이동 통로가 보이기 시작했습니다.
            </p>
            <p>
              그날 이후 저희는 팀 '내일'을 결성했습니다. 
              내일(Tomorrow)을 꿈꾸는 청년들이, 무장애 환경 조성을 나의 일(Work)처럼 생각하며 
              세상을 조금씩 바꿔나가고 있습니다.
            </p>
          </div>
        </div>
      </section>

      {/* 가치관 섹션 */}
      <section className="student-values">
        <div className="values-grid">
          <div className="value-card">
            <div className="value-icon">📍</div>
            <h3>현장 중심의 조사</h3>
            <p>책상 앞이 아닌 축제 현장에서 답을 찾습니다. 휠체어를 직접 밀어보며 경사도를 확인하고, 화장실의 안전 손잡이 유무를 꼼꼼히 체크합니다.</p>
          </div>
          <div className="value-card">
            <div className="value-icon">🎨</div>
            <h3>친절한 시각화</h3>
            <p>누구나 한눈에 이해할 수 있는 픽토그램과 지도를 만듭니다. 복잡한 텍스트보다 명확한 이미지로 장벽을 표현합니다.</p>
          </div>
          <div className="value-card">
            <div className="value-icon">💙</div>
            <h3>지속 가능한 변화</h3>
            <p>일회성 활동에 그치지 않고, 지자체와 협력하여 축제 기획 단계부터 무장애 정보가 반영될 수 있도록 목소리를 냅니다.</p>
          </div>
        </div>
      </section>

      {/* 두 번째 섹션: 현장 활동 모습 */}
      <section className="about-section">
        <div className="section-grid reverse">
          <div className="section-image">
            <img src="/images/about/fieldwork.png" alt="축제 현장 조사" />
          </div>
          <div className="section-text">
            <span className="badge badge-active">FIELD WORK</span>
            <h2>가장 뜨거운 계절을<br />축제 현장에서 보냅니다.</h2>
            <p>
              여름엔 뜨거운 뙤약볕 아래서, 겨울엔 매서운 칼바람 속에서 전국 각지의 축제장을 방문합니다.
              휠체어 이용자의 시선에서 바라보는 축제는 우리가 알던 모습과 사뭇 달랐습니다.
            </p>
            <p>
              우리의 지도가 한 장씩 늘어날 때마다, 
              축제장을 누비는 휠체어 바퀴 소리가 더 경쾌하게 울려 퍼질 것이라 믿습니다.
              수익을 쫓는 기업이 아닌, 사회적 가치를 쫓는 학생들의 순수한 열정입니다.
            </p>
            
            <div className="vision-mission">
              <div className="vm-box">
                <h4>MISSION</h4>
                <p>장애인의 문화 접근 장벽을 허문다.</p>
              </div>
              <div className="vm-box">
                <h4>VISION</h4>
                <p>모두가 즐길 수 있는 무장애 관광 인프라 구축</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
