const examFields = [
  { name: 'title', label: 'Exam title', placeholder: 'Mid Term Test' },
  { name: 'subject', label: 'Subject', placeholder: 'Mathematics' },
  { name: 'duration', label: 'Duration', type: 'number', min: 1, placeholder: '30 mins' },
  { name: 'startDate', label: 'Start date', type: 'date' },
  { name: 'endDate', label: 'End date', type: 'date' },
]

export default function ExamManagementPage({
  addExam,
  cancelEditExam,
  editExam,
  editingExamId,
  examForm,
  exams,
  removeExam,
  setExamForm,
  startEditExam,
}) {
  const updateForm = (setter, form, name, value) => setter({ ...form, [name]: value })

  return (
    <section className="panel">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-xl font-bold text-black">Create and Manage Exams</h2>
        <span className="badge">{exams.length} exams</span>
      </div>

      <form className="mb-6 grid gap-2 items-end
             xl:grid-cols-[200px_200px_100px_160px_160px_110px_130px]" onSubmit={addExam}>
        {examFields.map((field) => (
          <label className="label" key={field.name}>
            {field.label}
            <input
              className="input"
              type={field.type || 'text'}
              min={field.min}
              value={examForm[field.name]}
              onChange={(event) => updateForm(setExamForm, examForm, field.name, event.target.value)}
              placeholder={field.placeholder}
            />
          </label>
        ))}
        <label className="label">
          Status
          <select
            className="input"
            value={examForm.status}
            onChange={(event) => updateForm(setExamForm, examForm, 'status', event.target.value)}
          >
            <option>Draft</option>
            <option>Published</option>
          </select>
        </label>
        <button className="btn" type="submit">
          Add Exam
        </button>
      </form>

      {editingExamId ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Edit Exam</h3>
                <p className="text-sm text-slate-500">Update the exam details below.</p>
              </div>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                onClick={cancelEditExam}
              >
              </button>
            </div>

            <form className="grid gap-4 p-6" onSubmit={addExam}>
              <div className="grid gap-4 md:grid-cols-2">
                {examFields.map((field) => (
                  <label className="label" key={field.name}>
                    {field.label}
                    <input
                      className="input"
                      type={field.type || 'text'}
                      min={field.min}
                      value={examForm[field.name]}
                      onChange={(event) => updateForm(setExamForm, examForm, field.name, event.target.value)}
                      placeholder={field.placeholder}
                    />
                  </label>
                ))}
              </div>
              <label className="label">
                Status
                <select
                  className="input"
                  value={examForm.status}
                  onChange={(event) => updateForm(setExamForm, examForm, 'status', event.target.value)}
                >
                  <option>Draft</option>
                  <option>Published</option>
                </select>
              </label>
              <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-4">
                <button className="btn-light" type="button" onClick={cancelEditExam}>
                  Cancel
                </button>
                <button className="btn" type="submit">
                  Update Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {exams.length === 0 ? (
        <p className="empty-box">No exams added yet.</p>
      ) : (
        <div className="space-y-3">
          {exams.map((exam) => (
            <div className="rounded-xl border border-slate-200 bg-white p-4" key={exam.id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-black font-semibold">{exam.title}</p>
                  <small className="text-slate-600">{exam.subject}</small>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 bg-green-400 px-3 py-1 text-sm font-bold text-black"
                    onClick={() => startEditExam(exam)}
                  >
                    Edit
                  </button>
                  <select
                    className="rounded-lg border border-slate-300 bg-blue-400 px-3 py-1 text-sm font-bold text-black"
                    value={exam.status}
                    onChange={(event) =>
                      editExam(exam.id, {
                        status: event.target.value,
                      })
                    }
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                  </select>
                  <button
                    type="button"
                    className="rounded-lg border border-red-500 bg-red-500 px-3 py-1 text-sm font-bold text-black"
                    onClick={() => removeExam(exam.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-700">
                <span>{exam.duration} min</span>
                <span>{exam.status}</span>
                {exam.startDate ? <span>From {exam.startDate}</span> : null}
                {exam.endDate ? <span>To {exam.endDate}</span> : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
