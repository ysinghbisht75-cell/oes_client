import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { authenticateUser, registerUser } from './auth/auth.js'
import Admin from './components/pages/AdminDashboard.jsx'
import Login from './components/pages/LoginPage.jsx'
import Register from './components/pages/RegisterPage.jsx'
import StudentAnswerPage from './components/pages/StudentAnswerPage.jsx'
import Student from './components/pages/StudentPortal.jsx'
import StudentExamPage from './components/pages/StudentExamPage.jsx'
import { createExam, deleteExam, getExams, updateExam } from './services/examService.js'
import { createQuestion, deleteQuestion, getQuestions, updateQuestion } from './services/questionService.js'
import { createResult, getResults, updateResult } from './services/resultService.js'

function ProtectedLayout({ children, logout, title, user }) {
  return (
    <main className="app-bg">
      <header className="card mx-auto mb-6 flex w-full max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-teal-700">
            Examination System
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950">{title}</h1>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700">
            {user?.name}
          </span>
          <button type="button" className="btn-light" onClick={logout}>
            Logout
          </button>
        </div>
      </header>
      {children}
    </main>
  )
}

export default function App() {
  const [user, setUser] = useState(null)
  const [loginForm, setLoginForm] = useState({
    role: 'admin',
    name: '',
    email: '',
    password: '',
  })
  const [registerForm, setRegisterForm] = useState({
    role: 'student',
    name: '',
    email: '',
    password: '',
  })
  const [activeAdminTab, setActiveAdminTab] = useState('exams')
  const [authError, setAuthError] = useState('')
  const [questions, setQuestions] = useState([])
  const [exams, setExams] = useState([])
  const [editingExamId, setEditingExamId] = useState(null)
  const [editingQuestionId, setEditingQuestionId] = useState(null)
  const [questionExamId, setQuestionExamId] = useState('')
  const [examForm, setExamForm] = useState({
    title: '',
    subject: '',
    duration: '',
    startDate: '',
    endDate: '',
    status: 'Draft',
  })
  const [questionForm, setQuestionForm] = useState({
    text: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    answer: '0',
  })
  const [selectedExamId, setSelectedExamId] = useState('')
  const [results, setResults] = useState([])

  const resetExamForm = () => {
    setExamForm({
      title: '',
      subject: '',
      duration: '',
      startDate: '',
      endDate: '',
      status: 'Draft',
    })
  }

  const resetQuestionForm = () => {
    setEditingQuestionId(null)
    setQuestionForm({
      text: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      answer: '0',
    })
  }

  const loadData = async () => {
    const [nextExams, nextQuestions, nextResults] = await Promise.all([
      getExams(),
      getQuestions(),
      getResults(),
    ])
    setExams(nextExams)
    setQuestions(nextQuestions)
    setResults(nextResults)
  }

  const onLogin = async (event) => {
    event.preventDefault()
    setAuthError('')

    const result = await authenticateUser(loginForm)

    if (!result.success) {
      setAuthError(result.error)
      return false
    }

    await loadData().catch(() => {
      setExams([])
      setQuestions([])
      setResults([])
    })
    setUser(result.user)
    return true
  }

  const onRegister = async (event) => {
    event.preventDefault()
    setAuthError('')

    const result = await registerUser({
      ...registerForm,
      role: 'student',
    })

    if (!result.success) {
      setAuthError(result.error)
      return false
    }

    await loadData().catch(() => {
      setExams([])
      setQuestions([])
      setResults([])
    })
    setUser(result.user)
    return true
  }

  const logout = () => {
    setUser(null)
    setAuthError('')
    setResults([])
    setSelectedExamId('')
    setQuestionExamId('')
    resetExamForm()
    resetQuestionForm()
  }

  const addExam = async (event) => {
    event.preventDefault()
    if (!examForm.title.trim() || !examForm.subject.trim()) return

    const existingExam = editingExamId
      ? exams.find((exam) => exam.id === Number(editingExamId))
      : null

    const nextExam = {
      title: examForm.title.trim(),
      subject: examForm.subject.trim(),
      duration: Number(examForm.duration) || 30,
      startDate: examForm.startDate,
      endDate: examForm.endDate,
      status: examForm.status,
      questionIds: existingExam?.questionIds ?? [],
    }

    if (editingExamId) {
      const updatedExams = await updateExam(editingExamId, nextExam)
      setExams(updatedExams)
      setEditingExamId(null)
    } else {
      const updatedExams = await createExam(nextExam)
      setExams(updatedExams)
      setSelectedExamId(updatedExams[0]?.id)
      setQuestionExamId(updatedExams[0]?.id ?? '')
    }

    resetExamForm()
  }

  const startEditExam = (exam) => {
    setEditingExamId(exam.id)
    setQuestionExamId(exam.id)
    setExamForm({
      title: exam.title,
      subject: exam.subject,
      duration: exam.duration,
      startDate: exam.startDate || '',
      endDate: exam.endDate || '',
      status: exam.status,
    })
  }

  const cancelEditExam = () => {
    setEditingExamId(null)
    resetExamForm()
  }

  const editExam = async (id, updates) => {
    const updatedExams = await updateExam(id, updates)
    setExams(updatedExams)
  }

  const removeExam = async (id) => {
    const data = await deleteExam(id)
    setExams(data.exams)
    setQuestions(data.questions)
    if (selectedExamId === String(id)) {
      setSelectedExamId('')
    }
  }

  const addQuestion = async (event) => {
    event.preventDefault()
    if (
      !questionForm.text.trim() ||
      !questionForm.optionA.trim() ||
      !questionForm.optionB.trim()
    ) {
      return
    }

    const targetExamId = Number(questionExamId || selectedExamId || exams[0]?.id)

    if (!targetExamId) {
      return
    }

    const payload = {
      text: questionForm.text.trim(),
      options: [
        questionForm.optionA.trim(),
        questionForm.optionB.trim(),
        questionForm.optionC.trim() || 'None of these',
        questionForm.optionD.trim() || 'All of these',
      ],
      answer: Number(questionForm.answer),
      examId: targetExamId,
    }

    if (editingQuestionId) {
      const data = await updateQuestion(editingQuestionId, payload)
      setQuestions(data.questions)
      setExams(data.exams)
    } else {
      const data = await createQuestion(payload)
      setQuestions(data.questions)
      setExams(data.exams)
    }

    resetQuestionForm()
  }

  const startEditQuestion = (question) => {
    setEditingQuestionId(question.id)
    setQuestionExamId(Number(question.examId))
    setQuestionForm({
      text: question.text,
      optionA: question.options?.[0] || '',
      optionB: question.options?.[1] || '',
      optionC: question.options?.[2] || '',
      optionD: question.options?.[3] || '',
      answer: String(question.answer ?? 0),
    })
  }

  const removeQuestion = async (questionId) => {
    const data = await deleteQuestion(questionId)
    setQuestions(data.questions)
    setExams(data.exams)
  }

  const submitResult = async (resultData) => {
    try {
      const data = await createResult(resultData)
      setResults(data.results)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const changeResultPublication = async (resultId, published) => {
    try {
      const updatedResult = await updateResult(resultId, { published })
      setResults((currentResults) =>
        currentResults.map((result) => (result.id === resultId ? updatedResult : result)),
      )
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const authProps = {
    authError,
    loginForm,
    onLogin,
    registerForm,
    onRegister,
    setLoginForm,
    setRegisterForm,
  }

  const examManagementProps = {
    addExam,
    cancelEditExam,
    editExam,
    editingExamId,
    examForm,
    exams,
    removeExam,
    setExamForm,
    startEditExam,
  }

  const questionBankProps = {
    addQuestion,
    editingQuestionId,
    exams,
    questionExamId,
    questionForm,
    questions,
    removeQuestion,
    setQuestionExamId,
    setQuestionForm,
    startEditQuestion,
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to={user.role === 'admin' ? '/admin' : '/student'} replace />
            ) : (
              <Login {...authProps} />
            )
          }
        />

        <Route
          path="/register"
          element={
            user ? (
              <Navigate to={user.role === 'admin' ? '/admin' : '/student'} replace />
            ) : (
              <Register {...authProps} />
            )
          }
        />

        <Route
          path="/admin"
          element={
            user ? (
              user.role === 'admin' ? (
                <ProtectedLayout logout={logout} title="Admin Dashboard" user={user}>
                  <Admin
                    activeAdminTab={activeAdminTab}
                    examManagementProps={examManagementProps}
                    questionBankProps={questionBankProps}
                    changeResultPublication={changeResultPublication}
                    results={results}
                    setActiveAdminTab={setActiveAdminTab}
                  />
                </ProtectedLayout>
              ) : (
                <Navigate to="/student" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/student"
          element={
            user ? (
              user.role === 'student' ? (
                <ProtectedLayout logout={logout} title="Student Portal" user={user}>
                  <Student exams={exams} questions={questions} results={results} user={user} />
                </ProtectedLayout>
              ) : (
                <Navigate to="/admin" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/student/exams/:examId"
          element={
            user ? (
              user.role === 'student' ? (
                <ProtectedLayout logout={logout} title="Student Exam" user={user}>
                  <StudentExamPage
                    exams={exams}
                    onSubmitResult={submitResult}
                    questions={questions}
                    results={results}
                    user={user}
                  />
                </ProtectedLayout>
              ) : (
                <Navigate to="/admin" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/student/results/:resultId"
          element={
            user ? (
              user.role === 'student' ? (
                <ProtectedLayout logout={logout} title="Student Answer Review" user={user}>
                  <StudentAnswerPage questions={questions} results={results} user={user} />
                </ProtectedLayout>
              ) : (
                <Navigate to="/admin" replace />
              )
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="/"
          element={
            user ? (
              <Navigate to={user.role === 'admin' ? '/admin' : '/student'} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
