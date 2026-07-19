export function requestFullscreen() {
  if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
    return document.documentElement.requestFullscreen()
  }

  return Promise.resolve()
}

export function isBlockedExamShortcut(event) {
  const key = event.key.toLowerCase()

  return (
    key === 'f11' ||
    key === 'escape' ||
    key === 'f5' ||
    (event.ctrlKey && event.shiftKey && ['i', 'j', 'c'].includes(key)) ||
    (event.ctrlKey && ['u', 'r'].includes(key)) ||
    (event.metaKey && ['r'].includes(key)) ||
    event.ctrlKey ||
    event.metaKey ||
    event.altKey
  )
}
