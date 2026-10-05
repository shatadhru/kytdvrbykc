import React from 'react'
import '@/components/style/globals.css'
import Providor from '@/payload/providors'
import NoticeBannerSlot from '@/components/basic/banner/NoticeBannerSlot'
import CookieConsentSlot from '@/components/basic/cookies/CookieConsentSlot'

import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import localFont from 'next/font/local'
import { SiteConfig } from '@/config/site'

const googleSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-google-sans',
  display: 'swap',
})

const solaimanLipi = localFont({
  src: [
    {
      path: '../../public/fonts/solaimanlipi-regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/solaimanlipi-bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-solaiman-lipi',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: SiteConfig.seo.title.default,
    template: SiteConfig.seo.title.template,
  },
  description: SiteConfig.seo.description,
  keywords: SiteConfig.seo.keywords,
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="bn" suppressHydrationWarning className={`${googleSans.variable} ${solaimanLipi.variable}`}>
      <body className={`${solaimanLipi.className} min-h-screen overflow-x-hidden antialiased font-sans`}>
        <main className="min-h-screen overflow-x-hidden flex flex-col">
          <Providor>
            <NoticeBannerSlot />
            {children}
            <CookieConsentSlot />
          </Providor>
        </main>
      </body>
    </html>
  )
}

