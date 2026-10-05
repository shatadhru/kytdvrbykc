'use client'

import React, { useState } from 'react'
import { Send, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) {
      toast.error('অনুগ্রহ করে সঠিক ইমেইল এড্রেস লিখুন।')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (data.success) {
        setIsSubscribed(true)
        toast.success(data.message || 'সফলভাবে সাবস্ক্রাইব করা হয়েছে!')
      } else {
        toast.error(data.error || 'সাবস্ক্রাইব করা সম্ভব হয়নি।')
      }
    } catch {
      toast.error('নেটওয়ার্ক সমস্যা। পুনরায় চেষ্টা করুন।')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubscribed) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-primary/10 border border-primary/20 px-3.5 py-2.5 text-xs font-medium text-primary">
        <CheckCircle2 className="size-4 shrink-0" />
        <span>ধন্যবাদ! আপনি সফলভাবে যুক্ত হয়েছেন।</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="relative flex items-center">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="আপনার ইমেইল লিখুন..."
          required
          disabled={isLoading}
          className="h-10 pr-24 rounded-full bg-background/90 border-border/80 text-xs focus-visible:ring-2 focus-visible:ring-ring"
        />
        <Button
          type="submit"
          size="sm"
          disabled={isLoading}
          className="absolute right-1 h-8 px-3 rounded-full text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground transition-all cursor-pointer"
        >
          {isLoading ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <>
              <span>যুক্ত হন</span>
              <Send className="size-3 ml-1" />
            </>
          )}
        </Button>
      </div>
      <p className="text-[11px] text-muted-foreground/80 leading-normal pl-2">
        জিরো স্প্যাম। নিয়মিত নতুন ক্লাস ও শিক্ষা সংক্রান্ত আপডেট পান।
      </p>
    </form>
  )
}

export default NewsletterForm
