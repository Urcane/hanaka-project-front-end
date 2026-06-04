import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../context/useApp.js'
import { validateLoginInput } from '../models/authModel.js'
import { hasAnyError } from '../validation/customValidation.js'

const initialForm = {
  email: '',
  password: '',
}

function LoginPage() {
  const [formValues, setFormValues] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')

  const { loginAccount } = useApp()
  const location = useLocation()
  const navigate = useNavigate()

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormValues((previousValues) => ({
      ...previousValues,
      [name]: value,
    }))

    setErrors((previousErrors) => {
      if (!previousErrors[name]) {
        return previousErrors
      }

      const nextErrors = { ...previousErrors }
      delete nextErrors[name]
      return nextErrors
    })
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmitError('')

    const validationErrors = validateLoginInput(formValues)
    setErrors(validationErrors)

    if (hasAnyError(validationErrors)) {
      return
    }

    const result = loginAccount(formValues)
    if (!result.ok) {
      setSubmitError(result.error)
      return
    }

    const redirectTo = location.state?.redirectTo ?? '/'
    navigate(redirectTo, { replace: true })
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="brand-eyebrow">Hanaka Cake</p>
        <h1>Login Customer</h1>
        <p className="muted-text">
          Masuk ke akunmu untuk mulai pilih varian cake dan lanjut checkout.
        </p>

        <form className="form-grid" onSubmit={handleSubmit} noValidate>
          <label className="field" htmlFor="login-email">
            Email
            <input
              id="login-email"
              type="email"
              name="email"
              placeholder="nama@email.com"
              value={formValues.email}
              onChange={handleChange}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </label>

          <label className="field" htmlFor="login-password">
            Password
            <input
              id="login-password"
              type="password"
              name="password"
              placeholder="Masukkan password"
              value={formValues.password}
              onChange={handleChange}
            />
            {errors.password && (
              <span className="field-error">{errors.password}</span>
            )}
          </label>

          {submitError && <p className="submit-error">{submitError}</p>}

          <button type="submit" className="primary-button">
            Login
          </button>
        </form>

        <p className="switch-auth">
          Belum punya akun?{' '}
          <Link to="/register" state={location.state}>
            Daftar sekarang
          </Link>
        </p>
      </section>
    </main>
  )
}

export default LoginPage
