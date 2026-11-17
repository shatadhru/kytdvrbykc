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
  Users,
  Headphones,
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
      id: 'courses',
      title: 'কোর্সসমূহ',
      href: '/courses',
      icon: GraduationCap,
      badge: 'জনপ্রিয়',
      badgeVariant: 'teal',
    },
    {
      id: 'teachers',
      title: 'শিক্ষকবৃন্দ',
      href: '/teachers',
      icon: Users,
    },
    {
      id: 'about',
      title: 'আমাদের সম্পর্কে',
      href: '/about',
      icon: HelpCircle,
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
    profileUrl: '/dashboard/profile',
    notificationsUrl: '/dashboard/notifications',
    adminUrl: '/admin',
  },
}

export default headerConfig
