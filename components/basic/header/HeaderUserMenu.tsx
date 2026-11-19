'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authClient } from '@/payload/auth/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { buttonVariants } from '@/components/ui/button'
import {
  LayoutDashboard,
  User,
  Bell,
  Database,
  LogOut,
  LogIn,
  ArrowRight,
  Loader2,
  BookOpen,
  Receipt,
  FileText,
  Activity,
  HelpCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { HeaderAuthConfig } from '@/config/header'

export interface HeaderUserMenuProps {
  authConfig?: HeaderAuthConfig
  className?: string
  showCta?: boolean
}

export function HeaderUserMenu({
  authConfig = {
    loginUrl: '/auth/login',
    signupUrl: '/auth/signup',
    dashboardUrl: '/dashboard',
    profileUrl: '/dashboard/profile',
    notificationsUrl: '/dashboard/notifications',
    adminUrl: '/admin',
  },
  className,
  showCta = true,
}: HeaderUserMenuProps) {
  const { data: session, isPending } = authClient.useSession()
  const router = useRouter()
  const [loadingAction, setLoadingAction] = React.useState<'signin' | 'signup' | null>(null)

  const handleAuthClick = (type: 'signin' | 'signup', url: string) => {
    setLoadingAction(type)
    router.push(url)
    setTimeout(() => {
      setLoadingAction(null)
    }, 3500)
  }

  const user = session?.user
  const isAdmin = (user as { role?: string } | undefined)?.role === 'admin'

  // Loading skeleton state
  if (isPending) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Skeleton className="size-7.5 rounded-full" />
      </div>
    )
  }

  // Unauthenticated: Sign In & Get Started
  if (!user) {
    return (
      <div className={cn('flex items-center gap-1.5 sm:gap-2', className)}>
        <button
          type="button"
          onClick={() => handleAuthClick('signin', authConfig.loginUrl)}
          disabled={loadingAction !== null}
          className={cn(
            buttonVariants({ variant: 'default', size: 'xs' }),
            'h-7 px-2.5 text-xs font-semibold cursor-pointer'
          )}
        >
          {loadingAction === 'signin' ? (
            <Loader2 className="size-3.5 mr-1 animate-spin" />
          ) : (
            <LogIn className="size-3.5 mr-1" />
          )}
          <span>লগইন</span>
        </button>
        {showCta && (
          <button
            type="button"
            onClick={() => handleAuthClick('signup', authConfig.signupUrl)}
            disabled={loadingAction !== null}
            className={cn(
              buttonVariants({ variant: 'outline', size: 'xs' }),
              'hidden sm:inline-flex h-7 px-2.5 text-xs font-semibold cursor-pointer'
            )}
          >
            {loadingAction === 'signup' ? (
              <Loader2 className="size-3 mr-1 animate-spin" />
            ) : null}
            <span>শুরু করুন</span>
            {loadingAction !== 'signup' && <ArrowRight className="size-3 ml-1" />}
          </button>
        )}
      </div>
    )
  }

  // Authenticated User Avatar and Dropdown
  const userName = user.name || 'User'
  const userEmail = user.email || ''
  const userImage = user.image || undefined
  const userInitials =
    userName
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'UTM'

  const handleSignOut = async () => {
    try {
      await authClient.signOut()
      router.push(authConfig.loginUrl)
      router.refresh()
    } catch (err) {
      console.error('Sign out error:', err)
      router.push(authConfig.loginUrl)
    }
  }

  return (
    <div className={cn('relative flex items-center gap-1.5 sm:gap-2', className)}>
      {/* Mobile-Only Dashboard Shortcut Button after login */}
      <Link
        href={authConfig.dashboardUrl || '/dashboard'}
        className={cn(
          buttonVariants({ variant: 'outline', size: 'xs' }),
          'inline-flex md:hidden h-7 px-2 text-xs font-semibold items-center gap-1 border-primary/30 text-primary bg-primary/5 hover:bg-primary/10'
        )}
      >
        <LayoutDashboard className="size-3.5" />
        <span>ড্যাশবোর্ড</span>
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              className="relative inline-flex items-center justify-center rounded-full outline-hidden ring-offset-background transition-all hover:ring-2 hover:ring-primary/30 focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
              aria-label={`ব্যবহারকারী মেনু ${userName}`}
            />
          }
        >
          <Avatar className="size-7.5 border border-border/70 shadow-xs">
            <AvatarImage src={userImage} alt={userName} />
            <AvatarFallback className="bg-primary/10 text-primary text-[11px] font-bold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          side="bottom"
          sideOffset={8}
          className="w-64 p-1.5 shadow-xl border border-border/70 bg-popover/98 backdrop-blur-md rounded-2xl"
        >
          {/* User profile card in dropdown */}
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-muted/50 mb-1">
            <Avatar className="size-8.5 shrink-0 border border-border/50">
              <AvatarImage src={userImage} alt={userName} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-foreground truncate">
                  {userName}
                </span>
                {isAdmin ? (
                  <span className="shrink-0 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-primary/10 text-primary border border-primary/20">
                    এডমিন
                  </span>
                ) : (
                  <span className="shrink-0 text-[9px] font-medium px-1.5 py-0.2 rounded-full bg-muted text-muted-foreground">
                    শিক্ষার্থী
                  </span>
                )}
              </div>
              <span className="text-[11px] text-muted-foreground truncate">
                {userEmail}
              </span>
            </div>
          </div>

          <DropdownMenuSeparator className="my-1" />

          {/* Quick Links & Essentials (Requirement 20) */}
          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => router.push(authConfig.dashboardUrl)}
              className="gap-2.5 text-xs py-1.5 font-medium cursor-pointer rounded-lg"
            >
              <LayoutDashboard className="size-4 text-primary" />
              <span>ড্যাশবোর্ড</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => router.push('/dashboard/my-courses')}
              className="gap-2.5 text-xs py-1.5 font-medium cursor-pointer rounded-lg"
            >
              <BookOpen className="size-4 text-emerald-600 dark:text-emerald-400" />
              <span>আমার কোর্সসমূহ</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => router.push('/dashboard/orders')}
              className="gap-2.5 text-xs py-1.5 font-medium cursor-pointer rounded-lg"
            >
              <Receipt className="size-4 text-sky-600 dark:text-sky-400" />
              <span>পেমেন্ট রসিদ ও অর্ডার</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => router.push('/dashboard/files')}
              className="gap-2.5 text-xs py-1.5 font-medium cursor-pointer rounded-lg"
            >
              <FileText className="size-4 text-amber-600 dark:text-amber-400" />
              <span>ডাউনলোডকৃত ফাইল ও নোট</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => router.push('/dashboard/activity')}
              className="gap-2.5 text-xs py-1.5 font-medium cursor-pointer rounded-lg"
            >
              <Activity className="size-4 text-purple-600 dark:text-purple-400" />
              <span>অগ্রগতি ও পরিসংখ্যান</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="my-1" />

          <DropdownMenuGroup>
            <DropdownMenuItem
              onClick={() => router.push(authConfig.profileUrl)}
              className="gap-2.5 text-xs py-1.5 font-medium cursor-pointer rounded-lg"
            >
              <User className="size-4 text-muted-foreground" />
              <span>প্রোফাইল সেটিংস</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => router.push(authConfig.notificationsUrl)}
              className="gap-2.5 text-xs py-1.5 font-medium cursor-pointer rounded-lg"
            >
              <Bell className="size-4 text-muted-foreground" />
              <span>নোটিফিকেশন</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => router.push('/contact')}
              className="gap-2.5 text-xs py-1.5 font-medium cursor-pointer rounded-lg"
            >
              <HelpCircle className="size-4 text-muted-foreground" />
              <span>হেল্পলাইন ও সাপোর্ট</span>
            </DropdownMenuItem>

            {isAdmin && (
              <DropdownMenuItem
                onClick={() => window.open(authConfig.adminUrl, '_blank')}
                className="gap-2.5 text-xs py-1.5 font-semibold text-primary cursor-pointer rounded-lg"
              >
                <Database className="size-4 text-primary" />
                <span>এডমিন প্যানেল</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="my-1" />

          {/* Sign Out */}
          <DropdownMenuGroup>
            <DropdownMenuItem
              variant="destructive"
              onClick={handleSignOut}
              className="gap-2.5 text-xs py-1.5 font-semibold text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer rounded-lg"
            >
              <LogOut className="size-4" />
              <span>লগআউট</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default HeaderUserMenu
