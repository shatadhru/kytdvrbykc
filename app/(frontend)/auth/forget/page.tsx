"use client"

import * as React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRightIcon, Loader2Icon, MailIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { authClient } from "@/payload/auth/client"
import { toast } from "@/components/ui/toast"
import { StepIndicator } from "@/app/(frontend)/auth/forget/components/step-indicator"
import Link from "next/link"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await authClient.requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}/auth/forget/reset`,
      })

      if (result?.error) {
        toast.add({
          type: "error",
          title: "Request Failed",
          description: result.error.message || "Failed to send reset code. Please try again.",
        })
      } else {
        toast.add({
          type: "success",
          title: "Code Sent",
          description: "If an account exists with this email, a reset code was sent.",
        })
        router.push(`/auth/forget/verify?email=${encodeURIComponent(email)}`)
      }
    } catch (err: any) {
      console.error(err)
      toast.add({
        type: "error",
        title: "Error",
        description: err?.message || "An unexpected error occurred. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full rounded-2xl border-2 border-emerald-500/25 border-b-4 border-b-emerald-600 bg-card shadow-lg">
      <CardHeader className="space-y-1 text-center pb-3">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
          <MailIcon className="h-6 w-6" />
        </div>
        <CardTitle className="text-xl sm:text-2xl font-bold text-foreground">পাসওয়ার্ড পুনরুদ্ধার</CardTitle>
        <CardDescription className="text-xs sm:text-sm text-muted-foreground">
          আপনার নিবন্ধিত ইমেইল ঠিকানা দিন, আমরা একটি ভেরিফিকেশন কোড পাঠাবো
        </CardDescription>
      </CardHeader>

      <CardContent>
        <StepIndicator currentStep={1} />

        <form onSubmit={handleSubmit} className="space-y-4">
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="email" className="text-xs font-semibold">ইমেইল ঠিকানা</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="rounded-xl h-10"
              />
              <FieldDescription className="text-[11px] text-muted-foreground mt-1">
                একাউন্ট থাকলে এই ইমেইলে একটি ৬-সংখ্যার ওটিপি কোড যাবে
              </FieldDescription>
            </Field>
          </FieldGroup>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md cursor-pointer transition-all"
          >
            {isLoading ? (
              <>
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin text-white" />
                কোড পাঠানো হচ্ছে...
              </>
            ) : (
              <>
                রিসেট কোড পাঠান <ArrowRightIcon className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center pt-0">
        <p className="text-xs text-muted-foreground">
          পাসওয়ার্ড মনে পড়েছে?{" "}
          <Link
            href="/auth/login"
            className="font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            লগইন করুন
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
