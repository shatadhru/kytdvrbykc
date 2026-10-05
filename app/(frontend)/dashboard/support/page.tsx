"use client"

import React from "react"
import Link from "next/link"
import {
  QuestionCircleBoldDuotone,
  PhoneCallingBoldDuotone,
  LetterBoldDuotone,
  ChatRoundDotsBoldDuotone,
  CheckCircleBoldDuotone,
  Book2BoldDuotone,
  VideocameraBoldDuotone,
  AltArrowRightOutline,
} from "solar-icon-set"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function SupportPage() {
  const faqs = [
    {
      q: "ভিডিও ক্লাসগুলো কীভাবে দেখব?",
      a: "ড্যাশবোর্ডের 'আমার কোর্সসমূহ' অথবা 'ভিডিও ক্লাসরুম' মেনুতে গিয়ে আপনার কোর্সের অধ্যায় অনুযায়ী সকল রেকর্ডেড ক্লাস উচ্চমানের ভিডিও রেজুলেশনে দেখতে পারবেন।",
    },
    {
      q: "কোর্স ফি কীভাবে পরিশোধ করব?",
      a: "বিকাশ, নগদ, রকেট কিংবা যেকোনো ব্যাংকিং কার্ডের মাধ্যমে খুব সহজেই কোর্স ফি পরিশোধ করা যায়। পরিশোধের সাথে সাথেই আপনার কোর্সের অ্যাক্সেস চালু হয়ে যাবে।",
    },
    {
      q: "লাইভ বা ক্লাসের কোনো সমস্যা হলে কার সাথে যোগাযোগ করব?",
      a: "আমাদের হটলাইন নম্বরে (সকাল ৯টা থেকে রাত ১০টা) সরাসরি কল করতে পারেন অথবা আমাদের অফিশিয়াল ফেসবুক গ্রুপ ও হোয়াটসঅ্যাপে মেসেজ দিতে পারেন।",
    },
    {
      q: "লেকচার শিট বা অনুশীলনী প্রশ্নপত্র কীভাবে পাব?",
      a: "প্রতিটি ক্লাসের ভিডিও লিঙ্কের সাথে ডাউনলোডযোগ্য পিডিএফ লেকচার নোট ও অনুশীলনী শিট সংযুক্ত থাকে।",
    },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-2.5 sm:space-y-8 pb-4 sm:pb-8">
      {/* Page Header with Duo Icon */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-4 pb-2.5 sm:pb-4 border-b">
        <div>
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="size-8 sm:size-10 rounded-lg sm:rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center shrink-0">
              <QuestionCircleBoldDuotone size={16} className="sm:hidden" />
              <QuestionCircleBoldDuotone size={22} className="hidden sm:block" />
            </div>
            <h1 className="text-sm sm:text-2xl font-bold tracking-tight">হেল্পলাইন ও সহায়তা</h1>
          </div>
          <p className="text-[10px] sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 line-clamp-1 sm:line-clamp-none">
            ইউনিক টিচিং মেথড প্ল্যাটফর্ম সংক্রান্ত যেকোনো প্রশ্ন ও সরাসরি শিক্ষার্থী সহায়তা।
          </p>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link
            href="/video"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-7 sm:h-9 px-2.5 sm:px-3 flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs rounded-lg sm:rounded-xl")}
          >
            <VideocameraBoldDuotone size={13} className="text-rose-500" />
            <span>ভিডিও ক্লাসরুম</span>
          </Link>
          <a
            href="tel:01700000000"
            className={cn(buttonVariants({ size: "sm" }), "h-7 sm:h-9 px-2.5 sm:px-3 flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs rounded-lg sm:rounded-xl bg-teal-600 hover:bg-teal-700 text-white")}
          >
            <PhoneCallingBoldDuotone size={13} />
            <span>সরাসরি কল করুন</span>
          </a>
        </div>
      </div>

      {/* Support Status Banner */}
      <div className="rounded-xl sm:rounded-2xl border bg-card p-2.5 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 shadow-xs">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="size-8 sm:size-10 rounded-lg sm:rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <CheckCircleBoldDuotone size={16} className="sm:hidden" />
            <CheckCircleBoldDuotone size={22} className="hidden sm:block" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-semibold text-xs sm:text-sm">শিক্ষার্থী সহায়তা টিম সক্রিয়</span>
              <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                সকাল ৯টা - রাত ১০টা
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-1 sm:line-clamp-none">
              যেকোনো অ্যাকাউন্টিং বা ক্লাস সমস্যা দ্রুত সমাধানে আমরা সার্বক্ষণিক প্রস্তুত।
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/courses"
          className="text-[11px] sm:text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 shrink-0 self-end sm:self-auto"
        >
          <span>আমার কোর্স দেখুন</span>
          <AltArrowRightOutline size={12} className="sm:size-3.5" />
        </Link>
      </div>

      {/* Support Channels with Colorful Duo Icons */}
      <div className="grid gap-2.5 sm:gap-4 sm:grid-cols-3">
        <div className="rounded-xl sm:rounded-2xl border bg-card p-3 sm:p-5 space-y-2 sm:space-y-3 shadow-xs">
          <div className="size-7 sm:size-9 rounded-lg sm:rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <PhoneCallingBoldDuotone size={15} className="sm:hidden" />
            <PhoneCallingBoldDuotone size={20} className="hidden sm:block" />
          </div>
          <div>
            <h3 className="font-semibold text-xs sm:text-sm">হটলাইন হেল্পলাইন</h3>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
              জরুরি ক্লাসরুম বা পেমেন্ট সংক্রান্ত বিষয়ে সরাসরি কথা বলুন।
            </p>
          </div>
          <div className="pt-0.5 sm:pt-1">
            <a
              href="tel:01700000000"
              className="text-[11px] sm:text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
            >
              <span>+৮৮০ ১৭০০-০০০০০০</span>
            </a>
          </div>
        </div>

        <div className="rounded-xl sm:rounded-2xl border bg-card p-3 sm:p-5 space-y-2 sm:space-y-3 shadow-xs">
          <div className="size-7 sm:size-9 rounded-lg sm:rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <LetterBoldDuotone size={15} className="sm:hidden" />
            <LetterBoldDuotone size={20} className="hidden sm:block" />
          </div>
          <div>
            <h3 className="font-semibold text-xs sm:text-sm">ইমেইল সহায়তা</h3>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
              বিস্তারিত যেকোনো মতামত বা অনুসন্ধানে আমাদের ইমেইল করুন।
            </p>
          </div>
          <div className="pt-0.5 sm:pt-1">
            <a
              href="mailto:support@uniqueteaching.com"
              className="text-[11px] sm:text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
            >
              <span>support@uniqueteaching.com</span>
            </a>
          </div>
        </div>

        <div className="rounded-xl sm:rounded-2xl border bg-card p-3 sm:p-5 space-y-2 sm:space-y-3 shadow-xs">
          <div className="size-7 sm:size-9 rounded-lg sm:rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
            <ChatRoundDotsBoldDuotone size={15} className="sm:hidden" />
            <ChatRoundDotsBoldDuotone size={20} className="hidden sm:block" />
          </div>
          <div>
            <h3 className="font-semibold text-xs sm:text-sm">লাইভ চ্যাট ও প্রশ্ন</h3>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
              শিক্ষার্থীদের স্টাডি কমিউনিটি গ্রুপে যুক্ত হয়ে প্রশ্ন করুন।
            </p>
          </div>
          <div className="pt-0.5 sm:pt-1">
            <Link
              href="/dashboard/courses"
              className="text-[11px] sm:text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-1"
            >
              <span>কমিউনিটি গ্রুপে যান</span>
              <AltArrowRightOutline size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="space-y-2.5 sm:space-y-4">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="p-1 rounded-md sm:rounded-lg bg-teal-500/10 text-teal-500">
            <Book2BoldDuotone size={14} className="sm:size-4" />
          </div>
          <h2 className="text-xs sm:text-base font-semibold">সাধারণ জিজ্ঞাসাসমূহ (FAQ)</h2>
        </div>

        <div className="space-y-2 sm:space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="rounded-xl sm:rounded-2xl border bg-card p-3 sm:p-4.5 space-y-1 sm:space-y-1.5 shadow-xs">
              <h3 className="font-semibold text-xs sm:text-sm text-foreground">{faq.q}</h3>
              <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
