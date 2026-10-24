import amqp from 'amqplib'
import { getPayload } from 'payload'
import config from '@payload-config'
import { sendBroadcastEmail } from '@/utils/sendEmail'

export interface ExamSubmissionMessage {
  student: string
  studentName?: string
  studentEmail?: string
  examTitle: string
  classLevel?: string
  subject: string
  chapter: string
  totalQuestions: number
  attempted: number
  correctAnswers: number
  incorrectAnswers: number
  score: number
  percentage: number
  timeTakenSeconds: number
  passed: boolean
  answers: any
  submittedAt?: string
}

export interface BroadcastNotificationMessage {
  recipients: Array<{ email: string; name?: string | null }>
  title: string
  message: string
  priority?: 'info' | 'announcement' | 'security' | 'urgent'
  channels: ('in_app' | 'email')[]
  actionUrl?: string
  actionText?: string
  imageUrl?: string
}

export const QUEUES = {
  EXAM_SUBMISSIONS: 'exam_submissions_queue',
  NOTIFICATIONS: 'notifications_broadcast_queue',
} as const

// Singleton instances for RabbitMQ connection & channels
let amqpConnection: amqp.ChannelModel | null = null
let amqpChannel: amqp.Channel | null = null
let isConnecting = false
let consumersStarted = false

// In-Memory Fallback Queue (Ponytail principle: zero crashes even if RabbitMQ is offline)
const inMemorySubmissionsQueue: ExamSubmissionMessage[] = []
let isProcessingMemorySubmissions = false

/**
 * Get or initialize RabbitMQ connection
 */
async function getRabbitMQConnection(): Promise<amqp.ChannelModel | null> {
  const amqpUrl = process.env.RABBITMQ_URL

  if (!amqpUrl) {
    return null
  }

  if (amqpConnection) {
    return amqpConnection
  }

  if (isConnecting) {
    // Wait briefly if connection is already in progress
    await new Promise((resolve) => setTimeout(resolve, 100))
    return amqpConnection
  }

  isConnecting = true
  try {
    const conn = await amqp.connect(amqpUrl)

    conn.on('error', (err) => {
      console.warn('[RabbitMQ] Connection error:', err.message)
      amqpConnection = null
      amqpChannel = null
      consumersStarted = false
    })

    conn.on('close', () => {
      console.warn('[RabbitMQ] Connection closed. Resetting connection handle.')
      amqpConnection = null
      amqpChannel = null
      consumersStarted = false
    })

    amqpConnection = conn
    return amqpConnection
  } catch (err: any) {
    console.warn('[RabbitMQ] Failed to connect to broker:', err.message)
    amqpConnection = null
    amqpChannel = null
    return null
  } finally {
    isConnecting = false
  }
}

/**
 * Get or initialize RabbitMQ channel
 */
async function getRabbitMQChannel(): Promise<amqp.Channel | null> {
  if (amqpChannel) {
    return amqpChannel
  }

  const conn = await getRabbitMQConnection()
  if (!conn) {
    return null
  }

  try {
    const ch = await conn.createChannel()

    // Assert durable queues so jobs survive broker restart
    await ch.assertQueue(QUEUES.EXAM_SUBMISSIONS, { durable: true })
    await ch.assertQueue(QUEUES.NOTIFICATIONS, { durable: true })

    // Controlled prefetch to prevent overwhelming MongoDB/SMTP under 1,000+ burst submissions
    await ch.prefetch(20)

    amqpChannel = ch

    // Auto-start consumers once channel is ready
    if (!consumersStarted) {
      startWorkers(ch).catch((workerErr) => {
        console.error('[RabbitMQ] Failed to start queue workers:', workerErr)
      })
    }

    return amqpChannel
  } catch (err: any) {
    console.warn('[RabbitMQ] Failed to create channel:', err.message)
    amqpChannel = null
    return null
  }
}

/**
 * Persist an exam submission into MongoDB via Payload CMS
 */
async function saveSubmissionToDatabase(data: ExamSubmissionMessage): Promise<void> {
  const payload = await getPayload({ config })
  await (payload as any).create({
    collection: 'exam-submissions',
    data: {
      examTitle: data.examTitle,
      student: data.student,
      studentName: data.studentName || 'শিক্ষার্থী',
      studentEmail: data.studentEmail || '',
      classLevel: data.classLevel || 'General',
      subject: data.subject,
      chapter: data.chapter,
      totalQuestions: data.totalQuestions,
      attempted: data.attempted,
      correctAnswers: data.correctAnswers,
      incorrectAnswers: data.incorrectAnswers,
      score: data.score,
      percentage: data.percentage,
      timeTakenSeconds: data.timeTakenSeconds,
      passed: data.passed,
      answers: data.answers,
    },
  })
}

/**
 * Process in-memory queue fallback smoothly
 */
