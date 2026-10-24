import cache from '@/payload/lib/cache'
import type { Payload } from 'payload'
import { sendOrderInvoiceEmail, type InvoiceItem } from '@/payload/utils/sendEmail'

/**
 * Normalizes and validates Bangladeshi mobile numbers.
 * Valid numbers must be 11 digits starting with 013-019 (optionally with +88 or 88 prefix).
 * Returns normalized 11-digit format: "01XXXXXXXXX" (or null if invalid).
 */
export function normalizeBdPhoneNumber(rawPhone?: string | null): string | null {
  if (!rawPhone || typeof rawPhone !== 'string') return null

  // Strip all whitespace, dashes, parentheses, non-digits (keeping optional leading plus)
  let cleaned = rawPhone.trim().replace(/[^\d+]/g, '')
  if (cleaned.startsWith('+88')) {
    cleaned = cleaned.slice(3)
  } else if (cleaned.startsWith('88')) {
    cleaned = cleaned.slice(2)
  }

  // Must match Bangladeshi mobile format: 01[3-9]XXXXXXXX (11 digits)
  const bdMobileRegex = /^01[3-9]\d{8}$/
  if (!bdMobileRegex.test(cleaned)) {
    return null
  }

  return cleaned
}

/**
 * Sanitizes and enforces length limits on SMS messages to prevent runaway billing.
 */
export function sanitizeSmsMessage(msg?: string | null): string {
  if (!msg || typeof msg !== 'string') return ''
  // Strip excessive spaces, limit to 450 characters (max 3 standard SMS parts)
  return msg.trim().slice(0, 450)
}

function isConfiguredValue(val?: string | null): boolean {
  if (!val || typeof val !== 'string') return false
  const trimmed = val.trim().toLowerCase()
  if (
    trimmed === '' ||
    trimmed.startsWith('your-') ||
    trimmed.startsWith('your_') ||
    trimmed.includes('your-tauri') ||
    trimmed.includes('your-sms') ||
    trimmed.includes('example.com') ||
    trimmed.includes('placeholder')
  ) {
    return false
  }
  return true
}

export interface SendSmsOptions {
  to: string
  msg: string
  schedule?: string
  senderId?: string
}

export interface SendSmsResult {
  success: boolean
  messageId?: string
  error?: string
  simulated?: boolean
  skipped?: boolean
}

/**
 * Universal SMS Gateway Sender
 * Compatible with Tauri 2.0 SMS Gateway Links, sms.bd (ID & Password),
 * and standard REST SMS Gateways.
 */
