import fs from 'fs';
import path from 'path';

/**
 * 무장애 축제 지도 '내일' 사이트맵 생성 스크립트
 * 핵심 키워드: 무장애, 무장애축제, 무장애축제지도
 */

const BASE_URL = 'https://naeilmap.com';
const STATIC_PAGES = [
  '',
  '/about',
  '/maps',
  '/calendar',
  '/story',
  '/report'
];

// 축제 상세 페이지 ID 리스트 (추후 Firebase 등에서 동적으로 가져오도록 확장 가능)
// 현재는 수동 관리 혹은 빌드 전 데이터 추출 방식 권장
const getFestivalIds = async () => {
  try {
    // 예: public/data/festivals.json 파일이 있다면 읽어오기
    const dataPath = path.resolve('public/data/festivals.json');
    if (fs.existsSync(dataPath)) {
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
      return data.map(f => f.id);
    }
  } catch (e) {
    console.warn('동적 축제 ID를 불러오지 못했습니다. 정적 페이지만 생성합니다.');
  }
  return [];
};

async function generate() {
  const festivalIds = await getFestivalIds();
  const allPages = [
    ...STATIC_PAGES.map(p => ({ url: p, priority: p === '' ? '1.0' : '0.8', changefreq: 'daily' })),
    ...festivalIds.map(id => ({ url: `/maps/${id}`, priority: '0.9', changefreq: 'weekly' }))
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${BASE_URL}${page.url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  const outputPath = path.resolve('public/sitemap.xml');
  fs.writeFileSync(outputPath, sitemap);
  console.log(`✅ 사이트맵 생성 완료: ${outputPath} (${allPages.length}개 경로)`);
}

generate();
