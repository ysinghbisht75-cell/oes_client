import { Link, useNavigate, useParams } from 'react-router-dom'

export default function StudentAnswerPage({ questions, results, user }) {
  const { resultId } = useParams()
  const navigate = useNavigate()
  const currentEmail = (user?.email || '').trim().toLowerCase()

  const result = results.find(
    (entry) =>
      String(entry.id) === String(resultId) &&
      (entry.studentEmail || '').trim().toLowerCase() === currentEmail,
  )

  if (!result) {
    return (
      <section className="panel mx-auto w-full max-w-4xl">
        <h2 className="text-xl font-bold text-slate-950">Answer review not found</h2>
        <p className="mt-2 text-sm text-slate-600">
          The selected attempt is unavailable or does not belong to your account.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button className="btn-light" type="button" onClick={() => navigate(-1)}>
            Go back
          </button>
          <Link className="btn" to="/student">
            Back to portal
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto w-full max-w-5xl">
      <div className="panel mb-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">{result.examTitle}</h2>
            <p className="text-sm text-slate-600">{result.subject}</p>
            <p className="mt-2 text-sm text-slate-500">{result.student}</p>
          </div>
          <div className="flex flex-wrap gap-2 text-sm font-semibold text-slate-700">
            <span className="rounded-lg bg-slate-100 px-3 py-2">
              Marks: {result.score}/{result.total}
            </span>
            <span className="rounded-lg bg-slate-100 px-3 py-2">
              {result.date ? new Date(result.date).toLocaleDateString() : 'Recently'}
            </span>
          </div>
        </div>
      </div>

      <section className="panel">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-xl font-bold text-slate-950">Answer Review</h3>
          <span className="badge">{Array.isArray(result.answers) ? result.answers.length : 0} questions</span>
        </div>

        {Array.isArray(result.answers) && result.answers.length > 0 ? (
          <div className="space-y-3">
            {result.answers.map((answer, index) => {
              const linkedQuestion = questions.find((question) => question.id === answer.questionId)
              const attemptedOption = linkedQuestion?.options?.[answer.selectedOption]
              const correctOption = linkedQuestion?.options?.[answer.correctOption]

              return (
                <article className="rounded-2xl border border-slate-200 bg-slate-50 p-4" key={answer.questionId}>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                        Question {index + 1}
                      </p>
                      <h4 className="mt-1 text-lg font-semibold text-slate-950">
                        {linkedQuestion?.text || `Question ${answer.questionId}`}
                      </h4>
                    </div>
                    <span className={answer.isCorrect ? 'badge' : 'inline-flex min-h-7 items-center rounded-full bg-rose-100 px-3 text-xs font-bold text-rose-700'}>
                      {answer.isCorrect ? 'Correct' : 'Wrong'}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Attempted answer</p>
                      <p className="mt-1 text-sm text-slate-800">
                        {attemptedOption || 'Not answered'}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Correct answer</p>
                      <p className="mt-1 text-sm text-slate-800">
                        {correctOption || 'Unavailable'}
                      </p>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <p className="empty-box">No answer details are available for this attempt.</p>
        )}

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <Link className="btn-light" to="/student">
            Back to portal
          </Link>
        </div>
      </section>
    </section>
  )
}