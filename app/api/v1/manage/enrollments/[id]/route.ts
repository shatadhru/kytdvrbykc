import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { requireApiKey } from '@/lib/apiKeyAuth'

// GET /api/v1/manage/enrollments/[id]
export const GET = requireApiKey(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params
    const payload = await getPayload({ config })

    const enrollment = await payload.findByID({
      collection: 'enrollments' as any,
      id,
      depth: 2,
      overrideAccess: true,
    })

    if (!enrollment) {
      return NextResponse.json({ success: false, error: 'Enrollment not found.' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      enrollment,
    })
  } catch (error: any) {
    console.error('API Error [GET /api/v1/manage/enrollments/[id]]:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch enrollment.' },
      { status: 500 },
    )
  }
})

// PUT / PATCH /api/v1/manage/enrollments/[id]
export const PUT = requireApiKey(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params
    const payload = await getPayload({ config })

    const existing = await payload.findByID({
      collection: 'enrollments' as any,
      id,
      overrideAccess: true,
    })

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Enrollment not found.' }, { status: 404 })
    }

    const body = await req.json()
    const updateData: any = {}

    if (body.status !== undefined) {
      if (!['active', 'suspended', 'revoked'].includes(body.status)) {
        return NextResponse.json(
          { success: false, error: 'Invalid status. Allowed values: active, suspended, revoked.' },
          { status: 400 },
        )
      }
      updateData.status = body.status
    }

    if (body.completedLessons !== undefined && Array.isArray(body.completedLessons)) {
      updateData.completedLessons = body.completedLessons
    }

    const updated = await payload.update({
      collection: 'enrollments' as any,
      id,
      data: updateData,
      overrideAccess: true,
    })

    return NextResponse.json({
      success: true,
      message: 'Enrollment updated successfully.',
      enrollment: updated,
    })
  } catch (error: any) {
    console.error('API Error [PUT /api/v1/manage/enrollments/[id]]:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update enrollment.' },
      { status: 500 },
    )
  }
})

export const PATCH = PUT

// DELETE /api/v1/manage/enrollments/[id]
export const DELETE = requireApiKey(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params
    const payload = await getPayload({ config })

    const existing = await payload.findByID({
      collection: 'enrollments' as any,
      id,
      overrideAccess: true,
    })

    if (!existing) {
      return NextResponse.json({ success: false, error: 'Enrollment not found.' }, { status: 404 })
    }

    await payload.delete({
      collection: 'enrollments' as any,
      id,
      overrideAccess: true,
    })

    return NextResponse.json({
      success: true,
      message: `Enrollment (ID: ${id}) deleted successfully.`,
    })
  } catch (error: any) {
    console.error('API Error [DELETE /api/v1/manage/enrollments/[id]]:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to delete enrollment.' },
      { status: 500 },
    )
  }
})

