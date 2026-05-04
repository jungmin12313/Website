import * as XLSX from 'xlsx';
import type { Hotspot } from '../types';

export type ParsedExcelItem = Partial<Hotspot> & {
  sourceExcelId: string;
  category: 'building' | 'pathway' | 'elevator' | 'restroom';
  accessibilityGrade: 'G' | 'Y' | 'R';
  title: string;
  subtitle: string;
  rawData?: any; // 원본 행 데이터 보존 (수동 통합 시 필요)
};

// --- 교통약자이동편의증진법 법적 기준 상수 ---
export const ACCESSIBILITY_STANDARDS = {
  DOOR_WIDTH_MIN: 90,    // cm (승강기/주출입구 문 너비)
  RAMP_SLOPE_MAX: 4.76,  // 도 (1/12 이하)
  STEP_HEIGHT_MAX: 2,    // cm (단차)
  RESTROOM_WIDTH_MIN: 140, // cm
  RESTROOM_DEPTH_MIN: 180, // cm
};

// 기준 충족 여부 판단 유틸리티
const checkCompliance = (value: number | undefined, standard: number, type: 'min' | 'max'): string => {
  if (value === undefined || isNaN(value)) return '';
  const isCompliant = type === 'min' ? value >= standard : value <= standard;
  return isCompliant ? ' (기준 충족)' : ' (기준 미달)';
};

const parseGPS = (gpsStr: any) => {
  if (!gpsStr || typeof gpsStr !== 'string') return undefined;
  const parts = gpsStr.split(',').map(s => parseFloat(s.trim()));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) return { lat: parts[0], lng: parts[1] };
  return undefined;
};

// 엑셀 행을 서술형 문구 리스트로 변환 (법적 기준 반영)
export const formatAccessibilityInfo = (category: string, row: any): string[] => {
  const desc: string[] = [];
  
  if (category === 'building') {
    const width = Number(row['출입문_유효_너비'] || row['문_너비(cm)']);
    if (width) desc.push(`🏢 [건물] 주출입구 유효폭 ${width}cm${checkCompliance(width, ACCESSIBILITY_STANDARDS.DOOR_WIDTH_MIN, 'min')}`);
    
    const step = Number(row['단차_높이'] || row['단차_높이(cm)']);
    if (step !== undefined) desc.push(`🏢 [건물] 주출입구 단차 ${step}cm${checkCompliance(step, ACCESSIBILITY_STANDARDS.STEP_HEIGHT_MAX, 'max')}`);
    
    const slope = Number(row['경사로_기울기']);
    if (slope) desc.push(`🏢 [건물] 경사로 기울기 ${slope}도${checkCompliance(slope, ACCESSIBILITY_STANDARDS.RAMP_SLOPE_MAX, 'max')}`);
  } 
  else if (category === 'restroom') {
    const width = Number(row['출입문_너비']);
    if (width) desc.push(`🚻 [화장실] 입구 유효폭 ${width}cm${checkCompliance(width, ACCESSIBILITY_STANDARDS.DOOR_WIDTH_MIN, 'min')}`);
    
    const spaceX = Number(row['가로_유효_크기']);
    const spaceY = Number(row['세로_유효_크기']);
    if (spaceX && spaceY) {
      const isOk = spaceX >= ACCESSIBILITY_STANDARDS.RESTROOM_WIDTH_MIN && spaceY >= ACCESSIBILITY_STANDARDS.RESTROOM_DEPTH_MIN;
      desc.push(`🚻 [화장실] 내부 공간 ${spaceX}x${spaceY}cm${isOk ? ' (기준 충족)' : ' (기준 미달)'}`);
    }
  }
  else if (category === 'elevator') {
    const width = Number(row['출입문_너비']);
    if (width) desc.push(`♿ [엘리베이터] 문 너비 ${width}cm${checkCompliance(width, ACCESSIBILITY_STANDARDS.DOOR_WIDTH_MIN, 'min')}`);
    
    const internal = String(row['내부_크기'] || '');
    if (internal) desc.push(`♿ [엘리베이터] 내부 크기: ${internal}`);
  }

  return desc.filter(Boolean);
};

// 구글 드라이브 주소 변환 (임시 유지, 향후 서버 업로드로 대체 권장)
const convertDrivePathToUrl = async (path: string): Promise<string> => {
  if (!path) return '';
  const idMatch = path.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || path.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch) return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
  return path;
};

export const parseExcelHotspots = (file: File): Promise<ParsedExcelItem[]> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const getSheet = (n: string) => workbook.Sheets[n] ? XLSX.utils.sheet_to_json(workbook.Sheets[n]) : [];

      const categories: ('building' | 'restroom' | 'pathway' | 'elevator')[] = ['건물', '화장실', '보행로', '엘리베이터'] as any;
      const allItems: ParsedExcelItem[] = [];

      for (const cat of categories) {
        const rows = getSheet(cat);
        const sheetName = cat === '건물' ? 'building' : cat === '화장실' ? 'restroom' : cat === '보행로' ? 'pathway' : 'elevator';
        
        for (const row of rows as any[]) {
          allItems.push({
            sourceExcelId: String(row['ID'] || ''),
            category: sheetName as any,
            accessibilityGrade: row['색_구분'] || 'Y',
            title: String(row['건물명'] || row['화장실명'] || row['엘리베이터명'] || row['보행로_이름'] || '이름 없음'),
            label: String(row['건물명'] || row['화장실명'] || row['엘리베이터명'] || row['보행로_이름'] || '이름 없음'),
            description: formatAccessibilityInfo(sheetName, row),
            note: String(row['기타'] || ''),
            gps: parseGPS(row['위치_GPS']),
            rawData: row // 나중에 수동 통합 시 참조하기 위해 저장
          });
        }
      }
      resolve(allItems);
    };
    reader.readAsArrayBuffer(file);
  });
};
