"use client"

import React from "react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import {
  Book2BoldDuotone,
  VideocameraBoldDuotone,
  AtomBoldDuotone,
  PlayCircleBoldDuotone,
  AltArrowRightOutline,
  FlameBoldDuotone,
} from "solar-icon-set"

const enrolledCourses = [
  {
    id: "ssc-27-chemistry",
    title: "এস এস সি ২০২৭ - কেমিস্ট্রি বেসিক টু প্রো",
    instructor: "দেলোয়ার হোসেন",
    badge: "চলমান",
    progress: 65,
    completedLessons: 24,
    totalLessons: 38,
    lastClass: "অধ্যায় ৪: পর্যায় সারণি ও মৌলের ধর্ম",
    videoUrl: "/video",
    icon: AtomBoldDuotone,
    hexColor: "#10b981",
    themeBorder: "border-emerald-500/30 border-b-emerald-500",
    buttonBg: "bg-emerald-500 hover:bg-emerald-600 border-emerald-700",
    progressBg: "bg-emerald-500",
    badgeClass: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    iconBg: "bg-emerald-500/15 text-emerald-500",
  },
  {
    id: "ssc-28-physics",
    title: "এস এস সি ২০২৮ - পদার্থবিজ্ঞান পূর্ণাঙ্গ প্রস্তুতি",
    instructor: "দেলোয়ার হোসেন",
    badge: "চলমান",
    progress: 42,
    completedLessons: 18,
    totalLessons: 42,
    lastClass: "অধ্যায় ৩: বল ও নিউটনের গতিসূত্র",
    videoUrl: "/video",
    icon: VideocameraBoldDuotone,
    hexColor: "#0ea5e9",
    themeBorder: "border-sky-500/30 border-b-sky-500",
    buttonBg: "bg-sky-500 hover:bg-sky-600 border-sky-700",
    progressBg: "bg-sky-500",
    badgeClass: "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30",
    iconBg: "bg-sky-500/15 text-sky-500",
  },
  {
    id: "hmath-special",
    title: "উচ্চতর গণিত - ক্যালকুলাস ও জ্যামিতি মাস্টারক্লাস",
    instructor: "দেলোয়ার হোসেন",
    badge: "নতুন",
    progress: 20,
    completedLessons: 6,
    totalLessons: 30,
    lastClass: "লেকচার ১: সেট ও ফাংশন বেসিক",
    videoUrl: "/video",
    icon: Book2BoldDuotone,
    hexColor: "#a855f7",
    themeBorder: "border-purple-500/30 border-b-purple-500",
    buttonBg: "bg-purple-500 hover:bg-purple-600 border-purple-700",
    progressBg: "bg-purple-500",
    badgeClass: "bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30",
    iconBg: "bg-purple-500/15 text-purple-500",
  },
]

