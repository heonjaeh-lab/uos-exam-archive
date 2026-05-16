import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { fetchNotices, fetchAllBoards, NOTICE_BOARDS } from '../services/noticeScraper.js'

const router = Router()

const cache = new Map()
const CACHE_TTL = 10 * 60 * 1000 // 10분

const noticeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
})

/**
 * GET /api/notice?board=academic&page=1
 * 특정 게시판 공지 리스트
 */
router.get('/notice', noticeLimiter, async (req, res) => {
  const board = (req.query.board || 'academic').toString()
  const page = parseInt(req.query.page || '1', 10) || 1

  if (!NOTICE_BOARDS[board]) {
    return res.status(400).json({ error: '잘못된 게시판: ' + board })
  }

  const cacheKey = `notice-${board}-${page}`
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return res.json({ ...cached.data, cached: true })
  }

  try {
    const data = await fetchNotices(board, page)
    cache.set(cacheKey, { time: Date.now(), data })
    res.json(data)
  } catch (error) {
    console.error('[notice] 오류:', error.message)
    res.status(500).json({ error: '공지 로딩 실패' })
  }
})

/**
 * GET /api/notice/all
 * 모든 게시판 첫 페이지 한꺼번에
 */
router.get('/notice/all', noticeLimiter, async (req, res) => {
  const cacheKey = 'notice-all'
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return res.json({ ...cached.data, cached: true })
  }

  try {
    const data = await fetchAllBoards()
    cache.set(cacheKey, { time: Date.now(), data })
    res.json(data)
  } catch (error) {
    res.status(500).json({ error: '공지 로딩 실패' })
  }
})

export default router
