import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { extractCleanId } from '@/utils/extractId'

// shortcut: basic coupon validation against Payload CMS coupons collection
export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const body = await req.json()
    const rawCode = typeof body.code === 'string' ? body.code.trim().toUpperCase() : ''
    const cartTotal = Number(body.cartTotal) || 0
    const productIds: string[] = Array.isArray(body.productIds)
      ? body.productIds.map(extractCleanId).filter(Boolean)
      : []

    if (!rawCode) {
      return NextResponse.json(
        { valid: false, error: 'অনুগ্রহ করে একটি কুপন কোড লিখুন।' },
        { status: 400 }
      )
    }

    // 1. Find coupon by code
    const res = await payload.find({
      collection: 'coupons',
      where: {
        code: { equals: rawCode },
      },
      limit: 1,
      depth: 1,
      overrideAccess: true,
    })

    const coupon = res.docs[0] as any
    if (!coupon) {
      return NextResponse.json(
        { valid: false, error: 'কুপন কোডটি সঠিক নয়।' },
        { status: 404 }
      )
    }

    // 2. Check if active
    if (coupon.active === false) {
      return NextResponse.json(
        { valid: false, error: 'এই কুপন কোডটি বর্তমানে নিষ্ক্রিয় রয়েছে।' },
        { status: 400 }
      )
    }

    // 3. Check expiration
    if (coupon.expiresAt) {
      const expiry = new Date(coupon.expiresAt).getTime()
      if (Date.now() > expiry) {
        return NextResponse.json(
          { valid: false, error: 'কুপনটির মেয়াদ উত্তীর্ণ হয়ে গেছে।' },
          { status: 400 }
        )
      }
    }

    // 4. Check max uses
    const maxUses = Number(coupon.maxUses) || 0
    const usageCount = Number(coupon.usageCount) || 0
    if (maxUses > 0 && usageCount >= maxUses) {
      return NextResponse.json(
        { valid: false, error: 'কুপন ব্যবহারের সর্বোচ্চ সীমা শেষ হয়ে গেছে।' },
        { status: 400 }
      )
    }

    // 5. Check minimum order amount
    const minAmount = Number(coupon.minOrderAmount) || 0
    if (minAmount > 0 && cartTotal < minAmount) {
      return NextResponse.json(
        {
          valid: false,
          error: `এই কুপনটি ব্যবহারের জন্য সর্বনিম্ন ৳${minAmount} এর কোর্স অর্ডার করতে হবে।`,
        },
        { status: 400 }
      )
    }

    // 6. Check applicable products (if restricted)
    const applicable = Array.isArray(coupon.applicableProducts) ? coupon.applicableProducts : []
    if (applicable.length > 0) {
      const allowedIds = new Set(applicable.map(extractCleanId))
      const hasMatchingProduct = productIds.some((pid) => allowedIds.has(pid))
      if (!hasMatchingProduct) {
        return NextResponse.json(
          { valid: false, error: 'এই কুপনটি আপনার নির্বাচিত কোর্সের জন্য প্রযোজ্য নয়।' },
          { status: 400 }
        )
      }
    }

    // 7. Calculate Discount
    const discountType = coupon.type || 'percentage'
    const discountVal = Number(coupon.value) || 0
    let discountAmount = 0

    if (discountType === 'percentage') {
      discountAmount = Math.round((cartTotal * discountVal) / 100)
      const maxDiscount = Number(coupon.maxDiscountAmount) || 0
      if (maxDiscount > 0 && discountAmount > maxDiscount) {
        discountAmount = maxDiscount
      }
    } else if (discountType === 'fixed') {
      discountAmount = Math.min(cartTotal, discountVal)
    }

    discountAmount = Math.min(cartTotal, Math.max(0, discountAmount))
    const newTotal = Math.max(0, cartTotal - discountAmount)

    return NextResponse.json({
      valid: true,
      code: coupon.code,
      type: discountType,
      value: discountVal,
      discountAmount,
      newTotal,
      message: `অভিনন্দন! কুপন প্রয়োগ সফল হয়েছে (৳${discountAmount} ছাড়)।`,
    })
  } catch (err: any) {
    console.error('Error validating coupon:', err)
    return NextResponse.json(
      { valid: false, error: 'কুপন যাচাই করতে সমস্যা হয়েছে।' },
      { status: 500 }
    )
  }
}

