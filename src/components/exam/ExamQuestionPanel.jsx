import { Link } from 'react-router-dom'

export default function ExamQuestionPanel({
  answers,
  currentQuestion,
  currentQuestionIndex,
  feedback,
  handleAnswerChange,
  handleSubmit,
  isSubmitting,
  questionCount,
  goToNextQuestion,
  goToPreviousQuestion,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <form className="space-y-4" onSubmit={handleSubmit}>
        {currentQuestion ? (
          <fieldset className="rounded-2xl border border-slate-200 bg-white p-4" key={currentQuestion.id}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <legend className="px-1 text-sm font-bold text-slate-900">
                Question {currentQuestionIndex + 1} of {questionCount}
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
              disabled={currentQuestionIndex >= questionCount - 1}
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
  )
}
