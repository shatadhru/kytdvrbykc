import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, GraduationCap, FileQuestion } from "lucide-react"

export default function RootNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-white px-4 text-center font-sans">
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 text-xs font-semibold mb-6">
        <FileQuestion className="size-4" />
        <span>৪০৪ • পৃষ্ঠা পাওয়া যায়নি</span>
      </div>

      <h1 className="text-8xl sm:text-9xl font-black tracking-tight text-white font-mono">
        ৪<span className="text-red-600">০</span>৪
      </h1>

      <h2 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight text-white">
        পৃষ্ঠাটি খুঁজে পাওয়া যাচ্ছে না
      </h2>

      <p className="mt-3 text-sm text-gray-400 max-w-md mx-auto">
        আপনি যে লিংকটি অনুসন্ধান করছেন তা হয়তো পরিবর্তন করা হয়েছে বা মুছে ফেলা হয়েছে।
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild size="lg" className="rounded-xl px-6 bg-red-600 hover:bg-red-500 text-white font-semibold cursor-pointer">
          <Link href="/">
            <Home className="size-4 mr-2" />
            হোম পেজ
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="rounded-xl px-6 border-white/20 text-white hover:bg-white/10 cursor-pointer">
          <Link href="/courses">
            <GraduationCap className="size-4 mr-2 text-red-400" />
            কোর্সসমূহ
          </Link>
        </Button>
      </div>
    </div>
  )
}
