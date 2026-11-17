"use client"

import React, { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/payload/auth/client"
import { toast } from "@/components/ui/toast"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  UserRoundedBoldDuotone,
  ShieldCheckBoldDuotone,
  UserIdBoldDuotone as IdCardBoldDuotone,
  WalletMoneyBoldDuotone,
  FlameBoldDuotone,
  DiplomaVerifiedBoldDuotone,
  PhoneCallingBoldDuotone,
  LetterBoldDuotone,
  LockPasswordBoldDuotone,
  Logout2BoldDuotone,
} from "solar-icon-set"
import {
  Camera,
  Trash2,
  Copy,
  Check,
  Shield,
  ShieldAlert,
  Eye,
  EyeOff,
  Save,
  Clock,
  GraduationCap,
} from "lucide-react"
import { logActivity } from "@/lib/activity/activity-service"
import { ExamPerformanceSection } from "./ExamPerformanceSection"

export function ProfileSettingsView() {
  const router = useRouter()
  const { data: session, isPending: sessionLoading, refetch } = authClient.useSession()

  // Profile fields state
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [sscBatch, setSscBatch] = useState("")
  const [hscBatch, setHscBatch] = useState("")
  const [initialProfile, setInitialProfile] = useState({ phone: "", sscBatch: "", hscBatch: "" })
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)

  // Avatar state
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  // Password state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [revokeOtherSessions, setRevokeOtherSessions] = useState(true)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

  // Copy state
  const [copiedId, setCopiedId] = useState(false)

  // Sign out state
  const [isSigningOut, setIsSigningOut] = useState(false)

  // Verification state
  const [isSendingVerification, setIsSendingVerification] = useState(false)
  const [verificationSent, setVerificationSent] = useState(false)

  const handleSendVerification = async () => {
    if (!session?.user?.email || isSendingVerification || verificationSent) return
    setIsSendingVerification(true)
    try {
      const res = await authClient.sendVerificationEmail({
        email: session.user.email,
        callbackURL: "/dashboard/profile",
      })
      if (res?.error) {
        toast.add({
          title: "Failed to Send Email",
          description: res.error.message || "Failed to send verification email.",
          type: "error",
        })
      } else {
        setVerificationSent(true)
        toast.add({
          title: "Verification Email Sent",
          description: `A verification link has been sent to ${session.user.email}. Check your inbox or spam folder.`,
          type: "success",
        })
      }
    } catch (err: any) {
      toast.add({
        title: "Error",
        description: err?.message || "Failed to send verification email.",
        type: "error",
      })
    } finally {
      setIsSendingVerification(false)
    }
  }

  // Synchronize name and student onboarding data once loaded
  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name)
    }
    if (session?.user?.id) {
      fetch("/api/user/onboarding")
        .then((r) => r.json())
        .then((data) => {
          if (data?.profile) {
            const p = data.profile
            if (p.phone) setPhone(p.phone)
            if (p.sscBatch) setSscBatch(p.sscBatch)
            if (p.hscBatch) setHscBatch(p.hscBatch)
            setInitialProfile({
              phone: p.phone || "",
              sscBatch: p.sscBatch || "",
              hscBatch: p.hscBatch || "",
            })
          }
        })
        .catch(() => {})
    }
  }, [session?.user?.id, session?.user?.name])

  // Handle Profile Update (Name & Student Details)
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.add({
        title: "Validation Error",
        description: "Name cannot be empty.",
        type: "error",
      })
      return
    }

    if (name.trim().length < 2) {
      toast.add({
        title: "Validation Error",
        description: "Name must be at least 2 characters long.",
        type: "error",
      })
      return
    }

    setIsUpdatingProfile(true)
    try {
      const { error } = await authClient.updateUser({
        name: name.trim(),
      })

      // Also update student onboarding profile fields (phone, batches)
      if (phone.trim() || sscBatch.trim() || hscBatch.trim()) {
        await fetch("/api/user/onboarding", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: phone.trim(),
            sscBatch: sscBatch.trim(),
            hscBatch: hscBatch.trim(),
          }),
        })
      }

      if (error) {
        toast.add({
          title: "Update Failed",
          description: error.message || "Failed to update profile name.",
          type: "error",
        })
      } else {
        toast.add({
          title: "Profile Updated",
          description: "Your profile information has been successfully updated.",
          type: "success",
        })
        logActivity({
          title: "Profile updated",
          description: `Profile information updated.`,
          category: "Account",
          type: "profile_update",
          status: "success",
        })
        setInitialProfile({
          phone: phone.trim(),
          sscBatch: sscBatch.trim(),
          hscBatch: hscBatch.trim(),
        })
        if (refetch) await refetch()
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred."
      toast.add({
        title: "Error",
        description: message,
        type: "error",
      })
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  // Handle Avatar Upload via Cloudinary
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    e.target.value = ""

    if (!file.type.startsWith("image/")) {
      toast.add({
        title: "Invalid File",
        description: "Please select an image file (PNG, JPG, WebP, etc.).",
        type: "error",
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.add({
        title: "File Too Large",
        description: "Avatar image must be smaller than 5MB.",
        type: "error",
      })
      return
    }

    setIsUploadingAvatar(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append("file", file)

      const uploadRes = await fetch("/api/upload/avatar", {
        method: "POST",
        body: uploadFormData,
      })

      const uploadData = await uploadRes.json()

      if (!uploadRes.ok || !uploadData.url) {
        throw new Error(uploadData.error || "Failed to upload image to Cloudinary.")
      }

      const { error } = await authClient.updateUser({
        image: uploadData.url,
      })

      if (error) {
        toast.add({
          title: "Avatar Update Failed",
          description: error.message || "Could not update avatar image in profile.",
          type: "error",
        })
      } else {
        toast.add({
          title: "Avatar Updated",
          description: "Your professional profile picture has been uploaded and optimized.",
          type: "success",
        })
        logActivity({
          title: "Avatar updated",
          description: "High-definition profile picture processed and optimized with auto face-detection.",
          category: "Account",
          type: "avatar_update",
          status: "success",
          metadata: { provider: "Cloudinary CDN" },
        })
        if (refetch) await refetch()
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to process image."
      toast.add({
        title: "Upload Error",
        description: message,
        type: "error",
      })
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  // Handle Avatar Removal
  const handleRemoveAvatar = async () => {
    setIsUploadingAvatar(true)
    try {
      const { error } = await authClient.updateUser({
        image: null as unknown as string,
      })

      if (error) {
        toast.add({
          title: "Removal Failed",
          description: error.message || "Failed to remove avatar.",
          type: "error",
        })
      } else {
        toast.add({
          title: "Avatar Removed",
          description: "Your avatar has been reset to the default initials.",
          type: "success",
        })
        logActivity({
          title: "Avatar removed",
          description: "Profile picture reset to default initials.",
          category: "Account",
          type: "avatar_update",
          status: "info",
        })
        if (refetch) await refetch()
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to remove avatar."
      toast.add({
        title: "Error",
        description: message,
        type: "error",
      })
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  // Handle Password Change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentPassword) {
      toast.add({
        title: "Validation Error",
        description: "Please enter your current password.",
        type: "error",
      })
      return
    }

    if (newPassword.length < 8) {
      toast.add({
        title: "Validation Error",
        description: "New password must be at least 8 characters long.",
        type: "error",
      })
      return
    }

    if (newPassword !== confirmPassword) {
      toast.add({
        title: "Validation Error",
        description: "New password and confirmation do not match.",
        type: "error",
      })
      return
    }

    setIsUpdatingPassword(true)
    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions,
      })

      if (error) {
        toast.add({
          title: "Password Change Failed",
          description: error.message || "Could not change password. Please verify your current password.",
          type: "error",
        })
      } else {
        toast.add({
          title: "Password Updated",
          description: "Your password has been changed successfully.",
          type: "success",
        })
        logActivity({
          title: "Password changed successfully",
          description: "Account security credentials updated via Profile.",
          category: "Security",
          type: "password_change",
          status: "success",
        })
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred."
      toast.add({
        title: "Error",
        description: message,
        type: "error",
      })
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  // Copy User ID
  const handleCopyId = () => {
    if (session?.user?.id) {
      navigator.clipboard.writeText(session.user.id)
      setCopiedId(true)
      toast.add({
        title: "Copied",
        description: "User ID copied to clipboard.",
        type: "success",
      })
      setTimeout(() => setCopiedId(false), 2000)
    }
  }

  // Sign out
  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await authClient.signOut()
      toast.add({
        title: "Signed Out",
        description: "You have been safely signed out.",
        type: "success",
      })
      router.push("/auth/login")
    } catch {
      toast.add({
        title: "Sign Out Failed",
        description: "Could not sign out. Please try again.",
        type: "error",
      })
      setIsSigningOut(false)
    }
  }

  // Loading state
  if (sessionLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-xl" />
          <Skeleton className="h-4 w-72 rounded-lg" />
        </div>
        <Card className="rounded-2xl border-2 border-emerald-500/20 p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="size-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-40 rounded-lg" />
              <Skeleton className="h-4 w-56 rounded-md" />
            </div>
          </div>
        </Card>
      </div>
    )
  }

  const user = session?.user
  const userRole = (user as { role?: string } | undefined)?.role || "user"
  const isEmailVerified = user?.emailVerified ?? false
  const userInitials = (user?.name || user?.email || "U")
    .slice(0, 2)
    .toUpperCase()

  const formattedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("bn-BD", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null

  const isProfileChanged =
    name.trim() !== (user?.name || "") ||
    phone.trim() !== initialProfile.phone ||
    sscBatch.trim() !== initialProfile.sscBatch ||
    hscBatch.trim() !== initialProfile.hscBatch

  return (
    <div className="space-y-5 max-w-4xl mx-auto pb-10">
      {/* 1. Student Header Card matching Dashboard Aesthetic */}
      <div className="rounded-2xl border-2 border-emerald-500/25 border-b-4 border-b-emerald-600 bg-gradient-to-r from-emerald-500/10 via-card to-sky-500/10 p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4 sm:gap-5">
            {/* Avatar with gradient border and interactive upload */}
            <div
              className="relative group cursor-pointer shrink-0"
              onClick={() => !isUploadingAvatar && fileInputRef.current?.click()}
            >
              <Avatar className="size-16 sm:size-20 border-2 border-emerald-500/40 shadow-md ring-4 ring-emerald-500/15 transition-transform group-hover:scale-105">
                <AvatarImage src={user?.image || undefined} alt={user?.name || "User Avatar"} className="object-cover" />
                <AvatarFallback className="text-lg sm:text-xl font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  {userInitials}
                </AvatarFallback>
              </Avatar>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs text-white">
                <Camera className="size-4 sm:size-5" />
                <span className="text-[9px] sm:text-[10px] font-medium mt-0.5">ছবি পরিবর্তন</span>
              </div>

              {/* Uploading Spinner */}
              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-background/80 rounded-full flex flex-col items-center justify-center backdrop-blur-xs z-10">
                  <Spinner className="size-5 sm:size-6 text-emerald-600" />
                  <span className="text-[8px] sm:text-[9px] font-bold text-emerald-600 mt-1">আপলোড হচ্ছে...</span>
                </div>
              )}
            </div>

            {/* Student Details and Badges */}
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-xl font-bold tracking-tight text-foreground truncate">
                  {user?.name || "শিক্ষার্থী"}
                </h1>

                {/* Role Pill */}
                {userRole === "admin" ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-fuchsia-500/15 text-fuchsia-600 dark:text-fuchsia-400 border border-fuchsia-500/30">
                    এডমিন
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    শিক্ষার্থী
                  </span>
                )}

                {/* Verification Pill with Solar Icon */}
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold border ${
                    isEmailVerified
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                      : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                  }`}
                >
                  {isEmailVerified ? (
                    <>
                      <ShieldCheckBoldDuotone size={13} color="#10b981" />
                      <span>ভেরিফাইড</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="size-3 text-amber-600" />
                      <span>আনভেরিফাইড</span>
                    </>
                  )}
                </span>

                {!isEmailVerified && (
                  <button
                    type="button"
                    onClick={handleSendVerification}
                    disabled={isSendingVerification || verificationSent}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 dark:text-amber-400 hover:underline disabled:opacity-60 cursor-pointer transition-colors"
                  >
                    {isSendingVerification
                      ? "লিঙ্ক পাঠানো হচ্ছে..."
                      : verificationSent
                      ? "ইমেইল পাঠানো হয়েছে!"
                      : "ভেরিফাই করুন"}
                  </button>
                )}
              </div>

              {/* Email */}
              <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1.5 truncate">
                <LetterBoldDuotone size={14} color="#0ea5e9" className="shrink-0" />
                <span className="truncate">{user?.email}</span>
              </p>

              {/* Colorful Stat / Streak Pills */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap pt-0.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold text-[10px] sm:text-[11px]">
                  <FlameBoldDuotone size={12} color="#f59e0b" />
                  <span>৭ দিন স্ট্রিক</span>
                </span>

                {user?.id && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 font-bold text-[10px] sm:text-[11px]">
                    <IdCardBoldDuotone size={12} color="#06b6d4" />
                    <span>ID: {user.id.slice(0, 8)}...</span>
                  </span>
                )}

                {(sscBatch || hscBatch) && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-500/15 text-teal-600 dark:text-teal-400 font-bold text-[10px] sm:text-[11px]">
                    <DiplomaVerifiedBoldDuotone size={12} color="#14b8a6" />
                    <span>{sscBatch ? `SSC ${sscBatch}` : `HSC ${hscBatch}`}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Avatar Picture Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 self-end sm:self-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarFileChange}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-initial h-8 text-xs font-semibold rounded-xl border-emerald-500/30 hover:bg-emerald-500/10 text-foreground"
              disabled={isUploadingAvatar}
              onClick={() => fileInputRef.current?.click()}
            >
              <Camera className="size-3.5 mr-1 text-emerald-600" />
              <span>ছবি পরিবর্তন</span>
            </Button>

            {user?.image && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 text-xs font-semibold rounded-xl text-destructive hover:bg-destructive/10"
                disabled={isUploadingAvatar}
                onClick={handleRemoveAvatar}
                title="Remove avatar"
              >
                <Trash2 className="size-3.5 mr-1" />
                <span>মুছুন</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Responsive Tabs Layout with Vibrant Theme Accents */}
      <Tabs defaultValue="personal" className="w-full space-y-4">
        <TabsList className="w-full flex justify-start overflow-x-auto p-1 bg-muted/60 rounded-xl h-auto gap-1 border border-border/60">
          <TabsTrigger
            value="personal"
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold data-[state=active]:bg-card data-[state=active]:text-emerald-600 data-[state=active]:shadow-xs transition-all cursor-pointer"
          >
            <UserRoundedBoldDuotone size={15} color="#10b981" />
            <span>ব্যক্তিগত তথ্য</span>
          </TabsTrigger>

          <TabsTrigger
            value="security"
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold data-[state=active]:bg-card data-[state=active]:text-sky-600 data-[state=active]:shadow-xs transition-all cursor-pointer"
          >
            <ShieldCheckBoldDuotone size={15} color="#0ea5e9" />
            <span>নিরাপত্তা</span>
          </TabsTrigger>

          <TabsTrigger
            value="exams"
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold data-[state=active]:bg-card data-[state=active]:text-teal-600 data-[state=active]:shadow-xs transition-all cursor-pointer"
          >
            <DiplomaVerifiedBoldDuotone size={15} color="#14b8a6" />
            <span>পরীক্ষার ফলাফল</span>
          </TabsTrigger>

          <TabsTrigger
            value="account"
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-bold data-[state=active]:bg-card data-[state=active]:text-amber-600 data-[state=active]:shadow-xs transition-all cursor-pointer"
          >
            <WalletMoneyBoldDuotone size={15} color="#f59e0b" />
            <span>অ্যাকাউন্ট আইডি</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Personal Information Card */}
        <TabsContent value="personal" className="space-y-4 mt-0">
          <Card className="rounded-2xl border-2 border-emerald-500/25 border-b-4 border-b-emerald-500 bg-card shadow-xs overflow-hidden">
            <CardHeader className="p-4 sm:p-5 border-b border-border/60">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shrink-0">
                  <UserRoundedBoldDuotone size={20} color="#10b981" />
                </div>
                <div>
                  <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                    ব্যক্তিগত ও অ্যাকাডেমিক তথ্য
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    আপনার নাম, মোবাইল নম্বর এবং অ্যাকাডেমিক ব্যাচসমূহ আপডেট করুন।
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <form onSubmit={handleUpdateProfile}>
              <CardContent className="p-4 sm:p-5 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Name (Editable) */}
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs font-semibold">পূর্ণ নাম (Display Name)</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="আপনার নাম লিখুন"
                      disabled={isUpdatingProfile}
                      required
                      className="rounded-xl h-9 text-xs"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      সার্টিফিকেট ও ক্লাসরুমে এই নামটি প্রদর্শিত হবে।
                    </p>
                  </div>

                  {/* Email (Read-only) */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email" className="text-xs font-semibold">ইমেইল ঠিকানা</Label>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                        <Shield className="size-3" />
                        পরিবর্তনযোগ্য নয়
                      </span>
                    </div>
                    <Input
                      id="email"
                      value={user?.email || ""}
                      disabled
                      className="rounded-xl h-9 text-xs bg-muted/50 cursor-not-allowed text-muted-foreground"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      লগইন ও অ্যাকাউন্টের প্রাথমিক ভেরিফিকেশন পরিচয়।
                    </p>
                  </div>

                  {/* Mobile Number */}
                  <div className="space-y-1.5">
                    <Label htmlFor="phone" className="text-xs font-semibold flex items-center gap-1.5">
                      <PhoneCallingBoldDuotone size={13} color="#10b981" />
                      <span>মোবাইল নম্বর</span>
                    </Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="01XXXXXXXXX"
                      disabled={isUpdatingProfile}
                      className="rounded-xl h-9 text-xs"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      জরুরি ক্লাসরুম নোটিস ও পেমেন্ট কনফার্মেশনের জন্য ব্যবহৃত হবে।
                    </p>
                  </div>

                  {/* Batches Dropdown */}
                  <div className="space-y-1.5">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label htmlFor="sscBatch" className="text-xs font-semibold flex items-center gap-1">
                          <GraduationCap className="size-3 text-emerald-600" />
                          <span>SSC ব্যাচ</span>
                        </Label>
                        <select
                          id="sscBatch"
                          value={sscBatch}
                          onChange={(e) => setSscBatch(e.target.value)}
                          disabled={isUpdatingProfile}
                          className="flex h-9 w-full rounded-xl border border-input bg-background px-2.5 py-1 text-xs shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                        >
                          <option value="">নির্বাচন করুন</option>
                          <option value="2024">SSC 2024</option>
                          <option value="2025">SSC 2025</option>
                          <option value="2026">SSC 2026</option>
                          <option value="2027">SSC 2027</option>
                          <option value="2028">SSC 2028</option>
                          <option value="2029">SSC 2029</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <Label htmlFor="hscBatch" className="text-xs font-semibold flex items-center gap-1">
                          <GraduationCap className="size-3 text-sky-600" />
                          <span>HSC ব্যাচ</span>
                        </Label>
                        <select
                          id="hscBatch"
                          value={hscBatch}
                          onChange={(e) => setHscBatch(e.target.value)}
                          disabled={isUpdatingProfile}
                          className="flex h-9 w-full rounded-xl border border-input bg-background px-2.5 py-1 text-xs shadow-xs transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                        >
                          <option value="">নির্বাচন করুন</option>
                          <option value="2025">HSC 2025</option>
                          <option value="2026">HSC 2026</option>
                          <option value="2027">HSC 2027</option>
                          <option value="2028">HSC 2028</option>
                          <option value="2029">HSC 2029</option>
                          <option value="2030">HSC 2030</option>
                        </select>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      সঠিক ব্যাচ অনুযায়ী বিষয়ভিত্তিক ক্লাস ও এক্সাম প্রস্তাবিত হবে।
                    </p>
                  </div>
                </div>

                {/* Additional Details */}
                {formattedDate && (
                  <div className="pt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="size-3.5 text-emerald-600" />
                    <span>ইউনিক টিচিং মেথডে যুক্ত হয়েছেন: <strong className="text-foreground">{formattedDate}</strong></span>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex justify-end border-t border-border/60 p-4 sm:p-5 bg-muted/20">
                <Button
                  type="submit"
                  size="sm"
                  className="rounded-xl h-8 px-4 font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
                  disabled={isUpdatingProfile || !isProfileChanged || !name.trim()}
                >
                  {isUpdatingProfile ? (
                    <>
                      <Spinner className="size-3.5 mr-1.5" />
                      সংরক্ষণ হচ্ছে...
                    </>
                  ) : (
                    <>
                      <Save className="size-3.5 mr-1.5" />
                      তথ্য সংরক্ষণ করুন
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* Tab 2: Security & Password Card */}
        <TabsContent value="security" className="space-y-4 mt-0">
          <Card className="rounded-2xl border-2 border-sky-500/25 border-b-4 border-b-sky-500 bg-card shadow-xs overflow-hidden">
            <CardHeader className="p-4 sm:p-5 border-b border-border/60">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-sky-500/15 text-sky-500 flex items-center justify-center shrink-0">
                  <LockPasswordBoldDuotone size={20} color="#0ea5e9" />
                </div>
                <div>
                  <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                    নিরাপত্তা ও পাসওয়ার্ড পরিবর্তন
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    অ্যাকাউন্টের সুরক্ষার জন্য পাসওয়ার্ড আপডেট করুন। ন্যূনতম ৮ অক্ষর আবশ্যক।
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <form onSubmit={handleChangePassword}>
              <CardContent className="p-4 sm:p-5 space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="current-password" className="text-xs font-semibold">বর্তমান পাসওয়ার্ড</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="বর্তমান পাসওয়ার্ড লিখুন"
                      disabled={isUpdatingPassword}
                      className="rounded-xl h-9 text-xs pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {showCurrentPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="new-password" className="text-xs font-semibold">নতুন পাসওয়ার্ড</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="ন্যূনতম ৮ অক্ষর"
                        disabled={isUpdatingPassword}
                        className="rounded-xl h-9 text-xs pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="confirm-password" className="text-xs font-semibold">নতুন পাসওয়ার্ড নিশ্চিত করুন</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="পুনরায় নতুন পাসওয়ার্ড লিখুন"
                      disabled={isUpdatingPassword}
                      className="rounded-xl h-9 text-xs"
                    />
                  </div>
                </div>

                {/* Revoke Sessions Toggle */}
                <div className="flex items-center justify-between rounded-xl border border-sky-500/20 p-3 bg-sky-500/5">
                  <div className="space-y-0.5">
                    <Label htmlFor="revoke-sessions" className="text-xs font-semibold cursor-pointer">
                      অন্যান্য সকল সেশন থেকে সাইন আউট করুন
                    </Label>
                    <p className="text-[10px] text-muted-foreground">
                      পাসওয়ার্ড পরিবর্তনের সাথে সাথে অন্যান্য সব ডিভাইস থেকে স্বয়ংক্রিয়ভাবে লগআউট হবে।
                    </p>
                  </div>
                  <Switch
                    id="revoke-sessions"
                    checked={revokeOtherSessions}
                    onCheckedChange={setRevokeOtherSessions}
                    disabled={isUpdatingPassword}
                  />
                </div>
              </CardContent>

              <CardFooter className="flex justify-end border-t border-border/60 p-4 sm:p-5 bg-muted/20">
                <Button
                  type="submit"
                  size="sm"
                  className="rounded-xl h-8 px-4 font-bold text-xs bg-sky-600 hover:bg-sky-700 text-white shadow-xs"
                  disabled={
                    isUpdatingPassword ||
                    !currentPassword ||
                    !newPassword ||
                    !confirmPassword ||
                    newPassword.length < 8
                  }
                >
                  {isUpdatingPassword ? (
                    <>
                      <Spinner className="size-3.5 mr-1.5" />
                      পাসওয়ার্ড আপডেট হচ্ছে...
                    </>
                  ) : (
                    <>
                      <LockPasswordBoldDuotone size={14} color="#fff" className="mr-1" />
                      পাসওয়ার্ড পরিবর্তন করুন
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        {/* Tab 3: Exam Performance History */}
        <TabsContent value="exams" className="space-y-4 mt-0">
          <Card className="rounded-2xl border-2 border-teal-500/25 border-b-4 border-b-teal-500 bg-card shadow-xs overflow-hidden">
            <CardHeader className="p-4 sm:p-5 border-b border-border/60">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-teal-500/15 text-teal-500 flex items-center justify-center shrink-0">
                  <DiplomaVerifiedBoldDuotone size={20} color="#14b8a6" />
                </div>
                <div>
                  <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                    পরীক্ষার পারফরম্যান্স রেকর্ড
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    সকল বিষয়ভিত্তিক পরীক্ষা ও কুইজের প্রাপ্ত নম্বর, সঠিক-ভুল বিশ্লেষণ এবং অগ্রগতির ইতিহাস।
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-5">
              <ExamPerformanceSection />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 4: Account & Danger Zone */}
        <TabsContent value="account" className="space-y-4 mt-0">
          <Card className="rounded-2xl border-2 border-amber-500/25 border-b-4 border-b-amber-500 bg-card shadow-xs overflow-hidden">
            <CardHeader className="p-4 sm:p-5 border-b border-border/60">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0">
                  <WalletMoneyBoldDuotone size={20} color="#f59e0b" />
                </div>
                <div>
                  <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                    অ্যাকাউন্ট পরিচিতি ও সেশন
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground mt-0.5">
                    আপনার ইউনিক শিক্ষার্থী আইডি এবং সক্রিয় লগইন সেশন তথ্য।
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-5 space-y-4">
              {/* User ID Card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 rounded-xl border border-amber-500/20 bg-amber-500/5">
                <div className="space-y-0.5 min-w-0">
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 block uppercase">
                    ইউনিক শিক্ষার্থী আইডি (User ID)
                  </span>
                  <p className="text-xs font-mono text-foreground break-all">{user?.id || "N/A"}</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0 h-8 text-xs font-bold rounded-xl border-amber-500/30 hover:bg-amber-500/10 cursor-pointer"
                  onClick={handleCopyId}
                >
                  {copiedId ? (
                    <>
                      <Check className="size-3.5 mr-1 text-emerald-500" />
                      <span>কপি হয়েছে</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5 mr-1" />
                      <span>আইডি কপি করুন</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Active Session & Signout */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border/60">
                <div className="space-y-0.5">
                  <p className="text-xs sm:text-sm font-bold text-foreground">সক্রিয় সেশন (Active Session)</p>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    নিরাপদ Better Auth সেশনের মাধ্যমে এই ডিভাইসে সংযুক্ত রয়েছেন।
                  </p>
                </div>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="rounded-xl h-8 px-3.5 text-xs font-bold shrink-0 self-start sm:self-auto cursor-pointer"
                  disabled={isSigningOut}
                  onClick={handleSignOut}
                >
                  {isSigningOut ? (
                    <>
                      <Spinner className="size-3.5 mr-1.5" />
                      লগআউট হচ্ছে...
                    </>
                  ) : (
                    <>
                      <Logout2BoldDuotone size={13} color="#fff" className="mr-1" />
                      সাইন আউট করুন
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ProfileSettingsView
