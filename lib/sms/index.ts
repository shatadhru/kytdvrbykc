import { sendGatewaySms, type SendSmsOptions } from '@/payload/lib/sms/portaSms'

export interface SendSmsParams {
  to: string
  msg: string
  apiKey?: string
  schedule?: string
  senderId?: string
  dedupTtlSeconds?: number
}

export async function sendSms({
  to,
  msg,
  schedule,
  senderId,
}: SendSmsParams) {
  const result = await sendGatewaySms({
    to,
    msg,
    schedule,
    senderId,
  })

  if (!result.success) {
    throw new Error(result.error || 'Failed to send SMS through gateway.')
  }

  return result
}
