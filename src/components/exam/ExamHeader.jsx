import { formatRemainingTime } from '../../hooks/useExamTimer.js'

export default function ExamHeader({ exam, questionCount, remainingSeconds }) {
  const isTimeLow = remainingSeconds <= 60

  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-2xl font-bold text-slate-950">{exam.title}</h2>
        <p className="text-sm text-slate-500">{exam.subject}</p>
      </div>
      <div className="flex flex-wrap gap-2 text-sm font-semibold text-slate-700">
        <span className="rounded-lg bg-slate-100 px-3 py-2">{exam.duration} minutes</span>
        <span className={isTimeLow ? 'rounded-lg bg-rose-100 px-3 py-2 text-rose-700' : 'rounded-lg bg-teal-50 px-3 py-2 text-teal-800'}>
          Time left: {formatRemainingTime(remainingSeconds)}
        </span>
        <span className="rounded-lg bg-slate-100 px-3 py-2">{questionCount} questions</span>
      </div>
    </div>
  )
}
