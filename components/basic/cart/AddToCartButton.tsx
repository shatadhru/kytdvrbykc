'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@payloadcms/plugin-ecommerce/client/react'
import { Button } from '@/components/ui/button'
import { ShoppingBag, Check, Loader2, GraduationCap } from 'lucide-react'
import { toast } from 'sonner'
import { useCartDrawer } from './cart-drawer-context'
import { cn } from '@/lib/utils'

export interface AddToCartButtonProps {
  /**
   * The Payload product document ID
   */
  productId: string
  /**
   * Optional variant ID
   */
  variantId?: string
  /**
   * Number of units to add (default: 1)
   */
  quantity?: number
  /**
   * Button text label (defaults to "Add to Cart")
   * Can be customized via props (e.g. "Buy Now", "Order Now", etc.)
   */
  text?: string
  /**
   * Optional product title for toast notification
   */
  productTitle?: string
  /**
   * Course slug for direct classroom link if enrolled
   */
  courseSlug?: string
  /**
   * Whether the current student is already actively enrolled in this course
   */
  isEnrolled?: boolean
  /**
   * Automatically opens the cart drawer after adding (default: true)
   */
  openDrawer?: boolean
  /**
   * Render icon only
   */
  iconOnly?: boolean
  /**
   * Display shopping bag icon alongside text (default: true)
   */
  showIcon?: boolean
  /**
   * Shadcn button style variant
   */
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'destructive'
  /**
   * Shadcn button size
   */
  size?: 'default' | 'sm' | 'lg' | 'icon'
  /**
   * Custom CSS classes
   */
  className?: string
  /**
   * Disable interaction
   */
  disabled?: boolean
  /**
   * Callback on successful add
   */
  onSuccess?: () => void
}

/**
 * Reusable Add to Cart button powered securely by Payload CMS Ecommerce.
 * Supports configurable text via props (defaults to "Add to Cart"),
 * loading feedback, and automatic slide drawer opening.
 */
export function AddToCartButton({
  productId,
  variantId,
  quantity = 1,
  text = 'Add to Cart',
  productTitle,
  courseSlug,
  isEnrolled = false,
  openDrawer = true,
  iconOnly = false,
  showIcon = true,
  variant = 'default',
  size = 'default',
  className,
  disabled = false,
  onSuccess,
}: AddToCartButtonProps) {
  const { addItem, isLoading, cart } = useCart()
  const { openDrawer: triggerDrawer } = useCartDrawer()
  const [isAdding, setIsAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  // If already enrolled, direct them to study (Requirement 6)
  if (isEnrolled) {
    if (iconOnly) {
      return (
        <Button
          asChild
          variant="default"
          size={size === 'default' ? 'icon' : size}
          className={cn('rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer', className)}
        >
          <Link href={courseSlug ? `/courses/${courseSlug}?learn=true` : '/dashboard/my-courses'} title="ক্লাশ শুরু করুন">
            <GraduationCap className="size-4" />
          </Link>
        </Button>
      )
    }

    return (
      <Button
        asChild
        variant="default"
        size={size}
        className={cn(
          'gap-2 rounded-xl font-semibold transition-all shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer',
          className
        )}
      >
        <Link href={courseSlug ? `/courses/${courseSlug}?learn=true` : '/dashboard/my-courses'}>
          <GraduationCap className="size-4" />
          <span>ক্লাশ শুরু করুন</span>
        </Link>
      </Button>
    )
  }

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!productId || isAdding || isLoading) return

    // Prevent duplicate course in cart (Requirement 7)
    const isAlreadyInCart = cart?.items?.some((item: any) => {
      const prodId = typeof item.product === 'object' && item.product ? item.product.id : item.product
      return String(prodId) === String(productId)
    })

    if (isAlreadyInCart) {
      toast.info('এই কোর্সটি ইতিমধ্যে আপনার কার্টে যুক্ত আছে।')
      if (openDrawer) {
        triggerDrawer()
      }
      return
    }

    setIsAdding(true)
    try {
      // Securely update cart in Payload CMS via local session or API
      await addItem(
        {
          product: productId,
          ...(variantId ? { variant: variantId } : {}),
        },
        quantity
      )

      setJustAdded(true)
      toast.success(
        productTitle ? `Added "${productTitle}" to cart` : 'Item added to cart',
        {
          description: `Quantity: ${quantity}`,
        }
      )

      onSuccess?.()

      // Automatically open the drawer (mobile full-screen, desktop minimal)
      if (openDrawer) {
        triggerDrawer()
      }

      setTimeout(() => {
        setJustAdded(false)
      }, 2000)
    } catch (error) {
      toast.error('Failed to add item to cart. Please try again.')
      console.error('AddToCart error:', error)
    } finally {
      setIsAdding(false)
    }
  }

  const effectiveLoading = isAdding || isLoading

  if (iconOnly) {
    return (
      <Button
        variant={variant}
        size={size === 'default' ? 'icon' : size}
        onClick={handleAddToCart}
        disabled={disabled || effectiveLoading}
        className={cn('rounded-xl transition-all cursor-pointer', className)}
        aria-label={`Add ${productTitle || 'item'} to cart`}
      >
        {effectiveLoading ? (
          <Loader2 className="size-4 animate-spin" />
        ) : justAdded ? (
          <Check className="size-4 text-emerald-500 animate-in zoom-in" />
        ) : (
          <ShoppingBag className="size-4" />
        )}
      </Button>
    )
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleAddToCart}
      disabled={disabled || effectiveLoading}
      className={cn(
        'gap-2 rounded-xl font-semibold transition-all shadow-xs cursor-pointer',
        variant === 'default' &&
          !justAdded &&
          'bg-primary hover:bg-primary/90 text-primary-foreground',
        justAdded && 'bg-emerald-600 hover:bg-emerald-700 text-white',
        className
      )}
    >
      {effectiveLoading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : justAdded ? (
        <Check className="size-4 animate-in zoom-in" />
      ) : (
        showIcon && <ShoppingBag className="size-4" />
      )}
      <span>{justAdded ? 'Added!' : text}</span>
    </Button>
  )
}

export default AddToCartButton
