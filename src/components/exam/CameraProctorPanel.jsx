export default function CameraProctorPanel({
  cameraError,
  cameraReady,
  latestViolation,
  videoRef,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900">Camera Proctor</p>
        <span className={cameraReady ? 'badge' : 'inline-flex min-h-7 items-center rounded-full bg-rose-100 px-3 text-xs font-bold text-rose-700'}>
          {cameraReady ? 'Camera active' : 'Camera required'}
        </span>
      </div>
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-black">
        <video ref={videoRef} autoPlay muted playsInline className="h-48 w-full object-cover" />
      </div>
      {cameraError ? <p className="mt-2 text-sm font-semibold text-rose-700">{cameraError}</p> : null}
      {latestViolation ? (
        <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800">
          <p className="font-semibold">Suspicious event detected</p>
          <p className="mt-1 text-xs">{latestViolation.eventType}</p>
        </div>
      ) : null}
    </div>
  )
}
