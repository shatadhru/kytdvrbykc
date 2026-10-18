"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useCart } from "@payloadcms/plugin-ecommerce/client/react"
import { authClient } from "@/payload/auth/client"
import Header from "@/components/basic/header"
import { Footer } from "@/components/basic/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { formatPrice, getProductTitle, getProductUnitPrice } from "@/components/basic/cart/cart-utils"
import { toast } from "sonner"
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  BookOpen,
  GraduationCap,
  AlertCircle,
  Loader2,
  Smartphone,
  Copy,
} from "lucide-react"
import { Suspense } from "react"

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const errorParam = searchParams.get("error")

  const { cart, clearCart, isLoading: isCartLoading } = useCart()
  const { data: session, isPending: isSessionLoading } = authClient.useSession()

  const [activeMethod, setActiveMethod] = useState<"bkash" | "nagad">("bkash")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Nagad manual form state
  const [senderNumber, setSenderNumber] = useState("")
  const [manualTrxId, setManualTrxId] = useState("")

  const items = (cart?.items || []) as Array<{
    id?: string | null
    product?: any
    variant?: any
    quantity: number
  }>

  const totalAmount = items.reduce((acc, item) => {
    const price = getProductUnitPrice(item.product, item.variant)
    return acc + price * (item.quantity || 1)
  }, 0)

  const nagadNumber = process.env.NEXT_PUBLIC_NAGAD_NUMBER || "01XXXXXXXXX"
  const nagadType = process.env.NEXT_PUBLIC_NAGAD_TYPE || "Personal"

  const handleCopyNagadNumber = () => {
    navigator.clipboard.writeText(nagadNumber)
    toast.success("নগদ নম্বর কপি করা হয়েছে!")
  }

  // Handle bKash Auto Checkout
  const handleBkashCheckout = async () => {
    if (!session?.user?.id) {
      toast.error("অনুগ্রহ করে আগে লগইন করুন")
      router.push(`/auth/login?redirect=/checkout`)
      return
    }

    try {
      setIsSubmitting(true)
      const res = await fetch("/api/checkout/bkash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          cartID: cart?.id,
          customerInfo: {
            email: session.user.email,
            firstName: session.user.name,
          },
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success || !data.bkashURL) {
        throw new Error(data.error || "বিকাশ পেমেন্ট শুরু করতে ব্যর্থ হয়েছে।")
      }

      // Redirect student to official bKash gateway
      window.location.href = data.bkashURL
    } catch (err: any) {
      toast.error(err.message || "পেমেন্ট সম্পন্ন করতে সমস্যা হচ্ছে।")
      setIsSubmitting(false)
    }
  }

  // Handle Nagad Manual Submission
  const handleNagadCheckout = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session?.user?.id) {
      toast.error("অনুগ্রহ করে আগে লগইন করুন")
      router.push(`/auth/login?redirect=/checkout`)
      return
    }

    if (!senderNumber.trim() || senderNumber.replace(/[^0-9]/g, "").length < 11) {
      toast.error("অনুগ্রহ করে আপনার সঠিক ১১ ডিজিটের নগদ নম্বর দিন।")
      return
    }

    if (!manualTrxId.trim() || manualTrxId.trim().length < 4) {
      toast.error("অনুগ্রহ করে নগদ TrxID (ট্রানজেকশন আইডি) দিন।")
      return
    }

    try {
      setIsSubmitting(true)
      const res = await fetch("/api/checkout/nagad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          senderNumber: senderNumber.trim(),
          manualTrxId: manualTrxId.trim(),
          cartID: cart?.id,
          customerInfo: {
            email: session.user.email,
            firstName: session.user.name,
          },
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || "নগদ পেমেন্ট রিকোয়েস্ট ব্যর্থ হয়েছে।")
      }

      await clearCart()
      toast.success("পেমেন্ট রিকোয়েস্ট সফলভাবে জমা হয়েছে!")
      router.push(`/checkout/success?orderId=${data.orderID}&method=nagad`)
    } catch (err: any) {
      toast.error(err.message || "পেমেন্ট সাবমিট করতে সমস্যা হচ্ছে।")
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 container max-w-6xl mx-auto px-4 py-8 md:py-12">
        {/* Page Heading */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Link href="/courses" className="hover:text-primary transition-colors">
              কোর্সসমূহ
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">চেকআউট ও পেমেন্ট</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">নিরাপদ চেকআউট</h1>
          <p className="text-sm text-muted-foreground mt-1">
            আপনার পছন্দের পেমেন্ট পদ্ধতি নির্বাচন করে কোর্সটিতে দ্রুত এনরোল করুন।
          </p>
        </div>

        {/* Global Error Banner */}
        {errorParam && (
          <div className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-3 text-sm">
            <AlertCircle className="size-5 shrink-0" />
            <span>
              {errorParam === "payment_cancelled"
                ? "পেমেন্টটি বাতিল করা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।"
                : errorParam === "amount_mismatch"
                ? "পেমেন্টের পরিমাণে অমিল পাওয়া গেছে। অনুগ্রহ করে সাপোর্টে যোগাযোগ করুন।"
                : "পেমেন্ট সম্পন্ন হতে সমস্যা হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।"}
            </span>
          </div>
        )}

        {/* Not Logged In Notice */}
        {!isSessionLoading && !session && (
          <div className="mb-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="size-5 shrink-0 text-amber-600 dark:text-amber-400" />
              <div>
                <p className="font-semibold text-sm">লগইন করা নেই</p>
                <p className="text-xs text-muted-foreground">
                  কোর্সে লাইফটাইম অ্যাক্সেস পেতে চেকআউটের পূর্বে লগইন থাকা আবশ্যক।
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => router.push("/auth/login?redirect=/checkout")}
              className="shrink-0"
            >
              লগইন করুন
            </Button>
          </div>
        )}

        {/* Empty Cart State */}
        {!isCartLoading && items.length === 0 ? (
          <Card className="text-center py-16 border-dashed">
            <CardContent className="flex flex-col items-center">
              <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">
                <BookOpen className="size-8" />
              </div>
              <h2 className="text-xl font-bold mb-2">আপনার কার্ট খালি</h2>
              <p className="text-sm text-muted-foreground max-w-md mb-6">
                আপনার কার্টে কোনো কোর্স যোগ করা নেই। আমাদের কোর্স ক্যাটালগ থেকে কোর্স বেছে নিন।
              </p>
              <Button asChild>
                <Link href="/courses">
                  <GraduationCap className="size-4 mr-2" />
                  কোর্সসমূহ দেখুন
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Payment Methods */}
            <div className="lg:col-span-7 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="size-5 text-primary" />
                    পেমেন্ট মেথড নির্বাচন করুন
                  </CardTitle>
                  <CardDescription>
                    নিচের যে কোনো একটি মাধ্যমে সহজে পেমেন্ট সম্পন্ন করতে পারবেন।
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs
                    value={activeMethod}
                    onValueChange={(val) => setActiveMethod(val as "bkash" | "nagad")}
                    className="w-full"
                  >
                    <TabsList className="grid grid-cols-2 w-full mb-6">
                      <TabsTrigger value="bkash" className="font-semibold text-sm">
                        bKash (অটো)
                      </TabsTrigger>
                      <TabsTrigger value="nagad" className="font-semibold text-sm">
                        নগদ (ম্যানুয়াল)
                      </TabsTrigger>
                    </TabsList>

                    {/* bKash Content */}
                    <TabsContent value="bkash" className="space-y-4">
                      <div className="p-4 rounded-xl border border-pink-500/20 bg-pink-500/5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-pink-600 dark:text-pink-400 text-base">
                            bKash Auto Checkout
                          </span>
                          <Badge variant="outline" className="border-pink-500/30 text-pink-600 dark:text-pink-400">
                            ইনস্ট্যান্ট আনলক
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          বিকাশ গেটওয়ের মাধ্যমে পিন ও ওটিপি দিয়ে স্বয়ংক্রিয় ও নিরাপদভাবে ফি পরিশোধ করুন।
                          পেমেন্ট সফল হলে মুহূর্তের মধ্যে কোর্সটি আপনার প্রোফাইলে আনলক হয়ে যাবে।
                        </p>
                      </div>

                      <Button
                        size="lg"
                        disabled={isSubmitting || !session}
                        onClick={handleBkashCheckout}
                        className="w-full font-semibold bg-[#E2136E] hover:bg-[#C90E60] text-white shadow-md transition-all cursor-pointer"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="size-4 mr-2 animate-spin" />
                            বিকাশ গেটওয়েতে সংযোগ হচ্ছে...
                          </>
                        ) : (
                          <>
                            <Lock className="size-4 mr-2" />
                            বিকাশ দিয়ে পে করুন ({formatPrice(totalAmount)})
                            <ArrowRight className="size-4 ml-auto" />
                          </>
                        )}
                      </Button>
                    </TabsContent>

                    {/* Nagad Content */}
                    <TabsContent value="nagad" className="space-y-4">
                      <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-amber-700 dark:text-amber-400 text-base">
                            নগদ সেন্ড মানি নির্দেশনা
                          </span>
                          <Badge variant="outline" className="border-amber-500/30 text-amber-700 dark:text-amber-400">
                            ম্যানুয়াল যাচাই
                          </Badge>
                        </div>

                        <div className="text-xs space-y-2 text-muted-foreground">
                          <p>
                            ১. নগদ অ্যাপ বা ডায়াল থেকে নিচের নম্বরে <strong>Send Money</strong> করুন:
                          </p>
                          <div className="flex items-center justify-between bg-background border rounded-lg px-3 py-2 text-foreground font-mono font-bold text-sm">
                            <span>{nagadNumber} ({nagadType})</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={handleCopyNagadNumber}
                              className="h-7 px-2 text-xs"
                            >
                              <Copy className="size-3.5 mr-1" /> কপি
                            </Button>
                          </div>
                          <p>
                            ২. সঠিক টাকার পরিমাণ: <strong>{formatPrice(totalAmount)}</strong>
                          </p>
                          <p>
                            ৩. টাকা পাঠানোর পর এসএমএস থেকে প্রাপ্ত <strong>TrxID</strong> এবং আপনার <strong>নগদ নম্বর</strong> নিচে দিন।
                          </p>
                        </div>
                      </div>

                      <form onSubmit={handleNagadCheckout} className="space-y-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="senderNumber" className="text-xs font-medium">
                            আপনার নগদ প্রেরকের নম্বর <span className="text-destructive">*</span>
                          </Label>
                          <div className="relative">
                            <Smartphone className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                            <Input
                              id="senderNumber"
                              type="tel"
                              placeholder="০১XXXXXXXXX"
                              value={senderNumber}
                              onChange={(e) => setSenderNumber(e.target.value)}
                              className="pl-9"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="manualTrxId" className="text-xs font-medium">
                            নগদ ট্রানজেকশন আইডি (TrxID) <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="manualTrxId"
                            type="text"
                            placeholder="যেমন: 8A7B9C2D"
                            value={manualTrxId}
                            onChange={(e) => setManualTrxId(e.target.value.toUpperCase())}
                            className="font-mono uppercase"
                            required
                          />
                        </div>

                        <Button
                          type="submit"
                          size="lg"
                          disabled={isSubmitting || !session}
                          className="w-full font-semibold bg-[#F7941D] hover:bg-[#DE8214] text-white shadow-md transition-all cursor-pointer"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="size-4 mr-2 animate-spin" />
                              যাচাইয়ের জন্য পাঠানো হচ্ছে...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="size-4 mr-2" />
                              পেমেন্ট তথ্য সাবমিট করুন
                            </>
                          )}
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Trust Badges */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/40 border text-xs text-muted-foreground">
                <ShieldCheck className="size-5 text-primary shrink-0" />
                <span>
                  আপনার লেনদেন সম্পূর্ণ এনক্রিপ্টেড ও সুরক্ষিত। কোনো পেমেন্ট সমস্যা হলে আমাদের হটলাইনে তাৎক্ষণিক সহায়তা পাবেন।
                </span>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-5">
              <Card className="sticky top-24">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold">অর্ডারের সারসংক্ষেপ</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cart Items List */}
                  <div className="divide-y divide-border/60 max-h-72 overflow-y-auto pr-1">
                    {items.map((item, idx) => {
                      const title = getProductTitle(item.product)
                      const unitPrice = getProductUnitPrice(item.product, item.variant)
                      const lineTotal = unitPrice * (item.quantity || 1)

                      return (
                        <div key={item.id || idx} className="py-3 flex items-start justify-between gap-3 text-sm">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground line-clamp-1">{title}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              কোর্স অ্যাক্সেস • পরিমাণ: {item.quantity}
                            </p>
                          </div>
                          <span className="font-semibold text-foreground shrink-0 tabular-nums">
                            {formatPrice(lineTotal)}
                          </span>
                        </div>
                      )
                    })}
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="pt-3 border-t border-border/80 space-y-2 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>সাবটোটাল</span>
                      <span className="tabular-nums font-medium text-foreground">
                        {formatPrice(totalAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>ডেলিভারি / ভ্যাট</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">৳০ (ফ্রি)</span>
                    </div>
                    <div className="flex justify-between text-base font-bold text-foreground pt-2 border-t">
                      <span>সর্বমোট প্রদেয়</span>
                      <span className="text-primary tabular-nums text-lg">
                        {formatPrice(totalAmount)}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/20 border-t py-3 px-6 text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
                  <Lock className="size-3.5 text-primary" />
                  <span>Payload CMS Secure Checkout Gateway</span>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col bg-background text-foreground">
          <Header />
          <div className="flex-1 flex items-center justify-center p-12">
            <Loader2 className="size-8 animate-spin text-primary" />
          </div>
          <Footer />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  )
}

