"use client"

import React from "react"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  WalletMoneyBoldDuotone,
  CheckCircleBoldDuotone,
  QuestionCircleBoldDuotone,
  AltArrowRightOutline,
} from "solar-icon-set"

const paymentHistory = [
  {
    id: "TXN-98421",
    courseTitle: "এস এস সি ২০২৭ - কেমিস্ট্রি বেসিক টু প্রো",
    amount: "৳১,৫০০",
    date: "২৫ সেপ্টেম্বর, ২০২৬",
    method: "bKash / কার্ড",
    status: "সফল",
    invoiceNo: "INV-2026-092",
  },
  {
    id: "TXN-87114",
    courseTitle: "এস এস সি ২০২৮ - পদার্থবিজ্ঞান পূর্ণাঙ্গ প্রস্তুতি",
    amount: "৳১,২০০",
    date: "১০ আগস্ট, ২০২৬",
    method: "Nagad",
    status: "সফল",
    invoiceNo: "INV-2026-078",
  },
  {
    id: "TXN-76229",
    courseTitle: "উচ্চতর গণিত - ক্যালকুলাস ও জ্যামিতি মাস্টারক্লাস",
    amount: "৳১,০০০",
    date: "১৫ জুলাই, ২০২৬",
    method: "bKash",
    status: "সফল",
    invoiceNo: "INV-2026-054",
  },
]

export default function PaymentsPage() {
  return (
    <div className="flex flex-col gap-2.5 sm:gap-5 max-w-5xl mx-auto w-full pb-4 sm:pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-4 rounded-xl sm:rounded-2xl border border-border bg-card p-2.5 sm:p-6 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="size-8 sm:size-10 rounded-lg sm:rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <WalletMoneyBoldDuotone size={16} className="sm:hidden" />
              <WalletMoneyBoldDuotone size={22} className="hidden sm:block" />
            </div>
            <h1 className="text-sm sm:text-2xl font-bold tracking-tight text-card-foreground">
              পেমেন্ট হিস্ট্রি ও ফি রশিদ
            </h1>
          </div>
          <p className="text-[10px] sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 line-clamp-1 sm:line-clamp-none">
            আপনার সকল কোর্স ফি পরিশোধ ও লেনদেনের বিস্তারিত ইতিহাস।
          </p>
        </div>

        <Button asChild variant="outline" size="sm" className="h-7 sm:h-9 px-2.5 sm:px-3 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-medium gap-1 sm:gap-1.5 self-start sm:self-auto">
          <Link href="/dashboard/courses">
            <span>আমার কোর্সসমূহ</span>
            <AltArrowRightOutline size={12} className="sm:size-3.5" />
          </Link>
        </Button>
      </div>

      {/* Summary Cards with Colorful Duo Icons */}
      <div className="grid gap-2 sm:gap-4 grid-cols-2 sm:grid-cols-3">
        <Card className="border-border bg-card p-2.5 sm:p-5 rounded-xl sm:rounded-2xl shadow-xs">
          <div className="flex items-center justify-between pb-1 sm:pb-2">
            <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">মোট পরিশোধিত</span>
            <div className="p-1 sm:p-1.5 rounded-md sm:rounded-lg bg-amber-500/10 text-amber-500">
              <WalletMoneyBoldDuotone size={14} className="sm:hidden" />
              <WalletMoneyBoldDuotone size={18} className="hidden sm:block" />
            </div>
          </div>
          <div className="text-base sm:text-2xl font-bold text-card-foreground mt-0.5 sm:mt-1">৳৩,৭০০</div>
          <span className="text-[9px] sm:text-[11px] text-emerald-600 font-medium">৩ টি সফল লেনদেন</span>
        </Card>

        <Card className="border-border bg-card p-2.5 sm:p-5 rounded-xl sm:rounded-2xl shadow-xs">
          <div className="flex items-center justify-between pb-1 sm:pb-2">
            <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">বর্তমান স্ট্যাটাস</span>
            <div className="p-1 sm:p-1.5 rounded-md sm:rounded-lg bg-emerald-500/10 text-emerald-500">
              <CheckCircleBoldDuotone size={14} className="sm:hidden" />
              <CheckCircleBoldDuotone size={18} className="hidden sm:block" />
            </div>
          </div>
          <div className="text-base sm:text-2xl font-bold text-emerald-600 mt-0.5 sm:mt-1">সব পরিশোধিত</div>
          <span className="text-[9px] sm:text-[11px] text-muted-foreground">কোনো বকেয়া নেই</span>
        </Card>

        <Card className="border-border bg-card p-2.5 sm:p-5 rounded-xl sm:rounded-2xl shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between pb-1 sm:pb-2">
            <span className="text-[10px] sm:text-xs text-muted-foreground font-medium">পেমেন্ট হেল্পলাইন</span>
            <div className="p-1 sm:p-1.5 rounded-md sm:rounded-lg bg-teal-500/10 text-teal-500">
              <QuestionCircleBoldDuotone size={14} className="sm:hidden" />
              <QuestionCircleBoldDuotone size={18} className="hidden sm:block" />
            </div>
          </div>
          <div className="text-xs sm:text-sm font-semibold text-card-foreground mt-0.5 sm:mt-1">সকাল ৯টা - রাত ১০টা</div>
          <Link href="/dashboard/support" className="text-[9px] sm:text-[11px] text-primary hover:underline font-medium">
            সমস্যা হলে যোগাযোগ করুন
          </Link>
        </Card>
      </div>

      {/* Payments Table Card */}
      <Card className="border-border bg-card rounded-xl sm:rounded-2xl shadow-xs overflow-hidden">
        <CardHeader className="p-2.5 sm:p-5 border-b border-border/70">
          <CardTitle className="text-xs sm:text-base font-bold text-card-foreground">
            সাম্প্রতিক লেনদেনসমূহ
          </CardTitle>
          <CardDescription className="text-[10px] sm:text-xs text-muted-foreground">
            আপনার কোর্স ফি প্রদানের রসিদসমূহ
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-left text-[11px] sm:text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/60 bg-muted/30 text-muted-foreground font-semibold">
                <th className="p-2.5 sm:p-4">ট্রানজাকশন আইডি</th>
                <th className="p-2.5 sm:p-4">কোর্সের নাম</th>
                <th className="p-2.5 sm:p-4">তারিখ</th>
                <th className="p-2.5 sm:p-4">পেমেন্ট মাধ্যম</th>
                <th className="p-2.5 sm:p-4">পরিমাণ</th>
                <th className="p-2.5 sm:p-4">স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-card-foreground">
              {paymentHistory.map((item) => (
                <tr key={item.id} className="hover:bg-muted/20 transition-colors">
                  <td className="p-4 font-mono font-medium text-foreground">{item.id}</td>
                  <td className="p-4 font-medium">{item.courseTitle}</td>
                  <td className="p-4 text-muted-foreground">{item.date}</td>
                  <td className="p-4 text-muted-foreground">{item.method}</td>
                  <td className="p-4 font-bold text-foreground">{item.amount}</td>
                  <td className="p-4">
                    <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 gap-1 text-[11px] font-semibold">
                      <CheckCircleBoldDuotone size={13} className="text-emerald-500" />
                      <span>{item.status}</span>
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}
