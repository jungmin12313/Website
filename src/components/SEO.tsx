import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: 'website' | 'article' | 'event';
  noindex?: boolean;
  schema?: Record<string, any> | Record<string, any>[]; // JSON-LD 스키마 객체 또는 배열
}

const SEO = ({
  title = '내일 - 무장애축제지도 | 대한민국 접근성 데이터 플랫폼',
  description = '내일은 휠체어 사용자, 고령자 등 교통약자를 위한 전국의 배리어프리 접근성 정보를 제공하는 전문 플랫폼입니다. 축제, 상권, 공공시설의 단차와 경사도를 무장애지도로 확인하세요.',
  keywords = '무장애지도, 배리어프리, 휠체어 지도, 교통약자 여행, 접근성 데이터, 무장애 축제, NAEILMAP',
  image = 'https://naeilmap.com/og-image.png',
  type = 'website',
  noindex = false,
  schema,
}: SEOProps) => {
  const { pathname } = useLocation();
  const currentUrl = `https://naeilmap.com${pathname}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={currentUrl} />

      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {!noindex && <meta name="robots" content="index, follow" />}

      {/* Open Graph / Facebook / Kakao */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="내일 - 무장애 데이터 플랫폼" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Structured Data / JSON-LD */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
