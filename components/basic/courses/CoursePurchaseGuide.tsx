'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Play, HelpCircle, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react'

interface CoursePurchaseGuideProps {
  guide?: {
    enabled?: boolean
    title?: string
    subtitle?: string
    youtubeUrl?: string
  } | null
}

function extractYouTubeId(urlOrId?: string): string | null {
  if (!urlOrId) return null
  const str = urlOrId.trim()
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
    return str
  }
  const match = str.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/)
  return match ? match[1] : null
}

export function CoursePurchaseGuide({ guide }: CoursePurchaseGuideProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (guide && guide.enabled === false) {
    return null
  }

  const title = guide?.title || 'কোর্স কেনার সহজ নিয়ম ও ভিডিও নির্দেশিকা'
  const subtitle = guide?.subtitle || 'কিভাবে খুব সহজে বিকাশ বা নগদে পেমেন্ট করে কোর্সে যুক্ত হবেন দেখে নিন'
  const youtubeUrl = guide?.youtubeUrl || ''
  const videoId = extractYouTubeId(youtubeUrl)

  return (
    <div className="mb-8 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-card to-emerald-500/10 p-4 sm:p-5 shadow-xs transition-all hover:border-primary/40">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="size-10 sm:size-11 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0 border border-primary/25">
            <HelpCircle className="size-5" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-sm sm:text-base text-foreground flex items-center gap-2">
              <span>{title}</span>
              <span className="hidden sm:inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                টিউটোরিয়াল
              </span>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <Button
            size="sm"
            onClick={() => setIsOpen(true)}
            className="gap-2 h-9 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-xs cursor-pointer"
          >
            <Play className="size-3.5 fill-current" />
            <span>ভিডিও নির্দেশিকা দেখুন</span>
          </Button>

          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-3xl p-0 overflow-hidden bg-card border-border">
              <DialogHeader className="p-4 border-b border-border bg-muted/30">
                <DialogTitle className="text-base font-bold flex items-center gap-2">
                  <Play className="size-4 text-primary fill-primary" />
                  <span>{title}</span>
                </DialogTitle>
              </DialogHeader>

              <div className="p-4 sm:p-6 space-y-4">
                {videoId ? (
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-border shadow-md">
                    <iframe
                      src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                      title="Course Purchase Guide"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="size-full border-0"
                    />
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border p-6 text-center bg-muted/20">
                    <p className="text-sm font-medium text-foreground">
                      অ্যাডমিন প্যানেল (Site Settings) থেকে ইউটিউব ভিডিও যুক্ত করার পর এখানে স্বয়ংক্রিয়ভাবে ভিডিও প্রদর্শিত হবে।
                    </p>
                  </div>
                )}

                {/* 3 Step Quick Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-lg border border-border/70 bg-card/60">
                    <div className="flex items-center gap-2 text-xs font-bold text-primary mb-1">
                      <span className="size-5 rounded-full bg-primary/10 flex items-center justify-center text-[11px]">১</span>
                      <span>কোর্স নির্বাচন করুন</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">কোর্সের বিবরণ দেখে 'কোর্সে ভর্তি হোন' বাটনে ক্লিক করুন।</p>
                  </div>
                  <div className="p-3 rounded-lg border border-border/70 bg-card/60">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 mb-1">
                      <span className="size-5 rounded-full bg-emerald-500/10 flex items-center justify-center text-[11px]">২</span>
                      <span>পেমেন্ট সম্পন্ন করুন</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">বিকাশ বা নগদ গেটওয়ে দিয়ে খুব সহজে ফি পরিশোধ করুন।</p>
                  </div>
                  <div className="p-3 rounded-lg border border-border/70 bg-card/60">
                    <div className="flex items-center gap-2 text-xs font-bold text-sky-600 mb-1">
                      <span className="size-5 rounded-full bg-sky-500/10 flex items-center justify-center text-[11px]">৩</span>
                      <span>ক্লাসে প্রবেশ করুন</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">পেমেন্ট সফল হলে সাথে সাথে ড্যাশবোর্ডে ক্লাস ও নোট পেয়ে যাবেন।</p>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
