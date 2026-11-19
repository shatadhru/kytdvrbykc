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

    // Verify user email in database before allowing checkout
    const dbUser = await payload.findByID({
      collection: "users",
      id: session.user.id,
      depth: 0,
    })

    if (!dbUser || !dbUser.emailVerified) {
      return NextResponse.json(
        { error: "কোর্স কেনার পূর্বে আপনার ইমেইল ভেরিফাই করা আবশ্যক। অনুগ্রহ করে আপনার ইমেইল ভেরিফাই করুন।" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { items, manualTrxId, senderNumber, customerInfo, shippingAddress, cartID, couponCode } = body

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

    // Check if user is already enrolled in any of these courses (Requirements 5 & 6)
    const existingEnrollments = await payload.find({
      collection: "enrollments" as any,
      where: {
        and: [
          { student: { equals: session.user.id } },
          { course: { in: productIds } },
          { status: { equals: "active" } },
        ],
      },
      limit: 10,
      depth: 1,
    })

    if (existingEnrollments.docs.length > 0) {
      const alreadyEnrolledCourse = existingEnrollments.docs[0].course as any
      const courseTitle = alreadyEnrolledCourse?.title || "এই"
      return NextResponse.json(
        {
          error: `আপনি ইতিমধ্যে '${courseTitle}' কোর্সে ভর্তি আছেন। একই কোর্স পুনরায় কেনার প্রয়োজন নেই।`,
        },
        { status: 400 }
      )
    }

    // Check for duplicate course items in cart (Requirements 5 & 7)
    const seenPids = new Set<string>()
    for (const item of items) {
      const pid = String(
        typeof item.product === "object" && item.product !== null
          ? item.product.id
          : item.product
      )
      if (seenPids.has(pid)) {
        return NextResponse.json(
          { error: "একই কোর্স একাধিকবার কেনার সুযোগ নেই।" },
          { status: 400 }
        )
      }
      seenPids.add(pid)
    }

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

    // Apply Coupon Discount if provided
    let discountAmount = 0
    if (couponCode && typeof couponCode === 'string') {
      const cleanCode = couponCode.trim().toUpperCase()
      const couponRes = await payload.find({
        collection: 'coupons',
        where: { code: { equals: cleanCode }, active: { equals: true } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      })

      if (couponRes.docs.length > 0) {
        const c = couponRes.docs[0] as any
        const isNotExpired = !c.expiresAt || new Date(c.expiresAt).getTime() >= Date.now()
        const hasUsesLeft = !c.maxUses || (c.usageCount || 0) < c.maxUses
        if (isNotExpired && hasUsesLeft) {
          if (c.type === 'percentage') {
            discountAmount = Math.round((calculatedTotal * (Number(c.value) || 0)) / 100)
            if (c.maxDiscountAmount && discountAmount > c.maxDiscountAmount) {
              discountAmount = c.maxDiscountAmount
            }
          } else if (c.type === 'fixed') {
            discountAmount = Math.min(calculatedTotal, Number(c.value) || 0)
          }
        }
      }
    }

    const finalPayableTotal = Math.max(0, calculatedTotal - discountAmount)

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
        amount: finalPayableTotal,
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

    // 4. Clear user's active cart on server
    if (session.user.id) {
      try {
        const activeCarts = await payload.find({
          collection: "carts",
          where: {
            customer: { equals: session.user.id },
          },
          limit: 1,
        })
        if (activeCarts.docs.length > 0) {
          await payload.update({
            collection: "carts",
            id: activeCarts.docs[0].id,
            data: {
              items: [],
              subtotal: 0,
              status: "purchased",
              purchasedAt: new Date().toISOString(),
            },
          })
        }
      } catch (cartErr) {
        console.warn("Could not clear server cart on Nagad checkout:", cartErr)
      }
    }

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

