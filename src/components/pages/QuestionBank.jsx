const questionOptions = ['optionA', 'optionB', 'optionC', 'optionD']

export default function QuestionBankPage({
  addQuestion,
  exams,
  questionExamId,
  questionForm,
  questions,
  setQuestionExamId,
  setQuestionForm,
}) {
  const updateForm = (setter, form, name, value) =>
    setter({ ...form, [name]: value })

  // Show only questions for the selected exam
  const filteredQuestions = questionExamId
    ? questions.filter(
        (question) => Number(question.examId) === Number(questionExamId)
      )
    : []

  return (
    <section className="panel">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-black">
          Question Bank Management
        </h2>
        <span className="badge">{filteredQuestions.length} questions</span>
      </div>

      <form className="mb-6 grid gap-4" onSubmit={addQuestion}>
        <label className="label">
          Add to exam
          <select
            className="input"
            value={questionExamId}
            onChange={(event) => setQuestionExamId(event.target.value)}
          >
            <option value="">Select an exam</option>
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.title}
              </option>
            ))}
          </select>
        </label>

        <label className="label">
          Question
          <textarea
            className="input min-h-24 resize-y"
            value={questionForm.text}
            onChange={(event) =>
              updateForm(setQuestionForm, questionForm, 'text', event.target.value)
            }
            placeholder="Type the question"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          {questionOptions.map((option, index) => (
            <label className="label" key={option}>
              Option {index + 1}
              <input
                className="input"
                value={questionForm[option]}
                onChange={(event) =>
                  updateForm(
                    setQuestionForm,
                    questionForm,
                    option,
                    event.target.value
                  )
                }
                placeholder={`Answer choice ${index + 1}`}
              />
            </label>
          ))}
        </div>

        <label className="label">
          Correct answer
          <select
            className="input"
            value={questionForm.answer}
            onChange={(event) =>
              updateForm(
                setQuestionForm,
                questionForm,
                'answer',
                event.target.value
              )
            }
          >
            <option value="0">Option 1</option>
            <option value="1">Option 2</option>
            <option value="2">Option 3</option>
            <option value="3">Option 4</option>
          </select>
        </label>

        <button className="btn w-full sm:w-fit" type="submit">
          Add Question
        </button>
      </form>

      {!questionExamId ? (
        <p className="empty-box">
          Select an exam to view its questions.
        </p>
      ) : filteredQuestions.length === 0 ? (
        <p className="empty-box">
          No questions added for this exam.
        </p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {filteredQuestions.map((question) => {
            const linkedExam = exams.find(
              (exam) => Number(exam.id) === Number(question.examId)
            )

            return (
              <article
                className="rounded-xl border border-white bg-slate-50 p-4"
                key={question.id}
              >
                <p className="line-clamp-2 font-semibold text-black">
                  {question.text}
                </p>

                <small className="mt-2 block text-black">
                  Correct: {question.options[question.answer]}
                </small>

                <small className="mt-2 block text-slate-500">
                  {linkedExam
                    ? `Exam: ${linkedExam.title}`
                    : 'No exam linked'}
                </small>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
