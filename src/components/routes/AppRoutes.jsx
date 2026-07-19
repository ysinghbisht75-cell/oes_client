import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedLayout from '../layout/ProtectedLayout.jsx'
import Admin from '../pages/AdminDashboard.jsx'
import Login from '../pages/LoginPage.jsx'
import Register from '../pages/RegisterPage.jsx'
import StudentAnswerPage from '../pages/StudentAnswerPage.jsx'
import StudentExamPage from '../pages/StudentExamPage.jsx'
import Student from '../pages/StudentPortal.jsx'

export default function AppRoutes({
  activeAdminTab,
  authProps,
  changeResultPublication,
  examManagementProps,
  logout,
  questionBankProps,
  questions,
  results,
  setActiveAdminTab,
  submitResult,
  user,
  exams,
}) {
  const homePath = user?.role === 'admin' ? '/admin' : '/student'

  const protectedPage = (role, title, children) => {
    if (!user) return <Navigate to="/login" replace />
    if (user.role !== role) return <Navigate to={user.role === 'admin' ? '/admin' : '/student'} replace />

    return (
      <ProtectedLayout logout={logout} title={title} user={user}>
        {children}
      </ProtectedLayout>
    )
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to={homePath} replace /> : <Login {...authProps} />}
      />
      <Route
        path="/register"
        element={user ? <Navigate to={homePath} replace /> : <Register {...authProps} />}
      />
      <Route
        path="/admin"
        element={protectedPage(
          'admin',
          'Admin Dashboard',
          <Admin
            activeAdminTab={activeAdminTab}
            changeResultPublication={changeResultPublication}
            examManagementProps={examManagementProps}
            questionBankProps={questionBankProps}
            results={results}
            setActiveAdminTab={setActiveAdminTab}
          />,
        )}
      />
      <Route
        path="/student"
        element={protectedPage(
          'student',
          'Student Portal',
          <Student exams={exams} questions={questions} results={results} user={user} />,
        )}
      />
      <Route
        path="/student/exams/:examId"
        element={protectedPage(
          'student',
          'Student Exam',
          <StudentExamPage
            exams={exams}
            onSubmitResult={submitResult}
            questions={questions}
            results={results}
            user={user}
          />,
        )}
      />
      <Route
        path="/student/results/:resultId"
        element={protectedPage(
          'student',
          'Student Answer Review',
          <StudentAnswerPage questions={questions} results={results} user={user} />,
        )}
      />
      <Route path="/" element={user ? <Navigate to={homePath} replace /> : <Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
