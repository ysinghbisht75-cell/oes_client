const FRAME_WIDTH = 32
const FRAME_HEIGHT = 24

export function analyzeCameraFrame(video) {
  const canvas = document.createElement('canvas')
  canvas.width = FRAME_WIDTH
  canvas.height = FRAME_HEIGHT

  const context = canvas.getContext('2d', { willReadFrequently: true })
  if (!context) return null

  context.drawImage(video, 0, 0, FRAME_WIDTH, FRAME_HEIGHT)
  const pixels = context.getImageData(0, 0, FRAME_WIDTH, FRAME_HEIGHT).data
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

  return {
    averageBrightness,
    brightnessVariance,
    looksCovered: averageBrightness < 25 || brightnessVariance < 35,
    signature,
  }
}
