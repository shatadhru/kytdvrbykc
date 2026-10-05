'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell, CheckCheck, X, ChevronRight, ExternalLink } from 'lucide-react'
import { authClient } from '@/payload/auth/client'
import { cn } from '@/lib/utils'

interface NotificationItem {
  id: string
  title: string
  message: string
  priority?: 'low' | 'normal' | 'high' | 'urgent'
  actionUrl?: string
  actionText?: string
  sentAt?: string
  isRead?: boolean
}

export interface HeaderNotificationsProps {
  notificationsUrl?: string
  className?: string
}

export function HeaderNotifications({
  notificationsUrl = '/dashboard/notifications',
  className,
}: HeaderNotificationsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unreadCount, setUnreadCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const { data: session } = authClient.useSession()
  const userEmail = session?.user?.email || ''
  const userRole = (session?.user as { role?: string } | undefined)?.role || 'user'

  const fetchNotifications = async () => {
    try {
      setIsLoading(true)
      const url = userEmail
        ? `/api/user/notifications?email=${encodeURIComponent(userEmail)}&role=${encodeURIComponent(userRole)}`
        : '/api/user/notifications'
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data.notifications)) {
          setNotifications(data.notifications)
        }
        if (typeof data.unreadCount === 'number') {
          setUnreadCount(data.unreadCount)
        }
      }
    } catch {
      // ignore network errors silently in header
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [userEmail, userRole])

  // Close on outside click (desktop)
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick)
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
    }
  }, [isOpen])

  // Mark single notification as read
  const handleItemClick = async (notif: NotificationItem) => {
    setIsOpen(false)
    if (!notif.isRead && userEmail) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      )
      setUnreadCount((prev) => Math.max(0, prev - 1))
      try {
        await fetch('/api/user/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'read', notificationId: notif.id, email: userEmail }),
        })
      } catch {
        // ignore
      }
    }
    if (notif.actionUrl) {
      router.push(notif.actionUrl)
    }
  }

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    if (!userEmail) return
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    setUnreadCount(0)
    try {
      await fetch('/api/user/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'readAll', email: userEmail }),
      })
    } catch {
      // ignore
    }
  }

  return (
    <div className={cn('relative', className)} ref={containerRef}>
      {/* Normal Bell Trigger Icon Button (Matching Cart & Theme Toggle) */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="নোটিফিকেশন"
        aria-expanded={isOpen}
        className={cn(
          'relative inline-flex items-center justify-center size-7.5 sm:size-8 rounded-xl border border-border/80 bg-background/80 hover:bg-accent/60 transition-all duration-200 shadow-xs cursor-pointer text-foreground',
          isOpen && 'bg-accent/80 border-border'
        )}
      >
        <Bell className="size-4 text-foreground/80 hover:text-foreground transition-transform duration-200 hover:scale-110" />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-xs animate-in zoom-in-75 duration-200">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* DROPDOWN DRAWER (Mobile: dropdown drawer from top / Desktop: floating dropdown) */}
      {isOpen && (
        <>
          {/* Mobile Backdrop Overlay */}
          <div
            className="fixed inset-0 top-13 bg-black/40 z-40 sm:hidden animate-in fade-in duration-150"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer / Dropdown Box */}
          <div className="fixed inset-x-2.5 top-14 max-h-[78vh] flex flex-col sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 sm:w-88 sm:max-h-[460px] rounded-2xl border border-border/80 bg-popover/98 backdrop-blur-xl text-popover-foreground shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-border/50 bg-muted/40 shrink-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm text-foreground">নোটিফিকেশন</span>
                {unreadCount > 0 && (
                  <span className="rounded-full bg-primary/15 text-primary font-bold text-[10px] px-2 py-0.5 border border-primary/20">
                    {unreadCount} নতুন
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    className="text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1 px-1.5 py-0.5 rounded-md hover:bg-muted/60 transition-colors cursor-pointer"
                  >
                    <CheckCheck className="size-3" />
                    <span>পড়া হয়েছে</span>
                  </button>
                )}
                {/* Mobile Drawer Close Button */}
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 sm:hidden cursor-pointer"
                  aria-label="বন্ধ করুন"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto divide-y divide-border/40 overscroll-contain">
              {isLoading && notifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  লোড হচ্ছে...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="size-10 rounded-full bg-muted/60 flex items-center justify-center mx-auto mb-2 text-muted-foreground">
                    <Bell className="size-5" />
                  </div>
                  <p className="text-xs font-medium text-foreground">কোনো নতুন নোটিফিকেশন নেই</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">সব খবর ও আপডেট এখানে দেখতে পাবেন।</p>
                </div>
              ) : (
                notifications.slice(0, 5).map((notif) => (
                  <button
                    key={notif.id}
                    type="button"
                    onClick={() => handleItemClick(notif)}
                    className={cn(
                      'w-full p-3 text-left transition-colors hover:bg-muted/50 flex items-start gap-2.5 cursor-pointer relative',
                      !notif.isRead && 'bg-primary/5'
                    )}
                  >
                    <div className="mt-0.5 shrink-0 size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Bell className="size-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <h4 className={cn('text-xs font-semibold truncate', !notif.isRead ? 'text-foreground font-bold' : 'text-muted-foreground')}>
                          {notif.title}
                        </h4>
                        {!notif.isRead && (
                          <span className="size-1.5 rounded-full bg-primary shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Footer: View All Link */}
            <div className="p-2 border-t border-border/50 bg-muted/20 shrink-0 text-center">
              <Link
                href={notificationsUrl}
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center justify-center gap-1 w-full py-1.5 rounded-lg text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
              >
                <span>সবগুলো নোটিফিকেশন দেখুন</span>
                <ChevronRight className="size-3.5" />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
