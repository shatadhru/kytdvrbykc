import {
  WidgetBoldDuotone,
  Book2BoldDuotone,
  VideocameraBoldDuotone,
  WalletMoneyBoldDuotone,
  BellBoldDuotone,
  SettingsBoldDuotone,
  QuestionCircleBoldDuotone,
  ShieldCheckBoldDuotone,
  CompassBoldDuotone,
  UserRoundedBoldDuotone,
} from "solar-icon-set"

import { SiteConfig } from "./site"

export interface Workspace {
  id: string
  name: string
  plan: string
  initials: string
  avatar: string
}

export interface SidebarNavItem {
  id: string
  label: string
  href: string
  icon: any
  color: string
  hexColor?: string
  bgColor?: string
  badge?: string | number
  isActive?: boolean
  adminOnly?: boolean
}

export interface SidebarProject {
  id: string
  name: string
  href: string
  icon?: any
  color?: string
  hexColor?: string
  bgColor?: string
  description?: string
  adminOnly?: boolean
}

export interface DashboardStat {
  id: string
  label: string
  value: string
  change?: string
  trend?: "up" | "down" | "neutral"
  adminOnly?: boolean
}

export interface DashboardActivity {
  id: string
  title: string
  category: string
  time: string
  status: "success" | "warning" | "error" | "info"
  adminOnly?: boolean
}

export interface SidebarConfig {
  brand: {
    name: string
    subtext: string
    logoText: string
  }
  workspaces: Workspace[]
  userNavItems: SidebarNavItem[]
  adminNavItems: SidebarNavItem[]
  quickLinks: SidebarProject[]
  userStats: DashboardStat[]
  adminStats: DashboardStat[]
  recentActivities: DashboardActivity[]
}

