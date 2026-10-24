import 'dotenv/config'
import { enqueueExamSubmission, enqueueNotificationBroadcast } from '../payload/lib/queue/rabbitmq'
import { sendGatewaySms } from '../payload/lib/sms/portaSms'
import { sendOrderInvoiceEmail } from '../payload/utils/sendEmail'

async function testQueue(concurrency: number = 20) {
  console.log(`\n======================================================`)
  console.log(`🚀 TESTING RABBITMQ / EXAM SUBMISSION QUEUE CONCURRENCY`)
  console.log(`   Simulating ${concurrency} simultaneous student submissions...`)
  console.log(`======================================================`)

  const start = performance.now()
  const promises = []

  for (let i = 1; i <= concurrency; i++) {
    promises.push(
      enqueueExamSubmission({
        student: `test-student-${i}`,
        studentName: `Student ${i}`,
        studentEmail: `student${i}@example.com`,
        examTitle: 'HSC রসায়ন ১ম পত্র - গুণগত রসায়ন',
        classLevel: 'HSC',
        subject: 'রসায়ন ১ম পত্র',
        chapter: 'গুণগত রসায়ন',
        totalQuestions: 25,
        attempted: 25,
        correctAnswers: 22,
        incorrectAnswers: 3,
        score: 22,
        percentage: 88,
        timeTakenSeconds: 900,
        passed: true,
        answers: [],
      })
    )
  }

  const results = await Promise.all(promises)
  const duration = (performance.now() - start).toFixed(2)

  const rabbitCount = results.filter((r) => r.provider === 'rabbitmq').length
  const fallbackCount = results.filter((r) => r.provider === 'memory-fallback').length

  console.log(`\n✅ Completed ${concurrency} submissions in ${duration}ms! (Avg ${(Number(duration) / concurrency).toFixed(2)}ms per submission)`)
  console.log(`   - Enqueued via RabbitMQ broker: ${rabbitCount}`)
  console.log(`   - Enqueued via In-Memory queue: ${fallbackCount}`)
  console.log(`======================================================\n`)
}

function formatStatus(val?: string | null): string {
  if (!val) return 'Not set ❌'
  const trimmed = val.trim().toLowerCase()
  if (
    trimmed === '' ||
    trimmed.startsWith('your-') ||
    trimmed.startsWith('your_') ||
    trimmed.includes('your-tauri') ||
    trimmed.includes('your-sms') ||
    trimmed.includes('example.com') ||
    trimmed.includes('placeholder')
  ) {
    return 'Template Placeholder (Ignored) ⚠️'
  }
  return 'Configured ✅'
}

async function testSms(targetPhone: string) {
  console.log(`\n======================================================`)
  console.log(`📱 TESTING SMS GATEWAY INTEGRATION`)
  console.log(`   Target Phone: ${targetPhone}`)
  console.log(`   Config status:`)
  console.log(`   - SMS_NET_BD_API_KEY: ${formatStatus(process.env.SMS_NET_BD_API_KEY)}`)
  console.log(`   - TAURI_SMS_LINK: ${formatStatus(process.env.TAURI_SMS_LINK)}`)
  console.log(`   - SMS_GATEWAY_ID: ${formatStatus(process.env.SMS_GATEWAY_ID || process.env.SMS_BD_ID)}`)
  console.log(`   - SMS_GATEWAY_PASSWORD: ${formatStatus(process.env.SMS_GATEWAY_PASSWORD || process.env.SMS_BD_PASSWORD)}`)
  console.log(`======================================================`)

  const testMsg = `Test SMS from NextLoad LMS at ${new Date().toLocaleTimeString('en-US')}`
  const res = await sendGatewaySms({
    to: targetPhone,
    msg: testMsg,
  })

  console.log('Result:', JSON.stringify(res, null, 2))
  console.log(`======================================================\n`)
}

