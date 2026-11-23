import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { extractCloudinarySecureUrl } from '@/utils/cloudinary'

export const dynamic = 'force-dynamic'

const DEFAULT_SLIDES = [
  {
    id: 'default-1',
    title: 'UTM Math Cover',
    imageUrl: 'https://res.cloudinary.com/dccbp4dpb/image/upload/v1789276947/UTM-math-cover-1536x864_tplfis.webp',
    link: '/video',
  },
  {
    id: 'default-2',
    title: 'SSC 27 Chemistry',
    imageUrl: 'https://res.cloudinary.com/dccbp4dpb/image/upload/v1774289665/SSC-27-%E0%A6%AC%E0%A7%87%E0%A6%B8%E0%A6%BF%E0%A6%95-%E0%A6%9F%E0%A7%81-%E0%A6%AA%E0%A7%8D%E0%A6%B0%E0%A6%BF%E0%A6%AE%E0%A6%BF%E0%A6%AF%E0%A6%BC%E0%A6%BE%E0%A6%AE-%E0%A6%95%E0%A7%8B%E0%A6%B0%E0%A7%8D%E0%A6%B8-chemistry_kykgak.webp',
    link: '/video',
  },
  {
    id: 'default-3',
    title: 'SSC 28 Physics',
    imageUrl: 'https://res.cloudinary.com/dccbp4dpb/image/upload/v1774289665/SSC-28-%E0%A6%AC%E0%A7%87%E0%A6%B8%E0%A6%BF%E0%A6%95-%E0%A6%9F%E0%A7%81-%E0%A6%AA%E0%A7%8D%E0%A6%B0%E0%A6%BF%E0%A6%AE%E0%A6%BF%E0%A6%AF%E0%A6%BC%E0%A6%BE%E0%A6%AE-%E0%A6%95%E0%A7%8B%E0%A6%B0%E0%A7%8D%E0%A6%B8-Physics_dm48n5.webp',
    link: '/video',
  },
  {
    id: 'default-4',
    title: 'UTM Academic Special',
    imageUrl: 'https://res.cloudinary.com/dccbp4dpb/image/upload/v1789276888/b3690e0c-ab10-4385-9652-dbf2808d401d.png',
    link: '/video',
  },
  {
    id: 'default-5',
    title: 'SSC 28 Higher Math',
    imageUrl: 'https://res.cloudinary.com/dccbp4dpb/image/upload/v1789276983/SSC-28-%E0%A6%AC%E0%A7%87%E0%A6%B8%E0%A6%BF%E0%A6%95-%E0%A6%9F%E0%A7%81-%E0%A6%AA%E0%A7%8D%E0%A6%B0%E0%A6%BF%E0%A6%AE%E0%A6%BF%E0%A6%AF%E0%A6%BC%E0%A6%BE%E0%A6%AE-%E0%A6%95%E0%A7%8B%E0%A6%B0%E0%A7%8D%E0%A6%B8-hmath-1536x864_kawxh5.webp',
    link: '/video',
  },
]

export async function GET() {
  try {
    const payload = await getPayload({ config })
    const slidesRes = await payload.find({
      collection: 'hero-slides' as any,
      where: {
        isActive: { equals: true },
      },
      sort: 'order',
      depth: 1,
      limit: 20,
      overrideAccess: true,
    })

    if (slidesRes.docs && slidesRes.docs.length > 0) {
      const slides = slidesRes.docs.map((doc: any) => {
        let imageUrl = doc.imageUrl || ''
        if (!imageUrl && doc.image) {
          imageUrl = extractCloudinarySecureUrl(doc.image) || (typeof doc.image === 'object' ? doc.image.url : '') || ''
        }
        return {
          id: String(doc.id),
          title: doc.title || 'Slide',
          imageUrl: imageUrl || DEFAULT_SLIDES[0].imageUrl,
          link: doc.link || '/video',
        }
      })

      return NextResponse.json({ success: true, slides })
    }

    return NextResponse.json({ success: true, slides: DEFAULT_SLIDES })
  } catch (err: any) {
    console.warn('GET /api/hero-slides fallback to default:', err?.message)
    return NextResponse.json({ success: true, slides: DEFAULT_SLIDES })
  }
}
