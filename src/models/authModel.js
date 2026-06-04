import { createId } from '../utils/id.js'
import { validateSchema, validators } from '../validation/customValidation.js'

const registrationSchema = {
  fullName: [
    validators.required('Nama lengkap wajib diisi.'),
    validators.minLength(3, 'Nama minimal 3 karakter.'),
  ],
  email: [
    validators.required('Email wajib diisi.'),
    validators.email('Masukkan format email yang valid.'),
  ],
  phone: [
    validators.required('Nomor telepon wajib diisi.'),
    validators.phoneId('Format nomor telepon Indonesia belum tepat.'),
  ],
  password: [
    validators.required('Password wajib diisi.'),
    validators.strongPassword(),
  ],
  confirmPassword: [
    validators.required('Konfirmasi password wajib diisi.'),
    validators.sameAs('password', 'Konfirmasi password tidak sama.'),
  ],
}

const loginSchema = {
  email: [
    validators.required('Email wajib diisi.'),
    validators.email('Masukkan format email yang valid.'),
  ],
  password: [validators.required('Password wajib diisi.')],
}

export function validateRegistrationInput(values) {
  return validateSchema(registrationSchema, values)
}

export function validateLoginInput(values) {
  return validateSchema(loginSchema, values)
}

function normalizePhone(phone) {
  return String(phone).replace(/[\s-]/g, '')
}

export function buildAccount(values) {
  return {
    id: createId('usr'),
    fullName: values.fullName.trim(),
    email: values.email.trim().toLowerCase(),
    phone: normalizePhone(values.phone),
    password: values.password,
    createdAt: new Date().toISOString(),
  }
}
