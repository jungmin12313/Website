import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

import { HelmetProvider } from 'react-helmet-async'
import ErrorBoundary from './components/ErrorBoundary'

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

const initGA = () => {
  const gaId = import.meta.env.VITE_GA_ID;
  const isProd = import.meta.env.PROD;

  if (!isProd || !gaId) {
    console.log('개발 환경이거나 VITE_GA_ID가 누락되어 GA4를 실행하지 않습니다.');
    return;
  }

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function() {
    window.dataLayer.push(arguments);
  };
  
  window.gtag('js', new Date());
  window.gtag('config', gaId);
};

initGA();

const initClarity = () => {
  const isProd = import.meta.env.PROD;
  if (!isProd) {
    console.log('개발 환경이므로 Microsoft Clarity를 실행하지 않습니다.');
    return;
  }

  // @ts-ignore
  (function(c,l,a,r,i,t,y){
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window, document, "clarity", "script", "ye45irz6iq");
};

initClarity();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </HelmetProvider>
  </React.StrictMode>
)
