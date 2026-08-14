export const config = {
  runtime: 'edge', // Vercel Edge Runtime for performance
};

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('id');

  if (!id) {
    return new Response('Festival ID is required', { status: 400 });
  }

  try {
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/naeil-b568d/databases/(default)/documents/festivals/${id}`;
    const res = await fetch(firestoreUrl);
    
    if (!res.ok) {
      if (res.status === 404) {
        return new Response('Festival not found', { status: 404 });
      }
      return new Response('Failed to fetch festival data', { status: res.status });
    }

    const data = await res.json();
    const fields = data.fields;

    if (!fields) {
      return new Response('Invalid festival data', { status: 500 });
    }

    // Parse fields safely
    const name = fields.name?.stringValue || '이름 없음';
    const address = fields.address?.stringValue || '주소 없음';
    const description = fields.description?.stringValue || '';
    const date = fields.date?.stringValue || '일정 미정';
    const wheelchairAccessible = fields.wheelchairAccessible?.booleanValue ? 'Yes' : 'No';
    const hasDisabledRestroom = fields.hasDisabledRestroom?.booleanValue ? 'Yes' : 'No';
    const hasElevator = fields.hasElevator?.booleanValue ? 'Yes' : 'No';
    const hasParking = fields.hasParking?.booleanValue ? 'Yes' : 'No';

    // Parse hotspots
    let hotspotsMd = '';
    if (fields.hotspots?.arrayValue?.values) {
      hotspotsMd = fields.hotspots.arrayValue.values.map((h: any) => {
        const hf = h.mapValue.fields;
        const hName = hf.name?.stringValue || '';
        const hType = hf.type?.stringValue || '';
        const hDesc = hf.description?.stringValue || '';
        return `- **${hName}** (${hType}): ${hDesc}`;
      }).join('\n');
    }

    // Markdown Template
    const markdown = `# ${name}

**Date:** ${date}
**Address:** ${address}

## Description
${description}

## Accessibility Information (무장애 정보)
- Wheelchair Accessible (휠체어 접근 가능): ${wheelchairAccessible}
- Disabled Restroom (장애인 화장실): ${hasDisabledRestroom}
- Elevator/Ramp (엘리베이터/경사로): ${hasElevator}
- Disabled Parking (장애인 주차장): ${hasParking}

## Hotspots (주요 장소)
${hotspotsMd || 'No hotspot data available.'}

---
*This data is provided by NAEILMAP (내일맵) - The Barrier-Free Festival Map.*
*URL: https://naeilmap.com/maps/${id}*
`;

    return new Response(markdown, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200'
      }
    });
  } catch (error) {
    console.error('LLM API Error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
