import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { getServerSession } from '@delmaredigital/payload-better-auth'
import { extractCleanId } from '@/utils/extractId'

// shortcut: aggregate sales and remaining target by period and course
export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const session = await getServerSession(payload, req.headers)

    // Security: Only admins can view sales analytics
    if (!session?.user?.id || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const period = searchParams.get('period') || 'all' // 'monthly' | 'yearly' | 'all'
    const targetPerCourse = Math.max(1, Number(searchParams.get('target')) || 500)

    const now = new Date()
    const currentYear = Number(searchParams.get('year')) || now.getFullYear()
    const currentMonth = Number(searchParams.get('month')) || now.getMonth() + 1 // 1-indexed

    // 1. Fetch all courses (products)
    const coursesRes = await payload.find({
      collection: 'products',
      limit: 200,
      depth: 0,
      overrideAccess: true,
    })

    // 2. Build course map
    const courseStatsMap = new Map<
      string,
      {
        id: string
        title: string
        slug: string
        price: number
        soldUnits: number
        revenue: number
      }
    >()

    for (const c of coursesRes.docs) {
      const cid = extractCleanId(c.id)
      const price = typeof (c as any).priceInBDT === 'number'
        ? (c as any).priceInBDT
        : typeof (c as any).price === 'number'
        ? (c as any).price
        : 0

      courseStatsMap.set(cid, {
        id: cid,
        title: (c as any).title || 'Untitled Course',
        slug: (c as any).slug || '',
        price,
        soldUnits: 0,
        revenue: 0,
      })
    }

    // 3. Fetch paid orders
    const ordersRes = await payload.find({
      collection: 'orders',
      where: {
        paymentStatus: { equals: 'paid' },
      },
      limit: 5000,
      depth: 0,
      overrideAccess: true,
    })

    // 4. Filter orders by date period
    const filteredOrders = ordersRes.docs.filter((order: any) => {
      const orderDate = new Date(order.createdAt || order.updatedAt)
      if (isNaN(orderDate.getTime())) return true

      if (period === 'monthly') {
        return (
          orderDate.getFullYear() === currentYear &&
          orderDate.getMonth() + 1 === currentMonth
        )
      } else if (period === 'yearly') {
        return orderDate.getFullYear() === currentYear
      }
      return true
    })

    // 5. Aggregate item sales per course
    for (const order of filteredOrders) {
      const items = Array.isArray(order.items) ? order.items : []
      for (const item of items) {
        const pid = extractCleanId(item.product)
        const qty = Math.max(1, Number(item.quantity) || 1)
        const stat = courseStatsMap.get(pid)
        if (stat) {
          stat.soldUnits += qty
          stat.revenue += stat.price * qty
        }
      }
    }

    // 6. Calculate targets and breakdown
    let totalSoldUnits = 0
    let totalRevenue = 0

    const courseBreakdown = Array.from(courseStatsMap.values())
      .map((stat) => {
        totalSoldUnits += stat.soldUnits
        totalRevenue += stat.revenue

        const targetUnits = targetPerCourse
        const remainingTarget = Math.max(0, targetUnits - stat.soldUnits)
        const targetPercent = Math.min(100, Math.round((stat.soldUnits / targetUnits) * 100))

        return {
          id: stat.id,
          title: stat.title,
          slug: stat.slug,
          price: stat.price,
          soldUnits: stat.soldUnits,
          targetUnits,
          remainingTarget,
          targetPercent,
          revenue: stat.revenue,
          isTargetAchieved: stat.soldUnits >= targetUnits,
        }
      })
      .sort((a, b) => b.soldUnits - a.soldUnits)

    const totalCourses = courseBreakdown.length
    const totalTargetUnits = totalCourses * targetPerCourse
    const totalRemainingTarget = Math.max(0, totalTargetUnits - totalSoldUnits)
    const overallTargetPercent = totalTargetUnits > 0
      ? Math.min(100, Math.round((totalSoldUnits / totalTargetUnits) * 100))
      : 0

    return NextResponse.json({
      success: true,
      period,
      year: currentYear,
      month: currentMonth,
      targetPerCourse,
      summary: {
        totalCourses,
        totalSoldUnits,
        totalTargetUnits,
        totalRemainingTarget,
        totalRevenue,
        overallTargetPercent,
      },
      courses: courseBreakdown,
    })
  } catch (err: any) {
    console.error('Error fetching sales analytics:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}

