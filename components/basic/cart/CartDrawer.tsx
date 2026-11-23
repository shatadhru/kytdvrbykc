'use client'

import React, { useMemo, useEffect, useRef } from 'react'
import { useCart, useCurrency } from '@payloadcms/plugin-ecommerce/client/react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import {
  ShoppingBag,
  Trash2,
  PackageOpen,
  ShieldCheck,
  ArrowRight,
  X,
  Lock,
} from 'lucide-react'
import { useCartDrawer } from './cart-drawer-context'
import { CartDrawerItem } from './CartDrawerItem'
import { formatPrice } from './cart-utils'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { authClient } from '@/payload/auth/client'
import { toast } from 'sonner'

export interface CartDrawerProps {
  checkoutUrl?: string
  shoppingUrl?: string
  className?: string
}

export function CartDrawer({
  checkoutUrl = '/checkout',
  shoppingUrl = '/courses',
  className,
}: CartDrawerProps) {
  const { isOpen, setIsOpen, closeDrawer } = useCartDrawer()
  const { cart, clearCart, removeItem, isLoading } = useCart()
  const { currency } = useCurrency()
  const { data: session } = authClient.useSession()
  const router = useRouter()
  const checkedRef = useRef(false)

  const items = (cart?.items || []) as Array<{
    id?: string | null
    product?: any
    variant?: any
    quantity: number
  }>

  // Auto-remove already enrolled courses from cart (Requirement 6 & 7)
  useEffect(() => {
    if (!session?.user?.id || items.length === 0) return

    fetch('/api/user/enrollments')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.enrollments)) {
          const enrolledProductIds = new Set(
            data.enrollments.map((enr: any) => String(enr.id || enr.courseId))
          )

          for (const item of items) {
            const prodId = typeof item.product === 'object' && item.product ? item.product.id : item.product
            if (prodId && enrolledProductIds.has(String(prodId))) {
              if (item.id) {
                removeItem(item.id).catch(() => {})
                const title = typeof item.product === 'object' ? item.product.title : 'কোর্স'
                toast.info(`"${title}" কোর্সটিতে আপনি ইতিমধ্যে ভর্তি আছেন, তাই কার্ট থেকে সরিয়ে নেওয়া হয়েছে।`)
              }
            }
          }
        }
      })
      .catch((err) => console.warn('Could not verify cart enrollments:', err))
  }, [session?.user?.id, items, removeItem])

  const totalCount = useMemo(() => {
    return items.reduce((acc, item) => acc + (item.quantity || 0), 0)
  }, [items])

  // eslint-disable-next-line react-hooks/preserve-manual-memoization
  const subtotal = useMemo(() => {
    if (typeof cart?.subtotal === 'number') {
      return cart.subtotal
    }
    return items.reduce((sum, item) => {
      const prod = item.product
      const varnt = item.variant
      const unitPrice =
        (varnt && typeof varnt === 'object' && typeof varnt.priceInBDT === 'number'
          ? varnt.priceInBDT
          : null) ??
        (prod && typeof prod === 'object'
          ? typeof prod.priceInBDT === 'number'
            ? prod.priceInBDT
            : typeof prod.price === 'number'
            ? prod.price
            : 0
          : 0)
      return sum + unitPrice * (item.quantity || 0)
    }, 0)
  }, [cart?.subtotal, items])

  const currencySymbol = currency?.symbol || '৳'
  const formattedSubtotal = formatPrice(subtotal, currencySymbol, currency?.decimals || 0)

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className={cn(
          // Mobile: 100% full screen drawer!
          'w-full! h-full! max-w-none! inset-0!',
          // Desktop: sleek minimal right slide-over drawer!
          'sm:w-full! sm:max-w-md! sm:inset-y-0! sm:right-0! sm:left-auto! sm:h-full!',
          'flex flex-col p-0 bg-background/95 backdrop-blur-md border-l border-border/80 shadow-2xl z-50',
          className
        )}
      >
        {/* Header (100% Bangla) */}
        <SheetHeader className="flex flex-row items-center justify-between border-b border-border/60 px-5 py-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-2xs">
              <ShoppingBag className="size-4" />
            </div>
            <div>
              <SheetTitle className="text-base font-bold text-foreground">
                আপনার কার্ট
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                {totalCount} টি কোর্স কার্টে রয়েছে
              </SheetDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearCart()}
                disabled={isLoading}
                className="text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 px-2 gap-1 cursor-pointer"
                title="সব কোর্স কার্ট থেকে মুছুন"
              >
                <Trash2 className="size-3.5" />
                <span className="hidden sm:inline">সব মুছুন</span>
              </Button>
            )}

            {/* Custom Close Button */}
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={closeDrawer}
              className="rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label="কার্ট বন্ধ করুন"
            >
              <X className="size-4" />
            </Button>
          </div>
        </SheetHeader>

        {/* Body: Items or Empty State */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center px-4 py-16">
              <div className="flex size-20 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 mb-4 shadow-xs">
                <PackageOpen className="size-10 stroke-[1.5]" />
              </div>
              <h3 className="font-bold text-lg text-foreground">আপনার কার্ট খালি</h3>
              <p className="mt-1.5 text-xs text-muted-foreground max-w-[260px] leading-relaxed">
                আপনি এখনো কোনো কোর্স কার্টে যুক্ত করেননি। দেলোয়ার স্যারের স্পেশাল কোর্সসমূহ দেখে পছন্দমতো কোর্স যুক্ত করুন!
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-6 rounded-xl text-xs font-bold gap-1.5 cursor-pointer border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                onClick={() => {
                  closeDrawer()
                  router.push(shoppingUrl)
                }}
              >
                কোর্সসমূহ দেখুন
                <ArrowRight className="size-3.5" />
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map((item, index) => {
                const itemId = item.id || `cart-item-${index}`
                return (
                  <CartDrawerItem
                    key={itemId}
                    itemId={itemId}
                    product={item.product}
                    variant={item.variant}
                    quantity={item.quantity}
                  />
                )
              })}
            </div>
          )}
        </div>

        {/* Footer: Subtotal & Checkout */}
        {items.length > 0 && (
          <SheetFooter className="border-t border-border/60 bg-muted/20 px-5 py-4 flex flex-col gap-3 shrink-0">
            {/* SCALVIO GUARD Security Guarantee */}
            <div className="flex items-center gap-2 rounded-lg bg-emerald-500/10 border border-emerald-500/25 px-3 py-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold shadow-2xs">
              <ShieldCheck className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              <span className="leading-tight">SCALVIO GUARD Protected • Licensed & Secured Payment Gateway</span>
            </div>

            {/* Subtotal */}
            <div className="flex items-center justify-between text-sm pt-1">
              <span className="text-muted-foreground font-semibold">মোট মূল্য (সাবটোটাল)</span>
              <span className="font-black text-lg text-foreground tabular-nums">
                {formattedSubtotal}
              </span>
            </div>

            <p className="text-[11px] text-muted-foreground">
              এককালীন পেমেন্টে আজীবন ক্লাসরুম অ্যাক্সেস ও পরীক্ষার সুযোগ পাবেন।
            </p>

            {/* Checkout Button */}
            <Button
              size="lg"
              onClick={() => {
                closeDrawer()
                router.push(checkoutUrl)
              }}
              className="w-full gap-2 rounded-xl font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all hover:shadow-lg cursor-pointer"
            >
              <Lock className="size-4" />
              <span>পেমেন্ট সম্পন্ন করতে এগিয়ে যান</span>
              <ArrowRight className="size-4 ml-auto" />
            </Button>

            {/* Continue Shopping Button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                closeDrawer()
                router.push(shoppingUrl)
              }}
              className="w-full py-1 text-center text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              আরও কোর্স দেখুন
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}

export default CartDrawer
