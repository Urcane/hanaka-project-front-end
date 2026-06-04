const STORAGE_KEYS = {
  users: 'hanaka_users_v1',
  sessionUserId: 'hanaka_session_user_v1',
  cartsByUser: 'hanaka_carts_by_user_v1',
  orders: 'hanaka_orders_v1',
}

function getStorage() {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage
}

function readJson(key, fallbackValue) {
  const storage = getStorage()
  if (!storage) {
    return fallbackValue
  }

  try {
    const rawValue = storage.getItem(key)
    if (!rawValue) {
      return fallbackValue
    }

    return JSON.parse(rawValue)
  } catch {
    return fallbackValue
  }
}

function writeJson(key, value) {
  const storage = getStorage()
  if (!storage) {
    return
  }

  storage.setItem(key, JSON.stringify(value))
}

export function loadUsers() {
  return readJson(STORAGE_KEYS.users, [])
}

export function saveUsers(users) {
  writeJson(STORAGE_KEYS.users, users)
}

export function loadSessionUserId() {
  return readJson(STORAGE_KEYS.sessionUserId, null)
}

export function saveSessionUserId(userId) {
  writeJson(STORAGE_KEYS.sessionUserId, userId)
}

export function loadCartsByUser() {
  return readJson(STORAGE_KEYS.cartsByUser, {})
}

export function saveCartsByUser(cartsByUser) {
  writeJson(STORAGE_KEYS.cartsByUser, cartsByUser)
}

export function loadOrders() {
  return readJson(STORAGE_KEYS.orders, [])
}

export function saveOrders(orders) {
  writeJson(STORAGE_KEYS.orders, orders)
}
