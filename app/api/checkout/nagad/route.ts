import { NextRequest, NextResponse } from "next/server"
import { getPayload } from "payload"
import config from "@payload-config"
import { getServerSession } from "@delmaredigital/payload-better-auth"

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const session = await getServerSession(payload, req.headers)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "চেকআউট সম্পন্ন করতে প্রথমে আপনার একাউন্টে লগইন করুন।" },
        { status: 401 }
      )
    }

    const body = await req.json()
    const { items, manualTrxId, senderNumber, customerInfo, shippingAddress, cartID } = body

    // 1. Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "আপনার কার্ট খালি। কোর্স যুক্ত করার পর চেকআউট করুন।" },
        { status: 400 }
      )
    }

    if (!manualTrxId || typeof manualTrxId !== "string" || manualTrxId.trim().length < 4) {
      return NextResponse.json(
        { error: "সঠিক নগদ ট্রানজেকশন আইডি (TrxID) প্রদান করুন।" },
        { status: 400 }
      )
    }

    const cleanSender = (senderNumber || "").replace(/[^0-9]/g, "")
    if (!cleanSender || cleanSender.length < 11) {
      return NextResponse.json(
        { error: "সঠিক ১১ ডিজিটের নগদ প্রেরক নম্বর প্রদান করুন।" },
        { status: 400 }
      )
    }

    // 2. Server-side price calculation
    const productIds = items
      .map((item: any) =>
        typeof item.product === "object" && item.product !== null
          ? item.product.id
          : item.product
      )
      .filter(Boolean)

    const productsRes = await payload.find({
      collection: "products",
      where: {
        id: {
          in: productIds,
        },
      },
      limit: 100,
      depth: 0,
    })

    const productMap = new Map(productsRes.docs.map((p) => [String(p.id), p]))

    let calculatedTotal = 0
    const orderItems: Array<{ product: string; quantity: number }> = []

    for (const item of items) {
      const pid = String(
        typeof item.product === "object" && item.product !== null
          ? item.product.id
          : item.product
      )
      const dbProduct = productMap.get(pid)
      if (!dbProduct) {
        return NextResponse.json(
          { error: "নির্বাচিত কোর্সটি পাওয়া যায়নি।" },
          { status: 404 }
        )
      }

      const unitPrice =
        typeof (dbProduct as any).priceInBDT === "number"
          ? (dbProduct as any).priceInBDT
          : typeof (dbProduct as any).price === "number"
          ? (dbProduct as any).price
          : 0

      const quantity = Math.max(1, Number(item.quantity) || 1)
      calculatedTotal += unitPrice * quantity

      orderItems.push({
        product: pid,
        quantity,
      })
    }

    const customerEmail = (session.user.email || customerInfo?.email || "").trim().toLowerCase()
    const customerName = customerInfo?.firstName || session.user.name || "Student"

    // 3. Create Order with paymentStatus: 'pending' for Admin Verification
    const order = await payload.create({
      collection: "orders",
      data: {
        customer: session.user.id,
        customerEmail,
        paymentMethod: "nagad",
        paymentStatus: "pending",
        status: "processing",
        amount: calculatedTotal,
        currency: "BDT",
        items: orderItems,
        nagad: {
          manualTrxId: manualTrxId.trim().toUpperCase(),
          senderNumber: cleanSender.slice(-11),
        },
        shippingAddress: {
          title: shippingAddress?.title || "Digital Course Enrollment",
          firstName: customerName,
          lastName: customerInfo?.lastName || "",
          company: "",
          phone: cleanSender,
          addressLine1: shippingAddress?.addressLine1 || "Online LMS Delivery",
          addressLine2: shippingAddress?.addressLine2 || "",
          city: shippingAddress?.city || "Dhaka",
          state: shippingAddress?.state || "",
          postalCode: shippingAddress?.postalCode || "1200",
          country: shippingAddress?.country || "BD",
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: "আপনার নগদ পেমেন্ট রিকোয়েস্ট সফলভাবে জমা হয়েছে। অ্যাডমিন যাচাইয়ের পর কোর্সটি সক্রিয় করা হবে।",
      orderID: order.id,
    })
  } catch (err: any) {
    console.error("POST /api/checkout/nagad error:", err)
    return NextResponse.json(
      { error: err?.message || "নগদ পেমেন্ট রিকোয়েস্ট প্রক্রিয়াকরণে ত্রুটি হয়েছে।" },
      { status: 500 }
    )
  }
}

