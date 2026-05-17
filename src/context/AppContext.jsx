import { useEffect, useMemo, useState } from 'react'
import { AppContext } from './appContextObject.js'
import { buildAccount } from '../models/authModel.js'
import {
  buildCartItem,
  computeCartSubtotal,
  rebuildCartItem,
  updateCartItemQuantity,
} from '../models/cartModel.js'
import { createOrder, markOrderAsPaid } from '../models/orderModel.js'
import { findProductById, findSizeOption } from '../models/productModel.js'
import {
  loadCartsByUser,
  loadOrders,
  loadSessionUserId,
  loadUsers,
  saveCartsByUser,
  saveOrders,
  saveSessionUserId,
  saveUsers,
} from '../services/storageService.js'

function resolveCustomization(payload) {
  const product = findProductById(payload.productId)
  if (!product) {
    return { error: 'Produk tidak ditemukan.' }
  }

  const sizeOption = findSizeOption(product, payload.sizeId)
  if (!sizeOption) {
    return { error: 'Ukuran cake tidak valid.' }
  }

  return { product, sizeOption }
}

const GUEST_CART_KEY = '__guest__'

function mergeGuestCartToUser(previousCarts, userId) {
  const guestCart = previousCarts[GUEST_CART_KEY] ?? []
  const userCart = previousCarts[userId] ?? []

  if (!guestCart.length) {
    return {
      ...previousCarts,
      [userId]: userCart,
    }
  }

  return {
    ...previousCarts,
    [userId]: [...userCart, ...guestCart],
    [GUEST_CART_KEY]: [],
  }
}