async function testEmail(targetEmail: string) {
  console.log(`\n======================================================`)
  console.log(`📧 TESTING PURCHASE INVOICE EMAIL INTEGRATION`)
  console.log(`   Target Email: ${targetEmail}`)
  console.log(`   SMTP Config:`)
  console.log(`   - SMTP_HOST: ${process.env.SMTP_HOST || 'Not set (using default)'}`)
  console.log(`   - SMTP_PORT: ${process.env.SMTP_PORT || '587'}`)
  console.log(`   - SMTP_USER: ${process.env.SMTP_USER || 'Not set ❌'}`)
  console.log(`   - SMTP_PASS: ${process.env.SMTP_PASS ? 'Configured (' + process.env.SMTP_PASS.length + ' chars) ✅' : 'Not set ❌'}`)
  console.log(`   - SMTP_SECURE: ${process.env.SMTP_SECURE || (process.env.SMTP_PORT === '465' ? 'true' : 'false')}`)
  console.log(`======================================================`)

  const res = await sendOrderInvoiceEmail({
    customerEmail: targetEmail,
    customerName: 'Test Student',
    orderId: 'ORD-' + Date.now().toString().slice(-6),
    items: [
      {
        title: 'HSC পদার্থবিজ্ঞান পূর্ণাঙ্গ কোর্স',
        quantity: 1,
        price: 1500,
      },
    ],
    amount: 1500,
    paymentMethod: 'bKash',
    trxId: 'TRX99887766',
    date: new Date().toLocaleDateString('bn-BD'),
    dashboardUrl: 'http://localhost:3000/profile',
  })

  console.log('Result:', JSON.stringify(res, null, 2))
  if (!res.success && res.error?.includes('535')) {
    console.log(`\n💡 SMTP AUTHENTICATION TROUBLESHOOTING:`)
    console.log(`   1. Port & Security Mismatch:`)
    console.log(`      Your .env shows SMTP_PORT=465 but SMTP_SECURE=false.`)
    console.log(`      Port 465 REQUIRES SMTP_SECURE=true. Please set SMTP_SECURE=true in .env.`)
    console.log(`\n   2. Checking if your Hostinger domain uses Titan Email...`)

    try {
      const nodemailer = await import('nodemailer')
      const titanTransporter = nodemailer.default.createTransport({
        host: 'smtp.titan.email',
        port: 465,
        secure: true,
        auth: {
          user: process.env.SMTP_USER?.trim(),
          pass: process.env.SMTP_PASS?.trim(),
        },
      })
      await titanTransporter.verify()
      console.log(`   🎉 SUCCESS with Titan Email! Your Hostinger mailbox is on Titan Email!`)
      console.log(`   👉 Update your .env to:`)
      console.log(`      SMTP_HOST=smtp.titan.email`)
      console.log(`      SMTP_PORT=465`)
      console.log(`      SMTP_SECURE=true`)
    } catch (titanErr: any) {
      console.log(`      (Titan check: ${titanErr.message})`)
      console.log(`\n   3. Verify Webmail Login:`)
      console.log(`      Go to https://mail.hostinger.com and test logging in with:`)
      console.log(`      Email: ${process.env.SMTP_USER}`)
      console.log(`      If you cannot log in on Webmail, the password in .env is incorrect.`)
      console.log(`      In Hostinger hPanel > Emails > Manage > Reset the email password.`)
      console.log(`\n   4. Special Characters in .env:`)
      console.log(`      If your password has '#', '$', or spaces, wrap it in double quotes:`)
      console.log(`      SMTP_PASS="your#password"`)
    }
  }
  console.log(`======================================================\n`)
}

async function main() {
  const args = process.argv.slice(2)
  const mode = args[0]
  const param = args[1]

  if (mode === '--queue') {
    const count = parseInt(param, 10) || 50
    await testQueue(count)
  } else if (mode === '--sms') {
    if (!param) {
      console.error('Please specify phone number: npx tsx scripts/test-integrations.ts --sms 017XXXXXXXX')
      process.exit(1)
    }
    await testSms(param)
  } else if (mode === '--email') {
    if (!param) {
      console.error('Please specify email: npx tsx scripts/test-integrations.ts --email student@example.com')
      process.exit(1)
    }
    await testEmail(param)
  } else if (mode === '--order') {
    const phone = param
    const email = args[2]
    if (!phone || !email) {
      console.error('Usage: npx tsx scripts/test-integrations.ts --order 01XXXXXXXXX student@example.com')
      process.exit(1)
    }
    console.log(`\n🎉 SIMULATING FULL COURSE PURCHASE NOTIFICATION (SMS + EMAIL)`)
    await testSms(phone)
    await testEmail(email)
  } else {
    // Default: run queue benchmark
    console.log('Usage:')
    console.log('  npx tsx scripts/test-integrations.ts --queue [count]                 (Test concurrent exam submissions)')
    console.log('  npx tsx scripts/test-integrations.ts --sms 01XXXXXXXXX               (Test live SMS dispatch)')
    console.log('  npx tsx scripts/test-integrations.ts --email you@test.com             (Test live Invoice Email dispatch)')
    console.log('  npx tsx scripts/test-integrations.ts --order 01XXXXXXXXX you@test.com (Test full purchase SMS + Invoice)')
    console.log('\nRunning default queue test (50 submissions)...')
    await testQueue(50)
  }

  process.exit(0)
}

main().catch((e) => {
  console.error('Test error:', e)
  process.exit(1)
})

