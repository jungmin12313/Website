import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  url?: string;
}

export function useSEO({ title, description, url }: SEOProps) {
  useEffect(() => {
    // 1. Title
    document.title = title;
    
    // 2. Meta Tags (Description, OG, Twitter)
    const setMetaTag = (selector: string, attribute: string, content: string) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        if (selector.includes('property')) {
          el.setAttribute('property', attribute);
        } else {
          el.setAttribute('name', attribute);
        }
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMetaTag('meta[name="description"]', 'description', description);
    setMetaTag('meta[property="og:title"]', 'og:title', title);
    setMetaTag('meta[property="og:description"]', 'og:description', description);
    setMetaTag('meta[name="twitter:title"]', 'twitter:title', title);
    setMetaTag('meta[name="twitter:description"]', 'twitter:description', description);

    // 3. Canonical Link
    const targetUrl = url || window.location.href.split('?')[0]; // Query string 제거
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', targetUrl);

    // 4. OG URL
    setMetaTag('meta[property="og:url"]', 'og:url', targetUrl);

  }, [title, description, url]);
}
