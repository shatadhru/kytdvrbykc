import { NextRequest, NextResponse } from "next/server"
import { getPayload } from "payload"
import config from "@payload-config"
import { getServerSession } from "@delmaredigital/payload-better-auth"

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const session = await getServerSession(payload, req.headers)

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "অর্ডার তালিকা দেখতে প্রথমে লগইন করুন।" },
        { status: 401 }
      )
    }

    const userConditions: any[] = [{ customer: { equals: session.user.id } }]
    if (session.user.email) {
      userConditions.push({
        customerEmail: { equals: session.user.email.toLowerCase().trim() },
      })
    }

    const ordersRes = await payload.find({
      collection: "orders",
      where: {
        or: userConditions,
      },
      sort: "-createdAt",
      limit: 100,
      depth: 2,
      overrideAccess: true, // Allow user to fetch their own orders securely filtered
    })

    return NextResponse.json({
      success: true,
      orders: ordersRes.docs,
    })
  } catch (err: any) {
    console.error("GET /api/user/orders error:", err)
    return NextResponse.json(
      { error: err?.message || "অর্ডার তালিকা লোড করতে ব্যর্থ হয়েছে।" },
      { status: 500 }
    )
  }
}

