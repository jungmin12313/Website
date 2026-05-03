import * as XLSX from 'xlsx';
import type { Hotspot } from '../types';

export type ParsedExcelItem = Partial<Hotspot> & {
  sourceExcelId: string;
  category: 'building' | 'pathway' | 'elevator' | 'restroom';
  accessibilityGrade: 'G' | 'Y' | 'R';
  title: string;
  subtitle: string;
};

const parseGPS = (gpsStr: any) => {
  if (!gpsStr || typeof gpsStr !== 'string') return undefined;
  const parts = gpsStr.split(',').map(s => parseFloat(s.trim()));
  if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) return { lat: parts[0], lng: parts[1] };
  return undefined;
};

const convertDrivePathToUrl = async (path: string): Promise<string> => {
  if (!path) return '';
  if (path.includes('drive.google.com') || path.includes('id=')) {
    let fileId = '';
    const fileDMatch = path.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileDMatch) fileId = fileDMatch[1];
    else {
      const idMatch = path.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (idMatch) fileId = idMatch[1];
    }
    if (fileId) return `https://lh3.googleusercontent.com/d/${fileId}`;
  }
  return path;
};

const getPhotosForId = async (id: string, rawPath: string, photoSheet: any[]): Promise<{ url: string; label: string }[]> => {
  const photoList: { url: string; label: string }[] = [];
  if (rawPath && photoSheet && Array.isArray(photoSheet)) {
    const fileName = String(rawPath).split('/').pop() || String(rawPath);
    const mainRow = photoSheet.find(row => 
      String(row['사진파일'] || '').includes(fileName) || String(row['부모ID'] || '') === id
    );
    if (mainRow && mainRow['사진파일']) {
      const url = await convertDrivePathToUrl(String(mainRow['사진파일']));
      if (url) photoList.push({ url, label: '정면 사진' });
    }
  }
  if (photoSheet && Array.isArray(photoSheet)) {
    const related = photoSheet.filter(row => String(row['부모ID'] || '') === id);
    for (const row of related) {
      const url = await convertDrivePathToUrl(String(row['사진파일'] || ''));
      if (url && !photoList.some(p => p.url === url)) {
        photoList.push({ url, label: String(row['사진설명'] || '추가 사진') });
      }
    }
  }
  return photoList;
};

const processBuilding = async (row: any, photoSheet: any[]) => {
  const id = String(row['ID'] || '');
  const title = String(row['조사지 건물명'] || row['건물명'] || '건물');
  const desc = [
    row['출입문_형태'] && `주출입구 ${row['출입문_형태']} 설치`,
    row['출입문_유효_너비'] && `출입문 유효폭 ${row['출입문_유효_너비']}cm`,
    row['단차_높이'] !== undefined && `단차 ${row['단차_높이']}cm`,
    row['경사로_유무'] === 'TRUE' && `경사로 설치 (기울기 ${row['경사로_기울기']}°)`,
  ].filter(Boolean) as string[];
  return {
    sourceExcelId: id, category: 'building', accessibilityGrade: row['색_구분'] || 'Y',
    title, label: title, description: desc, note: String(row['기타'] || ''),
    gps: parseGPS(row['위치_GPS']),
    photos: await getPhotosForId(id, row['출입문_정면사진'] || '', photoSheet)
  } as ParsedExcelItem;
};

const processRestroom = async (row: any, photoSheet: any[]) => {
  const id = String(row['ID'] || '');
  const title = String(row['화장실명'] || '화장실');
  const desc = [
    row['카테고리'] && `${row['카테고리']}`,
    row['출입문_너비'] && `출입문 유효폭 ${row['출입문_너비']}cm`,
    row['가로_유효_크기'] && `내부 크기: ${row['가로_유효_크기']}x${row['세로_유효_크기']}cm`,
  ].filter(Boolean) as string[];
  return {
    sourceExcelId: id, category: 'restroom', accessibilityGrade: row['색_구분'] || 'Y',
    title, label: title, description: desc, note: String(row['기타'] || ''),
    gps: parseGPS(row['위치_GPS']),
    photos: await getPhotosForId(id, row['화장실_사진'] || '', photoSheet)
  } as ParsedExcelItem;
};

