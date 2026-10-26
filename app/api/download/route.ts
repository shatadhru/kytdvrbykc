import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

export const dynamic = 'force-dynamic'

function extractGoogleResource(url: string): { type: 'drive' | 'docs' | 'slides'; id: string } | null {
  const docsMatch = url.match(/docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/)
  if (docsMatch) return { type: 'docs', id: docsMatch[1] }

  const slidesMatch = url.match(/docs\.google\.com\/presentation\/d\/([a-zA-Z0-9_-]+)/)
  if (slidesMatch) return { type: 'slides', id: slidesMatch[1] }

  const driveMatch =
    url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/) ||
    url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/) ||
    url.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  if (driveMatch) return { type: 'drive', id: driveMatch[1] }

  return null
}

function getSignedCloudinaryUrl(rawUrl: string): string | null {
  const match = rawUrl.match(
    /res\.cloudinary\.com\/([^/]+)\/(image|raw|video)\/upload\/(?:s--[^/]+--\/)?(?:v(\d+)\/)?(.+)$/,
  )
  if (!match) return null

  const [, cloudName, resType, version, publicPath] = match
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY
  const configuredCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || cloudName

  if (!apiSecret) return null

  try {
    cloudinary.config({
      cloud_name: configuredCloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    })

    // Clean public path in case fl_attachment or other flags were already present
    const cleanPublicPath = publicPath.replace(/^fl_attachment(?::[^/]+)?\//, '')

    return cloudinary.url(cleanPublicPath, {
      sign_url: true,
      resource_type: resType,
      secure: true,
      version: version || undefined,
      flags: 'attachment',
    })
  } catch (err) {
    console.warn('Failed to sign Cloudinary URL:', err)
    return null
  }
}

function sanitizeAsciiFilename(name: string): string {
  const cleaned = name.replace(/[^\w.-]/g, '_').replace(/_+/g, '_')
  return cleaned.length > 0 ? cleaned : 'material'
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const rawUrl = searchParams.get('url')
    const customName = (searchParams.get('name') || 'download').trim()

    if (!rawUrl) {
      return NextResponse.json({ error: 'Missing file URL' }, { status: 400 })
    }

    // 1. Google Drive / Docs / Slides direct export
    const googleRes = extractGoogleResource(rawUrl)
    if (googleRes) {
      if (googleRes.type === 'slides') {
        return NextResponse.redirect(`https://docs.google.com/presentation/d/${googleRes.id}/export/pdf`)
      }
      if (googleRes.type === 'docs') {
        return NextResponse.redirect(`https://docs.google.com/document/d/${googleRes.id}/export?format=pdf`)
      }
      return NextResponse.redirect(`https://drive.google.com/uc?export=download&id=${googleRes.id}`)
    }

    // 2. Cloudinary Signed & Private URL Resolution
    let targetUrl = rawUrl
    const isCloudinary = targetUrl.includes('res.cloudinary.com')
    if (isCloudinary) {
      const signedUrl = getSignedCloudinaryUrl(targetUrl)
      if (signedUrl) {
        targetUrl = signedUrl
      }
    }

    // 3. Resolve relative or local URL to absolute
    if (targetUrl.startsWith('/')) {
      targetUrl = `${req.nextUrl.origin}${targetUrl}`
    }

    // 4. Server-Side Fetch & Stream (prevents direct browser redirect to 401 pages)
    let response: Response | null = null
    try {
      response = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) LMS-Downloader/1.0',
        },
      })
    } catch {
      response = null
    }

    // 5. If Cloudinary returns 401 (restricted PDF/ZIP), provide clear instructions
    if (!response || !response.ok) {
      if (isCloudinary && response?.status === 401) {
        return new NextResponse(
          `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="utf-8" />
  <title>Cloudinary PDF Restriction</title>
  <style>
    body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #0f172a; color: #f8fafc; }
    .card { max-width: 540px; padding: 2rem; background: #1e293b; border-radius: 1rem; border: 1px solid #334155; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
    h2 { color: #f97316; margin-top: 0; }
    p { color: #94a3b8; font-size: 0.95rem; line-height: 1.6; text-align: left; }
    ol { color: #cbd5e1; text-align: left; font-size: 0.9rem; line-height: 1.7; padding-left: 1.25rem; }
    a.btn { display: inline-block; margin-top: 1.5rem; padding: 0.65rem 1.25rem; background: #3b82f6; color: #fff; text-decoration: none; border-radius: 0.5rem; font-weight: 600; }
  </style>
</head>
<body>
  <div class="card">
    <h2>⚠️ Cloudinary PDF Security Restriction (401)</h2>
    <p>Cloudinary নতুন একাউন্টে ডিফল্টভাবে PDF ফাইল সরাসরি ডাউনলোডের অনুমতি অফ রাখে (Security Restriction)। এটি ১ ক্লিকে চালু করে নিলেই সকল লেকচার নোট ও স্লাইড ডাউনলোড শুরু হয়ে যাবে:</p>
    <ol>
      <li><b>Cloudinary Console</b> (console.cloudinary.com)-এ লগইন করুন।</li>
      <li>নিচের বামে থাকা <b>Settings (⚙️)</b> আইকনে ক্লিক করুন।</li>
      <li><b>Security</b> ট্যাবে যান।</li>
      <li>স্ক্রোল করে <b>"PDF and ZIP files delivery"</b> অপশনটি আনচেক / Enable করুন।</li>
      <li>নিচে <b>Save</b> বাটনে ক্লিক করুন।</li>
    </ol>
    <a href="https://console.cloudinary.com/settings/security" target="_blank" rel="noopener noreferrer" class="btn">Cloudinary Settings এ যান &rarr;</a>
  </div>
</body>
</html>`,
          {
            status: 403,
            headers: { 'Content-Type': 'text/html; charset=utf-8' },
          },
        )
      }

      return NextResponse.redirect(targetUrl)
    }

    const contentType = response.headers.get('content-type') || 'application/octet-stream'

    // Determine filename extension if missing
    let finalFilename = customName
    if (!finalFilename.includes('.')) {
      if (contentType.includes('pdf')) finalFilename += '.pdf'
      else if (contentType.includes('presentation') || contentType.includes('powerpoint')) finalFilename += '.pptx'
      else if (contentType.includes('word') || contentType.includes('document')) finalFilename += '.docx'
      else if (contentType.includes('zip')) finalFilename += '.zip'
    }

    const asciiName = sanitizeAsciiFilename(finalFilename)
    const encodedUtf8Name = encodeURIComponent(finalFilename)

    return new NextResponse(response.body, {
      headers: {
        'Content-Disposition': `attachment; filename="${asciiName}"; filename*=UTF-8''${encodedUtf8Name}`,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    })
  } catch (error) {
    console.error('Download proxy error:', error)
    const rawUrl = req.nextUrl.searchParams.get('url')
    if (rawUrl && (rawUrl.startsWith('http://') || rawUrl.startsWith('https://'))) {
      return NextResponse.redirect(rawUrl)
    }
    return NextResponse.json({ error: 'Failed to download file.' }, { status: 500 })
  }
}
