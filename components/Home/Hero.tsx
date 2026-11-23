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
  Award,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import GhostFibers from "@/components/Home/GhostFibers"

export default function Hero() {
  const router = useRouter()
  const [isNavigatingToCourses, setIsNavigatingToCourses] = useState(false)

  const handleCoursesClick = () => {
    setIsNavigatingToCourses(true)
    router.push("/courses")
  }

  return (
    <section className="relative overflow-hidden bg-black py-12 sm:py-16 md:py-20 lg:py-24 border-b border-red-950/40">
      {/* Background Animated Ghost Fibers (Red & Black) */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden bg-black">
        <GhostFibers
          lineColor="#ef4444"
          glowColor="#991b1b"
          backdropColor="#000000"
          scale={2.2}
          speed={0.22}
          layers={5}
          brightness={2.2}
          blueBoost={0.0}
          className="h-full w-full opacity-85"
        />
        {/* Radial vignette overlay so text & controls remain razor sharp */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_65%_at_50%_35%,rgba(0,0,0,0.3)_0%,rgba(0,0,0,0.85)_80%,#000000_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* 1. Admission Announcement Pill */}
          <div className="mb-4 sm:mb-5 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-950/40 px-3.5 py-1 text-xs sm:text-sm font-semibold text-red-400 shadow-2xs backdrop-blur-md">
              <span className="flex size-2 rounded-full bg-red-500 animate-pulse" />
              <span>এস এস সি - ২০২৭ ও ২০২৮ ব্যাচ ভর্তি চলছে</span>
              <span className="hidden sm:inline-block text-red-500/50">|</span>
              <span className="hidden sm:inline-block font-normal text-gray-300">নতুন সিলেবাস অনুযায়ী</span>
            </div>
          </div>

          {/* 2. Main Headline */}
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
            ঘরে বসেই শুরু হোক{" "}
            <span className="bg-gradient-to-r from-red-500 via-rose-400 to-red-600 bg-clip-text text-transparent drop-shadow-sm">
              আপনার সাফল্যের প্রস্তুতি
            </span>
          </h1>

          {/* 3. Subheading */}
          <p className="mx-auto mt-4 max-w-2xl text-xs sm:text-base sm:leading-7 text-gray-300 lg:text-lg font-medium">
            মুখস্থ নয়, কনসেপ্টভিত্তিক পড়াশোনা ও বুঝে শেখার মাধ্যমে জটিল বিষয়গুলোকে সহজ করে তুলতে{" "}
            <span className="font-bold text-white">দেলোয়ার স্যারের ইউনিক টিচিং মেথড</span> আপনার পাশে।
          </p>

          {/* 4. Action Buttons (Strictly Red & White) */}
          <div className="mt-6 sm:mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Button
              onClick={handleCoursesClick}
              disabled={isNavigatingToCourses}
              size="lg"
              className="h-11 sm:h-12 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm border-b-4 border-b-red-800 active:translate-y-0.5 shadow-lg shadow-red-950/50 hover:shadow-red-600/30 transition-all px-6 cursor-pointer"
            >
              {isNavigatingToCourses ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                  <span className="text-white">কোর্সে নেওয়া হচ্ছে...</span>
                </>
              ) : (
                <>
                  <GraduationCap className="mr-2 h-4 w-4 text-white" />
                  <span className="text-white">প্রিমিয়াম কোর্সসমূহ দেখুন</span>
                  <ArrowRight className="ml-2 h-4 w-4 text-white" />
                </>
              )}
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-11 sm:h-12 rounded-xl border-2 border-white/25 hover:border-red-500 bg-white/5 hover:bg-red-600/15 font-bold text-xs sm:text-sm text-white hover:text-white px-5 cursor-pointer shadow-xs backdrop-blur-md transition-all"
            >
              <Link href="/courses?category=free-courses">
                <PlayCircle className="mr-2 h-4 w-4 text-red-500" />
                <span className="text-white">ফ্রি ট্রায়াল ক্লাস</span>
              </Link>
            </Button>
          </div>

          {/* 5. Quick Trust Highlights (Dashboard Style with Red & Black Theme) */}
          <div className="mt-8 sm:mt-12 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
            <div className="rounded-xl sm:rounded-2xl border border-red-500/20 border-b-2 sm:border-b-4 border-b-red-600 bg-black/60 p-3 sm:p-4 text-left shadow-2xs backdrop-blur-md">
              <div className="flex items-center gap-2 text-red-500">
                <Users className="size-4 sm:size-5" />
                <span className="text-base sm:text-xl font-black text-white">৫,৫৪,০০০+</span>
              </div>
              <p className="mt-1 text-[10px] sm:text-xs text-gray-400 font-medium">সফল শিক্ষার্থী</p>
            </div>

            <div className="rounded-xl sm:rounded-2xl border border-red-500/20 border-b-2 sm:border-b-4 border-b-red-600 bg-black/60 p-3 sm:p-4 text-left shadow-2xs backdrop-blur-md">
              <div className="flex items-center gap-2 text-red-500">
                <BookOpen className="size-4 sm:size-5" />
                <span className="text-base sm:text-xl font-black text-white">৬২২+</span>
              </div>
              <p className="mt-1 text-[10px] sm:text-xs text-gray-400 font-medium">ক্লাস ও লেকচার</p>
            </div>

            <div className="rounded-xl sm:rounded-2xl border border-red-500/20 border-b-2 sm:border-b-4 border-b-red-600 bg-black/60 p-3 sm:p-4 text-left shadow-2xs backdrop-blur-md">
              <div className="flex items-center gap-2 text-red-500">
                <Award className="size-4 sm:size-5" />
                <span className="text-base sm:text-xl font-black text-white">৯৮.৫%</span>
              </div>
              <p className="mt-1 text-[10px] sm:text-xs text-gray-400 font-medium">সন্তুষ্টি রেট</p>
            </div>

            <div className="rounded-xl sm:rounded-2xl border border-red-500/20 border-b-2 sm:border-b-4 border-b-red-600 bg-black/60 p-3 sm:p-4 text-left shadow-2xs backdrop-blur-md">
              <div className="flex items-center gap-2 text-red-500">
                <ShieldCheck className="size-4 sm:size-5" />
                <span className="text-base sm:text-xl font-black text-white">১০০%</span>
              </div>
              <p className="mt-1 text-[10px] sm:text-xs text-gray-400 font-medium">সুরক্ষিত ক্লাসরুম</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
