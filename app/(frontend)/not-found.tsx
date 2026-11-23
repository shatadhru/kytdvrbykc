import React from "react"
import Link from "next/link"
import Header from "@/components/basic/header"
import { Footer } from "@/components/basic/footer"
import { Button } from "@/components/ui/button"
import {
  Home,
  GraduationCap,
  BookOpen,
  ArrowLeft,
  HelpCircle,
  FileQuestion,
} from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          {/* Glowing 404 badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-semibold mb-6">
            <FileQuestion className="size-4" />
            <span>ত্রুটি ৪০৪ • পেজ পাওয়া যায়নি</span>
          </div>

          <h1 className="text-7xl sm:text-9xl font-black tracking-tight text-foreground/90 font-mono">
            ৪<span className="text-red-600">০</span>৪
          </h1>

          <h2 className="mt-4 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            দুঃখিত! এই পৃষ্ঠাটি খুঁজে পাওয়া যাচ্ছে না
          </h2>

          <p className="mt-3 text-sm sm:text-base text-muted-foreground leading-relaxed max-w-lg mx-auto">
            আপনি যে পেজটিতে প্রবেশের চেষ্টা করছেন তা হয়তো সরানো হয়েছে, নাম পরিবর্তন করা হয়েছে
            অথবা আপনি ভুল লিংকে প্রবেশ করেছেন।
          </p>

          {/* Quick Action Navigation Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="rounded-xl px-5 bg-red-600 hover:bg-red-500 text-white font-semibold cursor-pointer shadow-md">
              <Link href="/">
                <Home className="size-4 mr-2" />
                হোম পেজে যান
              </Link>
            </Button>

            <Button asChild variant="outline" size="lg" className="rounded-xl px-5 cursor-pointer">
              <Link href="/courses">
                <GraduationCap className="size-4 mr-2 text-primary" />
                কোর্সসমূহ দেখুন
              </Link>
            </Button>

            <Button asChild variant="ghost" size="lg" className="rounded-xl px-5 cursor-pointer">
              <Link href="/resources">
                <BookOpen className="size-4 mr-2" />
                ফ্রি রিসোর্স
              </Link>
            </Button>
          </div>

          {/* Additional Help Link */}
          <div className="mt-10 pt-6 border-t border-border/60 text-xs text-muted-foreground flex items-center justify-center gap-1.5">
            <HelpCircle className="size-3.5 text-red-500" />
            <span>কোনো সমস্যা হলে আমাদের</span>
            <Link href="/dashboard/support" className="text-primary font-medium hover:underline">
              হেল্পলাইন ও সহায়তায়
            </Link>
            <span>যোগাযোগ করুন।</span>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
