import { Link, useNavigate } from 'react-router-dom'

export default function Register({
  authError,
  onRegister,
  registerForm,
  setRegisterForm,
}) {
  const navigate = useNavigate()

  const handleSubmit = async (event) => {
    const success = await onRegister(event)
    if (success) {
      navigate('/student')
    }
  }

  return (
    <main className="login-bg">
      <section className="card w-full max-w-3xl">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div className="space-y-4">
            <div className="rounded-3xl bg-teal-700 p-8 text-white shadow-lg lg:min-h-full">
              <div className="mb-6 text-center lg:text-left">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-teal-100">
                  Examination System
                </p>
                <h1 className="mt-4 text-3xl font-bold">Create your account</h1>
                <p className="mt-3 text-sm text-teal-100/90">
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <form className="grid gap-4" onSubmit={handleSubmit}>
              <label className="label">
                Name
                <input
                  className="input"
                  value={registerForm.name}
                  onChange={(event) =>
                    setRegisterForm({
                      ...registerForm,
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
                  type="text"
                  value={registerForm.email}
                  onChange={(event) =>
                    setRegisterForm({
                      ...registerForm,
                      email: event.target.value,
                    })
                  }
                  placeholder="name@example.com"
                  required
                />
              </label>
              <label className="label">
                Password
                <input
                  className="input"
                  type="password"
                  value={registerForm.password}
                  onChange={(event) =>
                    setRegisterForm({
                      ...registerForm,
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
                Register
              </button>

              <p className="text-center text-sm text-slate-500">
                Already have an account?{' '}
                <Link className="font-semibold text-slate-900" to="/login">
                  Login
                </Link>
              </p>
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}
