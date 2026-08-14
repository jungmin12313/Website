import { next } from '@vercel/edge';
import { buildSeoHtml } from './src/utils/seo-html-builder';

export const config = {
  // 미들웨어가 실행될 경로 지정.
  // API 및 에셋은 제외하고 페이지 경로만 매칭합니다.
  matcher: [
    '/maps/:id',
  ],
};

const BOT_USER_AGENTS = [
  'googlebot',
  'yeti',
  'bingbot',
  'baiduspider',
  'twitterbot',
  'facebookexternalhit',
  'kakaotalk-scrap',
  'slackbot',
  'discordbot'
];

export default async function middleware(req: Request) {
  const url = new URL(req.url);
  const userAgent = req.headers.get('user-agent') || '';

  // 1. 봇 여부 확인
  const isBot = BOT_USER_AGENTS.some(bot => userAgent.toLowerCase().includes(bot));

  // 봇이 아니면 바로 다음(일반 Vite React 앱)으로 넘김
  if (!isBot) {
    return next();
  }

  // 2. 봇인 경우, URL에서 축제 ID 추출 (/maps/fest-1234 -> fest-1234)
  const pathParts = url.pathname.split('/');
  const id = pathParts[pathParts.length - 1];

  if (!id || id === 'maps') {
    return next();
  }

  try {
    // 3. Firestore REST API를 호출하여 축제 데이터 조회
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/naeil-b568d/databases/(default)/documents/festivals/${id}`;
    const res = await fetch(firestoreUrl);
    
    if (!res.ok) {
      // 데이터를 못 찾았거나 에러 시 안전하게 일반 앱으로 넘김
      return next();
    }

    const doc = await res.json();
    
    // Firestore REST API 형식을 일반 앱에서 사용하는 객체 형식으로 변환 (최소한의 SEO에 필요한 속성만)
    const festival = {
      id: id,
      name: doc.fields?.name?.stringValue || '',
      description: doc.fields?.description?.stringValue || '',
      thumbnail: doc.fields?.thumbnail?.stringValue || doc.fields?.mapImage?.stringValue || '',
      mapImage: doc.fields?.mapImage?.stringValue || '',
      startDate: doc.fields?.startDate?.stringValue || '',
      endDate: doc.fields?.endDate?.stringValue || '',
      address: doc.fields?.address?.stringValue || '',
      hotspots: [] // 핫스팟 파싱은 복잡하므로 SEO 메인 정보 위주로 생성
    };

    // 4. 봇 전용 가벼운 SEO HTML 생성
    const html = buildSeoHtml(festival);

    // 5. 생성된 HTML 반환
    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' // 에지단에서 1시간 캐싱
      }
    });

  } catch (err) {
    console.error('SEO Middleware Error:', err);
    // 6. 에러 발생 시 무조건 일반 앱으로 안전하게 Fallback
    return next();
  }
}
