'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { authClient } from '@/payload/auth/client'
import { Flag, AlertCircle, CheckCircle2, Loader2, LogIn } from 'lucide-react'
import Link from 'next/link'

interface LessonReportModalProps {
  isOpen: boolean
  onClose: () => void
  courseSlug: string
  courseTitle: string
  lessonId: string
  lessonTitle: string
}

const ISSUE_OPTIONS = [
  { value: 'video_error', label: '🎥 ভিডিও প্লেব্যাক সমস্যা (ভিডিও চলে না বা বাফারিং)' },
  { value: 'audio_issue', label: '🔊 সাউন্ড বা অডিও সমস্যা (শব্দ কম বা শুনতে সমস্যা)' },
  { value: 'material_issue', label: '📄 ক্লাস নোট বা স্লাইড ডাউনলোড হচ্ছে না' },
  { value: 'content_mistake', label: '⚠️ ভুল তথ্য বা বিষয়বস্তুর অসঙ্গতি' },
  { value: 'other', label: '💬 অন্যান্য কোনো সমস্যা' },
]

export default function LessonReportModal({
  isOpen,
  onClose,
  courseSlug,
  courseTitle,
  lessonId,
  lessonTitle,
}: LessonReportModalProps) {
  const { data: session } = authClient.useSession()
  const [issueType, setIssueType] = useState<string>('video_error')
  const [description, setDescription] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [submitted, setSubmitted] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim() || description.trim().length < 5) {
      setError('অনুগ্রহ করে সমস্যার বিবরণ কমপক্ষে ৫ অক্ষরের মধ্যে লিখুন।')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch(`/api/courses/${courseSlug}/lessons/${lessonId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          issueType,
          description: description.trim(),
          lessonTitle,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setError(data.error || 'রিপোর্ট জমা দিতে সমস্যা হয়েছে। আবার চেষ্টা করুন।')
        setIsSubmitting(false)
        return
      }

      setSubmitted(true)
      setIsSubmitting(false)
    } catch {
      setError('নেটওয়ার্ক সংযোগ ত্রুটি। অনুগ্রহ করে আবার চেষ্টা করুন।')
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setError(null)
    setSubmitted(false)
    setDescription('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[480px] p-6">
        <DialogHeader>
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 mb-1">
            <div className="p-2 rounded-full bg-rose-500/10">
              <Flag className="size-4" />
            </div>
            <DialogTitle className="text-base sm:text-lg font-semibold">
              লেকচারে সমস্যা রিপোর্ট করুন
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            {courseTitle} &bull; <span className="font-medium text-foreground">{lessonTitle}</span>
          </DialogDescription>
        </DialogHeader>

        {!session ? (
          <div className="py-6 text-center space-y-4">
            <div className="p-3 mx-auto w-fit rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertCircle className="size-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                রিপোর্ট জমা দিতে একাউন্টে লগইন থাকা আবশ্যক
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                লগইন করার পর খুব সহজেই যে কোনো লেকচারের সমস্যা প্রশাসনকে জানাতে পারবেন।
              </p>
            </div>
            <Button asChild size="sm" className="gap-2">
              <Link href={`/auth/sign-in?callbackUrl=/courses/${courseSlug}`}>
                <LogIn className="size-4" />
                লগইন করুন
              </Link>
            </Button>
          </div>
        ) : submitted ? (
          <div className="py-6 text-center space-y-4">
            <div className="p-3 mx-auto w-fit rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-8" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-foreground">
                রিপোর্টটি সফলভাবে জমা হয়েছে
              </h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                ধন্যবাদ! আমাদের টেকনিক্যাল টিম বিষয়টি দ্রুত পর্যালোচনা করে সমাধান করবে।
              </p>
            </div>
            <Button size="sm" onClick={handleClose} className="px-6">
              ঠিক আছে
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 flex items-start gap-2">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="issueType" className="text-xs font-medium">
                সমস্যার ধরন নির্বাচন করুন
              </Label>
              <select
                id="issueType"
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {ISSUE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-xs font-medium">
                সমস্যার বিবরণ (কমপক্ষে ৫ অক্ষর)
              </Label>
              <Textarea
                id="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="যেমন: ৩ মিনিট ১২ সেকেন্ডে গিয়ে ভিডিওটি আটকে যাচ্ছে, অথবা স্লাইড ফাইলটি ওপেন হচ্ছে না..."
                className="text-xs resize-none"
                maxLength={2000}
                required
              />
              <div className="flex justify-end text-[10px] text-muted-foreground">
                {description.length}/2000 অক্ষর
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClose}
                disabled={isSubmitting}
                className="text-xs"
              >
                বাতিল
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isSubmitting || description.trim().length < 5}
                className="text-xs gap-1.5 bg-rose-600 hover:bg-rose-700 text-white"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    জমা হচ্ছে...
                  </>
                ) : (
                  <>
                    <Flag className="size-3.5" />
                    রিপোর্ট জমা দিন
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

