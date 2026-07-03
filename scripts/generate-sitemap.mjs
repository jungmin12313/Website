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

// Firestore REST API를 통해 동적으로 축제 ID를 불러옵니다.
const getFestivalIds = async () => {
  try {
    const res = await fetch('https://firestore.googleapis.com/v1/projects/naeil-b568d/databases/(default)/documents/festivals');
    if (!res.ok) throw new Error('Failed to fetch from Firestore');
    const data = await res.json();
    if (data.documents) {
      return data.documents.map(doc => doc.name.split('/').pop());
    }
  } catch (e) {
    console.warn('동적 축제 ID를 불러오지 못했습니다. 정적 페이지만 생성합니다.', e.message);
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
