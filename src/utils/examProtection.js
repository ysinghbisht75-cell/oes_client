import { useEffect, useRef, useState } from 'react'

export function useExamProtection({ onViolation } = {}) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [hasTabSwitchViolation, setHasTabSwitchViolation] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const lastEventAtRef = useRef({})
  const onViolationRef = useRef(onViolation)

  useEffect(() => {
    onViolationRef.current = onViolation
  }, [onViolation])

  const reportViolation = (eventType, details = '') => {
    const now = Date.now()
    const lastTime = lastEventAtRef.current[eventType] || 0

    if (now - lastTime < 2000) {
      return
    }

    lastEventAtRef.current[eventType] = now

    if (onViolationRef.current) {
      onViolationRef.current(eventType, details).catch(() => {})
    }
  }

  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen()
        }
      } catch {
        // Browsers may block fullscreen; the UI can still explain how to re-enter.
      }
    }

    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement))
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
      const key = event.key.toLowerCase()
      const blockedShortcut =
        key === 'f11' ||
        key === 'escape' ||
        key === 'f5' ||
        (event.ctrlKey && event.shiftKey && ['i', 'j', 'c'].includes(key)) ||
        (event.ctrlKey && ['u', 'r'].includes(key)) ||
        (event.metaKey && ['r'].includes(key)) ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey

      if (blockedShortcut) {
        event.preventDefault()
        event.stopPropagation()
        reportViolation('blocked_shortcut', key)
      }
    }

    const setupCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: true })
        streamRef.current = stream

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play().catch(() => {})
        }

        setCameraReady(true)
        setCameraError('')

        const [track] = stream.getVideoTracks()
        if (track) {
          track.addEventListener('ended', () => {
            setCameraReady(false)
            setCameraError('Camera disconnected during exam.')
            reportViolation('camera_disconnected')
          })
        }
      } catch (error) {
        setCameraReady(false)
        setCameraError('Camera permission is required for this exam.')
        reportViolation('camera_permission_denied', error?.name || 'permission_error')
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown, true)
    window.addEventListener('blur', handleWindowBlur)
    void enterFullscreen()
    void setupCamera()

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      document.removeEventListener('contextmenu', handleContextMenu)
      document.removeEventListener('keydown', handleKeyDown, true)
      window.removeEventListener('blur', handleWindowBlur)
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
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen()
      }
    } catch {
      setHasTabSwitchViolation(false)
    }
  }

  return {
    cameraError,
    cameraReady,
    hasTabSwitchViolation,
    isFullscreen,
    requestFullscreenAgain,
    videoRef,
  }
}