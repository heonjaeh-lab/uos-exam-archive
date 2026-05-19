/**
 * 시간표 이미지 다운로드 + 공유 URL 생성
 */

import html2canvas from 'html2canvas'
import { db } from '../firebase'
import { collection, addDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore'

const SHARED_COLLECTION = 'shared_timetables'

/**
 * DOM 요소를 PNG 이미지로 다운로드
 * @param {HTMLElement} element - 캡처할 요소
 * @param {string} filename - 저장 파일명
 */
export async function downloadAsImage(element, filename = 'timetable.png') {
  if (!element) throw new Error('캡처할 요소가 없어요')

  const canvas = await html2canvas(element, {
    backgroundColor: '#ffffff',
    scale: 2, // 2배 해상도 (Retina)
    useCORS: true,
    logging: false,
  })

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('이미지 생성 실패'))
        return
      }
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      resolve()
    }, 'image/png')
  })
}

/**
 * 시간표를 Firestore에 저장하고 공유 ID 반환
 * @param {Object} payload - { ownerName, semesterKey, courses }
 * @returns {Promise<string>} shareId
 */
export async function createSharedTimetable(payload) {
  const docRef = await addDoc(collection(db, SHARED_COLLECTION), {
    ownerName: payload.ownerName || '익명',
    semesterKey: payload.semesterKey || '',
    courses: payload.courses || [],
    createdAt: serverTimestamp(),
  })
  return docRef.id
}

/**
 * 공유된 시간표 가져오기
 * @param {string} shareId
 */
export async function fetchSharedTimetable(shareId) {
  const snap = await getDoc(doc(db, SHARED_COLLECTION, shareId))
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() }
}

/**
 * 공유 URL 생성 (현재 도메인 + hash 라우터 + /share/:id)
 */
export function buildShareUrl(shareId) {
  const base = window.location.origin + import.meta.env.BASE_URL
  return `${base}#/share/${shareId}`
}
