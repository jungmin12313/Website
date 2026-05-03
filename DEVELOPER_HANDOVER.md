# 내일맵(Naeilmap) 신규 개발자 인수인계 가이드

환영합니다! 이 문서는 내일맵(Naeilmap) 프로젝트를 인계받는 신규 개발자를 위해 작성된 A-Z 상세 기술 문서입니다. 프로젝트의 구조, 사용된 기술, 핵심 비즈니스 로직, 그리고 유지보수 시 주의해야 할 사항들을 모두 담고 있습니다.

---

## 1. 프로젝트 개요
**내일맵(Naeilmap)**은 누구나 장벽 없이 축제를 즐길 수 있도록 돕는 **'무장애(Barrier-Free) 축제 지도 서비스'**입니다. 
휠체어 접근로, 시각장애인 안내소, 수유실 등 배리어프리 관련 '핫스팟' 정보를 지도 위 핀(Pin) 형태로 제공하며, 사용자가 현장의 불편 사항을 직접 제보할 수 있는 시스템을 갖추고 있습니다.

## 2. 기술 스택 (Tech Stack)
### Front-end
- **프레임워크/라이브러리**: React 19, TypeScript
- **빌드 툴**: Vite (ESBuild 기반으로 매우 빠름)
- **라우팅**: React Router DOM v7 (`lazy`와 `Suspense`를 활용한 코드 스플리팅 적용)
- **스타일링**: 순수 CSS (Vanilla CSS). 별도의 라이브러리(Tailwind 등) 없이 CSS Variable과 `data-theme` 속성을 활용해 다크모드/고대비 모드를 구현합니다.
- **아이콘**: `lucide-react`

### Back-end & 인프라 (BaaS)
- **데이터베이스/인증**: Firebase (Firestore Database, Firebase Auth)
- **보안**: Firebase App Check (reCAPTCHA v3 기반 스팸 방어)
- **호스팅/배포**: Vercel (GitHub `main` 브랜치 푸시 시 자동 배포)

---

## 3. 폴더 및 파일 구조 (`src/`)
```text
src/
├── assets/             # 정적 이미지, 아이콘, 폰트 파일
├── components/         # 전역/공통 재사용 컴포넌트 (Navbar, Footer, ScrollToTop 등)
├── data/               # 정적 더미 데이터 (초기 기획용, 현재는 대부분 DB 연동됨)
├── hooks/              # 커스텀 훅 (예: useSEO 등 메타태그 동적 변경)
├── pages/              # 라우터에 연결되는 각 페이지의 메인 컴포넌트 및 개별 CSS
│   ├── Home.tsx        # 메인 랜딩 페이지 (설정된 배경 이미지 노출, 주요 축제 노출)
│   ├── FestivalList.tsx# 지도 목록 (현재 진행/예정된 축제 리스트)
│   ├── FestivalDetail.tsx # 개별 축제 상세 (지도 보기, 핫스팟 인터랙션 핵심 페이지)
│   ├── Report.tsx      # 신고/제보 접수 폼 페이지
│   ├── Admin.tsx       # 관리자 대시보드 (축제/핫스팟/제보/배경 이미지 관리)
│   └── About.tsx       # 서비스 소개 페이지
├── App.tsx             # 라우팅 설정 및 레이아웃의 엔트리 포인트
├── main.tsx            # React 앱 최상단 마운트
├── firebase.ts         # Firebase 초기화 및 인스턴스(Auth, Firestore, App Check) export
├── firebaseUtils.ts    # DB(Firestore) CRUD 로직을 추상화한 유틸리티 함수 모음
├── types.ts            # TypeScript 인터페이스(Festival, Hotspot, Report 등) 정의
└── index.css           # 글로벌 스타일, CSS 변수(디자인 토큰), 고대비 모드 글로벌 설정
```

---

## 4. 핵심 기능 및 동작 원리

### 4.1. 인터랙티브 지도 및 핫스팟 시스템 (가장 복잡한 로직)
- **위치**: `Admin.tsx`(관리자 좌표 찍기) & `FestivalDetail.tsx`(사용자 뷰)
- **동작 방식**: 
  - 관리자가 어드민 페이지에서 업로드한 지도 이미지(Base64 압축 형태) 위에 드래그 앤 드롭으로 핫스팟(Hotspot) 영역을 설정합니다.
  - 좌표는 이미지의 절대 픽셀값이 아닌 **백분율(%, `x`, `y`, `w`, `h`)**로 Firestore에 저장됩니다. 이를 통해 사용자의 기기(모바일/데스크톱) 화면 크기가 달라져도 지도 이미지 비율에 맞춰 핀이 정확한 위치에 렌더링됩니다.
  - 하나의 축제가 여러 장의 지도(앞면/뒷면 등)를 가질 수 있으며, `mapIndex` 필드로 구분합니다.

### 4.2. 제보(Report) 시스템 및 보안
- **위치**: `Report.tsx`
- **동작 방식**: 사용자가 폼을 작성해 Firestore `reports` 컬렉션에 문서를 생성합니다.
- **보안 장치**:
  - **Firebase App Check**: 악의적인 봇(Bot)의 DB 도배 공격(Billing Attack)을 막기 위해 reCAPTCHA v3가 적용되어 있습니다. (유효한 사이트에서만 DB 쓰기 허용)
  - **로컬 Rate Limit**: 브라우저 `localStorage`를 활용해 1분 이내 연속 제보를 1차 차단합니다.
  - **데이터 위생화(Sanitization)**: React가 렌더링 시 기본적으로 HTML을 이스케이프(XSS 방어)하며, 긴 텍스트 입력 시 `substring`으로 길이를 제한합니다.

