import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { fetchServerTimeOffset } from '../api/serverTime'
import {
  REGISTRATION_EVENTS,
  findNextRegistrationEvent,
} from '../data/registrationSchedule'

// 5분마다 서버 시간 재동기화 (시계 드리프트 방지)
const RESYNC_INTERVAL_MS = 5 * 60 * 1000

function formatHMS(ms) {
  if (ms < 0) ms = 0
  const totalSec = Math.floor(ms / 1000)
  const days = Math.floor(totalSec / 86400)
  const hours = Math.floor((totalSec % 86400) / 3600)
  const mins = Math.floor((totalSec % 3600) / 60)
  const secs = totalSec % 60
  return { days, hours, mins, secs }
}

function pad(n) {
  return String(n).padStart(2, '0')
}

function formatKstDate(ms) {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(ms))
}

export default function RegistrationHelperPage() {
  const [offsetMs, setOffsetMs] = useState(null)
  const [responseTimeMs, setResponseTimeMs] = useState(null)
  const [syncing, setSyncing] = useState(true)
  const [syncError, setSyncError] = useState(null)
  const [now, setNow] = useState(Date.now())

  // 서버 시간 동기화
  useEffect(() => {
    let cancelled = false
    const sync = async () => {
      setSyncing(true)
      setSyncError(null)
      try {
        const { offsetMs: off, responseTimeMs: rtt } = await fetchServerTimeOffset()
        if (!cancelled) {
          setOffsetMs(off)
          setResponseTimeMs(rtt)
        }
      } catch (e) {
        if (!cancelled) setSyncError(e.message)
      } finally {
        if (!cancelled) setSyncing(false)
      }
    }
    sync()
    const id = setInterval(sync, RESYNC_INTERVAL_MS)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  // 매 100ms 시계 업데이트 (밀리세컨드 깜박임 자연스럽게)
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 100)
    return () => clearInterval(id)
  }, [])

  const serverNowMs = offsetMs !== null ? now + offsetMs : now
  const nextEvent = findNextRegistrationEvent(serverNowMs)

  // 카운트다운
  const target = nextEvent
    ? nextEvent.status === 'ongoing'
      ? nextEvent.endsAtMs
      : nextEvent.startsAtMs
    : null
  const remainMs = target ? target - serverNowMs : null
  const remain = remainMs !== null ? formatHMS(remainMs) : null

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '20px 16px 40px' }}>
      {/* 헤더 */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, color: 'var(--c-text-3)', fontWeight: 600, letterSpacing: '0.08em' }}>
          COURSE REGISTRATION
        </div>
        <h1 style={{ margin: '4px 0 0', fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>
          수강신청 도우미
        </h1>
        <p style={{ margin: '8px 0 0', fontSize: 13, color: 'var(--c-text-3)' }}>
          시립대 수강신청 서버 시간 기준 정확한 카운트다운. 네이비즘 안 봐도 돼요.
        </p>
      </div>

      {/* 메인 카운트다운 카드 */}
      <section
        className="uos-card"
        style={{
          padding: '32px 24px',
          marginBottom: 16,
          background:
            nextEvent?.status === 'ongoing'
              ? 'linear-gradient(135deg, #c92a2a 0%, #e03131 60%, #f03e3e 100%)'
              : 'linear-gradient(135deg, var(--c-primary-700) 0%, var(--c-primary) 70%, var(--c-primary-600) 100%)',
          color: '#fff',
          border: 'none',
          textAlign: 'center',
        }}
      >
        {nextEvent ? (
          <>
            <div style={{ fontSize: 12, opacity: 0.85, fontWeight: 600, letterSpacing: '0.08em' }}>
              {nextEvent.semester}
            </div>
            <h2 style={{ margin: '6px 0 4px', fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em' }}>
              {nextEvent.label}
              {nextEvent.tentative && (
                <span style={{ fontSize: 12, marginLeft: 8, opacity: 0.8 }}>(잠정)</span>
              )}
            </h2>
            <div style={{ fontSize: 13, opacity: 0.85, marginBottom: 24 }}>
              {nextEvent.status === 'ongoing'
                ? `진행 중 · ${formatKstDate(nextEvent.endsAtMs)} 마감`
                : `${formatKstDate(nextEvent.startsAtMs)} 시작`}
            </div>

            {remain && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 16, fontVariantNumeric: 'tabular-nums' }}>
                <TimeBlock label={nextEvent.status === 'ongoing' ? '마감까지' : '시작까지'} value={remain.days} unit="일" />
                <TimeBlock value={pad(remain.hours)} unit="시" />
                <TimeBlock value={pad(remain.mins)} unit="분" />
                <TimeBlock value={pad(remain.secs)} unit="초" pulse />
              </div>
            )}
          </>
        ) : (
          <div style={{ padding: '20px 0' }}>
            <div style={{ fontSize: 16, fontWeight: 600 }}>예정된 수강신청 일정이 없어요</div>
            <div style={{ fontSize: 12, opacity: 0.85, marginTop: 8 }}>
              학사일정 발표 후 업데이트 예정
            </div>
          </div>
        )}
      </section>

      {/* 서버 시간 동기화 상태 */}
      <section className="uos-card" style={{ marginBottom: 16, padding: '14px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div>
            <div style={{ fontSize: 11, color: 'var(--c-text-3)', fontWeight: 600 }}>
              시립대 서버 시간 (KST)
            </div>
            <div style={{ fontSize: 17, fontWeight: 700, fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>
              {syncing && offsetMs === null
                ? '동기화 중...'
                : new Intl.DateTimeFormat('ko-KR', {
                    timeZone: 'Asia/Seoul',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: false,
                  }).format(new Date(serverNowMs))}
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: 11, color: 'var(--c-text-3)' }}>
            {syncError ? (
              <span style={{ color: '#c92a2a' }}>오류: {syncError}</span>
            ) : offsetMs !== null ? (
              <>
                <div>내 시계와 차이: {offsetMs >= 0 ? '+' : ''}{offsetMs}ms</div>
                <div>응답 시간: {responseTimeMs}ms · 5분마다 재동기화</div>
              </>
            ) : null}
          </div>
        </div>
      </section>

      {/* 시립대 바로가기 */}
      <section className="uos-card" style={{ marginBottom: 16 }}>
        <div className="uos-card__hd" style={{ padding: '14px 18px' }}>
          <h3 style={{ fontSize: 14 }}>바로가기</h3>
        </div>
        <div style={{ padding: '4px 0 8px' }}>
          <ExternalLink
            href="https://sugang.uos.ac.kr/"
            label="시립대 수강신청"
            description="실제 신청 페이지 (시간 되면 여기서)"
          />
          <ExternalLink
            href="https://wise.uos.ac.kr/index.do"
            label="이루넷 (WISE)"
            description="시간표 조회·수강 정보"
          />
          <ExternalLink
            href="https://www.uos.ac.kr/korNotice/list.do?list_id=FA2"
            label="학사 공지"
            description="수강신청 변경사항·안내"
          />
        </div>
      </section>

      {/* 전체 일정 */}
      <section className="uos-card">
        <div className="uos-card__hd" style={{ padding: '14px 18px' }}>
          <h3 style={{ fontSize: 14 }}>전체 일정</h3>
          <span className="uos-tag uos-tag--dot uos-tag--success">KST 기준</span>
        </div>
        <div>
          {REGISTRATION_EVENTS.map((e) => {
            const startMs = new Date(e.startsAt).getTime()
            const endMs = new Date(e.endsAt).getTime()
            const isPast = serverNowMs > endMs
            const isOngoing = serverNowMs >= startMs && serverNowMs <= endMs
            return (
              <div
                key={e.id}
                style={{
                  padding: '12px 18px',
                  borderTop: '1px solid var(--c-line)',
                  opacity: isPast ? 0.5 : 1,
                  background: isOngoing ? 'var(--c-primary-50)' : 'transparent',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>
                      {e.label}
                      {e.tentative && (
                        <span style={{ fontSize: 11, color: 'var(--c-text-3)', marginLeft: 6 }}>(잠정)</span>
                      )}
                      {isOngoing && (
                        <span className="uos-tag uos-tag--primary" style={{ marginLeft: 8, fontSize: 10 }}>
                          진행중
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--c-text-3)', marginTop: 2 }}>
                      {e.semester}
                      {e.notes && ` · ${e.notes}`}
                    </div>
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--c-text-3)', textAlign: 'right' }}>
                    <div>{formatKstDate(startMs)}</div>
                    <div>~ {formatKstDate(endMs)}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <div style={{ marginTop: 20, fontSize: 11, color: 'var(--c-text-4)', textAlign: 'center' }}>
        일정은 학사 공지를 참고해서 매학기 업데이트됩니다.<br />
        잘못된 정보 발견 시 <Link to="/about">개발자에게 알려주세요</Link>.
      </div>
    </div>
  )
}

function TimeBlock({ label, value, unit, pulse }) {
  return (
    <div style={{ minWidth: 56 }}>
      {label && (
        <div style={{ fontSize: 10, opacity: 0.75, marginBottom: 4, fontWeight: 600, letterSpacing: '0.04em' }}>
          {label}
        </div>
      )}
      <div
        style={{
          fontSize: 36,
          fontWeight: 700,
          lineHeight: 1,
          animation: pulse ? 'pulse 1s ease-in-out infinite' : 'none',
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 11, opacity: 0.8, marginTop: 4 }}>{unit}</div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
      `}</style>
    </div>
  )
}

function ExternalLink({ href, label, description }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 18px',
        borderTop: '1px solid var(--c-line)',
        textDecoration: 'none',
        color: 'inherit',
        transition: 'background .12s',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--c-bg-soft)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
    >
      <span style={{ flex: 1 }}>
        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: 11.5, color: 'var(--c-text-3)', marginTop: 2 }}>{description}</div>
      </span>
      <span style={{ fontSize: 14, color: 'var(--c-text-3)' }}>↗</span>
    </a>
  )
}
