/**
 * Firestore 기반 시간표 저장소
 *
 * 데이터 구조:
 *   /timetables/{studentId}
 *     - studentId: 학번
 *     - name: 이름
 *     - semesters: { "2026-10": [강의 배열], ... }
 *     - updatedAt: ISO timestamp
 *
 * 학번이 사용자 ID 역할을 함 (시립대 포털 로그인으로 검증됨).
 */

import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'

const COLLECTION = 'timetables'

/**
 * 사용자의 시간표 전체 가져오기
 *
 * @param {string} studentId
 * @returns {Promise<Object>} { "2026-10": [강의들], ... }
 */
export async function loadTimetables(studentId) {
  if (!studentId) return {}
  try {
    const snap = await getDoc(doc(db, COLLECTION, String(studentId)))
    if (!snap.exists()) return {}
    const data = snap.data()
    return data.semesters || {}
  } catch (err) {
    console.warn('[timetableStore] 로드 실패:', err.message)
    return {}
  }
}

/**
 * 사용자의 시간표 전체 저장 (덮어쓰기)
 *
 * @param {string} studentId
 * @param {Object} semesters - { "2026-10": [강의들], ... }
 * @param {Object} meta - { name?: string }
 */
export async function saveTimetables(studentId, semesters, meta = {}) {
  if (!studentId) throw new Error('학번이 필요해요')
  try {
    await setDoc(
      doc(db, COLLECTION, String(studentId)),
      {
        studentId: String(studentId),
        name: meta.name || null,
        semesters: semesters || {},
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    )
    return true
  } catch (err) {
    console.warn('[timetableStore] 저장 실패:', err.message)
    return false
  }
}
