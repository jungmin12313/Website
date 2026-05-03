import * as XLSX from 'xlsx';
import type { Hotspot } from '../types';

export type ParsedExcelItem = Partial<Hotspot> & {
  sourceExcelId: string;
  category: 'building' | 'pathway' | 'elevator' | 'restroom';
  accessibilityGrade: 'G' | 'Y' | 'R';
  title: string;
  subtitle: string;
};

// GPS 파싱 ("위도, 경도" -> {lat, lng})
const parseGPS = (gpsStr: any): { lat: number; lng: number } | undefined => {
  if (!gpsStr || typeof gpsStr !== 'string') return undefined;
  const parts = gpsStr.split(',').map(s => parseFloat(s.trim()));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
    return { lat: parts[0], lng: parts[1] };
  }
  return undefined;
};

// Drive API 연동 (환경 변수 또는 기타 백엔드 연동 전 임시/실제 처리)
const convertDrivePathToUrl = async (path: string): Promise<string> => {
  if (!path) return '';
  // 이미 URL 형태거나 id가 포함된 경우
  if (path.includes('drive.google.com') || path.includes('docs.google.com') || path.includes('id=')) {
    let fileId = '';
    
    // 1. /file/d/ID/view 형식에서 ID 추출
    const fileDMatch = path.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileDMatch) fileId = fileDMatch[1];
    
    // 2. id=ID 형식에서 ID 추출
    if (!fileId) {
      const idMatch = path.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (idMatch) fileId = idMatch[1];
    }
    
    // ID를 찾았다면 더 안정적인 thumbnail 엔드포인트 사용 (sz=w1000으로 고화질 요청)
    if (fileId) return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
    
    return path;
  }
  
  // 구글 드라이브 API 연동이 설정되어 있지 않은 경우 경로 자체를 반환하거나 임시 텍스트 처리
  // 프롬프트 요구사항: 파일을 찾지 못하면 "연결 실패" 처리.
  // 실제 API 키 없이 이름만으로 검색하는 것은 불가능하므로, 향후 API 연동을 위한 구조만 잡고 
  // 당장은 경로명 자체를 보존하거나 에러 메시지 반환.
  return path;
};

const getPhotosForId = async (id: string, mainPhoto: { url: string; label: string } | null, photoSheet: any[]): Promise<{ url: string; label: string }[]> => {
  const photoList: { url: string; label: string }[] = [];
  if (mainPhoto && mainPhoto.url) photoList.push(mainPhoto);
  
  if (photoSheet && Array.isArray(photoSheet)) {
    const related = photoSheet.filter(row => String(row['부모ID']) === id);
    for (const row of related) {
      if (row['사진파일']) {
        const url = await convertDrivePathToUrl(String(row['사진파일']));
        if (url) photoList.push({ url, label: String(row['사진설명'] || '추가 사진') });
      }
    }
  }

  return photoList;
};

// --- 변환 규칙 ---

const processBuilding = async (row: any, photoSheet: any[]): Promise<ParsedExcelItem> => {
  const id = String(row['ID'] || '');
  const title = row['건물명'] || '이름 없음';
  const grade = (row['색_구분'] || 'G') as 'G' | 'Y' | 'R';
  
  const desc: string[] = [];
  const doorType = row['출입문_유형'];
  if (doorType === '자동문') desc.push('주출입구 자동문 설치');
  else if (doorType) desc.push('주출입구 수동문');
  
  const doorWidth = Number(row['문_너비(cm)']);
  if (!isNaN(doorWidth) && doorWidth > 0) desc.push(`출입문 유효폭 ${doorWidth}cm`);
  
  const step = Number(row['단차_높이(cm)']);
  if (isNaN(step) || step === 0) desc.push('단차 없음');
  else if (step > 0) desc.push(`단차 ${step}cm`);
  
  const hasRamp = String(row['경사로_유무']).toUpperCase() === 'TRUE';
  const rampDegree = Number(row['경사로_기울기']);
  if (hasRamp) {
    if (!isNaN(rampDegree) && rampDegree > 0) desc.push(`경사로 설치 (기울기 ${rampDegree}°)`);
    else desc.push(`경사로 설치`);
  }

  return {
    sourceExcelId: id,
    category: 'building',
    accessibilityGrade: grade,
    title,
    subtitle: `${row['카테고리'] || '건물'}`,
    label: title,
    description: desc,
    note: String(row['기타'] || ''),
    gps: parseGPS(row['위치_GPS']),
    photos: await getPhotosForId(id, { url: await convertDrivePathToUrl(row['출입문_정면사진']), label: '출입구 정면' }, photoSheet)
  };
};

