import { Link } from 'react-router-dom'

export default function FocusLockOverlay({ hasTabSwitchViolation, requestFullscreenAgain }) {
  if (!hasTabSwitchViolation) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/80 p-4 text-center text-white">
      <div className="max-w-lg rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-rose-300">Warning</p>
        <h3 className="mt-3 text-2xl font-bold">Focus was lost</h3>
        <p className="mt-3 text-sm text-slate-300">
          The exam is locked because the tab or window lost focus. Return to the exam tab and continue there.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button className="btn-light text-slate-900" type="button" onClick={requestFullscreenAgain}>
            Re-enter fullscreen
          </button>
          <Link className="btn" to="/student">
            Leave exam
          </Link>
        </div>
      </div>
    </div>
  )
}
