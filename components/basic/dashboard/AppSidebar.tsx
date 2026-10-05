"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  MoreHorizontalIcon,
} from "lucide-react"

import {
  UserRoundedBoldDuotone,
  SettingsBoldDuotone,
  BellBoldDuotone,
  Logout2BoldDuotone,
  ShieldCheckBoldDuotone,
} from "solar-icon-set"

import { sidebarConfig, type Workspace } from "@/config/sidebar"
import { authClient } from "@/payload/auth/client"
import { Logo } from "@/components/ui/Logo"

function BrandMark({ className, isCollapsed }: { className?: string; isCollapsed?: boolean }) {
  return (
    <div className={cn("flex items-center px-2 py-1", isCollapsed && "justify-center px-0", className)}>
      <Logo href="/dashboard" variant={isCollapsed ? "icon" : "full"} size="md" />
    </div>
  )
}

function UserNav({
  isCollapsed,
  unreadCount = 0,
}: {
  isCollapsed: boolean
  unreadCount?: number
}) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      {!isCollapsed && <SidebarGroupLabel>ক্লাসরুম মেনু</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu className={cn(isCollapsed && "items-center gap-1.5")}>
          {sidebarConfig.userNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            const isNotifications = item.id === "notifications"
            const itemBadge = isNotifications
              ? unreadCount > 0
                ? unreadCount > 99
                  ? "99+"
                  : unreadCount
                : null
              : item.badge

            return (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  render={<Link href={item.href} />}
                  isActive={isActive}
                  tooltip={item.label}
                  className={cn(
                    "group/nav transition-colors gap-2.5",
                    isCollapsed && "justify-center px-0 size-9 relative"
                  )}
                >
                  <div
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover/nav:scale-110",
                      item.bgColor || "bg-primary/15",
                      item.color
                    )}
                    style={item.hexColor ? { color: item.hexColor } : undefined}
                  >
                    <Icon
                      size={18}
                      color={item.hexColor || "currentColor"}
                      style={item.hexColor ? { color: item.hexColor } : undefined}
                      className={cn("shrink-0 !size-[18px]", item.color)}
                      aria-hidden="true"
                    />
                  </div>

                  {!isCollapsed && <span className="truncate font-medium">{item.label}</span>}
                  {!isCollapsed && itemBadge ? (
                    <SidebarMenuBadge
                      className={cn(
                        isNotifications &&
                          "bg-rose-500/15 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 font-semibold"
                      )}
                    >
                      {itemBadge}
                    </SidebarMenuBadge>
                  ) : null}

                  {isCollapsed && isNotifications && unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex size-2 rounded-full bg-rose-500 animate-in zoom-in" />
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

function AdminNav({ isCollapsed }: { isCollapsed: boolean }) {
  const pathname = usePathname()

  return (
    <SidebarGroup>
      {!isCollapsed ? (
        <SidebarGroupLabel className="text-fuchsia-600 dark:text-fuchsia-400 font-semibold flex items-center gap-1.5">
          <ShieldCheckBoldDuotone size={16} color="#d946ef" style={{ color: "#d946ef" }} className="text-fuchsia-500 !size-4" />
          <span>এডমিন পোর্টাল</span>
        </SidebarGroupLabel>
      ) : (
        <SidebarSeparator className="my-1 mx-0" />
      )}
      <SidebarGroupContent>
        <SidebarMenu className={cn(isCollapsed && "items-center gap-1.5")}>
          {sidebarConfig.adminNavItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  render={<Link href={item.href} />}
                  isActive={isActive}
                  tooltip={item.label}
                  className={cn(
                    "group/nav transition-colors gap-2.5",
                    isCollapsed && "justify-center px-0 size-9"
                  )}
                >
                  <div
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover/nav:scale-110",
                      item.bgColor || "bg-primary/15",
                      item.color
                    )}
                    style={item.hexColor ? { color: item.hexColor } : undefined}
                  >
                    <Icon
                      size={18}
                      color={item.hexColor || "currentColor"}
                      style={item.hexColor ? { color: item.hexColor } : undefined}
                      className={cn("shrink-0 !size-[18px]", item.color)}
                      aria-hidden="true"
                    />
                  </div>
                  {!isCollapsed && <span className="truncate font-medium">{item.label}</span>}
                  {!isCollapsed && item.badge ? (
                    <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                  ) : null}
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

function QuickLinksNav({ isAdmin, isCollapsed }: { isAdmin: boolean; isCollapsed: boolean }) {
  const links = sidebarConfig.quickLinks.filter((item) => !item.adminOnly || isAdmin)

  return (
    <SidebarGroup>
      {!isCollapsed && <SidebarGroupLabel>দ্রুত লিঙ্ক</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu className={cn(isCollapsed && "items-center gap-1.5")}>
          {links.map((item) => {
            const Icon = item.icon

            return (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  render={<Link href={item.href} />}
                  tooltip={item.name}
                  className={cn(
                    "group/nav transition-colors gap-2.5",
                    isCollapsed && "justify-center px-0 size-9"
                  )}
                >
                  <div
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover/nav:scale-110",
                      item.bgColor || "bg-primary/15",
                      item.color
                    )}
                    style={item.hexColor ? { color: item.hexColor } : undefined}
                  >
                    {Icon && (
                      <Icon
                        size={18}
                        color={item.hexColor || "currentColor"}
                        style={item.hexColor ? { color: item.hexColor } : undefined}
                        className={cn("shrink-0 !size-[18px]", item.color || "text-primary")}
                        aria-hidden="true"
                      />
                    )}
                  </div>
                  {!isCollapsed && <span className="truncate font-medium">{item.name}</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

function AccountMenu({
  isAdmin,
  isCollapsed,
}: {
  isAdmin: boolean
  isCollapsed: boolean
}) {
  const { data: session } = authClient.useSession()
  const router = useRouter()

  const userName = session?.user?.name || "শিক্ষার্থী"
  const userEmail = session?.user?.email || ""
  const userInitials =
    userName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "UTM"

  const handleSignOut = async () => {
    try {
      await authClient.signOut()
      router.push("/auth/login")
      router.refresh()
    } catch {
      router.push("/auth/login")
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className={cn(
                  "aria-expanded:bg-sidebar-accent aria-expanded:text-sidebar-accent-foreground",
                  isCollapsed && "justify-center p-0 size-9"
                )}
              />
            }
          >
            <Avatar size="sm">
              <AvatarImage src={session?.user?.image || undefined} alt={userName} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <>
                <span className="grid min-w-0 flex-1 text-left leading-tight">
                  <span className="truncate text-sm font-medium flex items-center gap-1.5">
                    {userName}
                    {isAdmin ? (
                      <span className="rounded bg-primary/10 px-1 py-0.2 text-[10px] font-semibold text-primary">
                        এডমিন
                      </span>
                    ) : null}
                  </span>
                  <span className="text-sidebar-foreground/70 truncate text-xs">
                    {userEmail}
                  </span>
                </span>
                <MoreHorizontalIcon className="ml-auto opacity-60 size-4 shrink-0" aria-hidden="true" />
              </>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent side={isCollapsed ? "right" : "top"} align={isCollapsed ? "end" : "start"} className="w-52">
            <DropdownMenuGroup>
              <DropdownMenuLabel>{userName}</DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push("/dashboard/settings")} className="cursor-pointer gap-2.5">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-cyan-500/15" style={{ color: "#06b6d4" }}>
                  <UserRoundedBoldDuotone size={15} color="#06b6d4" style={{ color: "#06b6d4" }} className="text-cyan-500" aria-hidden="true" />
                </div>
                <span>প্রোফাইল ও সেটিংস</span>
              </DropdownMenuItem>
              {isAdmin ? (
                <DropdownMenuItem onClick={() => router.push("/admin")} className="cursor-pointer gap-2.5 text-primary font-medium">
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-fuchsia-500/15" style={{ color: "#d946ef" }}>
                    <ShieldCheckBoldDuotone size={15} color="#d946ef" style={{ color: "#d946ef" }} className="text-fuchsia-500" aria-hidden="true" />
                  </div>
                  <span>এডমিন প্যানেল</span>
                </DropdownMenuItem>
              ) : null}
              <DropdownMenuItem onClick={() => router.push("/dashboard/notifications")} className="cursor-pointer gap-2.5">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-purple-500/15" style={{ color: "#a855f7" }}>
                  <BellBoldDuotone size={15} color="#a855f7" style={{ color: "#a855f7" }} className="text-purple-500" aria-hidden="true" />
                </div>
                <span>নোটিফিকেশন</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer gap-2.5 text-destructive focus:bg-destructive/10">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-md bg-rose-500/15" style={{ color: "#f43f5e" }}>
                  <Logout2BoldDuotone size={15} color="#f43f5e" style={{ color: "#f43f5e" }} className="text-rose-500" aria-hidden="true" />
                </div>
                <span>লগআউট</span>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

export function AppSidebar({
  selectedWorkspace: _selectedWorkspace,
  onSelectWorkspace: _onSelectWorkspace,
  unreadCount = 0,
}: {
  selectedWorkspace?: Workspace
  onSelectWorkspace?: (workspace: Workspace) => void
  unreadCount?: number
}) {
  const { data: session } = authClient.useSession()
  const { state, isMobile } = useSidebar()
  const isAdmin = (session?.user as { role?: string } | undefined)?.role === "admin"
  const isCollapsed = state === "collapsed" && !isMobile

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader>
        <BrandMark isCollapsed={isCollapsed} />
      </SidebarHeader>

      <SidebarContent role="navigation" aria-label="Main Navigation">
        <UserNav isCollapsed={isCollapsed} unreadCount={unreadCount} />
        {isAdmin ? <AdminNav isCollapsed={isCollapsed} /> : null}
        <QuickLinksNav isAdmin={isAdmin} isCollapsed={isCollapsed} />
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator className="mx-0" />
        <AccountMenu isAdmin={isAdmin} isCollapsed={isCollapsed} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

export default AppSidebar