const processPathway = async (row: any, photoSheet: any[]): Promise<ParsedExcelItem> => {
  const id = String(row['ID'] || '');
  const title = row['건물명'] || '이름 없음';
  const grade = (row['색_구분'] || 'G') as 'G' | 'Y' | 'R';
  const category = row['카테고리'] || '';
  
  const desc: string[] = [];
  if (grade === 'G') desc.push('교통약자편의증진법 기준에 부합하는 보행로입니다.');
  else desc.push('교통약자편의증진법 기준에 어긋나 접근이 다소 불편한 보행로입니다.');

  if (category === '경사로') desc.push('경사로 구간');
  else if (category === '점자블록') desc.push('점자블록 구간');

  const width = Number(row['보행로_너비(cm)']);
  if (!isNaN(width) && width > 0) desc.push(`유효폭 ${width}cm`);
  
  if (row['포장_유형']) desc.push(`포장재: ${row['포장_유형']}`);
  
  const hasStep = String(row['단차_유무']).toUpperCase() === 'TRUE';
  const stepHeight = Number(row['단차_높이(cm)']);
  if (hasStep) {
    if (!isNaN(stepHeight) && stepHeight > 0) desc.push(`단차 ${stepHeight}cm 있음`);
    else desc.push(`단차 있음`);
  } else if (row['단차_유무'] !== undefined) {
    desc.push('단차 없음');
  }
  
  const rampDeg = Number(row['경사로_기울기']);
  if (!isNaN(rampDeg) && rampDeg > 0) desc.push(`경사 ${rampDeg}°`);

  return {
    sourceExcelId: id,
    category: 'pathway',
    accessibilityGrade: grade,
    title,
    subtitle: `${category || '보행로'}`,
    label: title,
    description: desc,
    note: String(row['기타'] || ''),
    gps: parseGPS(row['위치_GPS']),
    photos: await getPhotosForId(id, { url: await convertDrivePathToUrl(row['보행로_사진']), label: '보행로' }, photoSheet)
  };
};

const processElevator = async (row: any, photoSheet: any[]): Promise<ParsedExcelItem> => {
  const id = String(row['ID'] || '');
  const title = row['엘리베이터명'] || '이름 없음';
  const grade = (row['색_구분'] || 'G') as 'G' | 'Y' | 'R';
  
  const desc: string[] = [];
  const doorWidth = Number(row['출입문_너비(cm)']);
  if (!isNaN(doorWidth) && doorWidth > 0) desc.push(`출입문 유효폭 ${doorWidth}cm`);
  
  const gap = Number(row['승강기_틈(cm)']);
  if (!isNaN(gap) && gap > 0) desc.push(`승강기 틈 ${gap}cm`);
  
  const btnHeight = Number(row['조작버튼_높이(cm)']);
  if (!isNaN(btnHeight) && btnHeight > 0) desc.push(`조작버튼 높이 ${btnHeight}cm`);
  
  const w = Number(row['가로_유효_크기(cm)']);
  const h = Number(row['세로_유효_크기(cm)']);
  if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) desc.push(`내부 유효 크기 ${w}×${h}cm`);

  return {
    sourceExcelId: id,
    category: 'elevator',
    accessibilityGrade: grade,
    title,
    subtitle: `${row['카테고리'] || '엘리베이터'}`,
    label: title,
    description: desc,
    note: String(row['기타'] || ''),
    gps: parseGPS(row['위치_GPS']),
    photos: await getPhotosForId(id, { url: await convertDrivePathToUrl(row['엘리베이터_사진']), label: '엘리베이터' }, photoSheet)
  };
};

const processRestroom = async (row: any, photoSheet: any[]): Promise<ParsedExcelItem> => {
  const id = String(row['ID'] || '');
  const title = row['화장실명'] || '이름 없음';
  const grade = (row['색_구분'] || 'G') as 'G' | 'Y' | 'R';
  const category = row['카테고리'];
  
  const desc: string[] = [];
  if (category === '장애인용') desc.push('장애인 전용 화장실');
  else if (category === '비장애인용') desc.push('일반 화장실 (장애인 전용 아님)');
  
  const doorWidth = Number(row['출입문_너비(cm)']);
  if (!isNaN(doorWidth) && doorWidth > 0) desc.push(`출입문 유효폭 ${doorWidth}cm`);
  
  const w = Number(row['가로_유효_크기(cm)']);
  const h = Number(row['세로_유효_크기(cm)']);
  if (!isNaN(w) && !isNaN(h) && w > 0 && h > 0) desc.push(`내부 유효 크기 ${w}×${h}cm`);

  return {
    sourceExcelId: id,
    category: 'restroom',
    accessibilityGrade: grade,
    title,
    subtitle: `${category || '화장실'}`,
    label: title,
    description: desc,
    note: String(row['기타'] || ''),
    gps: parseGPS(row['위치_GPS']),
    photos: await getPhotosForId(id, { url: await convertDrivePathToUrl(row['화장실_사진']), label: '화장실' }, photoSheet)
  };
};

