import { analyzeCameraFrame } from './cameraFrameAnalysis.js'

export async function setupCamera({ reportViolation, setCameraError, setCameraReady, streamRef, videoRef }) {
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

export function monitorCamera({
  blockedFrameCountRef,
  lastFrameSignatureRef,
  repeatedFrameCountRef,
  reportViolation,
  setCameraError,
  setCameraReady,
  streamRef,
  videoRef,
}) {
  const video = videoRef.current
  const [track] = streamRef.current?.getVideoTracks() || []

  if (!video || !track) return

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

  const frame = analyzeCameraFrame(video)
  if (!frame) return

  if (frame.looksCovered) {
    blockedFrameCountRef.current += 1
  } else {
    blockedFrameCountRef.current = 0
  }

  if (blockedFrameCountRef.current >= 2) {
    setCameraReady(false)
    setCameraError('Camera feed is too dark or blocked.')
    reportViolation(
      'camera_blocked',
      `brightness:${Math.round(frame.averageBrightness)}, variance:${Math.round(frame.brightnessVariance)}`,
    )
    return
  }

  if (frame.signature === lastFrameSignatureRef.current) {
    repeatedFrameCountRef.current += 1
  } else {
    repeatedFrameCountRef.current = 0
    lastFrameSignatureRef.current = frame.signature
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
