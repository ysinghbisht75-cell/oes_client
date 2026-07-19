import { Link, useLocation } from 'react-router-dom'

export default function Student({ exams, questions, results = [], user }) {
  const publishedExams = exams.filter((exam) => exam.status === 'Published')
  const location = useLocation()
  const publishedResults = results.filter((result) => result.status === 'Published' || result.published === true)
  const message = location.state?.message || ''
  const currentUserEmail = (user?.email || '').trim().toLowerCase()
  const takenExamIds = new Set(
    results
      .filter((result) => result.studentEmail && result.studentEmail === currentUserEmail)
      .map((result) => String(result.examId)),
  )

  return (
    <section className="mx-auto w-full max-w-6xl">
      {message ? <p className="mb-6 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm font-semibold text-teal-800">{message}</p> : null}

      <section className="panel mb-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-bold text-slate-950">
            Published Exams
          </h2>
          <span className="badge">{publishedExams.length} published</span>
        </div>

        {publishedExams.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {publishedExams.map((exam) => {
              const questionCount = questions.filter((question) =>
                (exam.questionIds || []).includes(question.id),
              ).length
              const isTaken = takenExamIds.has(String(exam.id))

              return (
                <article
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                  key={exam.id}
                >
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-950">{exam.title}</h3>
                      <p className="text-sm text-slate-600">{exam.subject}</p>
                    </div>
                    {isTaken ? (
                      <span className="badge bg-slate-200 text-slate-700">Already taken</span>
                    ) : (
                      <Link className="btn-light" to={`/student/exams/${exam.id}`}>
                        Open exam
                      </Link>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold text-slate-700">
                    <span className="rounded-lg bg-white px-3 py-2">
                      {exam.duration} minutes
                    </span>
                    <span className="rounded-lg bg-white px-3 py-2">
                      {questionCount} questions
                    </span>
                    {exam.startDate ? (
                      <span className="rounded-lg bg-white px-3 py-2">
                        From {exam.startDate}
                      </span>
                    ) : null}
                    {exam.endDate ? (
                      <span className="rounded-lg bg-white px-3 py-2">
                        To {exam.endDate}
                      </span>
                    ) : null}
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <p className="empty-box">No published exams are available.</p>
        )}
      </section>

      <section className="panel">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-bold text-slate-950">
            My Published Attempts
          </h2>
          <span className="badge">
            {publishedResults.filter((result) => (result.studentEmail || '').trim().toLowerCase() === currentUserEmail).length} published
          </span>
        </div>

        {publishedResults.some((result) => (result.studentEmail || '').trim().toLowerCase() === currentUserEmail) ? (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {publishedResults
              .filter((result) => (result.studentEmail || '').trim().toLowerCase() === currentUserEmail)
              .map((result) => (
                <article
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                  key={result.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-slate-950">
                        {result.examTitle}
                      </h3>
                      <p className="text-sm text-slate-600">{result.student}</p>
                    </div>
                    <span className="badge">Published</span>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-3">
                    <span className="text-lg font-bold text-slate-950">
                      Marks: {result.score}/{result.total}
                    </span>
                    <span className="text-xs text-slate-500">
                      {result.date ? new Date(result.date).toLocaleDateString() : 'Recently'}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link className="btn-light" to={`/student/results/${result.id}`}>
                      View answers
                    </Link>
                  </div>
                </article>
              ))}
          </div>
        ) : (
          <p className="empty-box">No published attempts are available yet.</p>
        )}
      </section>
    </section>
  )
}
