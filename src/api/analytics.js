/**
 * 방문/로그인 통계 (관리자 전용)
 *
 * Firestore 컬렉션:
 *   - visits/{auto-id}: 페이지 방문 기록
 *     - studentId, path, timestamp, userAgent
 *   - logins/{auto-id}: 로그인 이벤트
 *     - studentId, success, timestamp
 *   - users/{studentId}: 사용자 누적 정보
 *     - firstSeen, lastSeen, visitCount
 *
 * 보안 모델: 156명 대상 소규모 프로젝트 — 관리자 게이트는 클라이언트 사이드.
 * 학생 ID 외 민감 정보는 저장 X (IP, 비번 등 절대 X).
 */

import { db } from '../firebase'
import {
  collection,
  addDoc,
  doc,
  getDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  increment,
} from 'firebase/firestore'

const VISITS = 'visits'
const LOGINS = 'logins'
const USERS = 'users'

// 같은 페이지 방문은 5분에 한 번만 기록 (스팸 방지)
const VISIT_DEDUP_WINDOW_MS = 5 * 60 * 1000
const lastLogged = new Map() // key: `${studentId}-${path}`, value: timestamp

/**
 * 페이지 방문 기록
 */
export async function logVisit({ studentId, path }) {
  if (!studentId || !path) return
  const dedupKey = `${studentId}-${path}`
  const now = Date.now()
  const last = lastLogged.get(dedupKey) || 0
  if (now - last < VISIT_DEDUP_WINDOW_MS) return
  lastLogged.set(dedupKey, now)

  try {
    await addDoc(collection(db, VISITS), {
      studentId: String(studentId),
      path: String(path).slice(0, 100),
      timestamp: serverTimestamp(),
      userAgent: (navigator.userAgent || '').slice(0, 200),
    })
    // 사용자 누적 정보 업데이트
    await setDoc(
      doc(db, USERS, String(studentId)),
      {
        studentId: String(studentId),
        lastSeen: serverTimestamp(),
        visitCount: increment(1),
      },
      { merge: true },
    )
    // firstSeen은 없을 때만
    const userDoc = await getDoc(doc(db, USERS, String(studentId)))
    if (userDoc.exists() && !userDoc.data().firstSeen) {
      await setDoc(
        doc(db, USERS, String(studentId)),
        { firstSeen: serverTimestamp() },
        { merge: true },
      )
    }
  } catch {
    // 분석 로깅 실패는 무시 — 사용자 경험에 영향 X
  }
}

/**
 * 로그인 이벤트 기록
 */
export async function logLogin({ studentId, success }) {
  if (!studentId) return
  try {
    await addDoc(collection(db, LOGINS), {
      studentId: String(studentId),
      success: !!success,
      timestamp: serverTimestamp(),
    })
  } catch {
    // 무시
  }
}

/**
 * 관리자: 최근 방문 가져오기
 * @param {number} count 가져올 개수 (기본 100)
 */
export async function fetchRecentVisits(count = 100) {
  const q = query(collection(db, VISITS), orderBy('timestamp', 'desc'), limit(count))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

/**
 * 관리자: 최근 로그인 가져오기
 */
export async function fetchRecentLogins(count = 50) {
  const q = query(collection(db, LOGINS), orderBy('timestamp', 'desc'), limit(count))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

/**
 * 관리자: 사용자 목록 가져오기 (방문 횟수 많은 순)
 */
export async function fetchAllUsers(count = 200) {
  const q = query(collection(db, USERS), orderBy('lastSeen', 'desc'), limit(count))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

/**
 * 관리자: 오늘 통계 요약
 * 최근 24시간 데이터로 계산
 */
export async function fetchTodayStats() {
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
  try {
    const visitsQ = query(
      collection(db, VISITS),
      where('timestamp', '>=', oneDayAgo),
    )
    const loginsQ = query(
      collection(db, LOGINS),
      where('timestamp', '>=', oneDayAgo),
    )
    const [visitsSnap, loginsSnap] = await Promise.all([
      getDocs(visitsQ),
      getDocs(loginsQ),
    ])
    const visits = visitsSnap.docs.map((d) => d.data())
    const logins = loginsSnap.docs.map((d) => d.data())
    const uniqueVisitors = new Set(visits.map((v) => v.studentId)).size
    const loginCount = logins.filter((l) => l.success).length
    return {
      visitCount: visits.length,
      uniqueVisitors,
      loginCount,
    }
  } catch {
    return { visitCount: 0, uniqueVisitors: 0, loginCount: 0 }
  }
}
