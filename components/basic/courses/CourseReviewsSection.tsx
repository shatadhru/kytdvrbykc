'use client'

import React, { useState, useEffect } from 'react'
import { authClient } from '@/payload/auth/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import {
  Star,
  MessageSquare,
  CheckCircle2,
  Send,
  Loader2,
  User,
  ThumbsUp,
} from 'lucide-react'

interface CourseReviewsSectionProps {
  courseSlug: string
  courseTitle: string
  isEnrolled?: boolean
}

export function CourseReviewsSection({
  courseSlug,
  courseTitle,
  isEnrolled = false,
}: CourseReviewsSectionProps) {
  const { data: session } = authClient.useSession()
  const [reviews, setReviews] = useState<any[]>([])
  const [averageRating, setAverageRating] = useState<number>(5.0)
  const [totalReviews, setTotalReviews] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)

  // Review Form state
  const [rating, setRating] = useState<number>(5)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  const fetchReviews = () => {
    setIsLoading(true)
    fetch(`/api/courses/${courseSlug}/reviews`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setReviews(data.reviews || [])
          setTotalReviews(data.totalReviews || 0)
          setAverageRating(data.averageRating || 5.0)
        }
      })
      .catch((err) => console.error('Failed to load reviews:', err))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    fetchReviews()
  }, [courseSlug])

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session?.user?.id) {
      toast.error('রিভিউ প্রদান করতে অনুগ্রহ করে আগে লগইন করুন।')
      return
    }

    if (!body.trim()) {
      toast.error('অনুগ্রহ করে আপনার রিভিউ বা মতামত লিখুন।')
      return
    }

    try {
      setIsSubmitting(true)
      const res = await fetch(`/api/courses/${courseSlug}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          title: title.trim() || 'কোর্স পর্যালোচনা',
          body: body.trim(),
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'রিভিউ জমা দিতে সমস্যা হয়েছে।')
      }

      toast.success('আপনার মূল্যবান রিভিউ সফলভাবে প্রকাশ করা হয়েছে!')
      setShowForm(false)
      setTitle('')
      setBody('')
      fetchReviews()
    } catch (err: any) {
      toast.error(err.message || 'রিভিউ জমা দিতে ব্যর্থ হয়েছে।')
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = (count: number, interactive = false) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => {
          const isFilled = interactive
            ? star <= (hoverRating || rating)
            : star <= Math.round(count)

          return (
            <button
              type={interactive ? 'button' : undefined}
              key={star}
              disabled={!interactive}
              onClick={interactive ? () => setRating(star) : undefined}
              onMouseEnter={interactive ? () => setHoverRating(star) : undefined}
              onMouseLeave={interactive ? () => setHoverRating(0) : undefined}
              className={`${
                interactive
                  ? 'cursor-pointer hover:scale-110 transition-transform'
                  : 'cursor-default'
              } p-0.5 focus:outline-hidden`}
            >
              <Star
                className={`size-4 sm:size-4.5 ${
                  isFilled
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-muted-foreground/30 stroke-muted-foreground/50'
                }`}
              />
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-6 pt-6 border-t border-border">
      {/* Header & Rating Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Star className="size-5 text-amber-400 fill-amber-400" />
            শিক্ষার্থীদের রিভিউ ও রেটিং
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {totalReviews > 0
              ? `${totalReviews} জন শিক্ষার্থীর যাচাইকৃত অভিজ্ঞতার ভিত্তিতে`
              : 'এখনো কোনো রিভিউ দেওয়া হয়নি। প্রথম রিভিউটি আপনি দিন!'}
          </p>
        </div>

        {/* Average Rating Score Card */}
        <div className="flex items-center gap-3 bg-muted/40 border border-border/80 px-4 py-2.5 rounded-xl shrink-0">
          <div className="text-2xl font-extrabold text-foreground tabular-nums">
            {averageRating.toFixed(1)}
          </div>
          <div>
            {renderStars(averageRating)}
            <span className="text-[11px] text-muted-foreground block mt-0.5">
              ৫-এর মধ্যে {averageRating.toFixed(1)} ({totalReviews} রিভিউ)
            </span>
          </div>
        </div>
      </div>

      {/* Review Submission Toggle / Button */}
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          সকল রিভিউ ({reviews.length})
        </span>

        <Button
          size="sm"
          variant={showForm ? 'outline' : 'default'}
          onClick={() => setShowForm(!showForm)}
          className="text-xs font-semibold h-8"
        >
          {showForm ? 'ফর্ম বন্ধ করুন' : 'একটি রিভিউ দিন'}
        </Button>
      </div>

      {/* Review Submission Form */}
      {showForm && (
        <Card className="border-primary/30 bg-primary/5 shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold">
              {courseTitle} — আপনার রিভিউ প্রদান করুন
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!session ? (
              <div className="text-center py-4 space-y-2">
                <p className="text-xs text-muted-foreground">
                  রিভিউ দিতে অনুগ্রহ করে আগে লগইন করুন।
                </p>
                <Button size="sm" asChild>
                  <a href={`/auth/login?redirect=/courses/${courseSlug}`}>লগইন করুন</a>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground block">
                    আপনার রেটিং (১ থেকে ৫ স্টার)
                  </label>
                  <div className="flex items-center gap-3">
                    {renderStars(rating, true)}
                    <span className="text-xs font-bold text-amber-500">
                      {rating} স্টার
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground block">
                    রিভিউ শিরোনাম (ঐচ্ছিক)
                  </label>
                  <Input
                    type="text"
                    placeholder="যেমন: অসাধারণ ও বোধগম্য ক্লাস!"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-xs bg-background"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground block">
                    আপনার বিস্তারিত অভিজ্ঞতা ও মতামত <span className="text-destructive">*</span>
                  </label>
                  <Textarea
                    placeholder="কোর্সের পাঠদান, টপিক ব্যাখ্যা এবং সার্বিক অভিজ্ঞতা কেমন লেগেছে..."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={4}
                    className="text-xs bg-background resize-none"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowForm(false)}
                    className="text-xs h-8"
                  >
                    বাতিল
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSubmitting || !body.trim()}
                    className="text-xs h-8 gap-1.5"
                  >
                    {isSubmitting ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Send className="size-3.5" />
                    )}
                    রিভিউ প্রকাশ করুন
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground text-xs">
          <Loader2 className="size-6 animate-spin text-primary" />
          <span>রিভিউ লোড হচ্ছে...</span>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 rounded-xl border border-dashed border-border bg-muted/20 text-muted-foreground space-y-2">
          <MessageSquare className="size-8 mx-auto opacity-40" />
          <p className="text-sm font-semibold">কোনো রিভিউ পাওয়া যায়নি</p>
          <p className="text-xs max-w-sm mx-auto">
            এই কোর্সে ভর্তি হওয়া প্রথম শিক্ষার্থী হিসেবে আপনার মতামত দিন।
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-4 rounded-xl border border-border/80 bg-card space-y-2.5 shadow-2xs flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  {renderStars(Number(rev.rating) || 5)}
                  <span className="text-[11px] text-muted-foreground">
                    {new Date(rev.createdAt).toLocaleDateString('bn-BD', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                {rev.title && (
                  <h4 className="text-sm font-bold text-foreground line-clamp-1">
                    {rev.title}
                  </h4>
                )}

                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {rev.body}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <div className="size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                    {rev.author ? rev.author.charAt(0) : <User className="size-3" />}
                  </div>
                  <span>{rev.author || 'শিক্ষার্থী'}</span>
                </div>

                {rev.verified ? (
                  <Badge variant="outline" className="text-[9px] h-4 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 gap-1 px-1.5">
                    <CheckCircle2 className="size-2.5" /> যাচাইকৃত শিক্ষার্থী
                  </Badge>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

