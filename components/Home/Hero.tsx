"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  ArrowRight,
  PlayCircle,
  Loader2,
  GraduationCap,
  BookOpen,
  Users,
  ShieldCheck,
  CheckCircle2,
  Award,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function Hero() {
  const router = useRouter()
  const [isNavigatingToCourses, setIsNavigatingToCourses] = useState(false)

  const handleCoursesClick = () => {
    setIsNavigatingToCourses(true)
    router.push("/courses")
  }

  return (
    <section className="relative overflow-hidden bg-background py-12 sm:py-16 md:py-20 lg:py-24 border-b border-border/60">
      {/* Background Accent Gradients (Theme-aware Emerald & Sky) */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 -top-24 size-[520px] -translate-x-1/2 rounded-full bg-emerald-500/10 blur-[120px] dark:bg-emerald-500/15" />
        <div className="absolute right-10 top-1/3 size-[380px] rounded-full bg-sky-500/10 blur-[100px] dark:bg-sky-500/15" />
        <div className="absolute -left-20 bottom-10 size-[320px] rounded-full bg-amber-500/10 blur-[90px] dark:bg-amber-500/10" />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-25" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* 1. Admission Announcement Pill */}
          <div className="mb-4 sm:mb-5 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 shadow-2xs backdrop-blur-xs">
              <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>এস এস সি - ২০২৭ ও ২০২৮ ব্যাচ ভর্তি চলছে</span>
              <span className="hidden sm:inline-block text-emerald-500/50">|</span>
              <span className="hidden sm:inline-block font-normal text-muted-foreground">নতুন সিলেবাস অনুযায়ী</span>
            </div>
          </div>

          {/* 2. Main Headline */}
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground">
            ঘরে বসেই শুরু হোক{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-sky-600 bg-clip-text text-transparent">
              আপনার সাফল্যের প্রস্তুতি
            </span>
          </h1>

          {/* 3. Subheading */}
          <p className="mx-auto mt-4 max-w-2xl text-xs sm:text-base sm:leading-7 text-muted-foreground lg:text-lg font-medium">
            মুখস্থ নয়, কনসেপ্টভিত্তিক পড়াশোনা ও বুঝে শেখার মাধ্যমে জটিল বিষয়গুলোকে সহজ করে তুলতে{" "}
            <span className="font-bold text-foreground">দেলোয়ার স্যারের ইউনিক টিচিং মেথড</span> আপনার পাশে।
          </p>

          {/* 4. Action Buttons */}
          <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Button
              onClick={handleCoursesClick}
              disabled={isNavigatingToCourses}
              size="lg"
              className="h-11 sm:h-12 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm border-b-4 border-b-emerald-700 active:translate-y-0.5 shadow-md transition-all px-6 cursor-pointer"
            >
              {isNavigatingToCourses ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                  <span>কোর্সে নেওয়া হচ্ছে...</span>
                </>
              ) : (
                <>
                  <GraduationCap className="mr-2 h-4 w-4" />
                  <span>প্রিমিয়াম কোর্সসমূহ দেখুন</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-11 sm:h-12 rounded-xl border-2 border-border/80 bg-card hover:bg-accent font-bold text-xs sm:text-sm text-foreground px-5 cursor-pointer shadow-xs"
            >
              <Link href="/courses?category=free-courses">
                <PlayCircle className="mr-2 h-4 w-4 text-emerald-500" />
                <span>ফ্রি ট্রায়াল ক্লাস</span>
              </Link>
            </Button>
          </div>

          {/* 5. Quick Trust Highlights (Dashboard Style) */}
          <div className="mt-8 sm:mt-12 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
            <div className="rounded-xl sm:rounded-2xl border border-emerald-500/25 border-b-2 sm:border-b-4 border-b-emerald-600 bg-card p-3 sm:p-4 text-left shadow-2xs">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <Users className="size-4 sm:size-5" />
                <span className="text-base sm:text-xl font-black text-foreground">৫,৫৪,০০০+</span>
              </div>
              <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground font-medium">সফল শিক্ষার্থী</p>
            </div>

            <div className="rounded-xl sm:rounded-2xl border border-sky-500/25 border-b-2 sm:border-b-4 border-b-sky-600 bg-card p-3 sm:p-4 text-left shadow-2xs">
              <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400">
                <BookOpen className="size-4 sm:size-5" />
                <span className="text-base sm:text-xl font-black text-foreground">৬২২+</span>
              </div>
              <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground font-medium">ক্লাস ও লেকচার</p>
            </div>

            <div className="rounded-xl sm:rounded-2xl border border-amber-500/25 border-b-2 sm:border-b-4 border-b-amber-600 bg-card p-3 sm:p-4 text-left shadow-2xs">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                <Award className="size-4 sm:size-5" />
                <span className="text-base sm:text-xl font-black text-foreground">৯৮.৫%</span>
              </div>
              <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground font-medium">সন্তুষ্টি রেট</p>
            </div>

            <div className="rounded-xl sm:rounded-2xl border border-purple-500/25 border-b-2 sm:border-b-4 border-b-purple-600 bg-card p-3 sm:p-4 text-left shadow-2xs">
              <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                <ShieldCheck className="size-4 sm:size-5" />
                <span className="text-base sm:text-xl font-black text-foreground">১০০%</span>
              </div>
              <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground font-medium">সুরক্ষিত ক্লাসরুম</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
