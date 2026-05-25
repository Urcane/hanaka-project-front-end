import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useApp } from '../context/useApp.js'
import { validateRegistrationInput } from '../models/authModel.js'
import { hasAnyError } from '../validation/customValidation.js'

const initialForm = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
}

function RegisterPage() {
  const [formValues, setFormValues] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { registerAccount } = useApp()
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

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSubmitError('')

    const validationErrors = validateRegistrationInput(formValues)
    setErrors(validationErrors)

    if (hasAnyError(validationErrors)) {
      return
    }

    setIsSubmitting(true)
    try {
      await registerAccount(formValues)
      const redirectTo = location.state?.redirectTo ?? '/'
      navigate(redirectTo, { replace: true })
    } catch (err) {
      if (err.status === 409) {
        setSubmitError('Email ini sudah terdaftar. Silakan login.')
      } else if (err.status === 400 && err.errors) {
        setErrors(err.errors)
      } else {
        setSubmitError(err.message || 'Terjadi kesalahan. Silakan coba lagi.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <p className="brand-eyebrow">Hanaka Cake</p>
        <h1>Buat Akun</h1>
        <p className="muted-text">
          Daftar akun customer untuk order cake custom dan cek order history.
        </p>

        <form className="form-grid" onSubmit={handleSubmit} noValidate>
          <label className="field" htmlFor="register-name">
            Nama Lengkap
            <input
              id="register-name"
              type="text"
              name="fullName"
              placeholder="Nama lengkap"
              value={formValues.fullName}
              onChange={handleChange}
            />
            {errors.fullName && (
              <span className="field-error">{errors.fullName}</span>
            )}
          </label>

          <label className="field" htmlFor="register-email">
            Email
            <input
              id="register-email"
              type="email"
              name="email"
              placeholder="nama@email.com"
              value={formValues.email}
              onChange={handleChange}
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </label>

          <label className="field" htmlFor="register-phone">
            No Telepon
            <input
              id="register-phone"
              type="tel"
              name="phone"
              placeholder="08xxxxxxxxxx"
              value={formValues.phone}
              onChange={handleChange}
            />
            {errors.phone && <span className="field-error">{errors.phone}</span>}
          </label>

          <label className="field" htmlFor="register-password">
            Password
            <input
              id="register-password"
              type="password"
              name="password"
              placeholder="Minimal 8 karakter"
              value={formValues.password}
              onChange={handleChange}
            />
            {errors.password && (
              <span className="field-error">{errors.password}</span>
            )}
          </label>

          <label className="field" htmlFor="register-confirm-password">
            Konfirmasi Password
            <input
              id="register-confirm-password"
              type="password"
              name="confirmPassword"
              placeholder="Ulangi password"
              value={formValues.confirmPassword}
              onChange={handleChange}
            />
            {errors.confirmPassword && (
              <span className="field-error">{errors.confirmPassword}</span>
            )}
          </label>

          {submitError && <p className="submit-error">{submitError}</p>}

          <button type="submit" className="primary-button" disabled={isSubmitting}>
            {isSubmitting ? 'Memproses...' : 'Buat Akun'}
          </button>
        </form>

        <p className="switch-auth">
          Sudah punya akun?{' '}
          <Link to="/login" state={location.state}>
            Login di sini
          </Link>
        </p>
      </section>
    </main>
  )
}

export default RegisterPage