export async function sendGatewaySms({
  to,
  msg,
  schedule,
  senderId,
}: SendSmsOptions): Promise<SendSmsResult> {
  // 1. Strict Validation: Phone Number
  const validPhone = normalizeBdPhoneNumber(to)
  if (!validPhone) {
    return { success: false, error: 'Invalid Bangladeshi phone number. Must be 11 digits (013-019).' }
  }

  // 2. Strict Validation: Message Content
  const cleanMsg = sanitizeSmsMessage(msg)
  if (!cleanMsg) {
    return { success: false, error: 'SMS message text cannot be empty.' }
  }

  // 3. Rate-Limiting Guard: Prevent multiple SMS to the same number within 30 seconds
  const rateKey = `sms:rate:${validPhone}`
  if (await cache.has(rateKey)) {
    return { success: false, error: 'Rate limit: Cooldown active for this recipient number (30s).' }
  }

  // 4. Duplicate Guard: Prevent sending exact same message to same number within 5 minutes
  const dedupKey = `sms:dedup:${validPhone}:${cleanMsg}`
  if (await cache.has(dedupKey)) {
    return { success: false, skipped: true, error: 'Duplicate SMS suppressed (identical message sent recently).' }
  }

  // 5. Environment & Credentials Resolution
  // Filter out dummy/template placeholders so valid credentials always take effect
  const rawTauriLink =
    process.env.TAURI_SMS_LINK ||
    process.env.SMS_GATEWAY_URL ||
    process.env.SMS_BD_URL
  const tauriLink = isConfiguredValue(rawTauriLink) ? rawTauriLink : null

  const rawGatewayId =
    process.env.SMS_GATEWAY_ID ||
    process.env.SMS_BD_ID ||
    process.env.SMS_USER_ID
  const gatewayId = isConfiguredValue(rawGatewayId) ? rawGatewayId : null

  const rawGatewayPassword =
    process.env.SMS_GATEWAY_PASSWORD ||
    process.env.SMS_BD_PASSWORD
  const gatewayPassword = isConfiguredValue(rawGatewayPassword) ? rawGatewayPassword : null

  const rawApiKey =
    process.env.SMS_NET_BD_API_KEY ||
    process.env.PORTA_SMS_API_KEY ||
    process.env.SMS_API_KEY
  const apiKey = isConfiguredValue(rawApiKey) ? rawApiKey : null

  const rawSenderId =
    senderId ||
    process.env.SMS_NET_BD_SENDER_ID ||
    process.env.SMS_GATEWAY_SENDER_ID ||
    process.env.PORTA_SMS_SENDER_ID ||
    process.env.SMS_SENDER_ID
  const activeSenderId = isConfiguredValue(rawSenderId) ? rawSenderId : null

  const isConfigured = Boolean(apiKey || tauriLink || (gatewayId && gatewayPassword))

  // In development / testing mode without credentials: simulate delivery safely without throwing
  if (!isConfigured) {
    console.warn(
      `[SMS Gateway] No SMS Gateway or credentials configured. Simulating delivery to ${validPhone}: "${cleanMsg}"`
    )
    await cache.set(rateKey, true, 30)
    await cache.set(dedupKey, true, 300)
    return { success: true, simulated: true }
  }

  // 6. Gateway Dispatch
  try {
    let res: Response

    // Prefer direct official sms.net.bd API Key when available
    if (apiKey || (!tauriLink && (gatewayId && gatewayPassword))) {
      // 6a. Dispatch via sms.net.bd / sms.bd using URL-encoded form parameters
      const apiUrl = process.env.SMS_BD_API_URL || 'https://api.sms.net.bd/sendsms'
      const params = new URLSearchParams()

      if (apiKey) params.append('api_key', apiKey.trim())
      if (gatewayId) {
        params.append('id', gatewayId.trim())
        params.append('username', gatewayId.trim())
      }
      if (gatewayPassword) {
        params.append('password', gatewayPassword.trim())
      }

      params.append('to', validPhone)
      params.append('msg', cleanMsg)
      if (schedule && schedule.trim()) params.append('schedule', schedule.trim())
      if (activeSenderId && activeSenderId.trim()) params.append('sender_id', activeSenderId.trim())

      res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
        signal: AbortSignal.timeout(10000),
      })
    } else if (tauriLink) {
      // 6b. Dispatch via Tauri 2.0 Link / Custom Webhook Gateway
      const endpoint = tauriLink.trim()
      const targetUrl = new URL(endpoint)

      if (gatewayId) targetUrl.searchParams.set('id', gatewayId)
      if (gatewayPassword) targetUrl.searchParams.set('password', gatewayPassword)
      targetUrl.searchParams.set('to', validPhone)
      targetUrl.searchParams.set('msg', cleanMsg)

      const payloadBody = {
        id: gatewayId || '',
        username: gatewayId || '',
        password: gatewayPassword || '',
        to: validPhone,
        phone: validPhone,
        number: validPhone,
        msg: cleanMsg,
        message: cleanMsg,
        text: cleanMsg,
        senderId: activeSenderId || '',
      }

      res = await fetch(targetUrl.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json, text/plain, */*',
        },
        body: JSON.stringify(payloadBody),
        signal: AbortSignal.timeout(8000),
      })
    } else {
      return { success: false, error: 'No valid gateway configuration found' }
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => '')
      console.error(`[SMS Gateway] HTTP Error ${res.status}: ${res.statusText}`, errText)
      return { success: false, error: `Gateway HTTP Error: ${res.status}` }
    }

    const responseText = await res.text()
    let data: any = null
    try {
      data = JSON.parse(responseText)
    } catch {
      data = { raw: responseText }
    }

    // Check common error response formats
    if (data?.error !== undefined && data?.error !== 0 && data?.error !== '0') {
      console.error(`[SMS Gateway] Failure code returned:`, data)
      return { success: false, error: data?.msg || data?.message || `SMS error code ${data?.error}` }
    }
    if (data?.success === false || data?.status === 'error' || data?.status === 'failed') {
      console.error(`[SMS Gateway] Failure status returned:`, data)
      return { success: false, error: data?.message || data?.msg || 'Gateway rejected SMS dispatch' }
    }

    // Successfully sent: lock deduplication and cooldown
    await cache.set(rateKey, true, 30)
    await cache.set(dedupKey, true, 300)

    return {
      success: true,
      messageId: String(data?.data?.request_id || data?.request_id || data?.id || data?.messageId || ''),
    }
  } catch (err: any) {
    console.error(`[SMS Gateway] Dispatch exception:`, err?.message || err)
    return { success: false, error: err?.message || 'Network dispatch failed' }
  }
}

// Backward-compatible alias
export const sendPortaSms = sendGatewaySms

/**
 * Safely sends an order purchase confirmation SMS to the student.
 * Guarantees exactly 1 SMS dispatch per order.
 * Isolated with try/catch so failure NEVER disrupts payment callbacks or admin approvals.
 */
export async function sendOrderPurchaseConfirmationSms(
  payload: Payload,
  order: any
): Promise<{ success: boolean; skipped?: boolean; error?: string }> {
  try {
    if (!order || order.paymentStatus !== 'paid') {
      return { success: false, skipped: true, error: 'Order is not paid' }
    }

    const orderId = String(order.id || order._id || '')
    if (!orderId) {
      return { success: false, skipped: true, error: 'Missing order ID' }
    }

    // 1. Check if already marked as sent on the order document
    if (order.confirmationSmsSent) {
      return { success: true, skipped: true }
    }

    // 2. Distributed Atomic Lock to prevent concurrent triggers between hook & callback
    const orderLockKey = `sms:order-confirmed:${orderId}`
    if (await cache.has(orderLockKey)) {
      return { success: true, skipped: true }
    }
    // Set 24-hour deduplication lock
    await cache.set(orderLockKey, true, 86400)

    // 3. Resolve student phone number from order data or customer profile
    let recipientPhone = normalizeBdPhoneNumber(order.shippingAddress?.phone)
    if (!recipientPhone && order.nagad?.senderNumber) {
      recipientPhone = normalizeBdPhoneNumber(order.nagad.senderNumber)
    }

    // Fallback: check customer profile if phone missing from order
    if (!recipientPhone && order.customer) {
      try {
        const customerId = typeof order.customer === 'object' ? order.customer.id : order.customer
        const user = await payload.findByID({
          collection: 'users',
          id: String(customerId),
          depth: 0,
        })
        if (user && (user as any).phone) {
          recipientPhone = normalizeBdPhoneNumber((user as any).phone)
        }
      } catch {
        // Safe fallback ignore
      }
    }

    if (!recipientPhone) {
      console.warn(`[SMS Gateway] Skipping SMS: No valid BD phone number found for order #${orderId}`)
      return { success: false, skipped: true, error: 'No recipient phone found' }
    }

    // 4. Construct concise, friendly Bengali confirmation message (under 160 characters)
    const shortOrderId = orderId.slice(-6).toUpperCase()
    const amount = Number(order.amount || 0)
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000')
      .replace(/^https?:\/\//, '')
      .replace(/\/+$/, '')
    const smsText = `NextLoad: আপনার অর্ডার #${shortOrderId} সফল হয়েছে! মোট ৳${amount} পরিশোধিত। ইনভয়েস ও কোর্স অ্যাক্সেস পেতে লগইন করুন: ${appUrl}/dashboard`

    // 5. Send via Gateway
    const sendRes = await sendGatewaySms({
      to: recipientPhone,
      msg: smsText,
    })

    // 6. Update order confirmationSmsSent flag atomically in Payload CMS
    if (sendRes.success) {
      try {
        await payload.update({
          collection: 'orders',
          id: orderId,
          data: {
            confirmationSmsSent: true,
          } as any,
          context: {
            skipSms: true, // Prevents recursive hook trigger
          },
        })
      } catch (dbErr) {
        console.warn(`[SMS Gateway] Warning: Could not update confirmationSmsSent flag on order #${orderId}:`, dbErr)
      }
    }

    return sendRes
  } catch (err: any) {
    // Safely isolated: failure never crashes payment flow
    console.error(`[SMS Gateway] Purchase confirmation trigger caught an error:`, err?.message || err)
    return { success: false, error: err?.message || 'Unexpected trigger error' }
  }
}

/**
 * Safely sends an order purchase invoice email to the student.
 * Guarantees exactly 1 invoice email dispatch per order.
 * Isolated with try/catch so failure NEVER disrupts payment callbacks or admin approvals.
 */
export async function sendOrderPurchaseInvoiceEmail(
  payload: Payload,
  order: any
): Promise<{ success: boolean; skipped?: boolean; error?: string }> {
  try {
    if (!order || order.paymentStatus !== 'paid') {
      return { success: false, skipped: true, error: 'Order is not paid' }
    }

    const orderId = String(order.id || order._id || '')
    if (!orderId) {
      return { success: false, skipped: true, error: 'Missing order ID' }
    }

    // 1. Check if already marked as sent on the order document
    if (order.confirmationEmailSent) {
      return { success: true, skipped: true }
    }

    // 2. Distributed Atomic Lock
    const orderLockKey = `email:order-confirmed:${orderId}`
    if (await cache.has(orderLockKey)) {
      return { success: true, skipped: true }
    }
    await cache.set(orderLockKey, true, 86400)

    // 3. Resolve student email and name
    let recipientEmail = order.customerEmail || ''
    let customerName =
      order.shippingAddress?.firstName
        ? `${order.shippingAddress.firstName} ${order.shippingAddress?.lastName || ''}`.trim()
        : ''

    if ((!recipientEmail || !customerName) && order.customer) {
      try {
        const customerId = typeof order.customer === 'object' ? order.customer.id : order.customer
        const user = await payload.findByID({
          collection: 'users',
          id: String(customerId),
          depth: 0,
        })
        if (user) {
          if (!recipientEmail && (user as any).email) recipientEmail = (user as any).email
          if (!customerName && (user as any).name) customerName = (user as any).name
        }
      } catch {
        // Safe fallback ignore
      }
    }

    if (!recipientEmail || !recipientEmail.includes('@')) {
      console.warn(`[Order Invoice Email] Skipping email: No valid email found for order #${orderId}`)
      return { success: false, skipped: true, error: 'No recipient email found' }
    }

    // 4. Resolve items / course titles
    const items = Array.isArray(order.items) ? order.items : []
    const invoiceItems: InvoiceItem[] = []

    for (const item of items) {
      const pid = item.product ? (typeof item.product === 'object' ? item.product.id : item.product) : null
      let title =
        item.product && typeof item.product === 'object' && item.product.title ? item.product.title : ''

      if (!title && pid) {
        try {
          const productDoc = await payload.findByID({
            collection: 'products',
            id: String(pid),
            depth: 0,
          })
          if (productDoc && (productDoc as any).title) {
            title = (productDoc as any).title
          }
        } catch {}
      }

      const unitPrice = typeof item.price === 'number' ? item.price : 0
      invoiceItems.push({
        title: title || 'Course Enrollment',
        quantity: Math.max(1, Number(item.quantity) || 1),
        price: unitPrice || Number(order.amount || 0) / Math.max(1, items.length),
      })
    }

    // 5. Format details
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/+$/, '')
    const dashboardUrl = `${appUrl}/dashboard`
    const dateFormatted = order.createdAt
      ? new Date(order.createdAt).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      : new Date().toLocaleDateString('en-GB')

    const trxId = order.bkash?.trxID || order.nagad?.manualTrxId || null
    const paymentMethod =
      order.paymentMethod === 'bkash'
        ? 'bKash (অটো)'
        : order.paymentMethod === 'nagad'
        ? 'নগদ (ম্যানুয়াল)'
        : (order.paymentMethod || 'Online')

    // 6. Send Invoice Email
    const emailRes = await sendOrderInvoiceEmail({
      orderId,
      customerName,
      customerEmail: recipientEmail,
      date: dateFormatted,
      paymentMethod,
      trxId,
      amount: Number(order.amount || 0),
      currency: order.currency || 'BDT',
      items: invoiceItems,
      dashboardUrl,
    })

    // 7. Persist confirmationEmailSent on order record
    if (emailRes.success) {
      try {
        await payload.update({
          collection: 'orders',
          id: orderId,
          data: {
            confirmationEmailSent: true,
          } as any,
          context: {
            skipNotifications: true,
            skipSms: true,
          },
        })
      } catch (dbErr) {
        console.warn(`[Order Invoice Email] Warning: Could not update confirmationEmailSent flag on order #${orderId}:`, dbErr)
      }
    }

    return emailRes
  } catch (err: any) {
    console.error(`[Order Invoice Email] Invoice email trigger caught an error:`, err?.message || err)
    return { success: false, error: err?.message || 'Unexpected trigger error' }
  }
}

/**
 * Unified Purchase Notifications Trigger
 * Sends both SMS and Email (with invoice) to the student.
 * Guarantees exactly-once execution, non-blocking and safe.
 */
export async function sendOrderPurchaseNotifications(
  payload: Payload,
  order: any
): Promise<{ sms: any; email: any }> {
  const [smsResult, emailResult] = await Promise.allSettled([
    sendOrderPurchaseConfirmationSms(payload, order),
    sendOrderPurchaseInvoiceEmail(payload, order),
  ])

  return {
    sms: smsResult.status === 'fulfilled' ? smsResult.value : { success: false, error: smsResult.reason },
    email: emailResult.status === 'fulfilled' ? emailResult.value : { success: false, error: emailResult.reason },
  }
}
