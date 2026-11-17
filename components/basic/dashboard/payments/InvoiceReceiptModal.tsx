"use client"

import React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Printer,
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  GraduationCap,
  Mail,
  Phone,
  Globe,
} from "lucide-react"
import { SiteConfig } from "@/config/site"

export interface InvoiceOrder {
  id: string
  createdAt: string
  amount: number
  currency?: string
  paymentMethod?: string
  paymentStatus?: "pending" | "paid" | "failed" | string
  status?: string
  customerEmail?: string
  customer?: any
  shippingAddress?: {
    firstName?: string
    lastName?: string
    phone?: string
    addressLine1?: string
    city?: string
    postalCode?: string
    country?: string
  }
  items?: Array<{
    product?: any
    quantity?: number
  }>
  bkash?: {
    paymentID?: string
    trxID?: string
  }
  nagad?: {
    manualTrxId?: string
    senderNumber?: string
  }
}

interface InvoiceReceiptModalProps {
  order: InvoiceOrder | null
  isOpen: boolean
  onClose: () => void
}

export function InvoiceReceiptModal({
  order,
  isOpen,
  onClose,
}: InvoiceReceiptModalProps) {
  if (!order) return null

  const invoiceNumber = `UTM-${String(order.id).slice(-8).toUpperCase()}`
  const isPaid = order.paymentStatus === "paid" || order.status === "completed"
  const isPending = order.paymentStatus === "pending" || order.status === "processing"
  const isFailed = order.paymentStatus === "failed" || order.status === "cancelled"

  const customerName =
    order.shippingAddress?.firstName
      ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName || ""}`.trim()
      : typeof order.customer === "object" && order.customer?.name
      ? order.customer.name
      : "সম্মানিত শিক্ষার্থী"

  const customerEmail =
    order.customerEmail ||
    (typeof order.customer === "object" ? order.customer?.email : "") ||
    "N/A"

  const customerPhone =
    order.shippingAddress?.phone ||
    order.nagad?.senderNumber ||
    (typeof order.customer === "object" ? order.customer?.phone : "") ||
    "—"

  const formattedDateEn = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—"

  const formattedDateBn = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString("bn-BD", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—"

  const paymentMethodLabel =
    order.amount === 0
      ? "বিনামূল্যে (Free Enrollment)"
      : order.paymentMethod === "bkash"
      ? "bKash (অটো পেমেন্ট)"
      : order.paymentMethod === "nagad"
      ? "নগদ (ম্যানুয়াল ভেরিফিকেশন)"
      : (order.paymentMethod || "অনলাইন").toUpperCase()

  const trxId =
    order.bkash?.trxID ||
    order.nagad?.manualTrxId ||
    order.bkash?.paymentID ||
    (order.amount === 0 ? "FREE-DISCOUNT-100" : "অপেক্ষমাণ")

  const items = Array.isArray(order.items) ? order.items : []

  const handlePrint = () => {
    window.print()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-0 border-border shadow-2xl">
        <style dangerouslySetInnerHTML={{
          __html: `
            @media print {
              body * {
                visibility: hidden !important;
              }
              #printable-invoice, #printable-invoice * {
                visibility: visible !important;
              }
              #printable-invoice {
                position: fixed !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                margin: 0 !important;
                padding: 24px !important;
                background: white !important;
                color: black !important;
                box-shadow: none !important;
                border: none !important;
                z-index: 999999 !important;
              }
              .no-print {
                display: none !important;
              }
            }
          `
        }} />

        <div className="p-6 md:p-8 space-y-6 bg-card text-card-foreground" id="printable-invoice">
          {/* Header with Branding */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-lg border border-primary/20">
                  <GraduationCap className="size-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground tracking-tight">
                    {SiteConfig.site.name}
                  </h2>
                  <p className="text-xs text-muted-foreground font-medium">
                    {SiteConfig.site.tagline}
                  </p>
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right space-y-0.5 text-xs text-muted-foreground">
              <div className="flex items-center sm:justify-end gap-1.5">
                <Globe className="size-3.5 text-primary" />
                <span className="font-mono">uniqueteachingmethod.com</span>
              </div>
              <div className="flex items-center sm:justify-end gap-1.5">
                <Mail className="size-3.5 text-primary" />
                <span>support@uniqueteachingmethod.com</span>
              </div>
              <div className="flex items-center sm:justify-end gap-1.5">
                <Phone className="size-3.5 text-primary" />
                <span>+880 1832-840909</span>
              </div>
            </div>
          </div>

          {/* Invoice Meta Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-muted/40 border text-xs">
            <div>
              <p className="text-muted-foreground font-medium">ইনভয়েস নম্বর</p>
              <p className="font-mono font-bold text-foreground text-sm mt-0.5">
                {invoiceNumber}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium">তারিখ</p>
              <p className="font-semibold text-foreground text-sm mt-0.5">
                {formattedDateEn}
              </p>
              <p className="text-[10px] text-muted-foreground">({formattedDateBn})</p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium">পেমেন্ট মেথড</p>
              <p className="font-semibold text-foreground text-sm mt-0.5">
                {paymentMethodLabel}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground font-medium">স্ট্যাটাস</p>
              <div className="mt-1">
                {isPaid && (
                  <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                    <CheckCircle2 className="size-3 mr-1" />
                    পরিশোধিত (Paid)
                  </Badge>
                )}
                {isPending && (
                  <Badge variant="outline" className="border-amber-500 text-amber-600 font-semibold">
                    <Clock className="size-3 mr-1" />
                    অপেক্ষমাণ (Pending)
                  </Badge>
                )}
                {isFailed && (
                  <Badge variant="destructive" className="font-semibold">
                    <AlertCircle className="size-3 mr-1" />
                    ব্যর্থ (Failed)
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Student & Trx Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-lg border bg-background/50 space-y-1">
              <p className="font-semibold text-foreground text-xs uppercase tracking-wider text-muted-foreground">
                শিক্ষার্থীর তথ্য (Bill To)
              </p>
              <p className="font-bold text-sm text-foreground">{customerName}</p>
              <p className="text-muted-foreground">{customerEmail}</p>
              <p className="text-muted-foreground">মোবাইল: {customerPhone}</p>
            </div>

            <div className="p-3.5 rounded-lg border bg-background/50 space-y-1">
              <p className="font-semibold text-foreground text-xs uppercase tracking-wider text-muted-foreground">
                লেনদেন সংক্রান্ত তথ্য (Transaction Details)
              </p>
              <p className="text-muted-foreground">
                ট্রানজেকশন আইডি:{" "}
                <span className="font-mono font-bold text-foreground select-all">
                  {trxId}
                </span>
              </p>
              <p className="text-muted-foreground">
                অর্ডার আইডি: <span className="font-mono">{order.id}</span>
              </p>
              <p className="text-muted-foreground">
                কোর্স এনরোলমেন্ট:{" "}
                <span className="font-semibold text-foreground">
                  {isPaid ? "সক্রিয় (Active)" : isPending ? "যাচাই চলছে (Reviewing)" : "নিষ্ক্রিয়"}
                </span>
              </p>
            </div>
          </div>

          {/* Purchased Items Table & Watermark */}
          <div className="relative overflow-hidden rounded-xl border">
            {/* PAID Stamp Watermark */}
            {isPaid && (
              <div
                className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-10 select-none"
                aria-hidden="true"
              >
                <div className="border-8 border-emerald-600 text-emerald-600 font-black text-6xl tracking-widest px-8 py-3 rounded-2xl rotate-[-15deg] uppercase">
                  PAID
                </div>
              </div>
            )}

            <table className="w-full text-left text-xs">
              <thead className="bg-muted/70 border-b text-muted-foreground font-semibold">
                <tr>
                  <th className="py-2.5 px-3">বিবরণ / কোর্স</th>
                  <th className="py-2.5 px-3 text-center">পরিমাণ</th>
                  <th className="py-2.5 px-3 text-right">মূল্য (৳)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {items.length > 0 ? (
                  items.map((item, idx) => {
                    const productObj =
                      typeof item.product === "object" && item.product !== null
                        ? item.product
                        : null
                    const title =
                      productObj?.title ||
                      productObj?.name ||
                      productObj?.courseName ||
                      "কোর্স এনরোলমেন্ট"
                    const unitPrice =
                      Number(productObj?.priceInBDT) ||
                      Number(productObj?.price) ||
                      (items.length === 1 ? order.amount : 0)
                    const qty = item.quantity || 1

                    return (
                      <tr key={idx} className="hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-3">
                          <p className="font-semibold text-foreground text-sm">{title}</p>
                          <p className="text-[11px] text-muted-foreground">
                            লাইফটাইম ক্লাসরুম ও ভিডিও অ্যাক্সেস
                          </p>
                        </td>
                        <td className="py-3 px-3 text-center font-medium">{qty}</td>
                        <td className="py-3 px-3 text-right font-mono font-semibold text-sm">
                          ৳{(unitPrice * qty).toLocaleString("en-US")}
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-foreground">কোর্স এনরোলমেন্ট</p>
                      <p className="text-[11px] text-muted-foreground">
                        লাইফটাইম ক্লাসরুম অ্যাক্সেস
                      </p>
                    </td>
                    <td className="py-3 px-3 text-center font-medium">১</td>
                    <td className="py-3 px-3 text-right font-mono font-semibold">
                      ৳{Number(order.amount || 0).toLocaleString("en-US")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Total Footer */}
            <div className="p-4 bg-muted/40 border-t space-y-1.5 text-xs">
              <div className="flex justify-between font-bold text-sm text-foreground pt-1">
                <span>সর্বমোট পরিশোধিত অর্থ:</span>
                <span className="text-primary font-mono text-base">
                  ৳{Number(order.amount || 0).toLocaleString("en-US")}
                </span>
              </div>
            </div>
          </div>

          {/* Footer note & Verification */}
          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[11px] text-muted-foreground border-t">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-emerald-600 shrink-0" />
              <span>এটি কম্পিউটার জেনারেটেড ডিজিটাল ইনভয়েস। কোনো ম্যানুয়াল স্বাক্ষরের প্রয়োজন নেই।</span>
            </div>
            <span className="font-mono text-[10px]">UTM Security Verified</span>
          </div>
        </div>

        {/* Modal Action Buttons (Hidden on Print) */}
        <DialogFooter className="no-print p-4 bg-muted/30 border-t flex flex-row items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="cursor-pointer"
          >
            <X className="size-4 mr-1.5" />
            বন্ধ করুন
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handlePrint}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold cursor-pointer shadow-sm"
          >
            <Printer className="size-4 mr-1.5" />
            প্রিন্ট / রসিদ ডাউনলোড
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default InvoiceReceiptModal

