export default function ExamStatusAlerts({
  hasTabSwitchViolation,
  isFullscreen,
  requestFullscreen,
}) {
  return (
    <>
      {hasTabSwitchViolation ? (
        <div className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
          <p className="font-semibold">Tab switch detected</p>
          <p className="mt-1 text-sm">
            Keep this exam tab active. Some browser shortcuts cannot be fully blocked, but switching tabs is monitored.
          </p>
        </div>
      ) : null}

      {!isFullscreen ? (
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
          Fullscreen is required for this exam. Leave prevention is limited by the browser, but common shortcuts are blocked.
          <button className="ml-3 underline" type="button" onClick={requestFullscreen}>
            Enter fullscreen again
          </button>
        </div>
      ) : null}
    </>
  )
}
