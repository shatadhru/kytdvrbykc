import React from "react"
import Link from "next/link"
import { getPayload } from "payload"
import config from "@payload-config"
import Header from "@/components/basic/header"
import { Footer } from "@/components/basic/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertTriangle,
  RotateCcw,
  ArrowLeft,
  Headphones,
  GraduationCap,
  HelpCircle,
} from "lucide-react"

interface FailedPageProps {
  searchParams: Promise<{
    reason?: string
    orderId?: string
    status?: string
    details?: string
  }>
}

export const metadata = {
  title: "পেমেন্ট সম্পন্ন হয়নি | Checkout",
  description: "আপনার পেমেন্ট প্রক্রিয়া সম্পন্ন হতে পারেনি। পুনরায় চেষ্টা করুন।",
}

export default async function CheckoutFailedPage({ searchParams }: FailedPageProps) {
  const { reason, orderId, status, details } = await searchParams
  const payload = await getPayload({ config })

  let order: any = null
  if (orderId) {
    try {
      order = await payload.findByID({
        collection: "orders",
        id: orderId,
        depth: 1,
      })
    } catch {
      // Non-blocking
    }
  }

  // Friendly human explanation
  let errorMessage = "আপনার পেমেন্ট প্রক্রিয়াটি সম্পন্ন হতে পারেনি।"
  const isCancelled = status === "cancel" || reason?.includes("cancel")

  if (isCancelled) {
    errorMessage = "আপনি বিকাশ পেমেন্ট উইন্ডো থেকে পেমেন্ট বাতিল করেছেন।"
  } else if (reason?.includes("insufficient_balance")) {
    errorMessage = "আপনার বিকাশ একাউন্টে পর্যাপ্ত ব্যালেন্স নেই।"
  } else if (reason?.includes("verification_failed") || reason?.includes("PIN")) {
    errorMessage = "ভুল ওটিপি বা পিন নম্বর দেওয়ার কারণে পেমেন্ট সফল হয়নি।"
  } else if (reason?.includes("amount_mismatch")) {
    errorMessage = "টাকার পরিমাণে অমিল পরিলক্ষিত হয়েছে। সুরক্ষার স্বার্থে অর্ডার স্থগিত করা হয়েছে।"
  } else if (reason) {
    errorMessage = decodeURIComponent(reason)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="w-full max-w-xl mx-auto space-y-6">
          <Card className="border border-border/80 shadow-lg bg-card overflow-hidden">
            <CardHeader className="text-center pt-8 pb-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-500/10 text-rose-600 mb-3">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                পেমেন্ট সম্পন্ন হয়নি
              </CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-md mx-auto">
                {errorMessage}
              </p>
            </CardHeader>

            <CardContent className="space-y-4 px-6 sm:px-8">
              {/* Notice Banner */}
              <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-4 text-xs text-muted-foreground leading-relaxed">
                <p className="font-semibold text-rose-600 dark:text-rose-400 mb-1">
                  💡 কোনো টাকা কাটা হয়েছে কি?
                </p>
                পেমেন্ট বাতিল বা ব্যর্থ হলে সাধারণত আপনার একাউন্ট থেকে টাকা কাটা হয় না। যদি ভুলবশত বিকাশ থেকে টাকা কেটে নেওয়া হয়ে থাকে, তবে সেটি বিকাশ স্বয়ংক্রিয়ভাবে রিফান্ড করে দেয় অথবা আমাদের হেল্পলাইনে জানালে আমরা তাৎক্ষণিক সমাধান করে দেব।
              </div>

              {/* Order Info (if available) */}
              {order && (
                <div className="rounded-xl border border-border/80 bg-muted/30 p-3 sm:p-4 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">অর্ডার আইডি</span>
                    <span className="font-mono font-semibold text-foreground">#{order.id}</span>
                  </div>
                  {order.amount && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">মোট পরিমাণ</span>
                      <span className="font-bold text-foreground">৳ {Number(order.amount).toLocaleString('bn-BD')}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">পেমেন্ট মেথড</span>
                    <Badge variant="outline" className="text-[10px] uppercase font-bold">
                      {order.paymentMethod || 'bKash'}
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex flex-col sm:flex-row gap-3 pt-2 pb-8 px-6 sm:px-8">
              <Button
                asChild
                className="w-full sm:flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                <Link href="/checkout">
                  <RotateCcw className="size-4" />
                  <span>পুনরায় চেষ্টা করুন</span>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="w-full sm:flex-1 gap-2 border-border/80 font-semibold"
              >
                <Link href="/courses">
                  <ArrowLeft className="size-4" />
                  <span>কোর্স তালিকায় ফিরে যান</span>
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Help & Support Note */}
          <div className="text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
            <Headphones className="size-4 text-primary" />
            <span>কোনো সাহায্য প্রয়োজন? আমাদের </span>
            <Link href="/dashboard/support" className="text-primary font-semibold underline underline-offset-2">
              হেল্পলাইন ও সহায়তা
            </Link>
            <span> পেজে যোগাযোগ করুন।</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

