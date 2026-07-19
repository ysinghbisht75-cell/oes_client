import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { logProctorEvent } from '../../services/proctorService.js'
import { useExamProtection } from '../../utils/examProtection.js'

export default function StudentExamPage({ exams, onSubmitResult, questions, results = [], user }) {
  const { examId } = useParams()
  const navigate = useNavigate()
  const [answers, setAnswers] = useState({})
  const [feedback, setFeedback] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [proctorEvents, setProctorEvents] = useState([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  const recordViolation = async (eventType, details = '') => {
    if (!activeExam || !(user?.email || '').trim()) {
      return
    }

    const occurredAt = new Date().toISOString()
    const nextEvent = { details, eventType, occurredAt }

    setProctorEvents((current) => [...current, nextEvent])

    await logProctorEvent({
      ...nextEvent,
      examId: activeExam.id,
      student: user?.name || 'Student',
      studentEmail: user.email,
    })
  }

  const {
    cameraError,
    cameraReady,
    hasTabSwitchViolation,
    isFullscreen,
    requestFullscreenAgain,
    videoRef,
  } = useExamProtection({ onViolation: recordViolation })

  const activeExam = exams.find(
    (exam) => String(exam.id) === String(examId) && exam.status === 'Published',
  )

  const activeQuestions = activeExam
    ? questions.filter((question) => (activeExam.questionIds || []).includes(question.id))
    : []

  const currentQuestion = activeQuestions[currentQuestionIndex] || null

  const hasAlreadyTaken = useMemo(
    () =>
      results.some(
        (result) =>
          String(result.examId) === String(examId) &&
          (result.studentEmail || '').trim().toLowerCase() === (user?.email || '').trim().toLowerCase(),
      ),
    [examId, results, user?.email],
  )

  const requestFullscreen = async () => {
    await requestFullscreenAgain()
    if (!document.fullscreenElement) {
      setFeedback('Your browser blocked fullscreen. Use F11 or click the browser prompt to continue.')
    }
  }

  const goToPreviousQuestion = () => {
    setCurrentQuestionIndex((current) => Math.max(0, current - 1))
  }

  const goToNextQuestion = () => {
    setCurrentQuestionIndex((current) => Math.min(activeQuestions.length - 1, current + 1))
  }

  const handleAnswerChange = (questionId, value) => {
    setAnswers((current) => ({ ...current, [questionId]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!activeExam || activeQuestions.length === 0) {
      setFeedback('This exam is not available or has no questions yet.')
      return
    }

    if (hasAlreadyTaken) {
      setFeedback('You have already taken this exam.')
      return
    }

    if (!cameraReady) {
      setFeedback('Camera must stay on before you can submit this exam.')
      return
    }

    setIsSubmitting(true)
    setFeedback('')

    const responses = activeQuestions.map((question) => ({
      questionId: question.id,
      selectedOption: Number(answers[question.id]),
    }))

    const result = await onSubmitResult({
      examId: activeExam.id,
      student: user?.name || 'Student',
      studentEmail: user?.email || '',
      responses,
      proctorEvents,
    })

    if (result.success) {
      navigate('/student', {
        replace: true,
        state: { message: 'Your exam was submitted successfully.' },
      })
      return
    }

    setFeedback(result.error)
    setIsSubmitting(false)
  }

  if (!activeExam) {
    return (
      <section className="panel mx-auto w-full max-w-4xl">
        <h2 className="text-xl font-bold text-slate-950">Exam not found</h2>
        <p className="mt-2 text-sm text-slate-600">
          This exam may no longer be published or the link is invalid.
        </p>
        <Link className="btn mt-5 w-fit" to="/student">
          Back to portal
        </Link>
      </section>
    )
  }

  if (hasAlreadyTaken) {
    return (
      <section className="panel mx-auto w-full max-w-4xl">
        <h2 className="text-xl font-bold text-slate-950">Exam already taken</h2>
        <p className="mt-2 text-sm text-slate-600">
          You have already submitted this exam and cannot retake it.
        </p>
        <Link className="btn mt-5 w-fit" to="/student">
          Back to portal
        </Link>
      </section>
    )
  }

  return (
    <section className="panel mx-auto w-full max-w-5xl">
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

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-950">{activeExam.title}</h2>
          <p className="text-sm text-slate-500">{activeExam.subject}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm font-semibold text-slate-700">
          <span className="rounded-lg bg-slate-100 px-3 py-2">{activeExam.duration} minutes</span>
          <span className="rounded-lg bg-slate-100 px-3 py-2">{activeQuestions.length} questions</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_0.8fr]">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <form className="space-y-4" onSubmit={handleSubmit}>
            {currentQuestion ? (
              <fieldset className="rounded-2xl border border-slate-200 bg-white p-4" key={currentQuestion.id}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <legend className="px-1 text-sm font-bold text-slate-900">
                    Question {currentQuestionIndex + 1} of {activeQuestions.length}
                  </legend>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {answers[currentQuestion.id] !== undefined ? 'Answered' : 'Unanswered'}
                  </span>
                </div>
                <p className="mt-3 font-medium text-slate-800">{currentQuestion.text}</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {currentQuestion.options.map((option, optionIndex) => (
                    <label
                      className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 hover:border-teal-300 hover:bg-teal-50"
                      key={option}
                    >
                      <input
                        checked={String(answers[currentQuestion.id]) === String(optionIndex)}
                        className="h-4 w-4 accent-teal-700"
                        name={`question-${currentQuestion.id}`}
                        onChange={() => handleAnswerChange(currentQuestion.id, optionIndex)}
                        type="radio"
                      />
                      <span>{option}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : (
              <p className="empty-box">This exam has no questions yet.</p>
            )}

            {feedback ? <p className="text-sm font-semibold text-slate-700">{feedback}</p> : null}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex flex-wrap gap-2">
                <button className="btn-light" disabled={currentQuestionIndex === 0} onClick={goToPreviousQuestion} type="button">
                  Previous
                </button>
                <button
                  className="btn-light"
                  disabled={currentQuestionIndex >= activeQuestions.length - 1}
                  onClick={goToNextQuestion}
                  type="button"
                >
                  Next
                </button>
              </div>
              <div className="flex flex-wrap justify-end gap-3">
                <Link className="btn-light" to="/student">
                  Cancel
                </Link>
                <button className="btn" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Exam'}
                </button>
              </div>
            </div>
          </form>
        </div>

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
        </div>
      </div>

      {hasTabSwitchViolation ? (
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
      ) : null}
    </section>
  )
}