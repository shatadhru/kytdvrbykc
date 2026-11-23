import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { extractCloudinarySecureUrl } from '@/utils/cloudinary'

export const dynamic = 'force-dynamic'

const DEFAULT_RESOURCES = [
  {
    id: 'default-1',
    title: 'এস এস সি - ২০২৭',
    description: 'এস এস সি ২০২৭ ব্যাচের জন্য প্রয়োজনীয় বিনামূল্যের শিক্ষাসামগ্রী।',
    category: 'এস এস সি - ২০২৭',
    type: 'video',
    url: '/video',
    imageUrl: 'https://res.cloudinary.com/doqcv0ywi/image/upload/v1789305933/ssc27_mamvtg.png',
    badge: 'বিনামূল্যে',
  },
  {
    id: 'default-2',
    title: 'এস এস সি - ২০২৮',
    description: 'এস এস সি ২০২৮ ব্যাচের প্রস্তুতির জন্য বিনামূল্যের রিসোর্স।',
    category: 'এস এস সি - ২০২৮',
    type: 'video',
    url: '/video',
    imageUrl: 'https://res.cloudinary.com/doqcv0ywi/image/upload/v1789305933/%E0%A7%81%E0%A7%81%E0%A7%A8%E0%A7%87%E0%A7%AE_o3naui.png',
    badge: 'বিনামূল্যে',
  },
  {
    id: 'default-3',
    title: 'এইচ এস সি - ২০২৭',
    description: 'এইচ এস সি ২০২৭ ব্যাচের জন্য সাজানো প্রয়োজনীয় শিক্ষাসামগ্রী।',
    category: 'এইচ এস সি - ২০২৭',
    type: 'video',
    url: '/video',
    imageUrl: 'https://res.cloudinary.com/doqcv0ywi/image/upload/v1789305933/hsc27_academic_naapzc.png',
    badge: 'বিনামূল্যে',
  },
  {
    id: 'default-4',
    title: 'এইচ এস সি - ২০২৮',
    description: 'এইচ এস সি ২০২৮ ব্যাচের প্রস্তুতির জন্য বিনামূল্যের রিসোর্স।',
    category: 'এইচ এস সি - ২০২৮',
    type: 'video',
    url: '/video',
    imageUrl: 'https://res.cloudinary.com/doqcv0ywi/image/upload/v1789306254/Untitled-1_dpemy8.png',
    badge: 'বিনামূল্যে',
  },
]

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const featuredOnly = searchParams.get('featured') === 'true'
    const category = searchParams.get('category')

    const payload = await getPayload({ config })
    const whereConditions: any[] = [{ isActive: { equals: true } }]
    if (featuredOnly) {
      whereConditions.push({ isFeatured: { equals: true } })
    }
    if (category && category !== 'all' && category !== 'সকল') {
      whereConditions.push({ category: { equals: category } })
    }

    const resourcesRes = await payload.find({
      collection: 'resources' as any,
      where: {
        and: whereConditions,
      },
      sort: 'order',
      depth: 1,
      limit: 100,
      overrideAccess: true,
    })

    if (resourcesRes.docs && resourcesRes.docs.length > 0) {
      const resources = resourcesRes.docs.map((doc: any) => {
        let imageUrl = doc.imageUrl || ''
        if (!imageUrl && doc.image) {
          imageUrl = extractCloudinarySecureUrl(doc.image) || (typeof doc.image === 'object' ? doc.image.url : '') || ''
        }
        return {
          id: String(doc.id),
          title: doc.title,
          description: doc.description || '',
          category: doc.category || 'সাধারণ',
          type: doc.type || 'video',
          url: doc.url || '/video',
          imageUrl: imageUrl || DEFAULT_RESOURCES[0].imageUrl,
          badge: doc.badge || 'বিনামূল্যে',
        }
      })
      return NextResponse.json({ success: true, resources })
    }

    return NextResponse.json({ success: true, resources: DEFAULT_RESOURCES })
  } catch (err: any) {
    console.warn('GET /api/resources fallback to default:', err?.message)
    return NextResponse.json({ success: true, resources: DEFAULT_RESOURCES })
  }
}
