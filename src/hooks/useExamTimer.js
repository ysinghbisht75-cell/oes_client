import { useEffect, useState } from 'react'

export function formatRemainingTime(seconds) {
  const safeSeconds = Math.max(0, Number(seconds) || 0)
  const minutes = Math.floor(safeSeconds / 60)
  const remainingSeconds = safeSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
}

export function useExamTimer({ durationMinutes, isActive, onTimeUp }) {
  const [remainingSeconds, setRemainingSeconds] = useState(
    () => Math.max(0, Number(durationMinutes) || 0) * 60,
  )
  const hasDuration = Number(durationMinutes) > 0

  useEffect(() => {
    const resetTimerId = window.setTimeout(() => {
      setRemainingSeconds(Math.max(0, Number(durationMinutes) || 0) * 60)
    }, 0)

    return () => window.clearTimeout(resetTimerId)
  }, [durationMinutes])

  useEffect(() => {
    if (!isActive || remainingSeconds <= 0) return undefined

    const timerId = window.setInterval(() => {
      setRemainingSeconds((current) => Math.max(0, current - 1))
    }, 1000)

    return () => window.clearInterval(timerId)
  }, [isActive, remainingSeconds])

  useEffect(() => {
    if (isActive && hasDuration && remainingSeconds === 0) {
      onTimeUp()
    }
  }, [hasDuration, isActive, onTimeUp, remainingSeconds])

  return remainingSeconds
}
