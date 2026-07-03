import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  url?: string;
  image?: string;
}

const SEO = ({
  title = '내일맵 | 모두를 위한 전국 무장애축제지도',
  description = '내일맵은 휠체어 사용자, 노인 등 교통약자를 위한 전국 축제의 배리어프리(무장애) 접근성 정보를 제공하는 전문 플랫폼입니다. 단차, 경사로, 장애인 화장실 등 휠체어 접근 경로를 확인하세요.',
  keywords = '무장애지도, 무장애축제지도, 무장애 축제, 배리어프리 지도, 휠체어 지도, 장애인 축제, 휠체어 여행, 교통약자 여행, 접근성 지도, 내일, 내일맵, NAEIL',
  url = 'https://naeilmap.com',
  image = 'https://naeilmap.com/og-image.png',
}: SEOProps) => {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook / Kakao */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="내일맵 - 무장애축제지도" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};

export default SEO;
