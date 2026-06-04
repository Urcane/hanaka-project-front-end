export function createId(prefix = 'id') {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${crypto.randomUUID().slice(0, 8)}`
  }

  const randomPart = Math.random().toString(16).slice(2, 10)
  return `${prefix}_${Date.now().toString(16)}${randomPart}`
}

export function createOrderNumber() {
  const now = new Date()
  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('')

  const timePart = [
    String(now.getHours()).padStart(2, '0'),
    String(now.getMinutes()).padStart(2, '0'),
    String(now.getSeconds()).padStart(2, '0'),
  ].join('')

  const randomPart = Math.floor(Math.random() * 900 + 100)
  return `HNK-${datePart}-${timePart}-${randomPart}`
}
