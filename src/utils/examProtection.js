import { useEffect, useRef, useState } from 'react'
import { isBlockedExamShortcut, requestFullscreen } from './examProtection/browserProtection.js'
import { monitorCamera, setupCamera } from './examProtection/cameraProtection.js'

export function useExamProtection({ onViolation } = {}) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [hasTabSwitchViolation, setHasTabSwitchViolation] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [latestViolation, setLatestViolation] = useState(null)
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const lastEventAtRef = useRef({})
  const onViolationRef = useRef(onViolation)
  const lastFrameSignatureRef = useRef('')
  const repeatedFrameCountRef = useRef(0)
  const blockedFrameCountRef = useRef(0)

  useEffect(() => {
    onViolationRef.current = onViolation
  }, [onViolation])

  const reportViolation = (eventType, details = '') => {
    const now = Date.now()
    const lastTime = lastEventAtRef.current[eventType] || 0

    if (now - lastTime < 2000) return

    lastEventAtRef.current[eventType] = now
    setLatestViolation({ details, eventType, occurredAt: new Date().toISOString() })
    onViolationRef.current?.(eventType, details).catch(() => {})
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      const fullscreenActive = Boolean(document.fullscreenElement)
      setIsFullscreen(fullscreenActive)

      if (!fullscreenActive) reportViolation('fullscreen_exit')
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') {
        setHasTabSwitchViolation(true)
        reportViolation('tab_hidden')
      }
    }

    const handleWindowBlur = () => {
      setHasTabSwitchViolation(true)
      reportViolation('window_blur')
    }

    const handleContextMenu = (event) => {
      event.preventDefault()
      reportViolation('context_menu_blocked')
    }

    const handleKeyDown = (event) => {
      if (!isBlockedExamShortcut(event)) return

      event.preventDefault()
      event.stopPropagation()
      reportViolation('blocked_shortcut', event.key.toLowerCase())
    }

    const handleBeforeUnload = () => {
      reportViolation('page_unload_attempt')
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown, true)
    window.addEventListener('blur', handleWindowBlur)
    window.addEventListener('beforeunload', handleBeforeUnload)

    requestFullscreen().catch(() => {})
    void setupCamera({ reportViolation, setCameraError, setCameraReady, streamRef, videoRef })

    const cameraMonitorId = window.setInterval(() => {
      monitorCamera({
        blockedFrameCountRef,
        lastFrameSignatureRef,
        repeatedFrameCountRef,
        reportViolation,
        setCameraError,
        setCameraReady,
        streamRef,
        videoRef,
      })
    }, 1000)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown, true)
      window.removeEventListener('blur', handleWindowBlur)
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.clearInterval(cameraMonitorId)

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop())
        streamRef.current = null
      }

      if (document.fullscreenElement && document.exitFullscreen) {
        void document.exitFullscreen().catch(() => {})
      }
    }
  }, [])

  const requestFullscreenAgain = async () => {
    try {
      await requestFullscreen()
    } catch {
      setHasTabSwitchViolation(false)
    }
  }

  return {
    cameraError,
    cameraReady,
    hasTabSwitchViolation,
    isFullscreen,
    latestViolation,
    requestFullscreenAgain,
    videoRef,
  }
}