const processPathway = async (row: any, photoSheet: any[]) => {
  const id = String(row['ID'] || '');
  return {
    sourceExcelId: id, category: 'pathway', accessibilityGrade: row['색_구분'] || 'Y',
    title: String(row['보행로_이름'] || '보행로'), label: '보행로',
    description: [row['보행로_너비'] && `보행로 유효폭 ${row['보행로_너비']}cm`].filter(Boolean),
    gps: parseGPS(row['위치_GPS']),
    photos: await getPhotosForId(id, row['보행로_사진'] || '', photoSheet)
  } as ParsedExcelItem;
};

const processElevator = async (row: any, photoSheet: any[]) => {
  const id = String(row['ID'] || '');
  return {
    sourceExcelId: id, category: 'elevator', accessibilityGrade: row['색_구분'] || 'Y',
    title: String(row['엘리베이터명'] || '엘리베이터'), label: '엘리베이터',
    description: [row['내부_크기'] && `내부 크기: ${row['내부_크기']}`].filter(Boolean),
    gps: parseGPS(row['위치_GPS']),
    photos: await getPhotosForId(id, row['엘리베이터_사진'] || '', photoSheet)
  } as ParsedExcelItem;
};

export const parseExcelHotspots = (file: File): Promise<ParsedExcelItem[]> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const getSheet = (n: string) => workbook.Sheets[n] ? XLSX.utils.sheet_to_json(workbook.Sheets[n]) : [];
      const bldgPhotos = getSheet('건물_사진');
      const restPhotos = getSheet('화장실_사진');
      const pathPhotos = getSheet('보행로_사진');
      const elevPhotos = getSheet('엘리베이터_사진');
      const buildingItems = await Promise.all(getSheet('건물').map(r => processBuilding(r, bldgPhotos)));
      const restroomItems = await Promise.all(getSheet('화장실').map(r => processRestroom(r, restPhotos)));
      const pathwayItems = await Promise.all(getSheet('보행로').map(r => processPathway(r, pathPhotos)));
      const elevatorItems = await Promise.all(getSheet('엘리베이터').map(r => processElevator(r, elevPhotos)));
      const buildingMap = new Map<string, ParsedExcelItem>();
      buildingItems.forEach(item => {
        const key = item.title.replace(/[^a-zA-Z0-9가-힣]/g, '').trim();
        buildingMap.set(key, item);
      });
      const finalRestrooms = new Map<string, ParsedExcelItem>();
      const results: ParsedExcelItem[] = [...pathwayItems];
      elevatorItems.forEach(item => {
        const clean = item.title.replace(/[^a-zA-Z0-9가-힣]/g, '').trim();
        let merged = false;
        for (const [bKey, parent] of buildingMap) {
          if (clean.includes(bKey) || bKey.includes(clean)) {
            parent.description = [...(parent.description || []), `[엘리베이터] ${item.title}: ${(item.description || []).join(', ')}`].filter(Boolean);
            parent.photos = Array.from(new Set([...(parent.photos as any[]), ...(item.photos as any[])]));
            merged = true; break;
          }
        }
        if (!merged) results.push(item);
      });
      restroomItems.forEach(item => {
        const clean = item.title.replace(/\s*\(?(남|여|남여|M|F|남성용|여성용|장애인용)\)?\s*/g, '').replace(/[^a-zA-Z0-9가-힣]/g, '').trim();
        let mergedToBuilding = false;
        for (const [bKey, parent] of buildingMap) {
          if (clean.includes(bKey)) {
            parent.description = [...(parent.description || []), `[내부 화장실] ${item.title}: ${(item.description || []).join(', ')}`].filter(Boolean);
            parent.photos = Array.from(new Set([...(parent.photos as any[]), ...(item.photos as any[])]));
            mergedToBuilding = true; break;
          }
        }
        if (!mergedToBuilding) {
          if (finalRestrooms.has(clean)) {
            const ex = finalRestrooms.get(clean)!;
            ex.description = Array.from(new Set([...(ex.description || []), ...(item.description || [])]));
            ex.photos = Array.from(new Set([...(ex.photos as any[]), ...(item.photos as any[])]));
          } else {
            item.title = clean; item.label = clean;
            finalRestrooms.set(clean, item);
          }
        }
      });
      resolve([...Array.from(buildingMap.values()), ...Array.from(finalRestrooms.values()), ...results]);
    };
    reader.readAsArrayBuffer(file);
  });
};
