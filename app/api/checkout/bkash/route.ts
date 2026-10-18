import { NextRequest, NextResponse } from "next/server"
import { getPayload } from "payload"
import config from "@payload-config"
import { getServerSession } from "@delmaredigital/payload-better-auth"
import { createBkashPayment } from "@/payload/lib/bkash/client"

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
    const { items, customerInfo, shippingAddress, cartID } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "আপনার কার্ট খালি। কোর্স যুক্ত করার পর চেকআউট করুন।" },
        { status: 400 }
      )
    }

    // 1. Secure Server-Side Price Calculation from Database
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

    if (calculatedTotal <= 0) {
      return NextResponse.json(
        { error: "বিনামূল্যের কোর্সের জন্য বিকাশ পেমেন্ট প্রযোজ্য নয়।" },
        { status: 400 }
      )
    }

    const customerEmail = (session.user.email || customerInfo?.email || "").trim().toLowerCase()
    const customerPhone = customerInfo?.phone || (session.user as any).phone || ""
    const customerName = customerInfo?.firstName || session.user.name || "Student"

    // 2. Create Pending Order in Payload CMS
    const order = await payload.create({
      collection: "orders",
      data: {
        customer: session.user.id,
        customerEmail,
        paymentMethod: "bkash",
        paymentStatus: "pending",
        status: "processing",
        amount: calculatedTotal,
        currency: "BDT",
        items: orderItems,
        shippingAddress: {
          title: shippingAddress?.title || "Digital Course Enrollment",
          firstName: customerName,
          lastName: customerInfo?.lastName || "",
          company: "",
          phone: customerPhone,
          addressLine1: shippingAddress?.addressLine1 || "Online LMS Delivery",
          addressLine2: shippingAddress?.addressLine2 || "",
          city: shippingAddress?.city || "Dhaka",
          state: shippingAddress?.state || "",
          postalCode: shippingAddress?.postalCode || "1200",
          country: shippingAddress?.country || "BD",
        },
      },
    })

    // 3. Initiate bKash Payment with Provider
    const invoiceNumber = `UTM-${order.id}`
    const bkashRes = await createBkashPayment({
      amount: calculatedTotal.toString(),
      invoiceNumber,
      payerReference: customerEmail || customerPhone || "student",
    })

    if (!bkashRes.success || !bkashRes.paymentID || !bkashRes.bkashURL) {
      await payload.update({
        collection: "orders",
        id: order.id,
        data: {
          paymentStatus: "failed",
        },
      })

      return NextResponse.json(
        { error: (bkashRes as any)?.statusMessage || "বিকাশ পেমেন্ট গেটওয়েতে সংযোগ করতে সমস্যা হচ্ছে।" },
        { status: 502 }
      )
    }

    // 4. Attach bKash Payment ID to the Order
    await payload.update({
      collection: "orders",
      id: order.id,
      data: {
        bkash: {
          paymentID: bkashRes.paymentID,
        },
      },
    })

    return NextResponse.json({
      success: true,
      orderID: order.id,
      paymentID: bkashRes.paymentID,
      bkashURL: bkashRes.bkashURL,
    })
  } catch (err: any) {
    console.error("POST /api/checkout/bkash error:", err)
    return NextResponse.json(
      { error: err?.message || "বিকাশ পেমেন্ট শুরু করতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।" },
      { status: 500 }
    )
  }
}

