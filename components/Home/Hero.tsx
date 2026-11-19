"use client";

import React, { useState } from "react";
import GhostFibers from "./GhostFibers";
import { Button } from "@/components/ui/button";
import { ArrowRight, PlayCircle, Loader2, GraduationCap } from "lucide-react";
import Link from "next/link";
import { Pattern } from "./c-carousel-5";
import { AnimatedBadge } from "../shadcn-space/badge/badge-08";
import { useRouter } from "next/navigation";

function Hero() {
  const router = useRouter();
  const [isNavigatingToCourses, setIsNavigatingToCourses] = useState(false);

  const handleCoursesClick = () => {
    setIsNavigatingToCourses(true);
    router.push("/courses");
  };

  return (
    <section className="relative h-[680px] overflow-hidden sm:h-[780px]">
      {/* Background */}
      <div className="absolute inset-0">
        <GhostFibers
          lineColor="#FF0201"
          glowColor="#6366F1"
          speed={0.2}
          scale={2}
          rotation={-90}
          rotationSpeed={0.25}
          layers={2}
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
          glowIntensity={0.65}
          brightness={2}
          blueBoost={1.25}
          vignette={0.8}
          grain={0.05}
          dpr={1}
          lightMode={false}
          fps={60}
          paused={false}
        />
      </div>

      {/* Content */}
      <div className="absolute inset-0 z-10 flex items-center justify-center px-4 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-2 sm:mb-3 flex justify-center">
            <AnimatedBadge
              label="এস এস সি - ২০২৮ ব্যাচ ভর্তি চলছে"
              className="text-xs sm:text-sm border-white/20 bg-black/40 text-white backdrop-blur-md hover:border-primary/50"
            />
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            <span className="text-white">ঘরে বসেই শুরু হোক</span>

            <br />

            <span className="text-gray-100">আপনার সাফল্যের প্রস্তুতি</span>
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-xs leading-5 text-gray-300 sm:mt-5 sm:text-base sm:leading-7 lg:text-lg">
            মুখস্থ নয়, বুঝে শেখার মাধ্যমে প্রতিটি বিষয়কে সহজ করে তুলতে
            <span className="px-1 font-semibold text-white">
              ইউনিক টিচিং মেথড
            </span>
            আপনার পাশে।
          </p>

          <div className="mt-4 sm:mt-6">
            <Pattern />
          </div>

          <div className="mt-4 flex flex-wrap justify-center gap-2.5 sm:mt-5 sm:gap-4">
            <div className="relative inline-flex overflow-hidden rounded-xl p-[1px] shadow-[0_4px_20px_0_rgba(16,185,129,0.35)] hover:shadow-[0_6px_25px_rgba(16,185,129,0.5)] transition-all duration-300">
              <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#10b981_0%,#38bdf8_50%,#10b981_100%)]" />
              <Button
                onClick={handleCoursesClick}
                disabled={isNavigatingToCourses}
                size="lg"
                className="relative h-11 rounded-[11px] bg-gradient-to-r from-emerald-600 to-teal-600 px-6 text-xs sm:text-sm font-bold text-white hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] transition-all duration-200 cursor-pointer shadow-md"
              >
                {isNavigatingToCourses ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                    <span>কোর্সে নেওয়া হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <GraduationCap className="mr-2 h-4 w-4" />
                    <span>প্রিমিয়াম কোর্স সমূহ</span>
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </div>

            <Button
              onClick={() => router.push("/courses")}
              variant="outline"
              size="lg"
              className="h-11 rounded-xl px-5 text-xs sm:text-sm font-semibold border-white/20 bg-black/40 text-white backdrop-blur-md hover:bg-white/10 hover:border-white/40 cursor-pointer shadow-xs"
            >
              কোর্স কেনার গাইড
              <PlayCircle className="ml-1.5 h-4 w-4 text-emerald-400" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
