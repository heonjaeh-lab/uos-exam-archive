import { useState, useEffect, useMemo, useRef } from 'react'
import { fetchTimetable, TERM } from '../api/uos'
import { parseClassNm, isConflicting } from '../utils/parseClassNm'
import TimetableGrid from '../components/TimetableGrid'
import CourseSearchPanel from '../components/CourseSearchPanel'
import PortalLoginModal from '../components/PortalLoginModal'
import { useUser, clearUser } from '../utils/user'
import { loadTimetables, saveTimetables } from '../api/timetableStore'
import { matchPortalCourses } from '../utils/portalCourseMatch'
import { koreaNow } from '../utils/koreaTime'
import { downloadAsImage, createSharedTimetable, buildShareUrl } from '../utils/timetableShare'

const STORAGE_KEY = 'uos-timetable-v1'

// 기본값: 한국 시간 기준 현재 연도 / 현재 정규학기 (9월부터 2학기)
const DEFAULT_YEAR = koreaNow().year
const DEFAULT_TERM = koreaNow().month >= 9 ? TERM.FALL : TERM.SPRING

export default function TimetablePage() {
  const [year, setYear] = useState(DEFAULT_YEAR)
  const [term, setTerm] = useState(DEFAULT_TERM)
  const [allCourses, setAllCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [downloading, setDownloading] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [shareLink, setShareLink] = useState('')
  const gridRef = useRef(null)

  // 시간표에 추가한 강의들 (학년/학기별로 분리 저장)
  const [savedTimetables, setSavedTimetables] = useState({})
  const [syncStatus, setSyncStatus] = useState(null) // 'syncing' | 'saved' | null
  const initialLoadDone = useRef(false)

  // 포털 로그인 모달
  const [portalModalOpen, setPortalModalOpen] = useState(false)
  const [importStatus, setImportStatus] = useState(null)

  // 사용자 (학번)
  const user = useUser()

  const currentKey = `${year}-${term}`
  const addedCourses = savedTimetables[currentKey] || []

  // 페이지 진입 시 시간표 로드
  // - 로그인 사용자: Firestore에서 + localStorage fallback
  // - 비로그인: localStorage만
  useEffect(() => {
    initialLoadDone.current = false
    ;(async () => {
      // localStorage 먼저 (즉시 표시)
      try {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) setSavedTimetables(JSON.parse(saved))
      } catch {}

      // 로그인되어 있으면 Firestore에서 최신 데이터 덮어쓰기
      if (user?.studentId) {
        setSyncStatus('syncing')
        const remote = await loadTimetables(user.studentId)
        // Firestore에 데이터가 있으면 그걸 사용 (없으면 localStorage 유지)
        if (remote && Object.keys(remote).length > 0) {
          setSavedTimetables(remote)
        }
        setSyncStatus('saved')
        setTimeout(() => setSyncStatus(null), 1500)
      }
      initialLoadDone.current = true
    })()
  }, [user?.studentId])

  // 시간표 변경 시 저장 (localStorage 즉시 + Firestore 디바운스)
  useEffect(() => {
    if (!initialLoadDone.current) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedTimetables))
    } catch {}

    if (!user?.studentId) return
    const handle = setTimeout(async () => {
      setSyncStatus('syncing')
      const ok = await saveTimetables(user.studentId, savedTimetables, { name: user.name })
      setSyncStatus(ok ? 'saved' : null)
      setTimeout(() => setSyncStatus(null), 1500)
    }, 800)
    return () => clearTimeout(handle)
  }, [savedTimetables, user?.studentId, user?.name])

  // 학년/학기 변경 시 강의 목록 다시 가져오기
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchTimetable(year, term)
      .then((data) => {
        if (!cancelled) setAllCourses(data)
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message)
          setAllCourses([])
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [year, term])

  // 강의 추가 (충돌 검사 포함)
  const handleAdd = (course) => {
    const newBlocks = parseClassNm(course.CLASS_NM)
    if (newBlocks.length === 0) {
      const ok = window.confirm(
        `'${course.SUBJECT_NM}' 강의는 시간 정보가 없어요. 그래도 추가할까요?`,
      )
      if (!ok) return
    }

    // 충돌 검사
    for (const existing of addedCourses) {
      const existingBlocks = parseClassNm(existing.CLASS_NM)
      if (isConflicting(newBlocks, existingBlocks)) {
        const ok = window.confirm(
          `'${existing.SUBJECT_NM}'와(과) 시간이 겹쳐요. 그래도 추가할까요?`,
        )
        if (!ok) return
        break
      }
    }

    setSavedTimetables((prev) => ({
      ...prev,
      [currentKey]: [...(prev[currentKey] || []), course],
    }))
  }

  const handleRemove = (course) => {
    setSavedTimetables((prev) => ({
      ...prev,
      [currentKey]: (prev[currentKey] || []).filter(
        (c) => !(c.SUBJECT_NO === course.SUBJECT_NO && c.DVCL_NO === course.DVCL_NO),
      ),
    }))
  }

  const handleClear = () => {
    if (addedCourses.length === 0) return
    if (!window.confirm('이 학기 시간표를 모두 지울까요?')) return
    setSavedTimetables((prev) => {
      const next = { ...prev }
      delete next[currentKey]
      return next
    })
  }

  // 시간표 이미지 다운로드
  const handleDownloadImage = async () => {
    if (!gridRef.current || downloading) return
    setDownloading(true)
    try {
      const filename = `시간표_${year}-${term === TERM.SPRING ? '1' : '2'}학기.png`
      await downloadAsImage(gridRef.current, filename)
    } catch (err) {
      window.alert('이미지 저장 실패: ' + err.message)
    } finally {
      setDownloading(false)
    }
  }

  // 시간표 공유 URL 생성
  const handleShare = async () => {
    if (!addedCourses.length || sharing) return
    setSharing(true)
    try {
      const shareId = await createSharedTimetable({
        ownerName: user?.name || user?.studentId || '익명',
        semesterKey: currentKey,
        courses: addedCourses,
      })
      const url = buildShareUrl(shareId)
      setShareLink(url)
      // 클립보드에 자동 복사 시도
      try {
        await navigator.clipboard.writeText(url)
      } catch {
        // 권한 없으면 그냥 표시만
      }
    } catch (err) {
      window.alert('공유 링크 생성 실패: ' + err.message)
    } finally {
      setSharing(false)
    }
  }

  // 포털에서 시간표 자동 가져오기 결과 처리
  const handlePortalImport = (portalData) => {
    const portalRows = portalData?.coursesRaw || portalData?.courses || []

    if (!portalRows.length) {
      setImportStatus({
        type: 'error',
        msg: '포털에서 시간표 데이터를 찾지 못했어요. 본인 시간표 페이지에 강의가 등록되어 있나요?',
      })
      return
    }

    if (allCourses.length === 0) {
      setImportStatus({
        type: 'error',
        msg: '현재 학기 강의 목록을 아직 불러오지 못했어요. 잠시 후 다시 시도해주세요.',
      })
      return
    }

    const { matched, unmatched } = matchPortalCourses(portalRows, allCourses)

    if (matched.length === 0) {
      setImportStatus({
        type: 'error',
        msg: '매칭되는 강의를 찾지 못했어요. 선택한 연도/학기가 포털 시간표와 같은지 확인해주세요.',
      })
      return
    }

    // 시간표에 추가 (중복 제거)
    setSavedTimetables((prev) => {
      const existing = prev[currentKey] || []
      const existingKeys = new Set(existing.map((c) => `${c.SUBJECT_NO}-${c.DVCL_NO}`))
      const newOnes = matched.filter(
        (c) => !existingKeys.has(`${c.SUBJECT_NO}-${c.DVCL_NO}`),
      )
      return {
        ...prev,
        [currentKey]: [...existing, ...newOnes],
      }
    })

    setImportStatus({
      type: 'success',
      msg: `✅ ${matched.length}개 강의를 시간표에 추가했어요${
        unmatched.length ? ` (${unmatched.length}개는 매칭 실패)` : ''
      }`,
    })
  }

  // 요약 정보
  const totalCredits = useMemo(
    () => addedCourses.reduce((sum, c) => sum + (c.CREDIT || 0), 0),
    [addedCourses],
  )

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">시간표</h2>
          {user?.studentId && (
            <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
              <span>📌 학번 <strong className="text-gray-700">{user.studentId}</strong>로 자동 저장 중</span>
              {syncStatus === 'syncing' && <span className="text-uos-blue">동기화 중...</span>}
              {syncStatus === 'saved' && <span className="text-emerald-600">✓ 저장됨</span>}
              <button
                onClick={() => {
                  if (window.confirm('로그아웃하면 다른 기기에서 시간표 동기화가 끊깁니다. 계속할까요?')) {
                    clearUser()
                  }
                }}
                className="text-gray-400 underline hover:text-gray-600 bg-transparent border-none cursor-pointer p-0 text-xs"
              >
                로그아웃
              </button>
            </div>
          )}
        </div>

        {/* 학년/학기 + 자동 가져오기 */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setPortalModalOpen(true)}
            className="px-4 py-2 bg-uos-blue text-white text-sm font-medium rounded-lg hover:bg-uos-dark border-none cursor-pointer transition-colors flex items-center gap-1.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            포털에서 가져오기
          </button>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-uos-blue bg-white"
          >
            {[DEFAULT_YEAR + 1, DEFAULT_YEAR, DEFAULT_YEAR - 1, DEFAULT_YEAR - 2].map((y) => (
              <option key={y} value={y}>{y}년</option>
            ))}
          </select>
          <select
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-uos-blue bg-white"
          >
            <option value={TERM.SPRING}>1학기</option>
            <option value={TERM.FALL}>2학기</option>
          </select>
        </div>
      </div>

      {/* 가져오기 결과 메시지 */}
      {importStatus && (
        <div
          className={`rounded-lg p-3 text-sm flex items-start justify-between gap-3 ${
            importStatus.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border border-rose-200 text-rose-800'
          }`}
        >
          <span>{importStatus.msg}</span>
          <button
            onClick={() => setImportStatus(null)}
            className="text-current opacity-50 hover:opacity-100 bg-transparent border-none cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* 요약 카드 */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-xs text-gray-500">담은 강의</div>
          <div className="text-xl font-bold text-gray-900 mt-1">
            {addedCourses.length}<span className="text-sm font-normal text-gray-400 ml-1">개</span>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-xs text-gray-500">총 학점</div>
          <div className="text-xl font-bold text-uos-blue mt-1">
            {totalCredits}<span className="text-sm font-normal text-gray-400 ml-1">학점</span>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500">초기화</div>
            <button
              onClick={handleClear}
              disabled={addedCourses.length === 0}
              className="text-sm font-medium text-rose-600 hover:text-rose-700 disabled:text-gray-300 disabled:cursor-not-allowed bg-transparent border-none p-0 cursor-pointer mt-1"
            >
              모두 삭제
            </button>
          </div>
        </div>
      </div>

      {/* 로딩/에러 상태 */}
      {loading && (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center text-sm text-gray-500">
          시립대 서버에서 강의 목록을 불러오는 중...
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-sm text-rose-700">
          <strong>강의 정보 로딩 실패</strong> — {error}
          <div className="text-xs text-rose-500 mt-1">
            (CORS 문제일 수 있어요. 개발자에게 알려주세요.)
          </div>
        </div>
      )}

      {/* 메인 영역 */}
      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
          {/* 시간표 그리드 */}
          <div>
            {addedCourses.length === 0 ? (
              <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
                <div className="text-4xl mb-3">📅</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-1">시간표가 비어있어요</h3>
                <p className="text-sm text-gray-500 mb-4">
                  <button
                    onClick={() => setPortalModalOpen(true)}
                    className="text-uos-blue underline hover:no-underline bg-transparent border-none cursor-pointer p-0 text-sm"
                  >
                    포털 계정으로 자동 가져오기
                  </button>
                  {' '}또는 오른쪽에서 직접 검색해보세요
                </p>
              </div>
            ) : (
              <div ref={gridRef} style={{ background: '#fff' }}>
                <TimetableGrid courses={addedCourses} onRemove={handleRemove} />
              </div>
            )}
            {/* 시간표 액션: 이미지 다운로드 + 공유 (강의 있을 때만) */}
            {addedCourses.length > 0 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                <button
                  onClick={handleDownloadImage}
                  disabled={downloading}
                  className="uos-btn"
                  style={{ flex: 1, minWidth: 140, justifyContent: 'center' }}
                >
                  {downloading ? '이미지 만드는 중...' : '🖼️ 이미지로 저장'}
                </button>
                <button
                  onClick={handleShare}
                  disabled={sharing}
                  className="uos-btn uos-btn--primary"
                  style={{ flex: 1, minWidth: 140, justifyContent: 'center' }}
                >
                  {sharing ? '공유 링크 만드는 중...' : '🔗 친구에게 공유'}
                </button>
              </div>
            )}
            {shareLink && (
              <div
                style={{
                  marginTop: 10,
                  padding: '12px 14px',
                  background: 'var(--c-primary-50)',
                  border: '1px solid var(--c-primary-100, #cce5ff)',
                  borderRadius: 10,
                  fontSize: 12.5,
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 6 }}>공유 링크 생성됨 (클립보드 복사됨)</div>
                <div style={{ wordBreak: 'break-all', color: 'var(--c-text-3)' }}>{shareLink}</div>
              </div>
            )}
          </div>

          {/* 검색 패널 */}
          <CourseSearchPanel
            allCourses={allCourses}
            addedCourses={addedCourses}
            onAdd={handleAdd}
          />
        </div>
      )}

      {/* 포털 로그인 모달 */}
      <PortalLoginModal
        open={portalModalOpen}
        onClose={() => setPortalModalOpen(false)}
        onSuccess={handlePortalImport}
      />
    </div>
  )
}
