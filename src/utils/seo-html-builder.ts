import { generateAccessibilitySchema } from './schemaGenerator';

export function buildSeoHtml(festival: any): string {
  // 스키마 생성
  const schema = generateAccessibilitySchema(festival);

  // HTML 구성
  // 봇이 수집하기 쉽게 시맨틱하고 풍부한 메타태그를 포함합니다.
  const title = `${festival.name} | 무장애축제지도 내일`;
  const description = festival.description || `${festival.name}의 휠체어, 유아차 접근성 정보를 내일맵에서 확인하세요.`;
  const image = festival.thumbnail || festival.mapImage || 'https://naeilmap.com/og-image.png';
  const url = `https://naeilmap.com/maps/${festival.id}`;

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <meta name="keywords" content="무장애지도, 배리어프리, 휠체어 지도, 교통약자 여행, 접근성 데이터, 무장애 축제, NAEILMAP">
  
  <link rel="canonical" href="${url}">
  
  <!-- Open Graph -->
  <meta property="og:type" content="event">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${image}">
  <meta property="og:site_name" content="내일 - 무장애 데이터 플랫폼">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${url}">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${image}">

  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">
    ${JSON.stringify(schema)}
  </script>
</head>
<body>
  <h1>${festival.name}</h1>
  <p>${description}</p>
  <a href="/">메인으로 돌아가기</a>
</body>
</html>`;
}
