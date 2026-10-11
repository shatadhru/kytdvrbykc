"use client"

import React from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import {
  Book2BoldDuotone,
  VideocameraBoldDuotone,
  WalletMoneyBoldDuotone,
  ShieldCheckBoldDuotone,
  QuestionCircleBoldDuotone,
  AltArrowRightOutline,
  FlameBoldDuotone,
  SmileCircleBoldDuotone,
} from "solar-icon-set"
import { authClient } from "@/payload/auth/client"
import { useActivities } from "@/lib/activity/activity-service"
import { ActivityTimeline } from "@/components/basic/activity/ActivityTimeline"

export default function DashboardPage() {
  const { data: session } = authClient.useSession()
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "admin"
  const { activities } = useActivities(isAdmin)
  const studentName = session?.user?.name || "শিক্ষার্থী"

  return (
    <div className="flex flex-col gap-2.5 sm:gap-5 max-w-5xl mx-auto w-full pb-4 sm:pb-6">
      {/* 1. Welcome Banner (Ultra Compact on Mobile) */}
      <div className="rounded-xl sm:rounded-2xl border sm:border-2 border-emerald-500/25 border-b-2 sm:border-b-4 border-b-emerald-600 bg-gradient-to-r from-emerald-500/10 via-card to-sky-500/10 p-2.5 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <h1 className="text-sm sm:text-xl font-bold tracking-tight text-foreground">
                স্বাগতম, {studentName}! 👋
              </h1>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold text-[10px] sm:text-[11px]">
                <FlameBoldDuotone size={12} color="#f59e0b" />
                <span>৭ দিন স্ট্রিক</span>
              </span>
              {isAdmin && (
                <Badge variant="outline" className="text-[9px] sm:text-[10px] py-0 px-1 font-bold border-fuchsia-500/40 text-fuchsia-600">
                  এডমিন
                </Badge>
              )}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 line-clamp-1 sm:line-clamp-none font-medium">
              ইউনিক টিচিং মেথড ডিজিটাল ক্লাসরুমে তোমার পড়াশোনা ও ক্লাসের সার্বিক তথ্য।
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 w-full sm:w-auto shrink-0">
            <Link
              href="/video"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 h-7 sm:h-9 px-2.5 sm:px-3.5 rounded-lg sm:rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[11px] sm:text-xs border-b-2 border-emerald-700 active:translate-y-0.5 shadow-xs transition-all"
            >
              <VideocameraBoldDuotone size={13} color="#fff" />
              <span>ক্লাস শুরু</span>
            </Link>
            <Link
              href="/store"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 h-7 sm:h-9 px-2.5 sm:px-3.5 rounded-lg sm:rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-[11px] sm:text-xs border-b-2 border-sky-700 active:translate-y-0.5 shadow-xs transition-all"
            >
              <Book2BoldDuotone size={13} color="#fff" />
              <span>স্টোর</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Stats Section (Desktop/Tablet Only) */}
      <div className="hidden sm:grid sm:grid-cols-3 sm:gap-4">
        <Link
          href="/store"
          className="group flex items-center justify-between p-4 rounded-2xl border-2 border-emerald-500/25 border-b-4 border-b-emerald-500 bg-card hover:bg-emerald-500/5 transition-colors"
        >
          <div>
            <span className="text-xs font-semibold text-muted-foreground block truncate">স্টোর</span>
            <div className="text-xl font-black text-foreground mt-0.5">প্রোডাক্টস</div>
            <span className="text-[10px] text-emerald-600 font-medium">সকল আইটেম দেখুন</span>
          </div>
          <div className="size-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-500 shrink-0">
            <Book2BoldDuotone size={20} color="#10b981" />
          </div>
        </Link>

        <Link
          href="/video"
          className="group flex items-center justify-between p-4 rounded-2xl border-2 border-sky-500/25 border-b-4 border-b-sky-500 bg-card hover:bg-sky-500/5 transition-colors"
        >
          <div>
            <span className="text-xs font-semibold text-muted-foreground block truncate">ভিডিও ক্লাস</span>
            <div className="text-xl font-black text-foreground mt-0.5">৬২২+</div>
            <span className="text-[10px] text-sky-600 font-medium">নিয়মিত নতুন লেকচার</span>
          </div>
          <div className="size-10 rounded-xl bg-sky-500/15 flex items-center justify-center text-sky-500 shrink-0">
            <VideocameraBoldDuotone size={20} color="#0ea5e9" />
          </div>
        </Link>

        <Link
          href="/dashboard/notifications"
          className="group flex items-center justify-between p-4 rounded-2xl border-2 border-amber-500/25 border-b-4 border-b-amber-500 bg-card hover:bg-amber-500/5 transition-colors"
        >
          <div>
            <span className="text-xs font-semibold text-muted-foreground block truncate">নোটিফিকেশন</span>
            <div className="text-xl font-black text-foreground mt-0.5">আপডেট</div>
            <span className="text-[10px] text-amber-600 font-medium">নতুন তথ্য ও ঘোষণা</span>
          </div>
          <div className="size-10 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-500 shrink-0">
            <WalletMoneyBoldDuotone size={20} color="#f59e0b" />
          </div>
        </Link>
      </div>

      {/* 3. Main Grid: Shortcuts + Recent Notices */}
      <div className="grid gap-2.5 sm:gap-5 md:grid-cols-3">
        {/* Quick Shortcuts */}
        <div className="rounded-xl sm:rounded-2xl border sm:border-2 border-border/80 border-b-2 sm:border-b-4 border-b-border bg-card p-2.5 sm:p-4">
          <div className="pb-1.5 sm:pb-2 border-b border-border/60 mb-2 flex items-center justify-between">
            <h2 className="text-[11px] sm:text-sm font-bold text-foreground">প্রয়োজনীয় শর্টকাট</h2>
            <span className="text-[9px] sm:text-[10px] text-muted-foreground">ক্লিক করো</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-1 gap-1.5 sm:gap-2">
            <Link
              href="/store"
              className="flex-1 sm:flex-initial flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-lg sm:rounded-xl border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors"
            >
              <div className="size-6 sm:size-7 rounded-md sm:rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
                <Book2BoldDuotone size={13} color="#10b981" />
              </div>
              <div className="min-w-0">
                <div className="text-[10.5px] sm:text-xs font-bold text-foreground truncate">স্টোর</div>
                <div className="text-[9px] sm:text-[10px] text-muted-foreground truncate">প্রোডাক্টস</div>
              </div>
            </Link>

            <Link
              href="/video"
              className="flex-1 sm:flex-initial flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-lg sm:rounded-xl border border-rose-500/20 bg-rose-500/5 hover:bg-rose-500/10 transition-colors"
            >
              <div className="size-6 sm:size-7 rounded-md sm:rounded-lg bg-rose-500/15 flex items-center justify-center shrink-0">
                <VideocameraBoldDuotone size={13} color="#f43f5e" />
              </div>
              <div className="min-w-0">
                <div className="text-[10.5px] sm:text-xs font-bold text-foreground truncate">ভিডিও ক্লাস</div>
                <div className="text-[9px] sm:text-[10px] text-muted-foreground truncate">লেকচার দেখো</div>
              </div>
            </Link>

            <Link
              href="/dashboard/settings"
              className="flex-1 sm:flex-initial flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-lg sm:rounded-xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition-colors"
            >
              <div className="size-6 sm:size-7 rounded-md sm:rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
                <WalletMoneyBoldDuotone size={13} color="#f59e0b" />
              </div>
              <div className="min-w-0">
                <div className="text-[10.5px] sm:text-xs font-bold text-foreground truncate">প্রোফাইল</div>
                <div className="text-[9px] sm:text-[10px] text-muted-foreground truncate">সেটিংস</div>
              </div>
            </Link>

            <Link
              href="/dashboard/support"
              className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-lg sm:rounded-xl border border-teal-500/20 bg-teal-500/5 hover:bg-teal-500/10 transition-colors"
            >
              <div className="size-6 sm:size-7 rounded-md sm:rounded-lg bg-teal-500/15 flex items-center justify-center shrink-0">
                <QuestionCircleBoldDuotone size={13} color="#14b8a6" />
              </div>
              <div className="min-w-0">
                <div className="text-[10.5px] sm:text-xs font-bold text-foreground truncate">টিচারের সাহায্য</div>
                <div className="text-[9px] sm:text-[10px] text-muted-foreground truncate">হেল্পলাইন</div>
              </div>
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                target="_blank"
                className="col-span-2 sm:col-span-1 flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-lg sm:rounded-xl border border-fuchsia-500/20 bg-fuchsia-500/5 hover:bg-fuchsia-500/10 transition-colors"
              >
                <div className="size-6 sm:size-7 rounded-md sm:rounded-lg bg-fuchsia-500/15 flex items-center justify-center shrink-0">
                  <ShieldCheckBoldDuotone size={13} color="#d946ef" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10.5px] sm:text-xs font-bold text-fuchsia-600 dark:text-fuchsia-400 truncate">এডমিন প্যানেল</div>
                  <div className="text-[9px] sm:text-[10px] text-muted-foreground truncate">কন্টেন্ট ম্যানেজমেন্ট</div>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Recent Activity / Classroom Notices */}
        <div className="md:col-span-2 rounded-xl sm:rounded-2xl border sm:border-2 border-border/80 border-b-2 sm:border-b-4 border-b-border bg-card p-2.5 sm:p-4">
          <div className="flex items-center justify-between pb-1.5 sm:pb-2 border-b border-border/60 mb-2 sm:mb-3">
            <div>
              <h2 className="text-[11px] sm:text-sm font-bold text-foreground">ক্লাসরুম নোটিস ও সাম্প্রতিক কার্যক্রম</h2>
              <p className="text-[9px] sm:text-xs text-muted-foreground">ক্লাসের সর্বশেষ নোটিফিকেশন ও আপডেট</p>
            </div>
            <Link href="/dashboard/notifications" className="text-[10px] sm:text-xs font-semibold text-primary hover:underline">
              সব দেখুন
            </Link>
          </div>

          {activities.length > 0 ? (
            <ActivityTimeline activities={activities.slice(0, 4)} compact />
          ) : (
            <div className="py-4 sm:py-6 text-center text-xs text-muted-foreground space-y-1">
              <SmileCircleBoldDuotone size={22} color="#10b981" className="mx-auto" />
              <p className="font-bold text-foreground text-[11px] sm:text-xs">দারুণ করছ! কোনো বকেয়া কাজ নেই 🎉</p>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground">ক্লাসরুমে তোমার সব অগ্রগতি নিয়মিত রেকর্ড হচ্ছে।</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}