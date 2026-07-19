import ExamManagementPage from './ExamManagement.jsx'
import QuestionBankPage from './QuestionBank.jsx'
import ResultHistoryPage from './AdminResultHistory.jsx'

const tabs = [
  { key: 'exams', label: 'Exam Management' },
  { key: 'questions', label: 'Question Bank' },
  { key: 'results', label: 'Result History' },
]

export default function Admin({
  activeAdminTab,
  changeResultPublication,
  examManagementProps,
  questionBankProps,
  results,
  setActiveAdminTab,
}) {
  return (
    <section className="w-full space-y-5 lg:grid lg:grid-cols-[220px_1fr] lg:gap-5 px-4 lg:px-6">
      <aside className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4 sticky top-4 h-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`admin-tab ${activeAdminTab === tab.key ? 'admin-tab-active' : 'admin-tab-normal'}`}
            onClick={() => setActiveAdminTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </aside>

      <div className="min-w-0">
        {activeAdminTab === 'exams' && (
          <ExamManagementPage {...examManagementProps} />
        )}
        {activeAdminTab === 'questions' && (
          <QuestionBankPage {...questionBankProps} />
        )}
        {activeAdminTab === 'results' && (
          <ResultHistoryPage
            changeResultPublication={changeResultPublication}
            results={results}
          />
        )}
      </div>
    </section>
  )
}
