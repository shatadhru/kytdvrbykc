import {
  Home,
  Newspaper,
  LayoutDashboard,
  Database,
  Code2,
  BookOpen,
  Layers,
  Zap,
  ShieldCheck,
  HelpCircle,
  Video,
  GraduationCap,
  type LucideIcon,
  MessageCircleCheckIcon,
} from 'lucide-react'

export interface HeaderNavItem {
  id: string
  title: string
  href: string
  icon?: LucideIcon
  badge?: string | number
  badgeVariant?: 'default' | 'secondary' | 'outline' | 'teal'
  description?: string
  external?: boolean
  children?: HeaderNavItem[]
  requiresAuth?: boolean
  adminOnly?: boolean
}

export interface HeaderActionConfig {
  showCart?: boolean
  showThemeToggle?: boolean
  showAuth?: boolean
  showNotifications?: boolean
}

export interface HeaderAuthConfig {
  loginUrl: string
  signupUrl: string
  dashboardUrl: string
  profileUrl: string
  notificationsUrl: string
  adminUrl: string
}

export interface HeaderBrandConfig {
  showBadge?: boolean
  badgeText?: string
  badgeHref?: string
}

export interface HeaderConfig {
  brand: HeaderBrandConfig
  nav: HeaderNavItem[]
  actions: HeaderActionConfig
  auth: HeaderAuthConfig
}

export const headerConfig: HeaderConfig = {
  brand: {
    showBadge: false,
    badgeText: '',
    badgeHref: '/blog',
  },
  nav: [
    {
      id: 'home',
      title: 'হোম',
      href: '/',
      icon: Home,
    },
    {
      id: 'store',
      title: 'স্টোর',
      href: '/store',
      icon: BookOpen,
    },
    {
      id: 'blog',
      title: 'ব্লগ ও নোটিশ',
      href: '/blog',
      icon: Newspaper,
    },
    {
      id: 'platform',
      title: 'একাডেমিক',
      href: '/dashboard',
      icon: GraduationCap,
      children: [
        {
          id: 'dashboard',
          title: 'শিক্ষার্থী ড্যাশবোর্ড',
          href: '/dashboard',
          icon: LayoutDashboard,
          description: 'ব্যক্তিগত অগ্রগতি, প্রোফাইল ও সংরক্ষিত ক্লাস।',
        },
        {
          id: 'video-library',
          title: 'বিষয়ভিত্তিক ভিডিও',
          href: '/video',
          icon: Layers,
          badge: 'নতুন',
          badgeVariant: 'teal',
          description: 'সকল বিষয়ভিত্তিক আকর্ষণীয় ভিডিও লেকচার।',
        },
        {
          id: 'cms',
          title: 'এডমিন পোর্টাল',
          href: '/admin',
          icon: Database,
          badge: 'এডমিন',
          badgeVariant: 'secondary',
          external: true,
          description: 'কন্টেন্ট, ক্লাস ও শিক্ষার্থী ব্যবস্থাপনা প্যানেল।',
        },
      ],
    },



    {
      id: 'resources',
      title: 'হেল্পলাইন',
      href: '/blog',
      icon: BookOpen,
      children: [
        {
          id: 'guides',
          title: 'কিভাবে ক্লাস করবেন',
          href: '/blog',
          icon: BookOpen,
          description: 'সহজ পদ্ধতিতে পড়াশোনা ও পরীক্ষা প্রস্তুতির কৌশল।',
        },
        {
          id: 'legal',
          title: 'লাইভ চ্যাট',
          href: '/auth/terms',
          icon: MessageCircleCheckIcon,
          description: 'প্ল্যাটফর্মের নিয়মাবলী ও গোপনীয়তা রক্ষা।',
        },
        {
          id: 'support',
          title: 'প্রশ্নোত্তর ও সাহায্য',
          href: '/security',
          icon: HelpCircle,
          description: 'সাধারণ জিজ্ঞাসা ও সার্বিক কাস্টমার সহায়তা।',
        },
      ],
    },
  ],
  actions: {
    showCart: true,
    showThemeToggle: true,
    showAuth: true,
    showNotifications: true,
  },
  auth: {
    loginUrl: '/auth/login',
    signupUrl: '/auth/signup',
    dashboardUrl: '/dashboard',
    profileUrl: '/dashboard/settings',
    notificationsUrl: '/dashboard/notifications',
    adminUrl: '/admin',
  },
}

export default headerConfig
