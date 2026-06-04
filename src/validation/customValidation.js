function normalizeText(value) {
  if (value === null || value === undefined) {
    return ''
  }

  return String(value).trim()
}

export const validators = {
  required: (message = 'Field ini wajib diisi.') => (value) => {
    return normalizeText(value) ? null : message
  },

  email: (message = 'Format email belum valid.') => (value) => {
    const rawValue = normalizeText(value)
    if (!rawValue) {
      return null
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(rawValue) ? null : message
  },

  phoneId: (message = 'Nomor telepon Indonesia belum valid.') => (value) => {
    const rawValue = normalizeText(value).replace(/[\s-]/g, '')
    if (!rawValue) {
      return null
    }

    const phoneRegex = /^(?:\+62|62|0)8[1-9][0-9]{6,11}$/
    return phoneRegex.test(rawValue) ? null : message
  },

  minLength: (minimum, message) => (value) => {
    const rawValue = normalizeText(value)
    if (!rawValue) {
      return null
    }

    return rawValue.length >= minimum
      ? null
      : message ?? `Minimal ${minimum} karakter.`
  },

  maxLength: (maximum, message) => (value) => {
    const rawValue = normalizeText(value)
    if (!rawValue) {
      return null
    }

    return rawValue.length <= maximum
      ? null
      : message ?? `Maksimal ${maximum} karakter.`
  },

  oneOf: (allowedValues, message = 'Nilai yang dipilih tidak valid.') => (value) => {
    const rawValue = normalizeText(value)
    if (!rawValue) {
      return null
    }

    return allowedValues.includes(rawValue) ? null : message
  },

  numeric: (message = 'Field ini harus berupa angka.') => (value) => {
    const rawValue = normalizeText(value)
    if (!rawValue) {
      return null
    }

    return Number.isNaN(Number(rawValue)) ? message : null
  },

  minNumber: (minimum, message) => (value) => {
    const rawValue = normalizeText(value)
    if (!rawValue) {
      return null
    }

    return Number(rawValue) >= minimum ? null : message ?? `Minimal ${minimum}.`
  },

  maxNumber: (maximum, message) => (value) => {
    const rawValue = normalizeText(value)
    if (!rawValue) {
      return null
    }

    return Number(rawValue) <= maximum ? null : message ?? `Maksimal ${maximum}.`
  },

  strongPassword:
    (message = 'Password minimal 8 karakter dan mengandung huruf + angka.') =>
    (value) => {
      const rawValue = normalizeText(value)
      if (!rawValue) {
        return null
      }

      const hasLetter = /[A-Za-z]/.test(rawValue)
      const hasNumber = /\d/.test(rawValue)
      return rawValue.length >= 8 && hasLetter && hasNumber ? null : message
    },

  sameAs: (fieldName, message = 'Nilai tidak sama.') => (value, values) => {
    return normalizeText(value) === normalizeText(values[fieldName]) ? null : message
  },
}

export function when(predicate, validator) {
  return (value, values) => {
    if (!predicate(values)) {
      return null
    }

    return validator(value, values)
  }
}

export function validateSchema(schema, values) {
  const errors = {}

  Object.entries(schema).forEach(([fieldName, validatorList]) => {
    const validatorsToRun = Array.isArray(validatorList)
      ? validatorList
      : [validatorList]

    for (const validator of validatorsToRun) {
      const errorMessage = validator(values[fieldName], values)
      if (errorMessage) {
        errors[fieldName] = errorMessage
        break
      }
    }
  })

  return errors
}

export function hasAnyError(errors) {
  return Object.keys(errors).length > 0
}
