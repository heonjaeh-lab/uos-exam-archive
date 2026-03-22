const subjectAliases = {
  '고전과함께하는비판적토론': ['고비토', '고전', '비판적토론', '토론'],
  '물리학및실험1': ['물리', '물실', '물리학', '물리실험'],
  '수학 1': ['수1', '수학1', '미적분', '교양수학'],
  '수학 2': ['수2', '수학2'],
  '대학영어(S)': ['영어', '영S', '영어S', '대학영어'],
  '인공지능수학기초': ['인수기', '인공지능', 'AI수학', '인공지능수학'],
  'C프로그래밍': ['C프로', 'C언어', '씨프로', '씨언어', 'C프로그래밍'],
  '인간과환경': ['인환', '환경'],
  '물리학및실험2': ['물실2', '물리2', '물리실험2'],
  '교재모음': ['교재', '책'],
  '대학영어(W)': ['영어W', '영W', '대학영어W', '라이팅'],
}

export function matchesSearch(exam, query) {
  const q = query.toLowerCase()
  if (exam.subject.toLowerCase().includes(q)) return true
  if (exam.professor.toLowerCase().includes(q)) return true
  if (exam.tags.some(t => t.toLowerCase().includes(q))) return true
  if (exam.title && exam.title.toLowerCase().includes(q)) return true

  const aliases = subjectAliases[exam.subject]
  if (aliases && aliases.some(a => a.toLowerCase().includes(q))) return true

  return false
}

export function getSuggestions(query, subjects) {
  if (!query || query.length === 0) return []
  const q = query.toLowerCase()
  const results = []

  for (const subject of subjects) {
    if (subject.toLowerCase().includes(q)) {
      results.push(subject)
      continue
    }
    const aliases = subjectAliases[subject]
    if (aliases && aliases.some(a => a.toLowerCase().includes(q))) {
      results.push(subject)
    }
  }

  return results
}

export default subjectAliases
