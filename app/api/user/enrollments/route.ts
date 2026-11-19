import { NextRequest, NextResponse } from "next/server"
import { getPayload } from "payload"
import config from "@payload-config"
import { getServerSession } from "@delmaredigital/payload-better-auth"
import { extractCloudinarySecureUrl } from "@/utils/cloudinary"
import { createEnrollmentsForOrder } from "@/utils/enrollment"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const session = await getServerSession(payload, req.headers)

    if (!session?.user?.id) {
      return NextResponse.json({ success: true, enrollments: [] }, { status: 200 })
    }

    const userId = session.user.id

    // 1. Fetch active enrollments
    const enrollmentsRes = await payload.find({
      collection: "enrollments" as any,
      where: {
        and: [
          { student: { equals: userId } },
          { status: { equals: "active" } },
        ],
      },
      depth: 2,
      limit: 100,
      sort: "-enrolledAt",
      overrideAccess: true,
    })

    // 2. Fallback sync if user has paid orders but enrollments missing
    if (enrollmentsRes.docs.length === 0) {
      const ordersRes = await payload.find({
        collection: "orders",
        where: {
          and: [
            { customer: { equals: userId } },
            { paymentStatus: { equals: "paid" } },
          ],
        },
        depth: 2,
        limit: 50,
        overrideAccess: true,
      })

      for (const order of ordersRes.docs) {
        await createEnrollmentsForOrder(payload, order)
      }
    }

    const finalRes =
      enrollmentsRes.docs.length > 0
        ? enrollmentsRes
        : await payload.find({
            collection: "enrollments" as any,
            where: {
              and: [
                { student: { equals: userId } },
                { status: { equals: "active" } },
              ],
            },
            depth: 2,
            limit: 100,
            sort: "-enrolledAt",
            overrideAccess: true,
          })

    const coursesMap = new Map<string, any>()

    for (const enrollment of finalRes.docs as any[]) {
      const course = typeof enrollment.course === "object" && enrollment.course ? enrollment.course : null
      const courseId = course?.id || (typeof enrollment.course === "string" ? enrollment.course : null)
      if (!courseId || coursesMap.has(String(courseId))) continue

      let fullCourse = course
      if (!fullCourse || !fullCourse.title) {
        try {
          fullCourse = await payload.findByID({
            collection: "products",
            id: courseId,
            depth: 1,
            overrideAccess: true,
          })
        } catch {
          continue
        }
      }

      if (!fullCourse) continue

      const thumbObj = typeof fullCourse.thumbnail === "object" && fullCourse.thumbnail ? fullCourse.thumbnail : null
      const thumbnailUrl =
        (typeof fullCourse.thumbnail === "string" && (fullCourse.thumbnail.startsWith("http") || fullCourse.thumbnail.startsWith("/"))
          ? fullCourse.thumbnail
          : null) ||
        extractCloudinarySecureUrl(fullCourse.thumbnail) ||
        thumbObj?.url ||
        thumbObj?.externalUrl ||
        fullCourse.thumbnailUrl ||
        "/images/course-placeholder.jpg"

      const totalLessons =
        fullCourse.lessons?.length ||
        fullCourse.subjects?.reduce((acc: number, s: any) => acc + (s.lessons?.length || 0), 0) ||
        0

      coursesMap.set(String(courseId), {
        id: String(courseId),
        title: fullCourse.title || "কোর্স",
        slug: fullCourse.slug,
        thumbnailUrl,
        totalLessons,
        enrolledAt: enrollment.enrolledAt,
        progress: enrollment.progress || 0,
      })
    }

    return NextResponse.json({
      success: true,
      enrollments: Array.from(coursesMap.values()),
    })
  } catch (error: any) {
    console.error("Failed to fetch user enrollments:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch enrollments" },
      { status: 500 }
    )
  }
}
