export default function ProtectedLayout({ children, logout, title, user }) {
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
