import { collection, doc, getDocs, getDoc, setDoc, deleteDoc, query, orderBy, onSnapshot, runTransaction } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from './firebase'
import type { Festival, Report, PressArticle, GalleryImage, Hotspot } from './types'

// 클라우드 스토리지 파일 업로드
export async function uploadToStorage(file: File | Blob, path: string): Promise<string> {
  const storageRef = ref(storage, path)
  const snapshot = await uploadBytes(storageRef, file)
  return await getDownloadURL(snapshot.ref)
}

// 축제 데이터 가져오기
export async function getFestivals(): Promise<Festival[]> {
  try {
    const snapshot = await getDocs(collection(db, 'festivals'))
    if (snapshot.empty) return []
    const reqs: Festival[] = []
    snapshot.forEach(d => {
      const data = d.data() as Festival
      if (data && data.id) {
        reqs.push(data)
      }
    })
    // id가 없는 데이터가 섞여 있어도 멈추지 않도록 안전 정렬
    return reqs.sort((a, b) => (a.id || '').localeCompare(b.id || ''))
  } catch (err) {
    console.error('Critical fail in getFestivals:', err)
    return []
  }
}

// 실시간 축제 데이터 구독
export function subscribeToFestivals(callback: (festivals: Festival[]) => void) {
  const q = query(collection(db, 'festivals'))
  return onSnapshot(q, (snapshot) => {
    const fests: Festival[] = []
    snapshot.forEach(d => {
      const data = d.data() as Festival
      if (data && data.id) fests.push(data)
    })
    callback(fests.sort((a, b) => (a.id || '').localeCompare(b.id || '')))
  }, (err) => {
    console.error('Snapshot error (festivals):', err)
  })
}

// 단일 축제 저장(업데이트)
export async function saveFestival(festival: Festival): Promise<void> {
  await setDoc(doc(db, 'festivals', festival.id), festival)
}

// 축제 삭제
export async function deleteFestival(festivalId: string): Promise<void> {
  await deleteDoc(doc(db, 'festivals', festivalId))
}

// 축제 메타데이터만 원자적으로 업데이트 (트랜잭션 사용)
export async function updateFestivalMetadata(festivalId: string, updates: Partial<Festival>): Promise<void> {
  const festRef = doc(db, 'festivals', festivalId)
  await runTransaction(db, async (transaction) => {
    const festDoc = await transaction.get(festRef)
    if (!festDoc.exists()) throw new Error('축제가 존재하지 않습니다.')
    transaction.update(festRef, updates)
  })
}

// 특정 핫스팟만 원자적으로 업데이트/추가 (트랜잭션 사용)
export async function updateHotspotInFestival(festivalId: string, hotspot: Hotspot): Promise<void> {
  const festRef = doc(db, 'festivals', festivalId)
  await runTransaction(db, async (transaction) => {
    const festDoc = await transaction.get(festRef)
    if (!festDoc.exists()) throw new Error('축제가 존재하지 않습니다.')
    
    const data = festDoc.data() as Festival
    const hotspots = [...(data.hotspots || [])]
    const idx = hotspots.findIndex(h => h.id === hotspot.id)
    
    if (idx > -1) {
      hotspots[idx] = hotspot // 업데이트
    } else {
      hotspots.push(hotspot) // 추가
    }
    
    transaction.update(festRef, { hotspots })
  })
}

// 특정 핫스팟만 원자적으로 삭제 (트랜잭션 사용)
export async function deleteHotspotFromFestival(festivalId: string, hotspotId: string): Promise<void> {
  const festRef = doc(db, 'festivals', festivalId)
  await runTransaction(db, async (transaction) => {
    const festDoc = await transaction.get(festRef)
    if (!festDoc.exists()) throw new Error('축제가 존재하지 않습니다.')
    
    const data = festDoc.data() as Festival
    const hotspots = (data.hotspots || []).filter(h => h.id !== hotspotId)
    
    transaction.update(festRef, { hotspots })
  })
}

export async function getSetting(key: string): Promise<string | null> {
  const docSnap = await getDoc(doc(db, 'settings', key))
  return docSnap.exists() ? docSnap.data().value : null
}

export async function saveSetting(key: string, value: string): Promise<void> {
  await setDoc(doc(db, 'settings', key), { value })
}

// --- 신고 센터 관련 ---
export async function getReports(): Promise<Report[]> {
  const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)
  if (snapshot.empty) return []
  const reqs: Report[] = []
  snapshot.forEach(d => reqs.push(d.data() as Report))
  return reqs
}

// 실시간 제보 데이터 구독
export function subscribeToReports(callback: (reports: Report[]) => void) {
  const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snapshot) => {
    const reports: Report[] = []
    snapshot.forEach(d => reports.push(d.data() as Report))
    callback(reports)
  }, (err) => {
    console.error('Snapshot error (reports):', err)
  })
}

export async function saveReport(report: Report): Promise<void> {
  await setDoc(doc(db, 'reports', report.id), report)
}

export async function deleteReport(reportId: string): Promise<void> {
  await deleteDoc(doc(db, 'reports', reportId))
}

// --- 보도자료(Press) 관련 ---
export async function getPress(): Promise<PressArticle[]> {
  const q = query(collection(db, 'press'), orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)
  if (snapshot.empty) return []
  const reqs: PressArticle[] = []
  snapshot.forEach(d => reqs.push(d.data() as PressArticle))
  return reqs
}

export async function savePress(article: PressArticle): Promise<void> {
  await setDoc(doc(db, 'press', article.id), article)
}

export async function deletePress(articleId: string): Promise<void> {
  await deleteDoc(doc(db, 'press', articleId))
}

// --- 갤러리(Gallery) 관련 ---
export async function getGallery(): Promise<GalleryImage[]> {
  const q = query(collection(db, 'gallery'), orderBy('createdAt', 'desc'))
  const snapshot = await getDocs(q)
  if (snapshot.empty) return []
  const reqs: GalleryImage[] = []
  snapshot.forEach(d => reqs.push(d.data() as GalleryImage))
  return reqs
}

export async function saveGallery(image: GalleryImage): Promise<void> {
  await setDoc(doc(db, 'gallery', image.id), image)
}

export async function deleteGallery(imageId: string): Promise<void> {
  await deleteDoc(doc(db, 'gallery', imageId))
}

// --- Audit Logs (행위 추적) ---
export async function logAction(action: string, entityId: string, details: any): Promise<void> {
  try {
    const auditId = `log-${Date.now()}`;
    await setDoc(doc(db, 'audit_logs', auditId), {
      action,
      entityId,
      details: JSON.stringify(details),
      timestamp: Date.now(),
      userAgent: navigator.userAgent
    });
  } catch (err) {
    // Audit log failure shouldn't stop the main action but should be suppressed
    console.warn('Logging failed silently.');
  }
}

// 초기 데이터 세팅용 (만약 서버가 비어있다면)
export async function seedInitialData(festivals: Festival[]) {
  for (const f of festivals) {
    await saveFestival(f);
    await logAction('SEED_DATA', f.id, { name: f.name });
  }
}