async function processInMemorySubmissions(): Promise<void> {
  if (isProcessingMemorySubmissions || inMemorySubmissionsQueue.length === 0) return
  isProcessingMemorySubmissions = true

  try {
    while (inMemorySubmissionsQueue.length > 0) {
      const batch = inMemorySubmissionsQueue.splice(0, 10)
      await Promise.all(
        batch.map(async (item) => {
          try {
            await saveSubmissionToDatabase(item)
          } catch (err) {
            console.error('[Queue Fallback] Error saving submission:', err)
          }
        }),
      )
    }
  } finally {
    isProcessingMemorySubmissions = false
  }
}

/**
 * Start RabbitMQ background consumers
 */
async function startWorkers(channel: amqp.Channel): Promise<void> {
  if (consumersStarted) return
  consumersStarted = true

  // 1. Worker for Exam Submissions (Queue for 1k+ concurrent exam submissions)
  await channel.consume(
    QUEUES.EXAM_SUBMISSIONS,
    async (msg) => {
      if (!msg) return
      try {
        const submission: ExamSubmissionMessage = JSON.parse(msg.content.toString())
        await saveSubmissionToDatabase(submission)
        channel.ack(msg)
      } catch (err) {
        console.error('[RabbitMQ] Error processing exam submission message:', err)
        // Discard or requeue based on error type. For now, ack to prevent infinite poison pill loops.
        channel.ack(msg)
      }
    },
    { noAck: false },
  )

  // 2. Worker for Broadcast Notifications / Emails
  await channel.consume(
    QUEUES.NOTIFICATIONS,
    async (msg) => {
      if (!msg) return
      try {
        const data: BroadcastNotificationMessage = JSON.parse(msg.content.toString())
        if (data.channels.includes('email') && data.recipients?.length) {
          const BATCH_SIZE = 5
          for (let i = 0; i < data.recipients.length; i += BATCH_SIZE) {
            const batch = data.recipients.slice(i, i + BATCH_SIZE)
            await Promise.all(
              batch.map(async (r) => {
                try {
                  await sendBroadcastEmail({
                    to: r.email,
                    recipientName: r.name,
                    title: data.title,
                    message: data.message,
                    priority: data.priority,
                    actionUrl: data.actionUrl,
                    actionText: data.actionText,
                    imageUrl: data.imageUrl,
                  })
                } catch (emailErr) {
                  console.error(`[RabbitMQ Worker] Failed to send email to ${r.email}:`, emailErr)
                }
              }),
            )
          }
        }
        channel.ack(msg)
      } catch (err) {
        console.error('[RabbitMQ] Error processing notification broadcast message:', err)
        channel.ack(msg)
      }
    },
    { noAck: false },
  )
}

/**
 * Publish an exam submission to RabbitMQ queue.
 * Resilient: If RabbitMQ is down/unconfigured, falls back to in-memory queue.
 */
export async function enqueueExamSubmission(
  submission: ExamSubmissionMessage,
): Promise<{ queued: boolean; provider: 'rabbitmq' | 'memory-fallback' }> {
  try {
    const channel = await getRabbitMQChannel()

    if (channel) {
      const buffer = Buffer.from(JSON.stringify(submission))
      const published = channel.sendToQueue(QUEUES.EXAM_SUBMISSIONS, buffer, {
        persistent: true,
      })

      if (published) {
        return { queued: true, provider: 'rabbitmq' }
      }
    }
  } catch (err: any) {
    console.warn('[RabbitMQ] Could not send to queue, falling back to memory queue:', err.message)
  }

  // Resilient Fallback to in-memory async processing
  inMemorySubmissionsQueue.push(submission)
  // Trigger background micro-batch processing without blocking HTTP response
  setTimeout(() => {
    processInMemorySubmissions().catch((e) =>
      console.error('[Queue Fallback] Batch processing error:', e),
    )
  }, 10)

  return { queued: true, provider: 'memory-fallback' }
}

/**
 * Publish broadcast notification task to RabbitMQ queue
 */
export async function enqueueNotificationBroadcast(
  notification: BroadcastNotificationMessage,
): Promise<{ queued: boolean; provider: 'rabbitmq' | 'memory-fallback' }> {
  try {
    const channel = await getRabbitMQChannel()

    if (channel) {
      const buffer = Buffer.from(JSON.stringify(notification))
      const published = channel.sendToQueue(QUEUES.NOTIFICATIONS, buffer, {
        persistent: true,
      })

      if (published) {
        return { queued: true, provider: 'rabbitmq' }
      }
    }
  } catch (err: any) {
    console.warn('[RabbitMQ] Notification publish failed, using background dispatch:', err.message)
  }

  // In-memory fallback
  setTimeout(async () => {
    if (notification.channels.includes('email') && notification.recipients?.length) {
      for (const r of notification.recipients) {
        try {
          await sendBroadcastEmail({
            to: r.email,
            recipientName: r.name,
            title: notification.title,
            message: notification.message,
            priority: notification.priority,
            actionUrl: notification.actionUrl,
            actionText: notification.actionText,
            imageUrl: notification.imageUrl,
          })
        } catch (e) {
          console.error(`[Fallback] Error sending email to ${r.email}:`, e)
        }
      }
    }
  }, 10)

  return { queued: true, provider: 'memory-fallback' }
}
