import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getServerSession } from '@delmaredigital/payload-better-auth'
import { validateApiKey } from '@/lib/apiKeyAuth'
import { runFullDataSync } from '../../../../scripts/sync-all-lms-data'

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })

    // 1. Check API Key first
    const apiKeyAuth = validateApiKey(req)
    let isAuthorized = apiKeyAuth.authorized

    // 2. If no valid API Key, check admin session
    if (!isAuthorized) {
      const session = await getServerSession(payload, req.headers)
      if (session?.user?.id && (session.user as any).role === 'admin') {
        isAuthorized = true
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized: Valid LMS_API_KEY (via x-api-key or Bearer token) or Admin login session required.',
        },
        { status: 401 },
      )
    }

    const result = await runFullDataSync(payload)
    return NextResponse.json(result)
  } catch (err: any) {
    console.error('Error in admin data sync endpoint:', err)
    return NextResponse.json(
      { success: false, error: err?.message || 'Sync failed.' },
      { status: 500 },
    )
  }
}
