'use client'

import React, { useState, useEffect } from 'react'
import { authClient } from '@/payload/auth/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/toast'
import { Phone, GraduationCap, Calendar, CheckCircle2, ShieldCheck } from 'lucide-react'

const SSC_BATCH_OPTIONS = ['2023', '2024', '2025', '2026', '2027', '2028']
const HSC_BATCH_OPTIONS = ['2025', '2026', '2027', '2028', '2029', '2030']

export function StudentOnboardingModal() {
  const { data: session, isPending: sessionPending } = authClient.useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [phone, setPhone] = useState('')
  const [sscBatch, setSscBatch] = useState('')
  const [hscBatch, setHscBatch] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    // Only check once session is loaded and user is authenticated
    if (sessionPending || !session?.user?.id) {
      setIsOpen(false)
      return
    }

    let isMounted = true

    async function checkStatus() {
      try {
        const res = await fetch('/api/user/onboarding')
        const data = await res.json()

        if (isMounted && data.authenticated && !data.isCompleted) {
          // Pre-populate if partial data exists
          if (data.profile?.phone) setPhone(data.profile.phone)
          if (data.profile?.sscBatch) setSscBatch(data.profile.sscBatch)
          if (data.profile?.hscBatch) setHscBatch(data.profile.hscBatch)
          setIsOpen(true)
        }
      } catch (err) {
        console.warn('Could not verify student onboarding status:', err)
      }
    }

    checkStatus()

    return () => {
      isMounted = false
    }
  }, [session, sessionPending])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    // Validate phone number format (Bangladeshi 11 digits: 013-019)
    const cleanedPhone = phone.trim().replace(/[^\d]/g, '')
    const bdRegex = /^01[3-9]\d{8}$/
    if (!bdRegex.test(cleanedPhone)) {
      setErrorMessage('সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01712345678)।')
      return
    }

    if (!sscBatch.trim()) {
      setErrorMessage('অনুগ্রহ করে আপনার এসএসসি ব্যাচ নির্বাচন করুন।')
      return
    }

    if (!hscBatch.trim()) {
      setErrorMessage('অনুগ্রহ করে আপনার এইচএসসি ব্যাচ নির্বাচন করুন।')
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanedPhone,
          sscBatch: sscBatch.trim(),
          hscBatch: hscBatch.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'তথ্য সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।')
        return
      }

      toast.add({
        type: 'success',
        title: 'প্রোফাইল সম্পন্ন হয়েছে',
        description: 'আপনার তথ্য সফলভাবে সংরক্ষিত হয়েছে। ধন্যবাদ!',
      })

      setIsOpen(false)
    } catch (err: any) {
      setErrorMessage(err?.message || 'ইন্টারনেট সংযোগ যাচাই করুন।')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        showCloseButton={false}
        className="max-w-md p-6 rounded-2xl bg-card border-border shadow-2xl backdrop-blur-md"
      >
        <DialogHeader className="text-left space-y-2">
          <div className="flex items-center gap-2 text-primary font-semibold text-xs tracking-wider uppercase">
            <ShieldCheck className="size-4" />
            শিক্ষার্থী তথ্য ভেরিফিকেশন
          </div>
          <DialogTitle className="text-xl font-bold text-foreground">
            আপনার প্রোফাইল সম্পন্ন করুন
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            কোর্সের লেকচার এক্সেস, নোটিশ এবং পরীক্ষার ফলাফল ট্র্যাক করতে আপনার মোবাইল নম্বর ও ব্যাচ নিশ্চিত করুন।
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="p-3 rounded-lg border border-destructive/30 bg-destructive/10 text-destructive text-xs">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          {/* Mobile Number */}
          <div className="space-y-1.5">
            <Label htmlFor="onboarding-phone" className="text-xs font-semibold flex items-center gap-1.5">
              <Phone className="size-3.5 text-primary" />
              মোবাইল নম্বর <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                +88
              </span>
              <Input
                id="onboarding-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01XXXXXXXXX"
                required
                maxLength={14}
                className="pl-12 h-10 text-sm font-medium"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              এসএমএস কনফার্মেশন ও গুরুত্বপূর্ণ নোটিশের জন্য প্রয়োজন।
            </p>
          </div>

          {/* SSC Batch */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <GraduationCap className="size-3.5 text-primary" />
                এসএসসি ব্যাচ (SSC Batch) <span className="text-destructive">*</span>
              </span>
              {sscBatch && <span className="text-primary font-bold text-xs">{sscBatch}</span>}
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {SSC_BATCH_OPTIONS.map((batch) => (
                <button
                  key={batch}
                  type="button"
                  onClick={() => setSscBatch(batch)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-all cursor-pointer font-medium ${
                    sscBatch === batch
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-muted/40 border-border text-foreground hover:bg-muted'
                  }`}
                >
                  SSC {batch}
                </button>
              ))}
            </div>
            <Input
              type="text"
              value={sscBatch}
              onChange={(e) => setSscBatch(e.target.value)}
              placeholder="অন্যান্য বছর হলে লিখুন (যেমন: 2022)"
              className="h-8 text-xs mt-1"
            />
          </div>

          {/* HSC Batch */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="size-3.5 text-primary" />
                এইচএসসি ব্যাচ (HSC Batch) <span className="text-destructive">*</span>
              </span>
              {hscBatch && <span className="text-primary font-bold text-xs">{hscBatch}</span>}
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {HSC_BATCH_OPTIONS.map((batch) => (
                <button
                  key={batch}
                  type="button"
                  onClick={() => setHscBatch(batch)}
                  className={`px-3 py-1.5 text-xs rounded-lg border transition-all cursor-pointer font-medium ${
                    hscBatch === batch
                      ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                      : 'bg-muted/40 border-border text-foreground hover:bg-muted'
                  }`}
                >
                  HSC {batch}
                </button>
              ))}
            </div>
            <Input
              type="text"
              value={hscBatch}
              onChange={(e) => setHscBatch(e.target.value)}
              placeholder="অন্যান্য বছর হলে লিখুন (যেমন: 2024)"
              className="h-8 text-xs mt-1"
            />
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isSubmitting || !phone || !sscBatch || !hscBatch}
              className="w-full h-10 font-semibold gap-2 shadow-sm"
            >
              {isSubmitting ? (
                'সংরক্ষণ করা হচ্ছে...'
              ) : (
                <>
                  <CheckCircle2 className="size-4" />
                  সংরক্ষণ করুন ও এগিয়ে যান
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

