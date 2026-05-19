const SUBJECT_FIELD_KEYS = [
  'SUBJECT_NO',
  'SUBJECTNO',
  'SUBJ_NO',
  'SBJT_NO',
  'SBJCT_NO',
  'COURSE_NO',
  'COURSE_CD',
  'SUBJECT_CD',
  'SBJT_CD',
  'SUB_NO',
]

const DVCL_FIELD_KEYS = [
  'DVCL_NO',
  'DVCLNO',
  'DIVCLS_NO',
  'CLASS_NO',
  'CLSS_NO',
  'BUNBAN',
  'TLSN_DVCL_NO',
  'OPEN_CLASS_NO',
]

const SUBJECT_NAME_KEYS = [
  'SUBJECT_NM',
  'SUBJECTNM',
  'SUBJ_NM',
  'SBJT_NM',
  'COURSE_NM',
  'KOR_SUBJECT_NM',
]

const PROF_NAME_KEYS = [
  'PROF_KOR_NM',
  'PROF_NM',
  'PROFESSOR_NM',
  'STAFF_NM',
  'EMP_NM',
]

const CLASS_NAME_KEYS = ['CLASS_NM', 'CLASSNM', 'TIME_ROOM', 'LECTURE_TIME', 'ROOM_NM']
const CREDIT_KEYS = ['CREDIT', 'PNT', 'POINT', 'CRD']

function normalizeKey(key) {
  return String(key || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase()
}

function readByKeys(source, keys) {
  if (!source || typeof source !== 'object' || Array.isArray(source)) return ''

  const wanted = new Set(keys.map(normalizeKey))
  for (const [key, value] of Object.entries(source)) {
    if (wanted.has(normalizeKey(key)) && value !== null && value !== undefined && value !== '') {
      return String(value).trim()
    }
  }
  return ''
}

function compactText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim()
}

function rowToText(row) {
  if (!row) return ''
  if (typeof row === 'string') return compactText(row)
  if (Array.isArray(row)) return compactText(row.join(' '))

  const parts = []
  if (Array.isArray(row.raw)) parts.push(row.raw.join(' '))
  if (row.row && typeof row.row === 'object') parts.push(Object.values(row.row).join(' '))

  if (typeof row === 'object') {
    Object.entries(row).forEach(([key, value]) => {
      if (key === 'raw' || key === 'row' || key === 'normalized') return
      if (value === null || value === undefined) return
      if (typeof value === 'object') return
      parts.push(String(value))
    })
  }

  return compactText(parts.join(' '))
}

export function normalizeSubjectNo(value) {
  return String(value || '').replace(/\s+/g, '').toUpperCase()
}

function normalizeDvclNo(value) {
  const text = String(value || '').trim().toUpperCase()
  if (!text) return ''
  const match = text.match(/[A-Z0-9]+/)
  const token = match ? match[0] : text
  return token.replace(/^0+(?=\d)/, '')
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function includesToken(text, token) {
  if (!text || !token) return false
  const pattern = new RegExp(`(^|[^A-Z0-9.-])${escapeRegExp(token)}([^A-Z0-9.-]|$)`, 'i')
  return pattern.test(text)
}

function includesText(haystack, needle) {
  const compactNeedle = compactText(needle)
  if (!compactNeedle) return false
  return haystack.includes(compactNeedle)
}

function normalizePortalRow(row) {
  const source = row?.row && typeof row.row === 'object' ? row.row : row
  const existing = row?.normalized && typeof row.normalized === 'object' ? row.normalized : {}

  return {
    rawText: rowToText(row),
    subjectNo: normalizeSubjectNo(
      existing.subjectNo ||
      existing.SUBJECT_NO ||
      readByKeys(source, SUBJECT_FIELD_KEYS),
    ),
    dvclNo: normalizeDvclNo(
      existing.dvclNo ||
      existing.DVCL_NO ||
      readByKeys(source, DVCL_FIELD_KEYS),
    ),
    subjectNm: compactText(
      existing.subjectNm ||
      existing.SUBJECT_NM ||
      readByKeys(source, SUBJECT_NAME_KEYS),
    ),
    profNm: compactText(
      existing.profNm ||
      existing.PROF_KOR_NM ||
      readByKeys(source, PROF_NAME_KEYS),
    ),
    classNm: compactText(
      existing.classNm ||
      existing.CLASS_NM ||
      readByKeys(source, CLASS_NAME_KEYS),
    ),
    credit: compactText(existing.credit || existing.CREDIT || readByKeys(source, CREDIT_KEYS)),
  }
}

function scoreCandidate(course, portal) {
  const rawText = portal.rawText
  let score = 0

  if (portal.subjectNo && normalizeSubjectNo(course.SUBJECT_NO) === portal.subjectNo) score += 20
  if (portal.dvclNo && normalizeDvclNo(course.DVCL_NO) === portal.dvclNo) score += 12
  if (includesText(rawText, course.SUBJECT_NM)) score += 5
  if (includesText(rawText, course.PROF_KOR_NM)) score += 4
  if (includesText(rawText, course.CLASS_NM)) score += 3
  if (portal.credit && String(course.CREDIT) === String(portal.credit)) score += 1

  return score
}

export function matchPortalCourse(row, allCourses = []) {
  const portal = normalizePortalRow(row)
  const rawText = portal.rawText
  const sortedCourses = [...allCourses].sort(
    (a, b) => normalizeSubjectNo(b.SUBJECT_NO).length - normalizeSubjectNo(a.SUBJECT_NO).length,
  )

  let candidates = []
  if (portal.subjectNo) {
    candidates = sortedCourses.filter((course) => normalizeSubjectNo(course.SUBJECT_NO) === portal.subjectNo)
  }

  if (candidates.length === 0 && rawText) {
    candidates = sortedCourses.filter((course) => includesToken(rawText, normalizeSubjectNo(course.SUBJECT_NO)))
  }

  if (portal.dvclNo && candidates.length > 1) {
    const byDivision = candidates.filter((course) => normalizeDvclNo(course.DVCL_NO) === portal.dvclNo)
    if (byDivision.length > 0) candidates = byDivision
  }

  if (candidates.length === 0) {
    return {
      course: null,
      portal,
      label: portal.subjectNo || portal.subjectNm || rawText.slice(0, 80) || '알 수 없는 강의',
    }
  }

  const [best] = candidates
    .map((course) => ({ course, score: scoreCandidate(course, portal) }))
    .sort((a, b) => b.score - a.score)

  return { course: best.course, portal, label: portal.subjectNo || best.course.SUBJECT_NO }
}

export function matchPortalCourses(rows = [], allCourses = []) {
  const matched = []
  const unmatched = []
  const seen = new Set()

  rows.forEach((row) => {
    const result = matchPortalCourse(row, allCourses)
    if (!result.course) {
      unmatched.push(result)
      return
    }

    const key = `${result.course.SUBJECT_NO}-${result.course.DVCL_NO}`
    if (seen.has(key)) return
    seen.add(key)
    matched.push(result.course)
  })

  return { matched, unmatched }
}
