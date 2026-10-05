"use client";

import GhostFibers from "./GhostFibers";
import { Button } from "@/components/ui/button";
import { ArrowRight, PlayCircle } from "lucide-react";
import Link from "next/link";
import { Pattern } from "./c-carousel-5";
import { AnimatedBadge } from "../shadcn-space/badge/badge-08";
import { useRouter } from "next/navigation";

function Hero() {
  const router = useRouter();

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
          <div className="mb-2 sm:mb-3">
            <AnimatedBadge
              label="এস এস সি - ২০২৮ ব্যাচ ভর্তি চলছে"
              className="text-xs sm:text-sm"
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
            <div className="relative inline-flex overflow-hidden rounded-xl p-[1px] shadow-[0_4px_14px_0_rgba(0,118,255,0.39)] hover:shadow-[0_6px_20px_rgba(0,118,255,0.25)] transition-all duration-200">
              <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#FF0000_0%,#ffffff_50%,#ffffff_75%,#fafafa_100%)]" />
              <Button
                onClick={() => router.push("/courses")}
                size="lg"
                className="relative h-10 rounded-[10px] bg-primary px-5 text-xs font-medium text-white hover:bg-primary/90 active:scale-[0.98] sm:h-11 sm:px-7 sm:text-sm transition-all duration-200 ease-linear cursor-pointer"
              >
                প্রিমিয়াম কোর্স সমূহ
                <ArrowRight className="ml-1.5 h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            </div>

            <Button
              onClick={() => router.push("/demo")}
              variant="secondary"
              size="lg"
              className="h-10 rounded-xl px-4 text-xs font-semibold sm:h-11 sm:px-6 sm:text-sm"
            >
              কোর্সে ভর্তি প্রক্রিয়া
              <PlayCircle className="ml-1 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