export const sidebarConfig: SidebarConfig = {
  brand: {
    name: SiteConfig.site.name,
    subtext: "শিক্ষার্থী ক্লাসরুম",
    logoText: SiteConfig.site.logoText,
  },
  workspaces: [
    {
      id: "student",
      name: "শিক্ষার্থী পোর্টাল",
      plan: "সক্রিয় ব্যাচ",
      initials: "UTM",
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=96&h=96&dpr=2&q=80",
    },
  ],
  // Classroom Navigation in Pure Bengali with Colorful Solar Duotone Icons
  userNavItems: [
    {
      id: "overview",
      label: "ড্যাশবোর্ড",
      href: "/dashboard",
      icon: WidgetBoldDuotone,
      color: "text-blue-500",
      hexColor: "#3b82f6",
      bgColor: "bg-blue-500/15 dark:bg-blue-500/25",
      isActive: true,
    },
    {
      id: "my-courses",
      label: "আমার কোর্সসমূহ",
      href: "/dashboard/my-courses",
      icon: Book2BoldDuotone,
      color: "text-amber-500",
      hexColor: "#f59e0b",
      bgColor: "bg-amber-500/15 dark:bg-amber-500/25",
    },
    {
      id: "classroom",
      label: "ভিডিও ক্লাসরুম",
      href: "/video",
      icon: VideocameraBoldDuotone,
      color: "text-rose-500",
      hexColor: "#f43f5e",
      bgColor: "bg-rose-500/15 dark:bg-rose-500/25",
      badge: "নতুন",
    },
    {
      id: "exams",
      label: "ফ্রি এক্সাম ও প্রশ্নব্যাংক",
      href: "/exams",
      icon: Book2BoldDuotone,
      color: "text-emerald-500",
      hexColor: "#10b981",
      bgColor: "bg-emerald-500/15 dark:bg-emerald-500/25",
      badge: "ফ্রি",
    },
    {
      id: "notifications",
      label: "নোটিফিকেশন",
      href: "/dashboard/notifications",
      icon: BellBoldDuotone,
      color: "text-purple-500",
      hexColor: "#a855f7",
      bgColor: "bg-purple-500/15 dark:bg-purple-500/25",
    },
    {
      id: "profile",
      label: "শিক্ষার্থী প্রোফাইল",
      href: "/dashboard/profile",
      icon: UserRoundedBoldDuotone,
      color: "text-cyan-500",
      hexColor: "#06b6d4",
      bgColor: "bg-cyan-500/15 dark:bg-cyan-500/25",
    },
    {
      id: "support",
      label: "হেল্পলাইন ও সহায়তা",
      href: "/dashboard/support",
      icon: QuestionCircleBoldDuotone,
      color: "text-teal-500",
      hexColor: "#14b8a6",
      bgColor: "bg-teal-500/15 dark:bg-teal-500/25",
    },
  ],
  // Admin Portal Navigation
  adminNavItems: [
    {
      id: "cms-admin",
      label: "এডমিন প্যানেল",
      href: "/admin",
      icon: ShieldCheckBoldDuotone,
      color: "text-fuchsia-500",
      hexColor: "#d946ef",
      bgColor: "bg-fuchsia-500/15 dark:bg-fuchsia-500/25",
      badge: "CMS",
      adminOnly: true,
    },
    {
      id: "website-view",
      label: "মূল ওয়েবসাইট",
      href: "/",
      icon: CompassBoldDuotone,
      color: "text-orange-500",
      hexColor: "#f97316",
      bgColor: "bg-orange-500/15 dark:bg-orange-500/25",
      adminOnly: true,
    },
  ],
  quickLinks: [
    {
      id: "courses-link",
      name: "কোর্স তালিকা",
      href: "/courses",
      icon: Book2BoldDuotone,
      color: "text-emerald-500",
      hexColor: "#10b981",
      bgColor: "bg-emerald-500/15 dark:bg-emerald-500/25",
      description: "নিবন্ধিত সকল ক্লাস ও বিষয়তালিকা",
    },
    {
      id: "video-link",
      name: "ভিডিও ক্লাস",
      href: "/video",
      icon: VideocameraBoldDuotone,
      color: "text-rose-500",
      hexColor: "#f43f5e",
      bgColor: "bg-rose-500/15 dark:bg-rose-500/25",
      description: "রেকর্ডেড লেকচার ও ক্লাসসমূহ",
    },
    {
      id: "payments-link",
      name: "পেমেন্ট রসিদ",
      href: "/dashboard/payments",
      icon: WalletMoneyBoldDuotone,
      color: "text-amber-500",
      hexColor: "#f59e0b",
      bgColor: "bg-amber-500/15 dark:bg-amber-500/25",
      description: "ফি পরিশোধ ও ট্রানজাকশন ইতিহাস",
    },
    {
      id: "support-link",
      name: "সাপোর্ট হেল্পলাইন",
      href: "/dashboard/support",
      icon: QuestionCircleBoldDuotone,
      color: "text-teal-500",
      hexColor: "#14b8a6",
      bgColor: "bg-teal-500/15 dark:bg-teal-500/25",
      description: "যেকোনো সমস্যা ও জিজ্ঞাসায় সাহায্য",
    },
  ],
  userStats: [
    {
      id: "courses",
      label: "নিবন্ধিত কোর্স",
      value: "৪ টি কোর্স",
      change: "এস এস সি ও এইচ এস সি ব্যাচ",
      trend: "up",
    },
    {
      id: "classes",
      label: "ভিডিও ক্লাস সংখ্যা",
      value: "৬২২+ টি",
      change: "নিয়মিত আপডেট",
      trend: "up",
    },
    {
      id: "payments",
      label: "পেমেন্ট স্ট্যাটাস",
      value: "পরিশোধিত",
      change: "ভর্তি সক্রিয়",
      trend: "up",
    },
  ],
  adminStats: [
    {
      id: "sessions",
      label: "মোট শিক্ষার্থী",
      value: "৫,৫৪,০০০+",
      change: "সক্রিয় শিক্ষার্থীবৃন্দ",
      trend: "up",
      adminOnly: true,
    },
    {
      id: "classes-total",
      label: "মোট আপলোড করা ক্লাস",
      value: "৬২২ টি লেকচার",
      change: "সকল বিষয়ভিত্তিক",
      trend: "up",
      adminOnly: true,
    },
    {
      id: "system-status",
      label: "সিস্টেম ও সার্ভার",
      value: "সক্রিয়",
      change: "১০০% আপটাইম",
      trend: "up",
      adminOnly: true,
    },
  ],
  recentActivities: [],
}

export default sidebarConfig
