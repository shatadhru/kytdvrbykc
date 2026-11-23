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
  const [isSendingVerification, setIsSendingVerification] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([])

  // Fetch student's existing enrollments to block duplicate purchase (Requirements 5 & 6)
  React.useEffect(() => {
    if (session?.user?.id) {
      fetch("/api/user/enrollments")
        .then((r) => r.json())
        .then((data) => {
          if (data?.success && Array.isArray(data.enrollments)) {
            setEnrolledCourseIds(data.enrollments.map((e: any) => String(e.id)))
          }
        })
        .catch(() => {})
    }
  }, [session?.user?.id])

  // Coupon state
  const [couponInput, setCouponInput] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string
    type: string
    value: number
    discountAmount: number
  } | null>(null)
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)

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

  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0
  const finalAmount = Math.max(0, totalAmount - discountAmount)
  const isEmailUnverified = Boolean(session?.user && !session.user.emailVerified)

  const alreadyEnrolledItems = items.filter((item) => {
    const pid = String(typeof item.product === "object" && item.product ? item.product.id : item.product)
    return enrolledCourseIds.includes(pid)
  })
  const hasAlreadyEnrolledCourse = alreadyEnrolledItems.length > 0

  const handleResendVerification = async () => {
    if (!session?.user?.email || isSendingVerification) return
    try {
      setIsSendingVerification(true)
      const res = await authClient.sendVerificationEmail({
        email: session.user.email,
        callbackURL: "/checkout",
      })
      if (res?.error) {
        toast.error(res.error.message || "ভেরিফিকেশন ইমেইল পাঠানো যায়নি।")
      } else {
        setVerificationSent(true)
        toast.success(`ভেরিফিকেশন লিংক ${session.user.email} ঠিকানায় পাঠানো হয়েছে।`)
      }
    } catch (err: any) {
      toast.error(err?.message || "ভেরিফিকেশন ইমেইল পাঠানো যায়নি।")
    } finally {
      setIsSendingVerification(false)
    }
  }

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) {
      toast.error("অনুগ্রহ করে একটি কুপন কোড লিখুন।")
      return
    }

    try {
      setIsApplyingCoupon(true)
      const productIds = items
        .map((item) => (typeof item.product === "object" ? item.product?.id : item.product))
        .filter(Boolean)

      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponInput.trim().toUpperCase(),
          cartTotal: totalAmount,
          productIds,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.valid) {
        throw new Error(data.error || "কুপন কোডটি সঠিক নয়।")
      }

      setAppliedCoupon({
        code: data.code,
        type: data.type,
        value: data.value,
        discountAmount: data.discountAmount,
      })
      toast.success(data.message || "কুপন কোড সফলভাবে যোগ করা হয়েছে!")
    } catch (err: any) {
      toast.error(err.message || "কুপন যাচাই করতে সমস্যা হয়েছে।")
    } finally {
      setIsApplyingCoupon(false)
    }
  }

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null)
    setCouponInput("")
    toast.info("কুপন কোড সরিয়ে নেওয়া হয়েছে।")
  }

  // Handle Free 100% Discount Enrollment
  const handleFreeEnrollment = async () => {
    if (!session?.user?.id) {
      toast.error("অনুগ্রহ করে আগে লগইন করুন")
      router.push(`/auth/login?redirect=/checkout`)
      return
    }

    if (isEmailUnverified) {
      toast.error("কোর্স কেনার পূর্বে আপনার ইমেইল ভেরিফাই করা আবশ্যক।")
      return
    }

    if (hasAlreadyEnrolledCourse) {
      toast.error("আপনি ইতিমধ্যে এই কোর্সে ভর্তি আছেন। একই কোর্স পুনরায় কেনার প্রয়োজন নেই।")
      return
    }

    try {
      setIsSubmitting(true)
      const res = await fetch("/api/checkout/bkash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          couponCode: appliedCoupon?.code,
          cartID: cart?.id,
          customerInfo: {
            email: session.user.email,
            firstName: session.user.name,
          },
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || "এনরোলমেন্ট সম্পন্ন করতে সমস্যা হয়েছে।")
      }

      await clearCart()
      toast.success("কোর্সে সফলভাবে ভর্তি সম্পন্ন হয়েছে!")
      router.push(`/checkout/success?orderId=${data.orderID || data.orderId}&free=true`)
    } catch (err: any) {
      toast.error(err.message || "সমস্যা হয়েছে।")
      setIsSubmitting(false)
    }
  }

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

    if (isEmailUnverified) {
      toast.error("কোর্স কেনার পূর্বে আপনার ইমেইল ভেরিফাই করা আবশ্যক।")
      return
    }

    if (hasAlreadyEnrolledCourse) {
      toast.error("আপনি ইতিমধ্যে এই কোর্সে ভর্তি আছেন। একই কোর্স পুনরায় কেনার প্রয়োজন নেই।")
      return
    }

    if (finalAmount <= 0) {
      toast.info("প্রদেয় অর্থ ৳০। অনুগ্রহ করে বিনামূল্যে ভর্তি সম্পন্ন করুন বাটনে ক্লিক করুন।")
      return
    }

    try {
      setIsSubmitting(true)
      const res = await fetch("/api/checkout/bkash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          couponCode: appliedCoupon?.code,
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

    if (isEmailUnverified) {
      toast.error("কোর্স কেনার পূর্বে আপনার ইমেইল ভেরিফাই করা আবশ্যক।")
      return
    }

    if (hasAlreadyEnrolledCourse) {
      toast.error("আপনি ইতিমধ্যে এই কোর্সে ভর্তি আছেন। একই কোর্স পুনরায় কেনার প্রয়োজন নেই।")
      return
    }

    if (finalAmount <= 0) {
      toast.info("প্রদেয় অর্থ ৳০। অনুগ্রহ করে বিনামূল্যে ভর্তি সম্পন্ন করুন বাটনে ক্লিক করুন।")
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
          couponCode: appliedCoupon?.code,
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

        {/* Unverified Email Warning Banner */}
        {!isSessionLoading && session?.user && !session.user.emailVerified && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3">
              <AlertCircle className="size-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5 sm:mt-0" />
              <div>
                <p className="font-semibold text-sm">ইমেইল ভেরিফিকেশন আবশ্যক</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  কোর্স কেনার পূর্বে আপনার ইমেইল (<strong>{session.user.email}</strong>) ভেরিফাই করা আবশ্যক। অনুগ্রহ করে আপনার ইনবক্স চেক করুন অথবা নতুন ভেরিফিকেশন লিংক রিকোয়েস্ট করুন।
                </p>
              </div>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={handleResendVerification}
              disabled={isSendingVerification}
              className="shrink-0 border-amber-500/40 hover:bg-amber-500/20 text-amber-900 dark:text-amber-100 cursor-pointer"
            >
              {isSendingVerification ? (
                <>
                  <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                  পাঠানো হচ্ছে...
                </>
              ) : verificationSent ? (
                <>
                  <CheckCircle2 className="size-3.5 mr-1.5 text-emerald-600" />
                  ইমেইল পাঠানো হয়েছে!
                </>
              ) : (
                "ভেরিফিকেশন ইমেইল পাঠান"
              )}
            </Button>
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
                  {hasAlreadyEnrolledCourse && (
                    <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border-2 border-amber-500/40 text-amber-950 dark:text-amber-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="size-6 text-amber-600 dark:text-amber-400 shrink-0" />
                        <div>
                          <p className="font-bold text-sm text-amber-800 dark:text-amber-300">
                            আপনি ইতিমধ্যে কার্টের একটি কোর্সে ভর্তি আছেন!
                          </p>
                          <p className="text-xs text-amber-700/90 dark:text-amber-300/80">
                            আপনার কার্টে থাকা কোর্স আপনি আগেই কিনেছেন। একই কোর্স ২ বার কেনার প্রয়োজন নেই।
                          </p>
                        </div>
                      </div>
                      <Button
                        asChild
                        size="sm"
                        className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer shadow-xs"
                      >
                        <Link href="/dashboard/my-courses">
                          ক্লাসরুমে যান
                        </Link>
                      </Button>
                    </div>
                  )}

                  {finalAmount === 0 && (
                    <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border-2 border-emerald-500/40 text-emerald-950 dark:text-emerald-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="size-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <div>
                          <p className="font-bold text-sm text-emerald-800 dark:text-emerald-300">
                            ১০০% ছাড় সক্রিয় — কোনো পেমেন্ট ফি নেই!
                          </p>
                          <p className="text-xs text-emerald-700/90 dark:text-emerald-300/80">
                            কুপন ছাড়ের ফলে আপনার প্রদেয় অর্থ ৳০ (ফ্রি)। সরাসরি কোর্সে এনরোল সম্পন্ন করতে ডানদিকের বাটনে ক্লিক করুন।
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleFreeEnrollment}
                        disabled={isSubmitting || !session || isEmailUnverified || hasAlreadyEnrolledCourse}
                        className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          "বিনামূল্যে ভর্তি সম্পন্ন করুন"
                        )}
                      </Button>
                    </div>
                  )}

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
                        disabled={isSubmitting || !session || isEmailUnverified || finalAmount <= 0 || hasAlreadyEnrolledCourse}
                        onClick={handleBkashCheckout}
                        className="w-full font-semibold bg-[#E2136E] hover:bg-[#C90E60] text-white shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="size-4 mr-2 animate-spin" />
                            বিকাশ গেটওয়েতে সংযোগ হচ্ছে...
                          </>
                        ) : (
                          <>
                            <Lock className="size-4 mr-2" />
                            বিকাশ দিয়ে পে করুন ({formatPrice(finalAmount)})
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
                            ২. সঠিক টাকার পরিমাণ: <strong>{formatPrice(finalAmount)}</strong>
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
                          disabled={isSubmitting || !session || isEmailUnverified || finalAmount <= 0 || hasAlreadyEnrolledCourse}
                          className="w-full font-semibold bg-[#F7941D] hover:bg-[#DE8214] text-white shadow-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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

                  {/* Coupon Code Section */}
                  <div className="pt-3 border-t border-border/80 space-y-2">
                    <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                      <span>কুপন কোড (যদি থাকে)</span>
                      {appliedCoupon && (
                        <span className="text-[11px] text-emerald-600 font-bold">
                          {appliedCoupon.code} সক্রিয়
                        </span>
                      )}
                    </label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="কুপন কোড (যেমন: 7UP, FREE26)"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                        disabled={appliedCoupon !== null || isApplyingCoupon}
                        className="uppercase text-xs h-9 font-mono"
                      />
                      {appliedCoupon ? (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={handleRemoveCoupon}
                          className="text-xs h-9 shrink-0 cursor-pointer"
                        >
                          রিমুভ
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleApplyCoupon}
                          disabled={isApplyingCoupon || !couponInput.trim()}
                          className="text-xs h-9 shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold cursor-pointer"
                        >
                          {isApplyingCoupon ? (
                            <Loader2 className="size-3 animate-spin" />
                          ) : (
                            "এপ্লাই"
                          )}
                        </Button>
                      )}
                    </div>
                    {appliedCoupon && (
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="size-3 shrink-0" />
                        <span>
                          কুপন সফলভাবে প্রয়োগ করা হয়েছে ({formatPrice(discountAmount)} ছাড়)
                        </span>
                      </p>
                    )}
                  </div>

                  {/* Pricing Breakdown */}
                  <div className="pt-3 border-t border-border/80 space-y-2 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>সাবটোটাল</span>
                      <span className="tabular-nums font-medium text-foreground">
                        {formatPrice(totalAmount)}
                      </span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-medium">
                        <span>কুপন ছাড় ({appliedCoupon?.code})</span>
                        <span className="tabular-nums">- {formatPrice(discountAmount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-muted-foreground">
                      <span>ডেলিভারি / ভ্যাট</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">৳০ (ফ্রি)</span>
                    </div>

                    <div className="flex justify-between text-base font-bold text-foreground pt-2 border-t">
                      <span>সর্বমোট প্রদেয়</span>
                      <span className="text-primary tabular-nums text-lg">
                        {formatPrice(finalAmount)}
                      </span>
                    </div>

                    {finalAmount === 0 && (
                      <div className="pt-2">
                        <Button
                          type="button"
                          size="lg"
                          onClick={handleFreeEnrollment}
                          disabled={isSubmitting || !session || isEmailUnverified}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md cursor-pointer text-sm ring-2 ring-emerald-500/50 hover:ring-emerald-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="size-4 mr-2 animate-spin" />
                              এনরোলমেন্ট সম্পন্ন হচ্ছে...
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="size-4 mr-2" />
                              বিনামূল্যে ভর্তি সম্পন্ন করুন
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="bg-emerald-500/5 border-t border-emerald-500/20 py-3 px-6 text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-center gap-1.5 shadow-2xs">
                  <ShieldCheck className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span>SCALVIO GUARD Protected • Licensed & Secured Payment Gateway</span>
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

