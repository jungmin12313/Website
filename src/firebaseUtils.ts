import { collection, doc, getDocs, getDoc, setDoc, deleteDoc, query, orderBy } from 'firebase/firestore'
import { db } from './firebase'
import type { Festival, Report } from './types'

// 축제 데이터 가져오기
export async function getFestivals(): Promise<Festival[]> {
  const snapshot = await getDocs(collection(db, 'festivals'))
  if (snapshot.empty) return []
  const reqs: Festival[] = []
  snapshot.forEach(d => reqs.push(d.data() as Festival))
  return reqs.sort((a, b) => a.id.localeCompare(b.id)) // ID순(또는 원하는 순서) 정렬
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

// 초기 데이터 세팅용 (만약 서버가 비어있다면)
export async function seedInitialData(festivals: Festival[]) {
  for (const f of festivals) {
    await saveFestival(f)
  }
}
