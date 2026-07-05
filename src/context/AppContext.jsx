import { useCallback, useEffect, useMemo, useState } from 'react'
import { AppContext } from './appContextObject.js'
import { getFeaturedProducts } from '../models/productModel.js'
import { fetchProducts } from '../services/productsApi.js'
import { apiGetMe, apiLogin, apiLogout, apiRegister } from '../services/authApi.js'
import {
  apiAddCartItem,
  apiClearCart,
  apiFetchCart,
  apiRemoveCartItem,
  apiUpdateCartItem,
  apiUpdateCartItemQuantity,
} from '../services/cartApi.js'
import {
  apiFetchOrderById,
  apiFetchOrders,
  apiMarkOrderPaid,
  apiPlaceOrder,
} from '../services/ordersApi.js'

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)
  
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)

  const [cartItems, setCartItems] = useState([])
  const [cartSubtotal, setCartSubtotal] = useState(0)
  const [cartItemCount, setCartItemCount] = useState(0)
  const [isCartLoading, setIsCartLoading] = useState(true)

  const [userOrders, setUserOrders] = useState([])

  const [products, setProducts] = useState([])

  // ── Products ──
  // dipanggil sekali saat AppContext pertama kali di-mount, untuk memuat daftar produk dari backend.
  // dipanggil ketika user membuka halaman apapun, untuk menampilkan daftar produk yang tersedia.
  useEffect(() => {
    let cancelled = false
    fetchProducts()
      .then((data) => {
        if (!cancelled) setProducts(data)
      })
      .catch(() => {
        if (!cancelled) setProducts([])
      })
      .finally(() => {
        if (!cancelled) setIsLoadingProducts(false)
        // fungsinya untuk menandai bahwa proses pemuatan produk telah selesai
      })
    return () => { cancelled = true }
  }, [])

  // ── Auth restore ──
  useEffect(() => {
    let cancelled = false
    apiGetMe()
      .then((user) => {
        if (!cancelled) setCurrentUser(user)
      })
      .catch(() => {
        if (!cancelled) setCurrentUser(null)
      })
      .finally(() => {
        if (!cancelled) setIsAuthLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  // ── Cart: sync from backend ──
  const refreshCart = useCallback(async () => {
    try {
      const data = await apiFetchCart()
      setCartItems(data.items)
      setCartSubtotal(data.subtotal)
      setCartItemCount(data.itemCount)
    } catch {
      setCartItems([])
      setCartSubtotal(0)
      setCartItemCount(0)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    apiFetchCart()
      .then((data) => {
        if (!cancelled) {
          setCartItems(data.items)
          setCartSubtotal(data.subtotal)
          setCartItemCount(data.itemCount)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCartItems([])
          setCartSubtotal(0)
          setCartItemCount(0)
        }
      })
      .finally(() => {
        if (!cancelled) setIsCartLoading(false)
      })
    return () => { cancelled = true }
  }, [currentUser])

  const featuredProducts = useMemo(() => {
    return getFeaturedProducts(products)
  }, [products])

  // ── Auth actions ──
  const registerAccount = async (values) => {
    const data = await apiRegister(values)
    setCurrentUser(data.user)
    return { ok: true, user: data.user }
  }

  const loginAccount = async (values) => {
    const data = await apiLogin(values)
    setCurrentUser(data.user)
    return { ok: true, user: data.user }
  }

  const logoutAccount = async () => {
    await apiLogout()
    setCurrentUser(null)
  }

  // ── Cart actions ──
  const addToCart = async (payload) => {
    const data = await apiAddCartItem(payload)
    await refreshCart()
    return { ok: true, item: data.item }
  }

  const editCartItem = async (itemId, payload) => {
    const data = await apiUpdateCartItem(itemId, payload)
    await refreshCart()
    return { ok: true, item: data.item }
  }

  const updateCartQuantity = async (itemId, quantity) => {
    await apiUpdateCartItemQuantity(itemId, quantity)
    await refreshCart()
  }

  const removeCartItem = async (itemId) => {
    await apiRemoveCartItem(itemId)
    await refreshCart()
  }

  const clearCart = async () => {
    await apiClearCart()
    setCartItems([])
    setCartSubtotal(0)
    setCartItemCount(0)
  }

  // ── Order actions ──
  const placeOrder = async (checkoutPayload) => {
    const data = await apiPlaceOrder(checkoutPayload)
    await refreshCart()
    return { ok: true, order: data.order }
  }

  const getOrderById = async (orderId) => {
    try {
      return await apiFetchOrderById(orderId)
    } catch {
      return null
    }
  }

  const refreshOrders = async () => {
    try {
      const orders = await apiFetchOrders()
      setUserOrders(orders)
    } catch {
      setUserOrders([])
    }
  }

  const markCurrentUserOrderPaid = async (orderId) => {
    const data = await apiMarkOrderPaid(orderId)
    return { ok: true, order: data.order }
  }

  const value = {
    currentUser,
    isAuthLoading,
    products,
    featuredProducts,
    isLoadingProducts,
    cartItems,
    cartItemCount,
    cartSubtotal,
    isCartLoading,
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
    refreshOrders,
    markCurrentUserOrderPaid,
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
