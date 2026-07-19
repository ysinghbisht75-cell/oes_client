import { useMemo, useState } from 'react'

export default function Results({ changeResultPublication, results }) {
  const [selectedExamKey, setSelectedExamKey] = useState('all')

  const formatDate = (value) => {
    if (!value) return 'Recently'

    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString()
  }

  const groupedResults = useMemo(() => results.reduce((groups, result) => {
    const key = String(result.examId || result.examTitle || 'unknown')
    if (!groups[key]) {
      groups[key] = {
        key,
        examId: result.examId,
        examTitle: result.examTitle || 'Untitled exam',
        subject: result.subject || '',
        results: [],
      }
    }

    groups[key].results.push(result)
    return groups
  }, {}), [results])

  const allExamGroups = Object.values(groupedResults).sort((left, right) =>
    String(left.examTitle).localeCompare(String(right.examTitle)),
  )
  const examGroups = selectedExamKey === 'all'
    ? allExamGroups
    : allExamGroups.filter((group) => group.key === selectedExamKey)
  const filteredAttemptCount = examGroups.reduce((total, group) => total + group.results.length, 0)

  return (
    <section className="panel">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-black">
          Student Result History
        </h2>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="text-sm font-semibold text-slate-700" htmlFor="exam-result-filter">
            Exam
          </label>
          <select
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 outline-none focus:border-teal-500"
            id="exam-result-filter"
            onChange={(event) => setSelectedExamKey(event.target.value)}
            value={selectedExamKey}
          >
            <option value="all">All exams</option>
            {allExamGroups.map((group) => (
              <option key={group.key} value={group.key}>
                {group.examTitle}
              </option>
            ))}
          </select>
          <span className="badge">{filteredAttemptCount} attempt{filteredAttemptCount === 1 ? '' : 's'}</span>
        </div>
      </div>
      {results.length === 0 ? (
        <p className="empty-box">No results yet in this session.</p>
      ) : examGroups.length === 0 ? (
        <p className="empty-box">No results found for this exam.</p>
      ) : (
        <div className="space-y-5">
          {examGroups.map((group) => (
            <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4" key={group.examId || group.examTitle}>
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-950">{group.examTitle}</h3>
                  {group.subject ? <p className="text-sm text-slate-600">{group.subject}</p> : null}
                </div>
                <span className="badge">{group.results.length} attempt{group.results.length === 1 ? '' : 's'}</span>
              </div>

              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {group.results.map((result) => (
                  <div className="rounded-xl border border-slate-200 bg-white p-4" key={result.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-950">{result.student}</p>
                        <p className="text-sm text-slate-600">{formatDate(result.date)}</p>
                      </div>
                      <span className={result.published ? 'badge' : 'inline-flex min-h-7 items-center rounded-full bg-slate-100 px-3 text-xs font-bold text-slate-700'}>
                        {result.published ? 'Published' : 'Hidden'}
                      </span>
                    </div>

                    <div className="mt-3 rounded-lg bg-slate-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Marks</p>
                      <p className="mt-1 text-lg font-bold text-slate-950">
                        {result.score}/{result.total}
                      </p>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        className="btn-light"
                        type="button"
                        onClick={() => changeResultPublication?.(result.id, !result.published)}
                      >
                        {result.published ? 'Unpublish' : 'Publish'}
                      </button>
                    </div>

                    <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Behavior Summary</p>
                      <p className="mt-2 text-sm text-slate-700">{result.proctorSummary || 'No suspicious behavior detected.'}</p>
                      {Array.isArray(result.proctorEvents) && result.proctorEvents.length > 0 ? (
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
                          {result.proctorEvents.map((event, index) => (
                            <li key={`${event.eventType}-${index}`}>
                              {event.eventType}{event.details ? ` — ${event.details}` : ''}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>

                    {Array.isArray(result.answers) && result.answers.length > 0 ? (
                      <details className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                        <summary className="cursor-pointer text-sm font-semibold text-slate-800">
                          View attempted answers
                        </summary>
                        <div className="mt-3 space-y-3 text-sm text-slate-700">
                          {result.answers.map((answer) => (
                            <div className="rounded-md bg-white p-3" key={answer.questionId}>
                              <div className="flex items-center justify-between gap-3">
                                <span className="font-semibold">Question {answer.questionId}</span>
                                <span className={answer.isCorrect ? 'text-emerald-700 font-semibold' : 'text-rose-700 font-semibold'}>
                                  {answer.isCorrect ? 'Correct' : 'Wrong'}
                                </span>
                              </div>
                              <p className="mt-2">
                                Attempted option: {answer.selectedOption ?? 'Not answered'}
                              </p>
                              <p>
                                Correct option: {answer.correctOption}
                              </p>
                            </div>
                          ))}
                        </div>
                      </details>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </section>
  )
}
