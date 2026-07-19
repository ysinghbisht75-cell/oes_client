import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import CameraProctorPanel from '../exam/CameraProctorPanel.jsx'
import ExamHeader from '../exam/ExamHeader.jsx'
import ExamQuestionPanel from '../exam/ExamQuestionPanel.jsx'
import ExamStatusAlerts from '../exam/ExamStatusAlerts.jsx'
import FocusLockOverlay from '../exam/FocusLockOverlay.jsx'
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

  const activeExam = exams.find(
    (exam) => String(exam.id) === String(examId) && exam.status === 'Published',
  )

  const recordViolation = async (eventType, details = '') => {
    if (!activeExam || !(user?.email || '').trim()) return

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
    latestViolation,
    requestFullscreenAgain,
    videoRef,
  } = useExamProtection({ onViolation: recordViolation })

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
      <ExamStatusAlerts
        hasTabSwitchViolation={hasTabSwitchViolation}
        isFullscreen={isFullscreen}
        requestFullscreen={requestFullscreen}
      />
      <ExamHeader exam={activeExam} questionCount={activeQuestions.length} />

      <div className="grid gap-6 lg:grid-cols-[1.6fr_0.8fr]">
        <ExamQuestionPanel
          answers={answers}
          currentQuestion={currentQuestion}
          currentQuestionIndex={currentQuestionIndex}
          feedback={feedback}
          goToNextQuestion={goToNextQuestion}
          goToPreviousQuestion={goToPreviousQuestion}
          handleAnswerChange={handleAnswerChange}
          handleSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          questionCount={activeQuestions.length}
        />
        <CameraProctorPanel
          cameraError={cameraError}
          cameraReady={cameraReady}
          latestViolation={latestViolation}
          videoRef={videoRef}
        />
      </div>

      <FocusLockOverlay
        hasTabSwitchViolation={hasTabSwitchViolation}
        requestFullscreenAgain={requestFullscreenAgain}
      />
    </section>
  )
}
