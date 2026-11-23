'use server'

import { headers } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getServerSession } from '@delmaredigital/payload-better-auth'
import { sendSms } from '../../lib/sms'

export async function sendSmsAction(formData: FormData) {
  const headerList = await headers()
  const payload = await getPayload({ config })
  const session = await getServerSession(payload, headerList)

  if (!session?.user?.id || (session.user as any).role !== 'admin') {
    return { success: false, error: 'অননুমোদিত: এসএমএস পাঠানোর জন্য অ্যাডমিন লগইন আবশ্যক।' }
  }

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
