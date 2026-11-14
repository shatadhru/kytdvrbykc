import 'dotenv/config'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { getPayload } from 'payload'
import config from '../payload/payload.config.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_DIR = path.resolve(__dirname, '../data')

export async function seedCoupons(payloadInstance?: any) {
  console.log('🏷️ Seeding Coupons from data/coupons.json...')
  const payload = payloadInstance || (await getPayload({ config }))

  const rawCoupons = JSON.parse(
    fs.readFileSync(path.join(DATA_DIR, 'coupons.json'), 'utf8')
  )

  let created = 0
  let existing = 0

  for (const c of rawCoupons) {
    const code = String(c.code).trim().toUpperCase()
    const isPercent = c.discount_type === 'percent'
    const value = parseFloat(c.amount) || 0
    const expiresAt = c.date_expires ? new Date(c.date_expires).toISOString() : undefined

    const found = await payload.find({
      collection: 'coupons',
      where: { code: { equals: code } },
      limit: 1,
    })

    if (found.docs.length > 0) {
      existing++
      continue
    }

    await payload.create({
      collection: 'coupons',
      data: {
        code,
        type: isPercent ? 'percentage' : 'fixed',
        value,
        active: true,
        expiresAt,
        maxUses: c.usage_limit ? Number(c.usage_limit) : 0,
        usageCount: c.usage_count ? Number(c.usage_count) : 0,
      } as any,
    })
    created++
  }

  console.log(`✅ Coupons seeded: ${created} created, ${existing} already existed.`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seedCoupons()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Error seeding coupons:', err)
      process.exit(1)
    })
}

