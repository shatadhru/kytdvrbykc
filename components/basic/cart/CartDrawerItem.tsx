'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart, useCurrency } from '@payloadcms/plugin-ecommerce/client/react'
import { Trash2, Loader2, Package, GraduationCap } from 'lucide-react'
import {
  formatPrice,
  getProductTitle,
  getProductUnitPrice,
  getProductImageUrl,
} from './cart-utils'

interface CartDrawerItemProps {
  itemId: string
  product: any
  variant?: any
  quantity: number
}

export function CartDrawerItem({
  itemId,
  product,
  variant,
  quantity,
}: CartDrawerItemProps) {
  const { removeItem, isLoading } = useCart()
  const { currency } = useCurrency()
  const [isUpdating, setIsUpdating] = useState(false)

  const title = getProductTitle(product)
  const imageUrl = getProductImageUrl(product)
  const unitPrice = getProductUnitPrice(product, variant)
  const itemTotal = unitPrice * quantity
  const currencySymbol = currency?.symbol || '৳'

  const handleRemove = async () => {
    if (isUpdating || isLoading) return
    setIsUpdating(true)
    try {
      await removeItem(itemId)
    } finally {
      setIsUpdating(false)
    }
  }

  const productSlug = typeof product === 'object' && product?.slug ? product.slug : null

  return (
    <div className="group relative flex items-start gap-3.5 rounded-xl border border-border/70 bg-card/60 p-3 backdrop-blur-xs transition-all hover:border-primary/40 hover:shadow-xs">
      {/* Thumbnail (16:9 Aspect Ratio) */}
      <div className="relative w-24 aspect-video shrink-0 overflow-hidden rounded-lg border bg-muted">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover"
            sizes="96px"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground bg-muted/60">
            <Package className="size-6" />
          </div>
        )}
      </div>

      {/* Info & Controls */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            {/* 100% Full course title - No truncation */}
            {productSlug ? (
              <Link
                href={`/courses/${productSlug}`}
                className="font-bold text-xs sm:text-sm text-foreground hover:text-primary transition-colors leading-snug block"
              >
                {title}
              </Link>
            ) : (
              <span className="font-bold text-xs sm:text-sm text-foreground leading-snug block">
                {title}
              </span>
            )}
            <p className="text-[11px] text-muted-foreground mt-1">
              কোর্স ফি: {formatPrice(unitPrice, currencySymbol, currency?.decimals || 0)}
            </p>
          </div>

          {/* Delete Button */}
          <button
            type="button"
            onClick={handleRemove}
            disabled={isUpdating}
            className="size-7 shrink-0 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
            title="কার্ট থেকে মুছুন"
            aria-label={`Remove ${title} from cart`}
          >
            {isUpdating ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Trash2 className="size-3.5" />
            )}
          </button>
        </div>

        {/* Single Seat Badge (No increment/decrement) & Line Total */}
        <div className="mt-2.5 flex items-center justify-between border-t border-border/40 pt-2">
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
            <GraduationCap className="size-3" />
            <span>১টি আসন (এককালীন)</span>
          </span>

          <span className="font-black text-xs sm:text-sm text-foreground tabular-nums">
            {formatPrice(itemTotal, currencySymbol, currency?.decimals || 0)}
          </span>
        </div>
      </div>
    </div>
  )
}

export default CartDrawerItem
