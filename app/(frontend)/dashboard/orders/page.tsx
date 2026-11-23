"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { authClient } from "@/payload/auth/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Eye,
  BookOpen,
  ArrowRight,
  Search,
  RefreshCw,
  Wallet,
  GraduationCap,
  FileText,
  ShoppingBag,
} from "lucide-react"
import { WalletMoneyBoldDuotone } from "solar-icon-set"
import { InvoiceReceiptModal, InvoiceOrder } from "@/components/basic/dashboard/payments/InvoiceReceiptModal"
import Image from "next/image"

export default function OrdersPage() {
  const { data: session, isPending: isSessionLoading } = authClient.useSession()
  const [orders, setOrders] = useState<InvoiceOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "pending" | "failed">("all")

  // Modal State
  const [selectedOrder, setSelectedOrder] = useState<InvoiceOrder | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/user/orders")
      if (res.ok) {
        const data = await res.json()
        setOrders(data.orders || [])
      }
    } catch (err) {
      console.error("Failed to load user orders:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user?.id) {
      fetchOrders()
    } else if (!isSessionLoading) {
      setIsLoading(false)
    }
  }, [session?.user?.id, isSessionLoading])

  // Statistics Calculation
  const totalOrders = orders.length
  const paidOrders = orders.filter(
    (o) => o.paymentStatus === "paid" || o.status === "completed"
  )
  const pendingOrders = orders.filter(
    (o) => o.paymentStatus === "pending" || o.status === "processing"
  )
  const totalSpentBDT = paidOrders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0)

  // Filtered Orders
  const filteredOrders = orders.filter((order) => {
    const isPaid = order.paymentStatus === "paid" || order.status === "completed"
    const isPending = order.paymentStatus === "pending" || order.status === "processing"
    const isFailed = order.paymentStatus === "failed" || order.status === "cancelled"

    if (statusFilter === "paid" && !isPaid) return false
    if (statusFilter === "pending" && !isPending) return false
    if (statusFilter === "failed" && !isFailed) return false

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      const invoiceId = `utm-${String(order.id).toLowerCase()}`
      const matchesId = invoiceId.includes(q) || String(order.id).toLowerCase().includes(q)
      const matchesMethod = (order.paymentMethod || "").toLowerCase().includes(q)
      const matchesTrx =
        (order.bkash?.trxID || "").toLowerCase().includes(q) ||
        (order.nagad?.manualTrxId || "").toLowerCase().includes(q)
      const matchesCourse = (order.items || []).some((item) => {
        const prod = typeof item.product === "object" ? item.product : null
        const title = (prod?.title || prod?.name || prod?.courseName || "").toLowerCase()
        return title.includes(q)
      })

      return matchesId || matchesMethod || matchesTrx || matchesCourse
    }

    return true
  })

  const handleOpenReceipt = (order: InvoiceOrder) => {
    setSelectedOrder(order)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <Link href="/dashboard" className="hover:text-primary transition-colors">
              ড্যাশবোর্ড
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">অর্ডারসমূহ</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <ShoppingBag className="size-5" />
            </div>
            আমার কোর্স অর্ডার ও পেমেন্ট
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            আপনার কোর্সের সকল পারচেজ অর্ডার, ভেরিফিকেশন স্ট্যাটাস ও ডিজিটাল রসিদ।
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchOrders}
          disabled={isLoading}
          className="shrink-0 cursor-pointer"
        >
          <RefreshCw className={`size-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
          রিফ্রেশ
        </Button>
      </div>

      {/* Stats Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Card 1: Total Orders */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              সর্বমোট অর্ডার
            </CardTitle>
            <div className="size-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center border border-blue-500/20">
              <FileText className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{totalOrders} টি</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {pendingOrders.length > 0
                ? `${pendingOrders.length} টি ভেরিফিকেশন অপেক্ষমাণ`
                : "সকল অর্ডার অন্তর্ভুক্ত"}
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Completed / Paid Orders */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              সফল ভর্তি / সক্রিয়
            </CardTitle>
            <div className="size-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20">
              <CheckCircle2 className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {paidOrders.length} টি
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              সক্রিয় ক্লাসরুম এক্সেস অনুমোদিত
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Total Spent */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              পরিশোধিত ফি মোট
            </CardTitle>
            <div className="size-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20">
              <Wallet className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono text-foreground">
              ৳{totalSpentBDT.toLocaleString("en-US")}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              BDT (বাংলাদেশি টাকা)
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Orders Section */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-semibold">অর্ডারের তালিকা</CardTitle>
              <CardDescription className="text-xs">
                যেকোনো অর্ডারের বিস্তারিত দেখতে ও প্রিন্ট করতে &apos;রসিদ দেখুন&apos; বাটনে ক্লিক করুন।
              </CardDescription>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative w-full sm:w-56">
                <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="অর্ডার আইডি / কোর্স খুঁজুন..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 text-xs h-9"
                />
              </div>

              <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-lg border">
                <button
                  type="button"
                  onClick={() => setStatusFilter("all")}
                  className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    statusFilter === "all"
                      ? "bg-background text-foreground shadow-2xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  সকল
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("paid")}
                  className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    statusFilter === "paid"
                      ? "bg-background text-emerald-600 shadow-2xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  সফল
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("pending")}
                  className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    statusFilter === "pending"
                      ? "bg-background text-amber-600 shadow-2xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  অপেক্ষমাণ
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter("failed")}
                  className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                    statusFilter === "failed"
                      ? "bg-background text-rose-600 shadow-2xs font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  ব্যর্থ
                </button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <RefreshCw className="size-6 text-primary animate-spin" />
              <p className="text-xs text-muted-foreground font-medium">অর্ডার লোড করা হচ্ছে...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
              <div className="size-14 rounded-2xl bg-muted/60 flex items-center justify-center text-muted-foreground mb-4">
                <ShoppingBag className="size-7" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">কোনো অর্ডার পাওয়া যায়নি</h3>
              <p className="text-xs text-muted-foreground max-w-sm mt-1">
                {searchQuery || statusFilter !== "all"
                  ? "ফিল্টারের সাথে মিলে এমন কোনো অর্ডার নেই। ভিন্ন ফিল্টার দিয়ে চেষ্টা করুন।"
                  : "আপনি এখনো কোনো কোর্সে ভর্তি হননি। কোর্সসমূহ ঘুরে দেখুন এবং আজই ভর্তি হন!"}
              </p>
              {!searchQuery && statusFilter === "all" && (
                <Button asChild size="sm" className="mt-4 gap-1.5 cursor-pointer">
                  <Link href="/courses">
                    <GraduationCap className="size-4" />
                    কোর্সসমূহ দেখুন
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 border-y border-border/60 text-muted-foreground font-medium">
                  <tr>
                    <th className="py-3 px-4">অর্ডার ও কোর্স</th>
                    <th className="py-3 px-4">তারিখ</th>
                    <th className="py-3 px-4">মেথড ও TrxID</th>
                    <th className="py-3 px-4">মোট টাকা</th>
                    <th className="py-3 px-4">স্ট্যাটাস</th>
                    <th className="py-3 px-4 text-right">পদক্ষেপ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredOrders.map((order) => {
                    const isPaid = order.paymentStatus === "paid" || order.status === "completed"
                    const isPending = order.paymentStatus === "pending" || order.status === "processing"
                    const isFailed = order.paymentStatus === "failed" || order.status === "cancelled"

                    const formattedDate = new Date(order.createdAt).toLocaleDateString("bn-BD", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })

                    const firstItem = order.items?.[0]
                    const productObj = typeof firstItem?.product === "object" ? firstItem.product : null
                    const courseTitle =
                      productObj?.title || productObj?.name || productObj?.courseName || "ইউনিক টিচিং কোর্স"
                    const courseSlug = productObj?.slug || ""
                    const thumbnail =
                      typeof productObj?.thumbnail === "object"
                        ? productObj.thumbnail?.url
                        : typeof productObj?.image === "object"
                        ? productObj.image?.url
                        : null

                    const trxId =
                      order.bkash?.trxID ||
                      order.nagad?.manualTrxId ||
                      (order.paymentMethod === "free" ? "FREE-ENROLL" : "অপেক্ষমাণ")

                    return (
                      <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="relative size-10 rounded-lg overflow-hidden bg-muted/60 shrink-0 border">
                              {thumbnail ? (
                                <Image
                                  src={thumbnail}
                                  alt={courseTitle}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                  <BookOpen className="size-5" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 max-w-[200px] sm:max-w-[280px]">
                              <p className="font-semibold text-foreground truncate" title={courseTitle}>
                                {courseTitle}
                              </p>
                              <p className="text-[11px] text-muted-foreground font-mono">
                                UTM-{String(order.id).slice(-6).toUpperCase()}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-muted-foreground whitespace-nowrap">
                          {formattedDate}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          <div className="font-medium capitalize text-foreground flex items-center gap-1.5">
                            <CreditCard className="size-3.5 text-muted-foreground" />
                            {order.paymentMethod || "অনলাইন"}
                          </div>
                          <div className="text-[11px] font-mono text-muted-foreground truncate max-w-[130px]">
                            {trxId}
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono font-semibold text-foreground whitespace-nowrap">
                          ৳{Number(order.amount || 0).toLocaleString("en-US")}
                        </td>

                        <td className="py-3 px-4 whitespace-nowrap">
                          {isPaid ? (
                            <Badge className="bg-emerald-500/15 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/30 text-[11px]">
                              <CheckCircle2 className="size-3 mr-1" />
                              পরিশোধিত
                            </Badge>
                          ) : isPending ? (
                            <Badge className="bg-amber-500/15 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/30 text-[11px]">
                              <Clock className="size-3 mr-1" />
                              অপেক্ষমাণ
                            </Badge>
                          ) : (
                            <Badge className="bg-rose-500/15 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 border-rose-500/30 text-[11px]">
                              <AlertCircle className="size-3 mr-1" />
                              ব্যর্থ
                            </Badge>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {isPaid && courseSlug && (
                              <Button
                                asChild
                                variant="ghost"
                                size="sm"
                                className="h-8 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10 cursor-pointer"
                              >
                                <Link href={`/courses/${courseSlug}?learn=true`}>
                                  <GraduationCap className="size-3.5 mr-1" />
                                  ক্লাস
                                </Link>
                              </Button>
                            )}

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenReceipt(order)}
                              className="h-8 px-2.5 text-xs cursor-pointer gap-1"
                            >
                              <Eye className="size-3.5" />
                              রসিদ
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invoice Receipt Modal */}
      <InvoiceReceiptModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        order={selectedOrder}
      />
    </div>
  )
}