export default function CoursesPage() {
  return (
    <div className="flex flex-col gap-2.5 sm:gap-5 max-w-5xl mx-auto w-full pb-4 sm:pb-8">
      {/* Duo-style Header Banner (Compact on mobile) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-4 rounded-xl sm:rounded-3xl border sm:border-2 border-emerald-500/30 border-b-2 sm:border-b-4 border-b-emerald-600 bg-gradient-to-r from-emerald-500/10 via-card to-sky-500/10 p-2.5 sm:p-6 md:p-7 shadow-xs">
        <div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="size-8 sm:size-12 rounded-lg sm:rounded-2xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0">
              <Book2BoldDuotone size={16} color="#10b981" style={{ color: "#10b981" }} className="sm:hidden" />
              <Book2BoldDuotone size={24} color="#10b981" style={{ color: "#10b981" }} className="hidden sm:block" />
            </div>
            <div>
              <h1 className="text-sm sm:text-2xl font-black tracking-tight text-foreground flex items-center gap-1.5 sm:gap-2">
                <span>আমার কোর্সসমূহ</span>
                <span className="text-xs sm:text-base">🎒</span>
              </h1>
              <p className="text-[10px] sm:text-sm text-muted-foreground mt-0.5 font-medium line-clamp-1 sm:line-clamp-none">
                তোমার পছন্দের সকল বিষয়ভিত্তিক ক্লাস ও দৈনন্দিন পাঠতালিকা।
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/video"
          className="inline-flex items-center justify-center gap-1.5 h-7 sm:h-10 px-3 sm:px-5 rounded-lg sm:rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[11px] sm:text-xs tracking-wide border-b-2 sm:border-b-4 border-emerald-700 active:translate-y-0.5 sm:active:translate-y-1 active:border-b-0 shadow-xs sm:shadow-md self-start sm:self-auto transition-all"
        >
          <VideocameraBoldDuotone size={13} color="#ffffff" style={{ color: "#ffffff" }} />
          <span>ভিডিও ক্লাসরুমে চলো</span>
        </Link>
      </div>

      {/* Courses Duo Tactile Grid */}
      <div className="grid gap-2.5 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
        {enrolledCourses.map((course) => {
          const CourseIcon = course.icon
          return (
            <div
              key={course.id}
              className={`rounded-xl sm:rounded-3xl border sm:border-2 ${course.themeBorder} border-b-2 sm:border-b-4 bg-card p-3 sm:p-5 shadow-xs flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5 sm:hover:-translate-y-1 hover:shadow-md`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
                  <div className={`size-8 sm:size-12 rounded-lg sm:rounded-2xl ${course.iconBg} flex items-center justify-center shrink-0`}>
                    <CourseIcon size={16} color={course.hexColor} style={{ color: course.hexColor }} className="sm:hidden" />
                    <CourseIcon size={24} color={course.hexColor} style={{ color: course.hexColor }} className="hidden sm:block" />
                  </div>
                  <span className={`rounded-full px-2 py-0.5 sm:px-3 sm:py-1 font-bold text-[10px] sm:text-xs border ${course.badgeClass}`}>
                    {course.badge}
                  </span>
                </div>

                <h3 className="text-xs sm:text-base font-extrabold text-foreground line-clamp-2 leading-snug">
                  {course.title}
                </h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 font-medium">
                  শিক্ষক: {course.instructor}
                </p>

                {/* Progress Bar (Chunky Duo Style) */}
                <div className="mt-2.5 sm:mt-4 space-y-1 sm:space-y-1.5">
                  <div className="flex justify-between text-[10px] sm:text-xs font-bold text-muted-foreground">
                    <span>অগ্রগতি ({course.completedLessons}/{course.totalLessons})</span>
                    <span className="font-extrabold text-foreground">{course.progress}%</span>
                  </div>
                  <div className="h-2 sm:h-3 w-full rounded-full bg-muted/60 overflow-hidden border border-border/60 p-0.5">
                    <div
                      className={`h-full rounded-full ${course.progressBg} transition-all duration-500`}
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-2 sm:mt-3.5 p-2 sm:p-3 rounded-lg sm:rounded-2xl bg-muted/40 border border-border/60 text-[10px] sm:text-xs text-muted-foreground">
                  <span className="font-bold text-foreground block mb-0.5">সর্বশেষ পাঠ:</span>
                  <span className="line-clamp-1 font-medium">{course.lastClass}</span>
                </div>
              </div>

              {/* Duo 3D Tactile Button */}
              <div className="mt-3 sm:mt-5">
                <Link
                  href={course.videoUrl}
                  className={`w-full inline-flex items-center justify-center gap-1.5 h-8 sm:h-10 py-1.5 sm:py-2.5 px-3 sm:px-4 rounded-lg sm:rounded-2xl text-white font-extrabold text-[11px] sm:text-xs tracking-wide border-b-2 sm:border-b-4 ${course.buttonBg} active:translate-y-0.5 sm:active:translate-y-1 active:border-b-0 shadow-xs sm:shadow-md transition-all duration-150`}
                >
                  <PlayCircleBoldDuotone size={13} color="#ffffff" style={{ color: "#ffffff" }} />
                  <span>ক্লাস শুরু করো!</span>
                  <AltArrowRightOutline size={12} className="ml-auto" />
                </Link>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
