import type { Festival } from '../types'

/**
 * 축제 데이터를 기반으로 Schema.org 규격의 동적 접근성 스키마(Accessibility Schema)를 생성합니다.
 * AI 검색 엔진(GEO)이 무장애 정보를 완벽하게 이해하도록 핫스팟 데이터를 정밀 분석하여
 * accessibilityFeature, accessibilityHazard, amenityFeature로 변환합니다.
 */
export function generateAccessibilitySchema(festival: Festival): Record<string, any> {
  const accessibilityFeatures = new Set<string>();
  const accessibilityHazards = new Set<string>();
  const amenityFeatures: any[] = [];
  const containsPlaces: any[] = [];

  // 기본적으로 휠체어/무장애 관련 정보가 있는 플랫폼임을 명시
  accessibilityFeatures.add("wheelchairAccessible");

  festival.hotspots?.forEach((hotspot) => {
    const fullText = (hotspot.label + " " + (hotspot.description?.join(" ") || "")).toLowerCase();
    
    // 1. Accessibility Features (긍정적/접근성 지원 속성)
    if (fullText.includes("경사로")) {
      accessibilityFeatures.add("ramp");
    }
    if (fullText.includes("엘리베이터") || hotspot.category === "elevator") {
      accessibilityFeatures.add("elevator");
    }
    if (fullText.includes("점자")) {
      accessibilityFeatures.add("tactilePaving");
      accessibilityFeatures.add("braille");
    }
    if (fullText.includes("수어")) {
      accessibilityFeatures.add("signLanguage");
    }

    // 2. Amenity Features (공간적 편의시설)
    if (fullText.includes("장애인 화장실") || hotspot.category === "restroom" || fullText.includes("장애인화장실")) {
      amenityFeatures.push({
        "@type": "LocationFeatureSpecification",
        "name": "장애인 화장실 (Accessible Restroom)",
        "value": true
      });
    }
    if (fullText.includes("수유실")) {
      amenityFeatures.push({
        "@type": "LocationFeatureSpecification",
        "name": "수유실 (Nursing Room)",
        "value": true
      });
    }
    if (fullText.includes("유아차") || fullText.includes("유모차")) {
      amenityFeatures.push({
        "@type": "LocationFeatureSpecification",
        "name": "유아차 대여/접근가능 (Stroller Accessible)",
        "value": true
      });
    }

    // 3. Accessibility Hazards (부정적/접근성 방해 요소)
    // 사용자가 요청한: 접근이 불편한, 단차, 기울기 등
    if (fullText.includes("단차")) {
      accessibilityHazards.add("noClearances"); // 단차/장애물
      accessibilityHazards.add("단차 주의 (Steps/Thresholds Hazard)");
    }
    if (fullText.includes("기울기")) {
      accessibilityHazards.add("기울기 심함 (Steep Incline Hazard)");
    }
    if (fullText.includes("접근이 불편한") || fullText.includes("불편")) {
      accessibilityHazards.add("휠체어 접근 불편 (Limited Wheelchair Access)");
    }

    // 4. 세부 핫스팟 공간 (containsPlace)
    const geo = hotspot.gps ? {
      "@type": "GeoCoordinates",
      "latitude": hotspot.gps.lat,
      "longitude": hotspot.gps.lng
    } : undefined;

    containsPlaces.push({
      "@type": "Place",
      "name": hotspot.label,
      "description": hotspot.description?.join(", ") || "",
      "geo": geo,
      "accessibilitySummary": hotspot.description?.join(", ") || ""
    });
  });

  // 배열 중복 제거를 위한 유틸 처리
  const uniqueAmenityFeatures = Array.from(new Map(amenityFeatures.map(item => [item.name, item])).values());

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    "name": festival.name,
    "description": festival.description || `${festival.name} 무장애 접근성 정보`,
    "image": festival.thumbnail || festival.mapImage,
    "startDate": festival.startDate ? new Date(festival.startDate).toISOString() : undefined,
    "endDate": festival.endDate ? new Date(festival.endDate).toISOString() : undefined,
    "location": {
      "@type": "Place",
      "name": festival.address || festival.name,
      "address": festival.address,
      "accessibilityFeature": Array.from(accessibilityFeatures),
      "accessibilityHazard": Array.from(accessibilityHazards),
      "amenityFeature": uniqueAmenityFeatures.length > 0 ? uniqueAmenityFeatures : undefined,
      "containsPlace": containsPlaces.length > 0 ? containsPlaces : undefined
    }
  };
}
