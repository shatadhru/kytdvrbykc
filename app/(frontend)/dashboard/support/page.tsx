"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import {
  QuestionCircleBoldDuotone,
  PhoneCallingBoldDuotone,
  LetterBoldDuotone,
  ChatRoundDotsBoldDuotone,
  CheckCircleBoldDuotone,
  Book2BoldDuotone,
  AltArrowRightOutline,
} from "solar-icon-set"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FAQItem {
  q: string
  a: string
}

interface SupportAndFaqData {
  hotline?: string
  hotlineHours?: string
  email?: string
  whatsapp?: string
  communityLink?: string
  faqs?: Array<{ question?: string; answer?: string; q?: string; a?: string }>
}

const DEFAULT_HOTLINE = "+৮৮০ ১৭০০-০০০০০০"
const DEFAULT_HOTLINE_HOURS = "সকাল ৯টা - রাত ১০টা"
const DEFAULT_EMAIL = "support@uniqueteaching.com"
const DEFAULT_FAQS: FAQItem[] = [
  {
    q: "ভিডিও ক্লাসগুলো কীভাবে দেখব?",
    a: "ড্যাশবোর্ডের 'আমার কোর্সসমূহ' মেনুতে গিয়ে আপনার কোর্সের অধ্যায় অনুযায়ী সকল রেকর্ডেড ক্লাস উচ্চমানের ভিডিও রেজুলেশনে দেখতে পারবেন।",
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

export default function SupportPage() {
  const [supportData, setSupportData] = useState<SupportAndFaqData>({
    hotline: DEFAULT_HOTLINE,
    hotlineHours: DEFAULT_HOTLINE_HOURS,
    email: DEFAULT_EMAIL,
    whatsapp: "+8801700000000",
    communityLink: "/courses",
    faqs: DEFAULT_FAQS,
  })

  useEffect(() => {
    fetch("/api/site-settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.supportAndFaq) {
          setSupportData((prev) => ({
            ...prev,
            ...data.supportAndFaq,
          }))
        }
      })
      .catch((err) => {
        console.warn("Failed to load CMS support settings:", err)
      })
  }, [])

  const hotline = supportData.hotline || DEFAULT_HOTLINE
  const hotlineHours = supportData.hotlineHours || DEFAULT_HOTLINE_HOURS
  const email = supportData.email || DEFAULT_EMAIL
  const communityLink = supportData.communityLink || "/courses"

  const rawFaqs = supportData.faqs || DEFAULT_FAQS
  const faqs: FAQItem[] = rawFaqs.map((f: any) => ({
    q: f.question || f.q || "",
    a: f.answer || f.a || "",
  })).filter((f) => f.q.trim().length > 0)

  // Normalize telephone link digits
  const telNumber = hotline.replace(/[^\d+]/g, "") || "01700000000"

  return (
    <div className="max-w-4xl mx-auto space-y-2.5 sm:space-y-8 pb-4 sm:pb-8">
      {/* Page Header with Single Responsive Duo Icon */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-4 pb-2.5 sm:pb-4 border-b">
        <div>
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="size-8 sm:size-10 rounded-lg sm:rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center shrink-0">
              <QuestionCircleBoldDuotone size={20} className="size-5 sm:size-6" />
            </div>
            <h1 className="text-sm sm:text-2xl font-bold tracking-tight">হেল্পলাইন ও সহায়তা</h1>
          </div>
          <p className="text-[10px] sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 line-clamp-1 sm:line-clamp-none">
            ইউনিক টিচিং মেথড প্ল্যাটফর্ম সংক্রান্ত যেকোনো প্রশ্ন ও সরাসরি শিক্ষার্থী সহায়তা।
          </p>
        </div>

        {/* Clean Header Action Link */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link
            href="/dashboard/my-courses"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "h-7 sm:h-9 px-2.5 sm:px-3.5 flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs rounded-lg sm:rounded-xl hover:bg-teal-500/10 hover:text-teal-600 transition-colors"
            )}
          >
            <span>আমার কোর্সসমূহ</span>
            <AltArrowRightOutline size={12} className="sm:size-3.5" />
          </Link>
        </div>
      </div>

      {/* Support Status Banner with Single Responsive Icon */}
      <div className="rounded-xl sm:rounded-2xl border bg-card p-2.5 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 shadow-xs">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="size-8 sm:size-10 rounded-lg sm:rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <CheckCircleBoldDuotone size={20} className="size-5 sm:size-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-semibold text-xs sm:text-sm">শিক্ষার্থী সহায়তা টিম সক্রিয়</span>
              <span className="inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {hotlineHours}
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-1 sm:line-clamp-none">
              যেকোনো অ্যাকাউন্টিং বা ক্লাস সমস্যা দ্রুত সমাধানে আমরা সার্বক্ষণিক প্রস্তুত।
            </p>
          </div>
        </div>

        <Link
          href="/dashboard/my-courses"
          className="text-[11px] sm:text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 shrink-0 self-end sm:self-auto"
        >
          <span>আমার কোর্স দেখুন</span>
          <AltArrowRightOutline size={12} className="sm:size-3.5" />
        </Link>
      </div>

      {/* Support Channels with Single Responsive Colorful Duo Icons */}
      <div className="grid gap-2.5 sm:gap-4 sm:grid-cols-3">
        {/* Hotline Card */}
        <div className="rounded-xl sm:rounded-2xl border bg-card p-3 sm:p-5 space-y-2 sm:space-y-3 shadow-xs hover:border-emerald-500/30 transition-colors">
          <div className="size-8 sm:size-10 rounded-lg sm:rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <PhoneCallingBoldDuotone size={20} className="size-5 sm:size-6" />
          </div>
          <div>
            <h3 className="font-semibold text-xs sm:text-sm">হটলাইন হেল্পলাইন</h3>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
              জরুরি ক্লাসরুম বা পেমেন্ট সংক্রান্ত বিষয়ে সরাসরি কথা বলুন।
            </p>
          </div>
          <div className="pt-0.5 sm:pt-1">
            <a
              href={`tel:${telNumber}`}
              className="text-[11px] sm:text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1"
            >
              <span>{hotline}</span>
            </a>
          </div>
        </div>

        {/* Email Card */}
        <div className="rounded-xl sm:rounded-2xl border bg-card p-3 sm:p-5 space-y-2 sm:space-y-3 shadow-xs hover:border-blue-500/30 transition-colors">
          <div className="size-8 sm:size-10 rounded-lg sm:rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <LetterBoldDuotone size={20} className="size-5 sm:size-6" />
          </div>
          <div>
            <h3 className="font-semibold text-xs sm:text-sm">ইমেইল সহায়তা</h3>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
              বিস্তারিত যেকোনো মতামত বা অনুসন্ধানে আমাদের ইমেইল করুন।
            </p>
          </div>
          <div className="pt-0.5 sm:pt-1">
            <a
              href={`mailto:${email}`}
              className="text-[11px] sm:text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
            >
              <span>{email}</span>
            </a>
          </div>
        </div>

        {/* Community / Live Chat Card */}
        <div className="rounded-xl sm:rounded-2xl border bg-card p-3 sm:p-5 space-y-2 sm:space-y-3 shadow-xs hover:border-purple-500/30 transition-colors">
          <div className="size-8 sm:size-10 rounded-lg sm:rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
            <ChatRoundDotsBoldDuotone size={20} className="size-5 sm:size-6" />
          </div>
          <div>
            <h3 className="font-semibold text-xs sm:text-sm">স্টাডি কমিউনিটি</h3>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
              শিক্ষার্থীদের স্টাডি কমিউনিটি গ্রুপে যুক্ত হয়ে পড়াশোনা সংক্রান্ত প্রশ্ন করুন।
            </p>
          </div>
          <div className="pt-0.5 sm:pt-1">
            <Link
              href={communityLink}
              className="text-[11px] sm:text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-1"
            >
              <span>কোর্সসমূহ দেখুন</span>
              <AltArrowRightOutline size={12} className="sm:size-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="space-y-2.5 sm:space-y-4">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="p-1 rounded-md sm:rounded-lg bg-teal-500/10 text-teal-500">
            <Book2BoldDuotone size={16} className="size-4 sm:size-5" />
          </div>
          <h2 className="text-xs sm:text-base font-semibold">সাধারণ জিজ্ঞাসাসমূহ (FAQ)</h2>
        </div>

        <div className="space-y-2 sm:space-y-3">
          {faqs.map((faq, idx) => (
            <div key={idx} className="rounded-xl sm:rounded-2xl border bg-card p-3 sm:p-4.5 space-y-1 sm:space-y-1.5 shadow-xs hover:border-border transition-colors">
              <h3 className="font-semibold text-xs sm:text-sm text-foreground">{faq.q}</h3>
              <p className="text-[11px] sm:text-xs text-muted-foreground leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
