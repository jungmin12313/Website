import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

/**
 * ============================================================================
 * [SECURITY & INFRASTRUCTURE GUIDE]
 * Firebase API Key 노출 방지 및 플랫폼 제한 안내
 * 
 * 본 프로젝트의 소스 코드는 Public 오픈소스로 공개되므로, 
 * API Key는 절대 코드 내부에 하드코딩하지 않고 환경변수(VITE_*)를 통해 주입받습니다.
 * 
 * [!주의!] 클라이언트 사이드 환경 변수는 빌드 시 브라우저에 노출됩니다.
 * 따라서 무단 도용 방지를 위해 Google Cloud Console에서 'HTTP 리퍼러 제한'을 
 * 반드시 설정해야 합니다.
 * 
 * 1. Google Cloud Console -> API 및 서비스 -> 사용자 인증 정보 접속
 * 2. 'Browser key (auto created by Firebase)' 선택
 * 3. '애플리케이션 제한사항' -> '웹사이트' 선택
 * 4. 허용할 웹사이트 URI 추가:
 *    - 로컬 개발: http://localhost:*
 *    - 실제 서비스: https://your-production-domain.com/*
 * ============================================================================
 */

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Debug logic to check if .env is loaded correctly
if (!firebaseConfig.apiKey) {
  console.error("❌ Firebase API Key is missing! Check your .env file and restart the dev server.");
} else {
  // console.log("✅ Firebase Config Loaded:", firebaseConfig.projectId);
}

// Initialize Firebase (중복 초기화 방지)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize App Check (Monitoring Mode Setup)
// Note: You need to add VITE_RECAPTCHA_SITE_KEY to your .env file and Vercel environment variables.
if (typeof window !== "undefined" && import.meta.env.VITE_RECAPTCHA_SITE_KEY) {
  if (import.meta.env.DEV) {
    // 로컬 개발 환경에서는 디버그 토큰을 사용합니다.
    (window as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
  }
  initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider(import.meta.env.VITE_RECAPTCHA_SITE_KEY),
    isTokenAutoRefreshEnabled: true
  });
}

// Initialize Services
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
