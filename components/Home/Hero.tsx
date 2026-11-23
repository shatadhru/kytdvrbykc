"use client"

import React, { useState } from "react"
import GhostFibers from "./GhostFibers"
import { Button } from "@/components/ui/button"
import { ArrowRight, PlayCircle, Loader2, GraduationCap } from "lucide-react"
import Link from "next/link"
import { Pattern } from "./c-carousel-5"
import { AnimatedBadge } from "../shadcn-space/badge/badge-08"
import { useRouter } from "next/navigation"

export default function Hero() {
  const router = useRouter()
  const [isNavigatingToCourses, setIsNavigatingToCourses] = useState(false)

  const handleCoursesClick = () => {
    setIsNavigatingToCourses(true)
    router.push("/courses")
  }

  return (
    <section className="relative min-h-[720px] overflow-hidden sm:min-h-[820px] bg-black py-10 sm:py-14 border-b border-red-950/40">
      {/* Background Animated Ghost Fibers */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden bg-black">
        <GhostFibers
          lineColor="#ef4444"
          glowColor="#991b1b"
          backdropColor="#000000"
          speed={0.2}
          scale={2.2}
          rotation={-90}
          rotationSpeed={0.25}
          layers={3}
          waveAmplitude={0.015}
          waveFrequency={3.7}
          waveSpeed={0.2}
          layerSpeed={0.08}
          twist={0.1}
          twistFrequency={5}
          twistSpeed={1.2}
          lineFrequency={5}
          lineSpacing={2}
          lineSharpness={16}
          glowFalloff={10}
          glowIntensity={0.9}
          brightness={2.2}
          blueBoost={0.0}
          vignette={0.85}
          grain={0.05}
          dpr={1}
          lightMode={false}
          fps={60}
          paused={false}
          className="h-full w-full opacity-85"
        />
        {/* Radial vignette overlay so text & controls remain razor sharp */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_65%_at_50%_35%,rgba(0,0,0,0.3)_0%,rgba(0,0,0,0.85)_80%,#000000_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center px-4 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          {/* 1. Admission Announcement Pill */}
          <div className="mb-2 sm:mb-3 flex justify-center">
            <AnimatedBadge
              label="এস এস সি - ২০২৮ ব্যাচ ভর্তি চলছে"
              className="text-xs sm:text-sm border-red-500/30 bg-black/60 text-white backdrop-blur-md hover:border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.25)]"
            />
          </div>

          {/* 2. Main Headline */}
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
            <span className="drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">ঘরে বসেই শুরু হোক</span>
            <br />
            <span className="bg-gradient-to-r from-red-500 via-rose-400 to-red-600 bg-clip-text text-transparent drop-shadow-sm font-extrabold">
              আপনার সাফল্যের প্রস্তুতি
            </span>
          </h1>

          {/* 3. Subheading */}
          <p className="mx-auto mt-3 max-w-2xl text-xs leading-5 text-gray-200 sm:mt-4 sm:text-base sm:leading-7 lg:text-lg drop-shadow-sm">
            মুখস্থ নয়, বুঝে শেখার মাধ্যমে প্রতিটি বিষয়কে সহজ করে তুলতে{" "}
            <span className="px-1.5 font-bold text-white bg-red-600/30 border border-red-500/30 rounded-md mx-1">
              ইউনিক টিচিং মেথড
            </span>{" "}
            আপনার পাশে।
          </p>

          {/* 4. Hero Carousel (Pattern) */}
          <div className="mt-4 sm:mt-6">
            <Pattern />
          </div>

          {/* 5. CTA Buttons (Strictly Red & White) */}
          <div className="mt-4 sm:mt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
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
              className="h-11 sm:h-12 rounded-xl border border-white/30 bg-black/50 hover:bg-white/10 text-white font-semibold text-xs sm:text-sm shadow-sm backdrop-blur-md transition-all px-5 cursor-pointer"
            >
              <Link href="/courses">
                <PlayCircle className="mr-2 h-4 w-4 text-red-500" />
                <span className="text-white">কোর্স কেনার গাইড</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
