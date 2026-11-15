import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

/**
 * Validates the API key from request headers:
 * - `x-api-key: <key>`
 * - `Authorization: Bearer <key>`
 *
 * Uses constant-time comparison to prevent timing/side-channel attacks.
 */
export function validateApiKey(req: NextRequest): { authorized: boolean; error?: string } {
  const configuredKey = process.env.LMS_API_KEY || process.env.ADMIN_API_KEY

  if (!configuredKey) {
    return {
      authorized: false,
      error: 'Server misconfiguration: LMS_API_KEY or ADMIN_API_KEY is not defined in environment variables.',
    }
  }

  // 1. Check x-api-key header
  let providedKey = req.headers.get('x-api-key')?.trim()

  // 2. Check Authorization header: Bearer <key>
  if (!providedKey) {
    const authHeader = req.headers.get('authorization')?.trim()
    if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
      providedKey = authHeader.slice(7).trim()
    }
  }

  if (!providedKey) {
    return {
      authorized: false,
      error: 'Missing API Key. Provide it via "x-api-key" header or "Authorization: Bearer <token>".',
    }
  }

  // 3. Constant-time comparison using crypto.timingSafeEqual
  const targetBuffer = Buffer.from(configuredKey, 'utf8')
  const providedBuffer = Buffer.from(providedKey, 'utf8')

  if (targetBuffer.length !== providedBuffer.length) {
    return { authorized: false, error: 'Invalid API Key.' }
  }

  const isMatch = crypto.timingSafeEqual(targetBuffer, providedBuffer)
  if (!isMatch) {
    return { authorized: false, error: 'Invalid API Key.' }
  }

  return { authorized: true }
}

/**
 * Higher-order guard for Next.js Route Handlers.
 */
export function requireApiKey(
  handler: (req: NextRequest, context: any) => Promise<NextResponse>,
) {
  return async (req: NextRequest, context: any) => {
    const auth = validateApiKey(req)
    if (!auth.authorized) {
      return NextResponse.json(
        {
          success: false,
          error: auth.error,
        },
        { status: 401 },
      )
    }
    return handler(req, context)
  }
}

