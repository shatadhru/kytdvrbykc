'use client'

import { useEffect, useRef } from 'react'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'

export function CartClearer() {
  const { clearCart } = useCart()
  const hasCleared = useRef(false)

  useEffect(() => {
    if (hasCleared.current) return
    hasCleared.current = true

    // Clear React Cart state through EcommerceProvider
    clearCart().catch((err) => {
      console.warn('Failed to clear cart state:', err)
    })

    // Also remove from localStorage key configured in EcommerceProvider
    try {
      localStorage.removeItem('nextload_cart')
    } catch {}
  }, [clearCart])

  return null
}

export default CartClearer

