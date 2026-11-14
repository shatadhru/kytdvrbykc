import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getServerSession } from '@delmaredigital/payload-better-auth'
import { runFullDataSync } from '../../../../scripts/sync-all-lms-data'

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const session = await getServerSession(payload, req.headers)

    // Security: Only admins can trigger full LMS sync
    if (!session?.user?.id || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 403 })
    }

    const result = await runFullDataSync(payload)
    return NextResponse.json(result)
  } catch (err: any) {
    console.error('Error in admin data sync endpoint:', err)
    return NextResponse.json({ error: err.message || 'Sync failed.' }, { status: 500 })
  }
}
