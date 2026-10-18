import React from "react"
import Link from "next/link"
import { getPayload } from "payload"
import config from "@payload-config"
import Header from "@/components/basic/header"
import { Footer } from "@/components/basic/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/components/basic/cart/cart-utils"
import { CartClearer } from "@/components/basic/cart/CartClearer"
import { createEnrollmentsForOrder } from "@/utils/enrollment"
import {
  CheckCircle2,
  Clock,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  BookOpen,
} from "lucide-react"

interface SuccessPageProps {
  searchParams: Promise<{
    orderId?: string
    method?: string
  }>
}

export default async function CheckoutSuccessPage({ searchParams }: SuccessPageProps) {
  const { orderId, method } = await searchParams
  const payload = await getPayload({ config })

  let order: any = null

  if (orderId) {
    try {
      order = await payload.findByID({
        collection: "orders",
        id: orderId,
        depth: 2,
      })

      // Ensure enrollments are active if order is paid
      if (order?.paymentStatus === "paid") {
        await createEnrollmentsForOrder(payload, order)
      }
    } catch (e) {
      console.warn("Could not find order by ID:", orderId)
    }
  }

  const isBkash = method === "bkash" || order?.paymentMethod === "bkash"
  const isPaid = order?.paymentStatus === "paid"

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <CartClearer />
      <Header />

      <main className="flex-1 container max-w-2xl mx-auto px-4 py-12 md:py-20 flex items-center justify-center">
        <Card className="w-full text-center border-border/80 shadow-lg">
          <CardHeader className="pt-8 pb-4 flex flex-col items-center">
            {isPaid ? (
              <div className="size-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                <CheckCircle2 className="size-9" />
              </div>
            ) : (
              <div className="size-16 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                <Clock className="size-9" />
              </div>
            )}

            <CardTitle className="text-2xl font-bold tracking-tight">
              {isPaid
                ? "পেমেন্ট সফল হয়েছে!"
                : "পেমেন্ট রিকোয়েস্ট সফলভাবে জমা হয়েছে"}
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              {isPaid
                ? "আপনার কোর্স এনরোলমেন্ট সফলভাবে সম্পন্ন হয়েছে। আপনি এখনই ক্লাসরুমে প্রবেশ করতে পারবেন।"
                : "আপনার নগদ ট্রানজেকশনটি যাচাইকরণের জন্য পাঠানো হয়েছে। অ্যাডমিন যাচাই শেষে আপনার কোর্সটি আনলক করে দেওয়া হবে।"}
            </p>
          </CardHeader>

          <CardContent className="space-y-4 text-left">
            {/* Order Details Summary Box */}
            <div className="p-4 rounded-xl bg-muted/40 border divide-y divide-border/60 text-sm space-y-2">
              <div className="flex justify-between items-center pb-2">
                <span className="text-muted-foreground">অর্ডার আইডি</span>
                <span className="font-mono font-semibold text-foreground">
                  #{orderId ? String(orderId).slice(-8).toUpperCase() : "N/A"}
                </span>
              </div>

              {order?.amount && (
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground">পরিশোধিত / প্রদেয় পরিমাণ</span>
                  <span className="font-semibold text-primary">
                    {formatPrice(order.amount)}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">পেমেন্ট মেথড</span>
                <Badge variant="outline" className="capitalize">
                  {isBkash ? "bKash (অটো)" : "নগদ (ম্যানুয়াল)"}
                </Badge>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-muted-foreground">স্ট্যাটাস</span>
                <Badge
                  variant={isPaid ? "default" : "secondary"}
                  className={
                    isPaid
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                  }
                >
                  {isPaid ? "✅ পরিশোধিত (Paid)" : "⏳ অপেক্ষমাণ (Pending Approval)"}
                </Badge>
              </div>

              {order?.bkash?.trxID && (
                <div className="flex justify-between items-center pt-2">
                  <span className="text-muted-foreground">bKash TrxID</span>
                  <span className="font-mono text-xs font-semibold">
                    {order.bkash.trxID}
                  </span>
                </div>
              )}

              {order?.nagad?.manualTrxId && (
                <div className="flex justify-between items-center pt-2">
                  <span className="text-muted-foreground">নগদ TrxID</span>
                  <span className="font-mono text-xs font-semibold">
                    {order.nagad.manualTrxId}
                  </span>
                </div>
              )}
            </div>

            {/* If Paid, show direct link to courses */}
            {isPaid && order?.items && order.items.length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  আপনার এনরোলকৃত কোর্স:
                </p>
                <div className="space-y-2">
                  {order.items.map((item: any, idx: number) => {
                    const product = typeof item.product === "object" ? item.product : null
                    const slug = product?.slug
                    const title = product?.title || "কোর্স ক্লাসরুম"

                    return slug ? (
                      <Link
                        key={idx}
                        href={`/courses/${slug}`}
                        className="flex items-center justify-between p-3 rounded-lg border hover:border-primary/50 hover:bg-muted/50 transition-all text-sm font-medium"
                      >
                        <span className="flex items-center gap-2">
                          <GraduationCap className="size-4 text-primary" />
                          {title}
                        </span>
                        <span className="text-xs text-primary font-semibold flex items-center gap-1">
                          ক্লাসরুমে যান <ArrowRight className="size-3.5" />
                        </span>
                      </Link>
                    ) : null
                  })}
                </div>
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row gap-3 pt-2 pb-6 px-6">
            <Button asChild className="w-full sm:flex-1 cursor-pointer">
              <Link href="/courses">
                <BookOpen className="size-4 mr-2" />
                কোর্স ক্যাটালগ
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full sm:flex-1 cursor-pointer">
              <Link href="/dashboard">
                <ShieldCheck className="size-4 mr-2" />
                আমার ড্যাশবোর্ড
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </main>

      <Footer />
    </div>
  )
}