export const parseExcelFile = async (file: File): Promise<ParsedExcelItem[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const getSheet = (name: string) => {
          const sheet = workbook.Sheets[name];
          return sheet ? XLSX.utils.sheet_to_json(sheet) : [];
        };

        const bldgs = getSheet('건물');
        const paths = getSheet('보행로');
        const elevs = getSheet('엘리베이터');
        const rests = getSheet('화장실');
        const bldgPhotos = getSheet('건물_사진');
        const pathPhotos = getSheet('보행로_사진');
        const elevPhotos = getSheet('엘리베이터_사진');
        const restPhotos = getSheet('화장실_사진');

        const results: ParsedExcelItem[] = [];
        const restroomMap = new Map<string, ParsedExcelItem>();
        const buildingMap = new Map<string, ParsedExcelItem>();

        // 1. 건물 먼저 처리하여 맵에 저장
        for (const row of bldgs) {
          const item = await processBuilding(row, bldgPhotos);
          // 건물명에서 공백 제거하여 비교용 키 생성
          const searchKey = item.title.replace(/\s+/g, '').trim();
          buildingMap.set(searchKey, item);
        }

        // 2. 보행로 처리
        for (const row of paths) results.push(await processPathway(row, pathPhotos));

        // 3. 엘리베이터 처리 (이름 기반 병합)
        for (const row of elevs) {
          const item = await processElevator(row, elevPhotos);
          const cleanTitle = item.title.replace(/\s+/g, '').trim();
          
          let merged = false;
          for (const [bName, parent] of buildingMap.entries()) {
            if (cleanTitle.includes(bName) || bName.includes(cleanTitle)) {
              parent.description = [...(parent.description || []), `[엘리베이터] ${item.title}: ${item.description.join(', ')}`].filter(Boolean);
              if (item.photos) parent.photos = Array.from(new Set([...(parent.photos as any[]), ...(item.photos as any[])]));
              merged = true;
              break;
            }
          }
          if (!merged) results.push(item);
        }

        // 4. 화장실 처리 (이름 기반 병합 + 성별 통합)
        for (const row of rests) {
          const item = await processRestroom(row, restPhotos);
          const cleanTitle = item.title
            .replace(/\s*\(?(남|여|남여|M|F|Male|Female|남성용|여성용|장애인용|비장애인용)\)?\s*/g, '')
            .replace(/\s+/g, '')
            .trim();

          let mergedToBuilding = false;
          for (const [bName, parent] of buildingMap.entries()) {
            // 화장실 이름에 건물명이 포함되어 있는지 확인 (예: "YMCA 1층 화장실" 에 "YMCA" 포함)
            if (cleanTitle.includes(bName)) {
              parent.description = [...(parent.description || []), `[내부 화장실] ${item.title}: ${item.description.join(', ')}`].filter(Boolean);
              if (item.photos) parent.photos = Array.from(new Set([...(parent.photos as any[]), ...(item.photos as any[])]));
              mergedToBuilding = true;
              break;
            }
          }

          if (!mergedToBuilding) {
            const key = `${cleanTitle}_restroom`;
            if (restroomMap.has(key)) {
              const existing = restroomMap.get(key)!;
              existing.description = Array.from(new Set([...(existing.description || []), ...(item.description || [])]));
              if (item.photos && Array.isArray(item.photos)) {
                const currentPhotos = Array.isArray(existing.photos) ? (existing.photos as any[]) : [];
                const allPhotos = [...currentPhotos, ...(item.photos as any[])];
                const seenUrls = new Set<string>();
                existing.photos = allPhotos.filter(p => {
                  const url = typeof p === 'string' ? p : p.url;
                  if (!url || seenUrls.has(url)) return false;
                  seenUrls.add(url);
                  return true;
                });
              }
              if (item.accessibilityGrade === 'G') existing.accessibilityGrade = 'G';
            } else {
              item.title = cleanTitle;
              item.label = cleanTitle;
              restroomMap.set(key, item);
            }
          }
        }

        // 5. 결과 합치기
        results.push(...Array.from(buildingMap.values()));
        results.push(...Array.from(restroomMap.values()));

        resolve(results);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};
