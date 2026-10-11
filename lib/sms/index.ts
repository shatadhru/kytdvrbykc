import cache from '@/payload/lib/cache'

export interface SendSmsParams {
  to: string
  msg: string
  apiKey?: string
  schedule?: string
  senderId?: string
  dedupTtlSeconds?: number // Prevents sending same message to same number (default: 60s)
}

export async function sendSms({
  to,
  msg,
  schedule,
  senderId,
  apiKey = process.env.SMS_NET_BD_API_KEY,
  dedupTtlSeconds = 60,
}: SendSmsParams) {
  if (!apiKey) {
    throw new Error('SMS API key is missing. Set SMS_NET_BD_API_KEY in your env or pass apiKey.')
  }

  const cleanTo = to.trim()
  const cleanMsg = msg.trim()
  const dedupKey = `sms:dedup:${cleanTo}:${cleanMsg}`

  if (dedupTtlSeconds > 0) {
    if (await cache.has(dedupKey)) {
      throw new Error('Duplicate SMS: Exactly the same message was already sent recently. Please wait a moment.')
    }
    // Temporary 10s lock during dispatch to block double-click races
    await cache.set(dedupKey, true, 10)
  }

  const formData = new FormData()
  formData.append('api_key', apiKey)
  formData.append('to', to)
  formData.append('msg', msg)
  if (schedule) formData.append('schedule', schedule)
  if (senderId) formData.append('sender_id', senderId)

  try {
    const res = await fetch('https://api.sms.net.bd/sendsms', {
      method: 'POST',
      body: formData,
    })

    if (!res.ok) {
      throw new Error(`SMS request failed with status ${res.status}: ${res.statusText}`)
    }

    const data = await res.json()
    if (data.error !== 0) {
      throw new Error(data.msg || `SMS error code ${data.error}`)
    }

    if (dedupTtlSeconds > 0) {
      await cache.set(dedupKey, true, dedupTtlSeconds)
    }

    return data
  } catch (err) {
    if (dedupTtlSeconds > 0) {
      await cache.del(dedupKey)
    }
    throw err
  }
}
