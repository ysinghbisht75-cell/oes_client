import { useEffect, useRef, useState } from 'react'

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

    if (now - lastTime < 2000) {
      return
    }

    lastEventAtRef.current[eventType] = now
    setLatestViolation({ details, eventType, occurredAt: new Date().toISOString() })

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
      const fullscreenActive = Boolean(document.fullscreenElement)
      setIsFullscreen(fullscreenActive)

      if (!fullscreenActive) {
        reportViolation('fullscreen_exit')
      }
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
          track.addEventListener('mute', () => {
            setCameraReady(false)
            setCameraError('Camera video is not available.')
            reportViolation('camera_muted')
          })

          track.addEventListener('unmute', () => {
            setCameraReady(true)
            setCameraError('')
          })

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

    const monitorCamera = () => {
      const video = videoRef.current
      const [track] = streamRef.current?.getVideoTracks() || []

      if (!video || !track) {
        return
      }

      if (track.readyState !== 'live' || track.muted || !track.enabled) {
        setCameraReady(false)
        setCameraError('Camera must stay active during the exam.')
        reportViolation('camera_inactive', track.readyState)
        return
      }

      if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || !video.videoWidth || !video.videoHeight) {
        setCameraReady(false)
        setCameraError('Camera video is not being detected.')
        reportViolation('camera_no_video')
        return
      }

      const canvas = document.createElement('canvas')
      const width = 32
      const height = 24
      canvas.width = width
      canvas.height = height
      const context = canvas.getContext('2d', { willReadFrequently: true })

      if (!context) {
        return
      }

      context.drawImage(video, 0, 0, width, height)
      const pixels = context.getImageData(0, 0, width, height).data
      let brightnessTotal = 0
      let brightnessSquaredTotal = 0
      let signature = ''
      let samples = 0

      for (let index = 0; index < pixels.length; index += 16) {
        const brightness = Math.round((pixels[index] + pixels[index + 1] + pixels[index + 2]) / 3)
        brightnessTotal += brightness
        brightnessSquaredTotal += brightness * brightness
        signature += Math.round(brightness / 16).toString(16)
        samples += 1
      }

      const averageBrightness = brightnessTotal / samples
      const brightnessVariance = brightnessSquaredTotal / samples - averageBrightness * averageBrightness
      const looksCovered = averageBrightness < 25 || brightnessVariance < 35

      if (looksCovered) {
        blockedFrameCountRef.current += 1
      } else {
        blockedFrameCountRef.current = 0
      }

      if (blockedFrameCountRef.current >= 2) {
        setCameraReady(false)
        setCameraError('Camera feed is too dark or blocked.')
        reportViolation(
          'camera_blocked',
          `brightness:${Math.round(averageBrightness)}, variance:${Math.round(brightnessVariance)}`,
        )
        return
      }

      if (signature === lastFrameSignatureRef.current) {
        repeatedFrameCountRef.current += 1
      } else {
        repeatedFrameCountRef.current = 0
        lastFrameSignatureRef.current = signature
      }

      if (repeatedFrameCountRef.current >= 4) {
        setCameraReady(false)
        setCameraError('Camera feed appears frozen.')
        reportViolation('camera_frozen')
        return
      }

      setCameraReady(true)
      setCameraError('')
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
    void enterFullscreen()
    void setupCamera()
    const cameraMonitorId = window.setInterval(monitorCamera, 1000)

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
    latestViolation,
    requestFullscreenAgain,
    videoRef,
  }
}
