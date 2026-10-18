import { NextRequest, NextResponse } from "next/server"
import { getPayload } from "payload"
import config from "@payload-config"
import { executeBkashPayment } from "@/payload/lib/bkash/client"
import { createEnrollmentsForOrder } from "@/utils/enrollment"

async function handleBkashCallback(req: NextRequest) {
  const url = new URL(req.url)
  const searchParams = url.searchParams

  let paymentID = searchParams.get("paymentID")
  let status = searchParams.get("status")

  // Fallback for POST callbacks
  if ((!paymentID || !status) && req.method === "POST") {
    try {
      const body = await req.json()
      paymentID = paymentID || body?.paymentID
      status = status || body?.status
    } catch {
      // Ignore JSON parse error if body is empty or form-encoded
    }
  }

  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || url.origin).replace(/\/+$/, '')
  // If appUrl points to localhost, ensure it uses http:// (never https:// which causes ERR_SSL_PROTOCOL_ERROR)
  const safeOrigin = appUrl.includes('localhost') || appUrl.includes('127.0.0.1')
    ? appUrl.replace(/^https:\/\//, 'http://')
    : appUrl

  if (!paymentID) {
    return NextResponse.redirect(`${safeOrigin}/checkout?error=missing_payment_id`)
  }

  try {
    const payload = await getPayload({ config })

    // Find the associated order
    const orderRes = await payload.find({
      collection: "orders",
      where: {
        "bkash.paymentID": {
          equals: paymentID,
        },
      },
      limit: 1,
    })

    if (!orderRes.docs || orderRes.docs.length === 0) {
      console.error(`[bKash Callback] Order not found for paymentID: ${paymentID}`)
      return NextResponse.redirect(`${safeOrigin}/checkout?error=order_not_found`)
    }

    const order = orderRes.docs[0]

    // 1. Handle user cancellation or gateway failure
    if (status !== "success") {
      await payload.update({
        collection: "orders",
        id: order.id,
        data: {
          paymentStatus: "failed",
        },
      })
      return NextResponse.redirect(
        `${safeOrigin}/checkout?error=payment_${status || "cancelled"}&orderId=${order.id}`
      )
    }

    // 2. Idempotency & Replay Attack Defense
    // If order was already confirmed and marked paid, redirect directly without re-executing
    if (order.paymentStatus === "paid") {
      return NextResponse.redirect(
        `${safeOrigin}/checkout/success?orderId=${order.id}&method=bkash`
      )
    }

    // 3. Server-to-Server Execution
    const executeRes = await executeBkashPayment(paymentID)

    const isSuccessfulPayment =
      executeRes.success &&
      (executeRes.transactionStatus === "Completed" ||
        executeRes.statusCode === "0000" ||
        executeRes.statusCode === "2029" ||
        executeRes.statusCode === "2062")

    if (!isSuccessfulPayment) {
      await payload.update({
        collection: "orders",
        id: order.id,
        data: {
          paymentStatus: "failed",
        },
      })

      const reason = executeRes.statusMessage || "verification_failed"
      return NextResponse.redirect(
        `${safeOrigin}/checkout?error=${encodeURIComponent(reason)}&orderId=${order.id}`
      )
    }

    // 4. Strict Amount Verification
    const executedAmount = Number(
      executeRes.payment?.amount || (executeRes as any).amount || 0
    )
    const expectedAmount = Number(order.amount || 0)

    if (Math.abs(executedAmount - expectedAmount) > 0.5) {
      console.error(
        `[bKash Security Alert] Amount mismatch! Order amount: ${expectedAmount}, Executed: ${executedAmount}`
      )
      await payload.update({
        collection: "orders",
        id: order.id,
        data: {
          paymentStatus: "failed",
        },
      })
      return NextResponse.redirect(
        `${safeOrigin}/checkout?error=amount_mismatch&orderId=${order.id}`
      )
    }

    // 5. Update Order to Paid & Completed Atomically
    const trxID = executeRes.trxID || executeRes.payment?.trxID || ""
    const updatedOrder = await payload.update({
      collection: "orders",
      id: order.id,
      data: {
        paymentStatus: "paid",
        status: "completed",
        bkash: {
          paymentID,
          trxID,
        },
      },
    })

    // 6. Create enrollment records in dedicated enrollments collection
    await createEnrollmentsForOrder(payload, updatedOrder)

    // 7. Clear user's server-side active cart
    if (order.customer) {
      try {
        const customerId =
          typeof order.customer === "object" ? order.customer.id : order.customer
        const activeCarts = await payload.find({
          collection: "carts",
          where: {
            customer: {
              equals: customerId,
            },
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
        console.warn("[bKash Callback] Could not clear server cart:", cartErr)
      }
    }

    return NextResponse.redirect(
      `${safeOrigin}/checkout/success?orderId=${order.id}&method=bkash`
    )
  } catch (error: any) {
    const errorDetails = error?.cause?.message || error?.message || "Internal error"
    console.error("[bKash Callback] Error processing execution:", error, error?.cause)
    return NextResponse.redirect(
      `${safeOrigin}/checkout?error=server_error&details=${encodeURIComponent(errorDetails)}`
    )
  }
}

export async function GET(req: NextRequest) {
  return handleBkashCallback(req)
}

export async function POST(req: NextRequest) {
  return handleBkashCallback(req)
}

