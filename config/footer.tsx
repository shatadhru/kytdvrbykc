import React from 'react'
import {
  BookOpen,
  Code2,
  Database,
  FileText,
  Globe,
  HelpCircle,
  Layers,
  LayoutDashboard,
  Lock,
  Mail,
  Newspaper,
  Shield,
  Zap,
  GraduationCap,
  Users,
  Headphones,
} from 'lucide-react'

export interface FooterMenuItem {
  title: string
  href: string
  icon?: any
  badge?: string
  external?: boolean
}

export interface FooterMenuColumn {
  title: string
  items: FooterMenuItem[]
}

export interface SocialLinkConfig {
  platform: string
  url: string
  name: string
  enabled?: boolean
}

export interface FooterConfig {
  columns: FooterMenuColumn[]
  socials: SocialLinkConfig[]
}

export const footerConfig: FooterConfig = {
  columns: [
    {
      title: 'শিক্ষা ও পাঠক্রম',
      items: [
        { title: 'হোম পেজ', href: '/', icon: Globe },
        { title: 'কোর্সসমূহ', href: '/courses', icon: GraduationCap, badge: 'নতুন' },
        { title: 'ভিডিও ক্লাস', href: '/video', icon: Layers, badge: 'জনপ্রিয়' },
        { title: 'আমাদের শিক্ষকবৃন্দ', href: '/teachers', icon: GraduationCap, badge: 'ফ্যাকাল্টি' },
        { title: 'কো-অর্ডিনেটর টিম', href: '/coordinators', icon: Headphones },
        { title: 'শিক্ষার্থী ড্যাশবোর্ড', href: '/dashboard', icon: LayoutDashboard },
        { title: 'এডমিন পোর্টাল', href: '/admin', icon: Database, badge: 'CMS', external: true },
      ],
    },
    {
      title: 'রিসোর্স ও পরিচিতি',
      items: [
        { title: 'আমাদের সম্পর্কে', href: '/about', icon: BookOpen },
        { title: 'ব্লগ ও শিক্ষা তথ্য', href: '/blog', icon: Newspaper, badge: 'নতুন' },
        { title: 'স্টাডি গাইডলাইন', href: '/blog', icon: BookOpen },
        { title: 'পরীক্ষা প্রস্তুতি টিপস', href: '/blog', icon: Zap },
        { title: 'ইউনিক টিচিং মেথড', href: '/about', icon: GraduationCap },
      ],
    },
    {
      title: 'নীতিমালা ও সহায়তা',
      items: [
        { title: 'গোপনীয়তা নীতিমালা', href: '/auth/privacy', icon: Shield },
        { title: 'ব্যবহারের শর্তাবলী', href: '/auth/terms', icon: FileText },
        { title: 'কুকি পলিসি', href: '/cookies', icon: Lock },
        { title: 'সহায়তা ও FAQ', href: '/security', icon: HelpCircle },
      ],
    },
  ],
  socials: [
    { platform: 'youtube', url: 'https://youtube.com', name: 'YouTube', enabled: true },
    { platform: 'facebook', url: 'https://facebook.com', name: 'Facebook', enabled: true },
    { platform: 'x', url: 'https://x.com', name: 'X / Twitter', enabled: true },
    { platform: 'linkedin', url: 'https://linkedin.com', name: 'LinkedIn', enabled: true },
  ],
}

export default footerConfig
