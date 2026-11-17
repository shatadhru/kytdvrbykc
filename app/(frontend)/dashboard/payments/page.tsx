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
} from "lucide-react"
import { WalletMoneyBoldDuotone } from "solar-icon-set"
import { InvoiceReceiptModal, InvoiceOrder } from "@/components/basic/dashboard/payments/InvoiceReceiptModal"

export default function PaymentsPage() {
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
            <span className="text-foreground font-medium">পেমেন্ট রসিদ</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 border border-emerald-500/20">
              <WalletMoneyBoldDuotone className="size-5" />
            </div>
            পেমেন্ট রসিদ ও ইনভয়েস
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            আপনার সফল কোর্স পারচেজ এবং অনলাইন ফি পরিশোধের অফিসিয়াল ডিজিটাল রসিদ।
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
              মোট ট্রানজেকশন
            </CardTitle>
            <div className="size-8 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center border border-blue-500/20">
              <FileText className="size-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{totalOrders} টি</div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {pendingOrders.length > 0
                ? `${pendingOrders.length} টি পেমেন্ট অপেক্ষমাণ`
                : "সকল অর্ডার অন্তর্ভুক্ত"}
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Completed / Paid Orders */}
        <Card className="border-border/80 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              সফল ভর্তি / পেইড
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
              সর্বমোট পরিশোধিত ফি
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

      {/* Transactions Section */}
      <Card className="border-border/80 shadow-xs">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base font-semibold">লেনদেনের ইতিহাস</CardTitle>
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
                  পরিশোধিত
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
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-muted-foreground text-sm">
              <RefreshCw className="size-6 animate-spin text-primary mb-3" />
              <span>পেমেন্ট রসিদ তথ্য লোড হচ্ছে...</span>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-16 text-center px-4 flex flex-col items-center justify-center">
              <div className="size-14 rounded-full bg-muted/60 flex items-center justify-center text-muted-foreground mb-3 border">
                <BookOpen className="size-6" />
              </div>
              <h3 className="font-semibold text-base mb-1">কোনো লেনদেন পাওয়া যায়নি</h3>
              <p className="text-xs text-muted-foreground max-w-sm mb-6">
                {orders.length === 0
                  ? "আপনি এখনও কোনো কোর্সে ভর্তি হননি। আমাদের মানসম্মত কোর্সসমূহ ঘুরে দেখুন।"
                  : "আপনার অনুসন্ধানের সাথে মিলে এমন কোনো পেমেন্ট রেকর্ড নেই।"}
              </p>
              {orders.length === 0 && (
                <Button asChild size="sm">
                  <Link href="/courses">
                    <GraduationCap className="size-4 mr-1.5" />
                    কোর্স ক্যাটালগ দেখুন
                    <ArrowRight className="size-3.5 ml-1.5" />
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-y border-border/80 text-muted-foreground font-semibold">
                  <tr>
                    <th className="py-3 px-4">ইনভয়েস নম্বর</th>
                    <th className="py-3 px-4">তারিখ</th>
                    <th className="py-3 px-4">কোর্স বিবরণ</th>
                    <th className="py-3 px-4">পেমেন্ট মেথড</th>
                    <th className="py-3 px-4 text-right">পরিমাণ</th>
                    <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                    <th className="py-3 px-4 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredOrders.map((order) => {
                    const invoiceNumber = `UTM-${String(order.id).slice(-8).toUpperCase()}`
                    const isPaid = order.paymentStatus === "paid" || order.status === "completed"
                    const isPending = order.paymentStatus === "pending" || order.status === "processing"
                    const isFailed = order.paymentStatus === "failed" || order.status === "cancelled"

                    const items = Array.isArray(order.items) ? order.items : []
                    const courseTitles = items
                      .map((it) => {
                        const p = typeof it.product === "object" ? it.product : null
                        return p?.title || p?.name || p?.courseName || "কোর্স"
                      })
                      .join(", ") || "কোর্স এনরোলমেন্ট"

                    const formattedDate = order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"

                    const paymentLabel =
                      order.amount === 0
                        ? "বিনামূল্যে (Free)"
                        : order.paymentMethod === "bkash"
                        ? "bKash (অটো)"
                        : order.paymentMethod === "nagad"
                        ? "নগদ (ম্যানুয়াল)"
                        : (order.paymentMethod || "অনলাইন").toUpperCase()

                    return (
                      <tr
                        key={order.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                          {invoiceNumber}
                        </td>
                        <td className="py-3.5 px-4 text-muted-foreground whitespace-nowrap">
                          {formattedDate}
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="font-medium text-foreground line-clamp-1">
                            {courseTitles}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            পরিমাণ: {items.reduce((acc, it) => acc + (it.quantity || 1), 0)} টি
                          </p>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="font-medium text-foreground">
                            {paymentLabel}
                          </span>
                          {order.bkash?.trxID && (
                            <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
                              Trx: {order.bkash.trxID}
                            </p>
                          )}
                          {order.nagad?.manualTrxId && (
                            <p className="font-mono text-[10px] text-muted-foreground mt-0.5">
                              Trx: {order.nagad.manualTrxId}
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-sm text-foreground">
                          ৳{Number(order.amount || 0).toLocaleString("en-US")}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          {isPaid && (
                            <Badge className="bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30 text-[11px] font-semibold">
                              <CheckCircle2 className="size-3 mr-1" />
                              পরিশোধিত
                            </Badge>
                          )}
                          {isPending && (
                            <Badge variant="outline" className="border-amber-500/40 text-amber-600 dark:text-amber-400 bg-amber-500/10 text-[11px] font-semibold">
                              <Clock className="size-3 mr-1" />
                              অপেক্ষমাণ
                            </Badge>
                          )}
                          {isFailed && (
                            <Badge variant="destructive" className="text-[11px] font-semibold">
                              <AlertCircle className="size-3 mr-1" />
                              ব্যর্থ
                            </Badge>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenReceipt(order)}
                            className="h-8 px-2.5 text-xs font-semibold hover:border-primary hover:text-primary cursor-pointer"
                          >
                            <Eye className="size-3.5 mr-1 text-primary" />
                            রসিদ দেখুন
                          </Button>
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
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}

