
import GhostFibers from './GhostFibers'
import { Pattern } from './c-carousel-5'
import { Button } from '@/components/ui/button'
import { ArrowRight, PlayCircle } from 'lucide-react'
import { AnimatedBadge } from '@/components/shadcn-space/badge/badge-08'
import Link from 'next/link'

function Hero() {
  return (
    <section className="relative h-[680px] overflow-hidden sm:h-[750px]">
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
      <div className="absolute inset-0 z-10 flex items-center justify-center px-5 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-3">
            <AnimatedBadge label="এস এস সি - ২০২৮ ব্যাচ ভর্তি চলছে" />
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            <span className="text-white">
              ঘরে বসেই শুরু হোক
            </span>

            <br />

            <span className="text-gray-100">
              আপনার সাফল্যের প্রস্তুতি
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-gray-300 sm:mt-6 sm:text-lg">
            মুখস্থ নয়, বুঝে শেখার মাধ্যমে প্রতিটি বিষয়কে সহজ করে তুলতে
            <span className="px-1 font-semibold text-white">
              ইউনিক টিচিং মেথড
            </span>
            আপনার পাশে।
          </p>

          <div className="mt-6">
            <Pattern />
          </div>

          <div className="mt-5 flex flex-wrap justify-center gap-3 sm:gap-4">
            <Button
              asChild
              size="lg"
              className="h-11 sm:h-12 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm border-b-4 border-b-red-800 active:translate-y-0.5 shadow-lg shadow-red-950/60 hover:shadow-red-600/30 transition-all px-6 cursor-pointer"
            >
              <Link href="/courses" className="flex items-center gap-2">
                <span>প্রিমিয়াম কোর্স সমূহ</span>
                <ArrowRight className="size-4" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-11 sm:h-12 rounded-xl border-2 border-red-500/70 bg-red-950/20 hover:bg-red-600 hover:border-red-600 hover:text-white text-red-100 font-semibold text-xs sm:text-sm shadow-sm backdrop-blur-md transition-all px-5 cursor-pointer"
            >
              <Link href="/courses" className="flex items-center gap-2">
                <PlayCircle className="size-4 text-red-400" />
                <span>কোর্সে ভর্তি প্রক্রিয়া</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero