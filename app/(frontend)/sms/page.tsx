'use client'

import { useState, useTransition } from 'react'
import { sendSmsAction } from '@/app/actions/sms'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

export default function SmsPage() {
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<{ success?: boolean; text?: string }>({})

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)

    startTransition(async () => {
      setStatus({})
      const res = await sendSmsAction(formData)
      if (res.success) {
        setStatus({ success: true, text: 'SMS sent successfully!' })
        form.reset()
      } else {
        setStatus({ success: false, text: res.error })
      }
    })
  }

  return (
    <div className="container flex min-h-[calc(100vh-140px)] items-center justify-center py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Send SMS</CardTitle>
          <CardDescription>Send instant SMS via sms.net.bd</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="to">Phone Number</Label>
              <Input
                id="to"
                name="to"
                type="tel"
                placeholder="8801800000000"
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="msg">Message</Label>
              <Textarea
                id="msg"
                name="msg"
                placeholder="Write your SMS text here..."
                rows={4}
                required
              />
            </div>

            {status.text && (
              <p
                className={`text-sm ${
                  status.success ? 'text-green-600 dark:text-green-400' : 'text-destructive'
                }`}
              >
                {status.text}
              </p>
            )}

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending ? 'Sending...' : 'Send SMS'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
