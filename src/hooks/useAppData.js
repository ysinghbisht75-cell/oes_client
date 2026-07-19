import { useState } from 'react'
import { authenticateUser, registerUser } from '../auth/auth.js'
import { createExam, deleteExam, getExams, updateExam } from '../services/examService.js'
import { createQuestion, deleteQuestion, getQuestions, updateQuestion } from '../services/questionService.js'
import { createResult, getResults, updateResult } from '../services/resultService.js'

const emptyExamForm = {
  title: '',
  subject: '',
  duration: '',
  startDate: '',
  endDate: '',
  status: 'Draft',
}

const emptyQuestionForm = {
  text: '',
  optionA: '',
  optionB: '',
  optionC: '',
  optionD: '',
  answer: '0',
}

export function useAppData() {
  const [user, setUser] = useState(null)
  const [loginForm, setLoginForm] = useState({ role: 'admin', name: '', email: '', password: '' })
  const [registerForm, setRegisterForm] = useState({ role: 'student', name: '', email: '', password: '' })
  const [activeAdminTab, setActiveAdminTab] = useState('exams')
  const [authError, setAuthError] = useState('')
  const [questions, setQuestions] = useState([])
  const [exams, setExams] = useState([])
  const [editingExamId, setEditingExamId] = useState(null)
  const [editingQuestionId, setEditingQuestionId] = useState(null)
  const [questionExamId, setQuestionExamId] = useState('')
  const [examForm, setExamForm] = useState(emptyExamForm)
  const [questionForm, setQuestionForm] = useState(emptyQuestionForm)
  const [selectedExamId, setSelectedExamId] = useState('')
  const [results, setResults] = useState([])

  const resetExamForm = () => setExamForm(emptyExamForm)

  const resetQuestionForm = () => {
    setEditingQuestionId(null)
    setQuestionForm(emptyQuestionForm)
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

  const loadDataOrClear = async () => {
    await loadData().catch(() => {
      setExams([])
      setQuestions([])
      setResults([])
    })
  }

  const onLogin = async (event) => {
    event.preventDefault()
    setAuthError('')

    const result = await authenticateUser(loginForm)
    if (!result.success) {
      setAuthError(result.error)
      return false
    }

    await loadDataOrClear()
    setUser(result.user)
    return true
  }

  const onRegister = async (event) => {
    event.preventDefault()
    setAuthError('')

    const result = await registerUser({ ...registerForm, role: 'student' })
    if (!result.success) {
      setAuthError(result.error)
      return false
    }

    await loadDataOrClear()
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

    const existingExam = editingExamId ? exams.find((exam) => exam.id === Number(editingExamId)) : null
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
    if (selectedExamId === String(id)) setSelectedExamId('')
  }

  const addQuestion = async (event) => {
    event.preventDefault()
    if (!questionForm.text.trim() || !questionForm.optionA.trim() || !questionForm.optionB.trim()) return

    const targetExamId = Number(questionExamId || selectedExamId || exams[0]?.id)
    if (!targetExamId) return

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

    const data = editingQuestionId
      ? await updateQuestion(editingQuestionId, payload)
      : await createQuestion(payload)

    setQuestions(data.questions)
    setExams(data.exams)
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

  return {
    activeAdminTab,
    authError,
    changeResultPublication,
    exams,
    loginForm,
    logout,
    onLogin,
    onRegister,
    questions,
    registerForm,
    results,
    setActiveAdminTab,
    setLoginForm,
    setRegisterForm,
    submitResult,
    user,
    examManagementProps: {
      addExam,
      cancelEditExam,
      editExam,
      editingExamId,
      examForm,
      exams,
      removeExam,
      setExamForm,
      startEditExam,
    },
    questionBankProps: {
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
    },
  }
}
