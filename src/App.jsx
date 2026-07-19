import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './components/routes/AppRoutes.jsx'
import { useAppData } from './hooks/useAppData.js'

export default function App() {
  const appData = useAppData()
  const authProps = {
    authError: appData.authError,
    loginForm: appData.loginForm,
    onLogin: appData.onLogin,
    onRegister: appData.onRegister,
    registerForm: appData.registerForm,
    setLoginForm: appData.setLoginForm,
    setRegisterForm: appData.setRegisterForm,
  }

  return (
    <BrowserRouter>
      <AppRoutes
        activeAdminTab={appData.activeAdminTab}
        authProps={authProps}
        changeResultPublication={appData.changeResultPublication}
        examManagementProps={appData.examManagementProps}
        exams={appData.exams}
        logout={appData.logout}
        questionBankProps={appData.questionBankProps}
        questions={appData.questions}
        results={appData.results}
        setActiveAdminTab={appData.setActiveAdminTab}
        submitResult={appData.submitResult}
        user={appData.user}
      />
    </BrowserRouter>
  )
}
