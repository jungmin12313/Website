import { collection, doc, getDocs, getDoc, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore'
import { db } from './firebase'
import type { Festival, Report } from './types'

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

// 단일 축제 저장(업데이트)
export async function saveFestival(festival: Festival): Promise<void> {
  await setDoc(doc(db, 'festivals', festival.id), festival)
}

// 축제 삭제
export async function deleteFestival(festivalId: string): Promise<void> {
  await deleteDoc(doc(db, 'festivals', festivalId))
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

export async function saveReport(report: Report): Promise<void> {
  await setDoc(doc(db, 'reports', report.id), report)
}

export async function deleteReport(reportId: string): Promise<void> {
  await deleteDoc(doc(db, 'reports', reportId))
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
