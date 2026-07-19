import { Link, useNavigate } from 'react-router-dom'

export default function Login({ authError, loginForm, onLogin, setLoginForm }) {
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    const success = await onLogin(event)
    if (success) {
      const destination = loginForm.role === 'admin' ? '/admin' : '/student'
      navigate(destination)
    }
  }

  return (
    <main className="login-bg">
      <section className="w-full max-w-sm">
        <form className="card space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-3 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-xl bg-slate-900 text-xl font-bold text-white">
              ES
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">
              Examination System
            </p>
            <h1 className="text-3xl font-bold text-slate-900">Login</h1>
            <p className="text-sm text-slate-500">
              Choose your role and sign in.
            </p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
              {['admin', 'student'].map((role) => (
                <button
                  className={`min-h-11 rounded-lg text-sm font-bold capitalize ${
                    loginForm.role === role
                      ? 'bg-white text-teal-800 shadow-sm'
                      : 'bg-transparent text-slate-500 hover:text-slate-800'
                  }`}
                  key={role}
                  type="button"
                  onClick={() =>
                    setLoginForm({
                      ...loginForm,
                      role,
                    })
                  }
                >
                  {role}
                </button>
              ))}
            </div>
            {loginForm.role === 'admin' ? (
              <label className="label">
                Email
                <input
                  className="input"
                  type="email"
                  value={loginForm.email}
                  onChange={(event) =>
                    setLoginForm({
                      ...loginForm,
                      email: event.target.value,
                    })
                  }
                  placeholder="admin@gmail.com"
                  required
                />
              </label>
            ) : (
              <>
                <label className="label">
                  Name
                  <input
                    className="input"
                    value={loginForm.name}
                    onChange={(event) =>
                      setLoginForm({
                        ...loginForm,
                        name: event.target.value,
                      })
                    }
                    placeholder="Enter your name"
                    required
                  />
                </label>
                <label className="label">
                  Email
                  <input
                    className="input"
                    type="email"
                    value={loginForm.email}
                    onChange={(event) =>
                      setLoginForm({
                        ...loginForm,
                        email: event.target.value,
                      })
                    }
                    placeholder="name@example.com"
                    required
                  />
                </label>
              </>
            )}

            <label className="label">
              Password
              <input
                className="input"
                type="password"
                value={loginForm.password}
                onChange={(event) =>
                  setLoginForm({
                    ...loginForm,
                    password: event.target.value,
                  })
                }
                placeholder="Enter password"
                required
              />
            </label>
            {authError ? (
              <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {authError}
              </p>
            ) : null}
            <button className="btn w-full" type="submit">
              Login
            </button>
            <p className="text-center text-sm text-slate-500">
              Don't have an account?{' '}
              <Link className="font-bold text-teal-700 hover:text-teal-900" to="/register">
                Register
              </Link>
            </p>
          </div>
        </form>
      </section>
    </main>
  )
}
