'use server'

import { sendSms } from '../../lib/sms'

export async function sendSmsAction(formData: FormData) {
  const to = formData.get('to')?.toString().trim()
  const msg = formData.get('msg')?.toString().trim()

  if (!to || !msg) {
    return { success: false, error: 'Phone number and message are required.' }
  }

  try {
    const data = await sendSms({ to, msg })
    return { success: true, data }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to send SMS.'
    return { success: false, error: message }
  }
}