export function AppProvider({ children }) {
  const [users, setUsers] = useState(() => loadUsers())
  const [sessionUserId, setSessionUserId] = useState(() => loadSessionUserId())
  const [cartsByUser, setCartsByUser] = useState(() => loadCartsByUser())
  const [orders, setOrders] = useState(() => loadOrders())

  useEffect(() => {
    saveUsers(users)
  }, [users])

  useEffect(() => {
    saveSessionUserId(sessionUserId)
  }, [sessionUserId])

  useEffect(() => {
    saveCartsByUser(cartsByUser)
  }, [cartsByUser])

  useEffect(() => {
    saveOrders(orders)
  }, [orders])

  const currentUser = useMemo(() => {
    return users.find((user) => user.id === sessionUserId) ?? null
  }, [users, sessionUserId])

  const activeCartKey = currentUser?.id ?? GUEST_CART_KEY

  const cartItems = useMemo(() => {
    return cartsByUser[activeCartKey] ?? []
  }, [activeCartKey, cartsByUser])

  const cartItemCount = useMemo(() => {
    return cartItems.reduce((count, item) => count + item.quantity, 0)
  }, [cartItems])

  const cartSubtotal = useMemo(() => {
    return computeCartSubtotal(cartItems)
  }, [cartItems])

  const userOrders = useMemo(() => {
    if (!currentUser) {
      return []
    }

    return orders
      .filter((order) => order.userId === currentUser.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [orders, currentUser])

  const registerAccount = (values) => {
    const normalizedEmail = values.email.trim().toLowerCase()
    const alreadyExists = users.some((user) => user.email === normalizedEmail)

    if (alreadyExists) {
      return {
        ok: false,
        error: 'Email ini sudah terdaftar. Silakan login.',
      }
    }

    const account = buildAccount(values)
    setUsers((previousUsers) => [...previousUsers, account])
    setSessionUserId(account.id)
    setCartsByUser((previousCarts) =>
      mergeGuestCartToUser(previousCarts, account.id),
    )

    return { ok: true, user: account }
  }

  const loginAccount = (values) => {
    const normalizedEmail = values.email.trim().toLowerCase()
    const matchedUser = users.find(
      (user) =>
        user.email === normalizedEmail && user.password === values.password,
    )

    if (!matchedUser) {
      return {
        ok: false,
        error: 'Email atau password belum sesuai.',
      }
    }

    setSessionUserId(matchedUser.id)
    setCartsByUser((previousCarts) =>
      mergeGuestCartToUser(previousCarts, matchedUser.id),
    )

    return { ok: true, user: matchedUser }
  }

  const logoutAccount = () => {
    setSessionUserId(null)
  }

  const addToCart = (payload) => {
    const customization = resolveCustomization(payload)
    if (customization.error) {
      return { ok: false, error: customization.error }
    }

    const cartItem = buildCartItem({
      product: customization.product,
      sizeOption: customization.sizeOption,
      colorText: payload.colorText ?? '',
      theme: payload.theme ?? '',
      message: payload.message ?? '',
      quantity: payload.quantity,
    })

    setCartsByUser((previousCarts) => {
      const userCart = previousCarts[activeCartKey] ?? []
      return {
        ...previousCarts,
        [activeCartKey]: [...userCart, cartItem],
      }
    })

    return { ok: true, item: cartItem }
  }

  const editCartItem = (itemId, payload) => {
    const currentUserCart = cartsByUser[activeCartKey] ?? []
    const targetItem = currentUserCart.find((item) => item.id === itemId)

    if (!targetItem) {
      return { ok: false, error: 'Item keranjang tidak ditemukan.' }
    }

    const customization = resolveCustomization(payload)
    if (customization.error) {
      return { ok: false, error: customization.error }
    }

    const rebuiltItem = rebuildCartItem(targetItem, {
      sizeOption: customization.sizeOption,
      colorText: payload.colorText ?? '',
      theme: payload.theme ?? '',
      message: payload.message ?? '',
      quantity: payload.quantity,
    })

    setCartsByUser((previousCarts) => {
      const nextUserCart = (previousCarts[activeCartKey] ?? []).map((item) => {
        if (item.id !== itemId) {
          return item
        }

        return rebuiltItem
      })

      return {
        ...previousCarts,
        [activeCartKey]: nextUserCart,
      }
    })

    return { ok: true, item: rebuiltItem }
  }

  const updateCartQuantity = (itemId, quantity) => {
    setCartsByUser((previousCarts) => {
      const nextUserCart = (previousCarts[activeCartKey] ?? []).map((item) => {
        if (item.id !== itemId) {
          return item
        }

        return updateCartItemQuantity(item, quantity)
      })

      return {
        ...previousCarts,
        [activeCartKey]: nextUserCart,
      }
    })
  }

  const removeCartItem = (itemId) => {
    setCartsByUser((previousCarts) => {
      const nextUserCart = (previousCarts[activeCartKey] ?? []).filter(
        (item) => item.id !== itemId,
      )

      return {
        ...previousCarts,
        [activeCartKey]: nextUserCart,
      }
    })
  }

  const clearCart = () => {
    setCartsByUser((previousCarts) => ({
      ...previousCarts,
      [activeCartKey]: [],
    }))
  }

  const placeOrder = (checkoutPayload) => {
    if (!cartItems.length) {
      return { ok: false, error: 'Keranjang masih kosong.' }
    }

    const order = createOrder({
      user: currentUser,
      items: cartItems,
      checkout: checkoutPayload,
    })

    setOrders((previousOrders) => [order, ...previousOrders])
    clearCart()

    return { ok: true, order }
  }

  const getOrderById = (orderId) => {
    const targetOrder = orders.find((order) => order.id === orderId)

    if (!targetOrder) {
      return null
    }

    if (currentUser) {
      return targetOrder.userId === currentUser.id ? targetOrder : null
    }

    return targetOrder.userId === null ? targetOrder : null
  }

  const markCurrentUserOrderPaid = (orderId) => {
    let paidOrder = null

    setOrders((previousOrders) => {
      return previousOrders.map((order) => {
        const isOrderAccessible = currentUser
          ? order.userId === currentUser.id
          : order.userId === null

        if (order.id !== orderId || !isOrderAccessible) {
          return order
        }

        paidOrder = markOrderAsPaid(order)
        return paidOrder
      })
    })

    if (!paidOrder) {
      return { ok: false, error: 'Order tidak ditemukan untuk sesi ini.' }
    }

    return { ok: true, order: paidOrder }
  }

  const value = {
    users,
    currentUser,
    cartItems,
    cartItemCount,
    cartSubtotal,
    userOrders,
    registerAccount,
    loginAccount,
    logoutAccount,
    addToCart,
    editCartItem,
    updateCartQuantity,
    removeCartItem,
    clearCart,
    placeOrder,
    getOrderById,
    markCurrentUserOrderPaid,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
