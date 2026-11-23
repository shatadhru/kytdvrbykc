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
   * Button text label (defaults to "কার্টে যোগ করুন")
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
 * Supports configurable text via props (defaults to "কার্টে যোগ করুন"),
 * loading feedback, double-click prevention, and automatic slide drawer opening.
 */
export function AddToCartButton({
  productId,
  variantId,
  quantity = 1,
  text = 'কার্টে যোগ করুন',
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
          className={cn('rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs', className)}
        >
          <Link href={courseSlug ? `/courses/${courseSlug}?learn=true` : '/dashboard/my-courses'} title="ইতিমধ্যে ভর্তি সম্পন্ন • ক্লাসরুমে যান">
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
          <span>ক্লাসরুমে যান</span>
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
        1 // Always 1 seat per course purchase
      )

      setJustAdded(true)
      toast.success(
        productTitle ? `"${productTitle}" কার্টে যুক্ত হয়েছে` : 'কোর্সটি সফলভাবে কার্টে যুক্ত হয়েছে'
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
      toast.error('কার্টে যুক্ত করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।')
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
        className={cn('rounded-xl transition-all cursor-pointer', effectiveLoading && 'pointer-events-none opacity-80', className)}
        aria-label={`কার্টে যোগ করুন: ${productTitle || 'কোর্স'}`}
      >
        {effectiveLoading ? (
          <Loader2 className="size-4 animate-spin text-primary" />
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
        effectiveLoading && 'pointer-events-none opacity-80',
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
      <span>{justAdded ? 'যুক্ত হয়েছে!' : text}</span>
    </Button>
  )
}

export default AddToCartButton
