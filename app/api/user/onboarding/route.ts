import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getServerSession } from '@delmaredigital/payload-better-auth'
import { normalizeBdPhoneNumber } from '@/payload/lib/sms/portaSms'

export const dynamic = 'force-dynamic'

/**
 * GET /api/user/onboarding
 * Checks if the currently authenticated student has completed the required onboarding fields:
 * - Mobile Number (phone)
 * - SSC Batch (sscBatch)
 * - HSC Batch (hscBatch)
 */
export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const session = await getServerSession(payload, req.headers)

    if (!session?.user?.id) {
      return NextResponse.json({ authenticated: false, isCompleted: true })
    }

    const userDoc: any = await payload.findByID({
      collection: 'users',
      id: session.user.id,
      depth: 0,
    })

    if (!userDoc) {
      return NextResponse.json({ authenticated: false, isCompleted: true })
    }

    const hasPhone = Boolean(userDoc.phone && String(userDoc.phone).trim())
    const hasSscBatch = Boolean(userDoc.sscBatch && String(userDoc.sscBatch).trim())
    const hasHscBatch = Boolean(userDoc.hscBatch && String(userDoc.hscBatch).trim())
    const isCompleted = hasPhone && hasSscBatch && hasHscBatch

    return NextResponse.json({
      authenticated: true,
      isCompleted,
      profile: {
        phone: userDoc.phone || '',
        sscBatch: userDoc.sscBatch || '',
        hscBatch: userDoc.hscBatch || '',
        name: userDoc.name || '',
      },
    })
  } catch (err: any) {
    console.error('Error checking user onboarding status:', err)
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 })
  }
}

/**
 * POST /api/user/onboarding
 * Updates the required onboarding profile fields for the authenticated student.
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const session = await getServerSession(payload, req.headers)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized. Please login.' }, { status: 401 })
    }

    const body = await req.json()
    const { phone, sscBatch, hscBatch } = body

    // 1. Validate Phone Number (Bangladeshi 11 digits: 013-019)
    const validPhone = normalizeBdPhoneNumber(phone)
    if (!validPhone) {
      return NextResponse.json(
        { error: 'সঠিক বাংলাদেশি ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 017XXXXXXXX)।' },
        { status: 400 },
      )
    }

    // 2. Validate SSC Batch
    const cleanSsc = typeof sscBatch === 'string' ? sscBatch.trim() : String(sscBatch || '').trim()
    if (!cleanSsc) {
      return NextResponse.json({ error: 'এসএসসি ব্যাচ নির্বাচন বা উল্লেখ করুন।' }, { status: 400 })
    }

    // 3. Validate HSC Batch
    const cleanHsc = typeof hscBatch === 'string' ? hscBatch.trim() : String(hscBatch || '').trim()
    if (!cleanHsc) {
      return NextResponse.json({ error: 'এইচএসসি ব্যাচ নির্বাচন বা উল্লেখ করুন।' }, { status: 400 })
    }

    // 4. Update the User profile in Payload CMS
    const updatedUser: any = await (payload as any).update({
      collection: 'users',
      id: session.user.id,
      data: {
        phone: validPhone,
        sscBatch: cleanSsc,
        hscBatch: cleanHsc,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'তথ্য সফলভাবে সংরক্ষিত হয়েছে।',
      user: {
        id: updatedUser?.id || session.user.id,
        phone: updatedUser?.phone || validPhone,
        sscBatch: updatedUser?.sscBatch || cleanSsc,
        hscBatch: updatedUser?.hscBatch || cleanHsc,
      },
    })
  } catch (err: any) {
    console.error('Error saving user onboarding data:', err)
    return NextResponse.json(
      { error: err?.message || 'তথ্য সংরক্ষণ করতে ব্যর্থ হয়েছে।' },
      { status: 500 },
    )
  }
}