### 4.3. 관리자 시스템 (Admin Dashboard)
- **위치**: `Admin.tsx`
- **인증**: Firebase Auth(이메일/비밀번호)를 사용합니다. 보안 강화를 위해 `user.email === 'admin@naeil.app'` 인지 프론트엔드 라우터 단에서 이중 검증합니다.
- **데이터 저장 최적화 (Base64)**: 현재 별도의 Firebase Storage 서버를 구축하지 않고, 클라이언트에서 캔버스(Canvas) API를 이용해 이미지를 리사이징/압축한 후 **Base64 문자열 형태로 Firestore Document에 직접 저장**합니다. (유지보수가 편하고 비용이 절감되나, 무제한 고화질 업로드는 지양해야 함)

### 4.4. 접근성 (Accessibility & 배리어프리)
- **고대비 모드(High Contrast)**: 전맹/저시력자 등을 위해 `Navbar`에서 '고대비 모드' 버튼을 제공합니다.
- 활성화 시 `<html>` 태그에 `data-theme="high-contrast"` 속성이 토글되며, 각 페이지의 `.css` 파일 하단에 정의된 `[data-theme='high-contrast']` 선택자들이 적용되어 UI가 흑백+노란색의 고대비로 강제 전환됩니다.

---

## 5. 데이터베이스(Firestore) 스키마 요약

1. **`festivals` 컬렉션**: 축제 정보
   - `id`, `name`, `startDate`, `endDate`, `mapImages` 등
   - **`hotspots` (배열)**: 해당 축제에 속한 핫스팟 객체 리스트 (x, y, w, h 좌표 포함)
2. **`reports` 컬렉션**: 사용자 제보 내역
   - `id`, `name`, `contact`, `content`, `status`('pending' | 'resolved'), `images`
3. **`settings` 컬렉션**: 글로벌 설정
   - 메인 홈페이지의 큰 배경 이미지 등을 `key-value` 형태로 저장 (예: `naeil_hero_bg`)
4. **`audit_logs` 컬렉션**: 관리자 행동 감사 로그 (삭제 등 위험 작업 기록)

---

## 6. 로컬 개발 환경 세팅 (Local Setup)

1. **저장소 클론 및 패키지 설치**
   ```bash
   git clone https://github.com/jungmin12313/Website.git
   cd Website
   npm install
   ```
2. **환경변수 세팅**
   - 최상위 디렉토리에 `.env` 파일을 생성하고 아래 값들을 채워넣습니다. (기존 개발자에게 전달받거나 Firebase 콘솔에서 확인)
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_RECAPTCHA_SITE_KEY=your_recaptcha_v3_site_key # App Check용
   ```
3. **로컬 서버 실행**
   ```bash
   npm run dev
   ```
   - 브라우저에서 `http://localhost:5173` 으로 접속합니다.

---

## 7. 배포 가이드 (Deployment)

본 프로젝트는 Vercel과 연동되어 있습니다.
- **자동 배포**: GitHub `main` 브랜치에 코드를 `git push` 하면 자동으로 Vercel이 감지하여 빌드 및 배포를 진행합니다.
- **환경 변수**: 로컬 `.env` 에 있는 모든 변수는 Vercel 대시보드 [Settings] -> [Environment Variables] 에 똑같이 등록되어 있어야 실서버에서 정상 작동합니다.
- **빌드 명령어**: `package.json` 내부의 `"build": "node scripts/generate-sitemap.mjs && npx rimraf node_modules/.vite dist && tsc -b && vite build"` 가 실행되며, 빌드 직전에 SEO를 위한 `sitemap.xml`이 자동 생성됩니다.

---

## 8. 🚨 향후 과제 및 주의사항 (Gotchas)

1. **이미지 저장 방식의 한계**
   - 현재 Firestore 문서는 건당 최대 1MB의 용량 제한이 있습니다.
   - 따라서 어드민에서 고해상도 지도를 Base64로 변환하여 그대로 저장하면 용량 초과 에러가 날 수 있습니다. 현재 클라이언트 단 압축 로직(`compressImage`)이 있으나, 추후 트래픽/데이터가 방대해지면 Firebase Storage 또는 AWS S3 연동으로 마이그레이션이 필요할 수 있습니다.
2. **App Check 강제(Enforce) 설정**
   - 현재 Firebase App Check 코드는 '모니터링 모드'로 코드에 이식되어 있습니다.
   - 신임 개발자께서는 배포 후 1~2주 뒤 Firebase 콘솔의 [App Check] 탭에서 유효 트래픽 비율을 확인하시고, **'Enforce(강제 적용)' 버튼을 눌러야만 비로소 스팸 방어가 100% 작동**합니다.
3. **Tailwind CSS 미사용**
   - 이 프로젝트는 의도적으로 Tailwind를 사용하지 않고 순수 CSS와 BEM 유사 방법론을 사용 중입니다. 새로운 페이지나 컴포넌트를 만들 때는 반드시 전용 `.css` 파일을 분리 생성하고 `[data-theme='high-contrast']` 구문을 잊지 말고 추가해 주어야 접근성이 유지됩니다.

---
*개발하며 막히는 부분이 있다면 언제든 이 가이드를 다시 참조해 주시고, 성공적인 온보딩을 응원합니다!*
