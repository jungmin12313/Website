export const config = {
  runtime: 'edge', // Vercel Edge Runtime을 사용하여 응답 속도를 극대화합니다.
};

const BASE_URL = 'https://naeilmap.com';
const STATIC_PAGES = [
  '',
  '/about',
  '/maps',
  '/calendar',
  '/report',
  '/partnership',
  '/newsletter',
  '/press'
];

export default async function handler(req: Request) {
  let festivalIds: string[] = [];

  try {
    const res = await fetch('https://firestore.googleapis.com/v1/projects/naeil-b568d/databases/(default)/documents/festivals');
    if (res.ok) {
      const data = await res.json();
      if (data.documents) {
        festivalIds = data.documents.map((doc: any) => doc.name.split('/').pop());
      }
    }
  } catch (e) {
    console.error('Failed to fetch festivals for sitemap:', e);
  }

  const REGIONS = ['seoul', 'gyeonggi', 'incheon', 'gangwon', 'chungcheong', 'jeolla', 'gyeongsang', 'jeju', 'all'];
  const THEMES = ['wheelchair', 'stroller', 'blind', 'deaf'];
  const explorePages: string[] = [];
  
  REGIONS.forEach(region => {
    THEMES.forEach(theme => {
      explorePages.push(`/explore/${region}/${theme}`);
    });
  });

  const allPages = [
    ...STATIC_PAGES.map(p => ({ url: p, priority: p === '' ? '1.0' : '0.8', changefreq: 'daily' })),
    ...festivalIds.map(id => ({ url: `/maps/${id}`, priority: '0.9', changefreq: 'weekly' })),
    ...explorePages.map(p => ({ url: p, priority: '0.7', changefreq: 'weekly' }))
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

  return new Response(sitemap, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      // 중요: s-maxage=86400 (Vercel CDN Edge에 24시간 캐싱)
      // stale-while-revalidate=43200 (캐시 만료 후 12시간 동안은 낡은 캐시를 보여주고 뒤에서 새로고침)
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200'
    }
  });
}
