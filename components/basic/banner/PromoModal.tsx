'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { GraduationCap, ArrowRight } from 'lucide-react'

interface PromoModalSettings {
  enabled?: boolean
  version?: string
  title?: string
  description?: string
  imageUrl?: string | null
  ctaText?: string
  ctaLink?: string
}

export function PromoModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [promo, setPromo] = useState<PromoModalSettings | null>(null)
  const router = useRouter()

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null

    async function checkPromo() {
      try {
        const res = await fetch('/api/site-settings')
        if (!res.ok) return
        const data = await res.json()
        const modalData: PromoModalSettings | undefined = data?.promoModal

        if (!modalData || !modalData.enabled) return

        const version = modalData.version || 'v1'
        const storageKey = `utm_promo_dismissed_${version}`
        const isDismissed = localStorage.getItem(storageKey)

        if (!isDismissed) {
          setPromo(modalData)
          timer = setTimeout(() => {
            setIsOpen(true)
          }, 600)
        }
      } catch {
        // Silently catch fetch or localStorage errors
      }
    }

    checkPromo()

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [])

  const handleDismiss = () => {
    setIsOpen(false)
    if (promo) {
      const version = promo.version || 'v1'
      const storageKey = `utm_promo_dismissed_${version}`
      try {
        localStorage.setItem(storageKey, 'true')
      } catch {
        // ignore
      }
    }
  }

  const handleCta = () => {
    handleDismiss()
    if (promo?.ctaLink) {
      router.push(promo.ctaLink)
    }
  }

  if (!promo) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleDismiss()}>
      <DialogContent
        className="max-w-[calc(100%-2rem)] sm:max-w-lg p-0 overflow-hidden border-border/80 shadow-2xl rounded-2xl gap-0"
        showCloseButton={true}
      >
        {promo.imageUrl && (
          <div className="relative w-full aspect-video bg-muted/40 overflow-hidden">
            <Image
              src={promo.imageUrl}
              alt={promo.title || 'বিশেষ ঘোষণা'}
              fill
              unoptimized
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 512px"
              priority
            />
          </div>
        )}

        <div className="p-5 sm:p-6 space-y-4">
          <DialogHeader className="text-left space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold w-fit border border-primary/20">
              <GraduationCap className="size-3.5" />
              <span>বিশেষ ঘোষণা</span>
            </div>

            {promo.title && (
              <DialogTitle className="text-lg sm:text-xl font-bold text-foreground leading-snug">
                {promo.title}
              </DialogTitle>
            )}

            {promo.description && (
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                {promo.description}
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDismiss}
              className="rounded-xl text-xs cursor-pointer"
            >
              বন্ধ করুন
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleCta}
              className="rounded-xl text-xs font-semibold gap-1.5 cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
            >
              <span>{promo.ctaText || 'বিস্তারিত দেখুন'}</span>
              <ArrowRight className="size-3.5" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default PromoModal
