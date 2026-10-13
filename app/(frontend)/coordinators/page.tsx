import React from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import Header from '@/components/basic/header'
import { Footer } from '@/components/basic/footer'
import { SiteConfig, getPageTitle } from '@/config/site'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { SocialIcon } from 'react-social-icons'
import {
  Headphones,
  Users,
  Clock,
  MessageSquare,
  ShieldCheck,
  Mail,
  Phone,
  HelpCircle,
  CalendarCheck,
  ArrowRight,
  Send,
  Zap,
} from 'lucide-react'
import type { Coordinator as CoordinatorType } from '@/payload/payload-types'

export const revalidate = 60 // ISR revalidation every 60s

export async function generateMetadata(): Promise<Metadata> {
  const title = 'আমাদের কো-অর্ডিনেটরবৃন্দ | Academic Coordinators'
  const description =
    'ইউনিক টিচিং মেথডের একাডেমিক কো-অর্ডিনেটর ও শিক্ষার্থী সাপোর্ট টিম। ক্লাস শিডিউল, পড়াশোনার ডাউট সলভ এবং সার্বিক তত্ত্বাবধানে আমরা আপনার পাশে।'
  const canonicalUrl = `${SiteConfig.site.url}/coordinators`

  return {
    title: getPageTitle(title),
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: getPageTitle(title),
      description,
      url: canonicalUrl,
      siteName: SiteConfig.site.name,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: getPageTitle(title),
      description,
    },
  }
}

function resolveCoordinatorImageUrl(image: CoordinatorType['image']): string | null {
  if (!image) return null
  if (typeof image === 'string') {
    if (image.startsWith('http://') || image.startsWith('https://')) return image
    return null
  }
  if (typeof image === 'object') {
    return image.url || image.cloudinary?.secure_url || null
  }
  return null
}

export default async function CoordinatorsPage() {
  const payload = await getPayload({ config })

  // Query active coordinators from Payload CMS sorted by order
  let coordinators: CoordinatorType[] = []
  try {
    const result = await payload.find({
      collection: 'coordinators',
      where: {
        isActive: { equals: true },
      },
      sort: 'order',
      limit: 100,
    })
    coordinators = result.docs as CoordinatorType[]
  } catch (error) {
    console.error('Failed to fetch coordinators from Payload:', error)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-primary/5 via-background to-background py-14 sm:py-20 lg:py-24">
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute right-1/4 top-10 size-80 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute left-1/4 bottom-0 size-72 rounded-full bg-blue-500/10 blur-3xl" />
          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="mb-4 flex justify-center">
              <Badge
                variant="outline"
                className="gap-1.5 rounded-full border-primary/30 bg-primary/10 px-3.5 py-1 text-xs sm:text-sm font-medium text-primary shadow-xs"
              >
                <Headphones className="size-3.5" />
                <span>একাডেমিক সাপোর্ট ও কো-অর্ডিনেশন</span>
              </Badge>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              আপনার পড়াশোনার সার্বক্ষণিক সহযোগিতায়{' '}
              <span className="text-primary block sm:inline">আমাদের কো-অর্ডিনেটর টিম</span>
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7 lg:text-lg">
              ক্লাসের রুটিন নির্ধারণ, ব্যাচ মনিটরিং, হোমওয়ার্ক মূল্যায়ন থেকে শুরু করে পড়াশোনার যেকোনো
              সমস্যায় আমাদের কো-অর্ডিনেটররা সবসময় শিক্ষার্থীদের পাশে প্রস্তুত।
            </p>

            {/* Support Highlights */}
            <div className="mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-3 sm:mt-10 sm:grid-cols-4 sm:gap-4">
              <div className="rounded-xl border border-border/60 bg-card/60 p-3.5 backdrop-blur-xs sm:p-4">
                <div className="flex items-center justify-center gap-1.5 text-primary">
                  <Clock className="size-4" />
                  <span className="text-base font-bold sm:text-lg text-card-foreground">
                    সকাল ৯টা - রাত ১০টা
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">সরাসরি সাপোর্ট টাইম</p>
              </div>

              <div className="rounded-xl border border-border/60 bg-card/60 p-3.5 backdrop-blur-xs sm:p-4">
                <div className="flex items-center justify-center gap-1.5 text-primary">
                  <CalendarCheck className="size-4" />
                  <span className="text-base font-bold sm:text-lg text-card-foreground">১০০%</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">রুটিন সমন্বয়</p>
              </div>

              <div className="rounded-xl border border-border/60 bg-card/60 p-3.5 backdrop-blur-xs sm:p-4">
                <div className="flex items-center justify-center gap-1.5 text-primary">
                  <MessageSquare className="size-4" />
                  <span className="text-base font-bold sm:text-lg text-card-foreground">তাৎক্ষণিক</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">ডাউট ও প্রশ্ন সমাধান</p>
              </div>

              <div className="rounded-xl border border-border/60 bg-card/60 p-3.5 backdrop-blur-xs sm:p-4">
                <div className="flex items-center justify-center gap-1.5 text-primary">
                  <ShieldCheck className="size-4" />
                  <span className="text-base font-bold sm:text-lg text-card-foreground">নিরাপদ</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">ব্যক্তিগত মেন্টরিং</p>
              </div>
            </div>
          </div>
        </section>

        {/* Coordinators Grid Section */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  সকল কো-অর্ডিনেটর ও সাপোর্ট মেম্বার
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  আপনার নির্দিষ্ট ব্যাচ বা বিষয়ে সহায়তার জন্য সংশ্লিষ্ট কো-অর্ডিনেটরের সাথে যোগাযোগ করুন।
                </p>
              </div>

              <div className="text-xs text-muted-foreground">
                মোট কো-অর্ডিনেটর:{' '}
                <span className="font-semibold text-foreground">
                  {coordinators.length > 0 ? coordinators.length : 1} জন
                </span>
              </div>
            </div>

            {coordinators.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                {coordinators.map((coordinator) => {
                  const imageUrl = resolveCoordinatorImageUrl(coordinator.image)

                  return (
                    <Card
                      key={coordinator.id}
                      className="group flex flex-col overflow-hidden rounded-2xl border-border/70 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
                    >
                      {/* Image Area */}
                      <div className="relative aspect-4/3 w-full overflow-hidden bg-muted/30">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={coordinator.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-teal-500/10 via-muted to-primary/5 text-primary">
                            <div className="flex size-20 items-center justify-center rounded-full bg-primary/20 text-3xl font-bold">
                              {coordinator.name.charAt(0)}
                            </div>
                            <span className="mt-2 text-xs text-muted-foreground">
                              ছবি সংযুক্ত নেই
                            </span>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                        {/* Status badge */}
                        <div className="absolute top-3 right-3">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-2.5 py-0.5 text-[10px] font-medium text-white shadow-xs backdrop-blur-xs">
                            <span className="size-1.5 rounded-full bg-white animate-pulse" />
                            সক্রিয় সহায়তায়
                          </span>
                        </div>

                        {/* Top Designation */}
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                          {coordinator.designation && (
                            <Badge className="bg-primary/90 text-primary-foreground text-[11px] backdrop-blur-xs font-medium">
                              {coordinator.designation}
                            </Badge>
                          )}
                        </div>

                        {/* Bottom Name on Image */}
                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <h3 className="text-lg font-bold tracking-tight drop-shadow-xs">
                            {coordinator.name}
                          </h3>
                        </div>
                      </div>

                      {/* Content Area */}
                      <CardContent className="flex flex-1 flex-col p-5">
                        {/* Bio / Responsibilities */}
                        {coordinator.bio ? (
                          <p className="line-clamp-4 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                            {coordinator.bio}
                          </p>
                        ) : (
                          <p className="text-xs italic text-muted-foreground">
                            ইউনিক টিচিং মেথডের একাডেমিক কো-অর্ডিনেটর ও শিক্ষার্থী সাপোর্ট টিম মেম্বার।
                          </p>
                        )}

                        <div className="mt-auto pt-5">
                          {/* Direct Contact buttons */}
                          <div className="space-y-1.5 border-t border-border/50 pt-3 text-xs text-muted-foreground">
                            {coordinator.email && (
                              <a
                                href={`mailto:${coordinator.email}`}
                                className="flex items-center gap-2 truncate transition-colors hover:text-primary"
                              >
                                <Mail className="size-3.5 shrink-0 text-primary" />
                                <span className="truncate">{coordinator.email}</span>
                              </a>
                            )}
                            {coordinator.phone && (
                              <a
                                href={`tel:${coordinator.phone}`}
                                className="flex items-center gap-2 transition-colors hover:text-primary"
                              >
                                <Phone className="size-3.5 shrink-0 text-primary" />
                                <span>{coordinator.phone}</span>
                              </a>
                            )}
                          </div>

                          {/* Social links & CTA */}
                          <div className="mt-4 flex items-center justify-between gap-2">
                            {coordinator.socialLinks && coordinator.socialLinks.length > 0 ? (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {coordinator.socialLinks.map((item, idx) => (
                                  <SocialIcon
                                    key={idx}
                                    url={item.url}
                                    network={item.platform}
                                    style={{ height: 28, width: 28 }}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  />
                                ))}
                              </div>
                            ) : (
                              <div className="text-[11px] text-muted-foreground">
                                ইউটিএম কো-অর্ডিনেশন
                              </div>
                            )}

                            {coordinator.email ? (
                              <Button
                                asChild
                                size="sm"
                                variant="outline"
                                className="gap-1 rounded-lg text-xs"
                              >
                                <a href={`mailto:${coordinator.email}`}>
                                  ইমেইল পাঠান
                                  <Send className="size-3" />
                                </a>
                              </Button>
                            ) : (
                              <Button
                                asChild
                                size="sm"
                                variant="outline"
                                className="gap-1 rounded-lg text-xs"
                              >
                                <Link href="/auth/terms">
                                  সহায়তা নিন
                                  <ArrowRight className="size-3" />
                                </Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              /* Fallback Support Overview Card if CMS has no records yet */
              <Card className="mx-auto max-w-4xl overflow-hidden rounded-2xl border-border bg-card p-0 shadow-sm">
                <CardContent className="p-6 sm:p-8">
                  <div className="flex flex-col items-center text-center">
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Headphones className="size-7" />
                    </div>
                    <Badge className="mt-4 rounded-full bg-primary text-xs">
                      সরাসরি হেল্পলাইন ও সাপোর্ট ডেস্ক
                    </Badge>
                    <h3 className="mt-3 text-2xl font-bold text-card-foreground">
                      কেন্দ্রীয় কো-অর্ডিনেশন ও স্টুডেন্ট হেল্পডেস্ক
                    </h3>
                    <p className="mt-3 max-w-xl text-xs leading-relaxed text-muted-foreground sm:text-sm">
                      আমাদের ডেডিকেটেড কো-অর্ডিনেটর টিম প্রতিটি ব্যাচের ক্লাস শিডিউল, ভিডিও অ্যাক্সেস এবং
                      শিক্ষার্থীদের পাঠ্যক্রম সংক্রান্ত যেকোনো তথ্যে সার্বক্ষণিক সহায়তা প্রদান করে থাকে।
                    </p>

                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                      <Button asChild size="sm" className="rounded-lg text-xs">
                        <Link href="/dashboard">ড্যাশবোর্ডে সাপোর্ট নিন</Link>
                      </Button>
                      <Button asChild size="sm" variant="outline" className="rounded-lg text-xs">
                        <Link href="/video">ক্লাস দেখুন</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* How Coordinators Help Section */}
        <section className="border-t border-border/40 bg-muted/20 py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="outline" className="rounded-full text-xs text-primary border-primary/20 bg-primary/5">
                কীভাবে সহায়তা পাবেন?
              </Badge>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                কো-অর্ডিনেটররা আপনার পড়াশোনায় যেভাবে সহায়তা করেন
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                অনলাইন শিক্ষাকে শতভাগ কার্যকর ও শৃঙ্খলাবদ্ধ রাখতে আমাদের সমন্বয় প্রক্রিয়া।
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
              <div className="rounded-2xl border border-border/60 bg-card p-5 sm:p-6 shadow-2xs">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <CalendarCheck className="size-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">
                  ১. ব্যাচ রুটিন ও ক্লাস নোটিশ
                </h3>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                  কোন দিন কোন ক্লাস হবে এবং নতুন কোনো নোটিশ থাকলে তা সময়মতো প্রতিটি শিক্ষার্থীকে জানিয়ে
                  দেওয়া হয়।
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-card p-5 sm:p-6 shadow-2xs">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <MessageSquare className="size-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">
                  ২. শিক্ষক-শিক্ষার্থী সেতুবন্ধন
                </h3>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                  ক্লাসে কোনো টপিক বুঝতে সমস্যা হলে শিক্ষকের সাথে যোগাযোগ করিয়ে সমাধান নিশ্চিত করা হয়।
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-card p-5 sm:p-6 shadow-2xs">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Zap className="size-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">
                  ৩. টেকনিক্যাল ও অ্যাকাউন্ট সহায়তা
                </h3>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                  ভিডিও লোডিং, অ্যাকাউন্ট লগইন বা ক্লাস ম্যাটেরিয়াল ডাউনলোড সংক্রান্ত যেকোনো টেকনিক্যাল সমস্যা
                  দ্রুত সমাধান করা হয়।
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-700 via-primary to-emerald-700 px-6 py-10 text-white shadow-xl sm:px-12 sm:py-14 text-center">
              <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-2xl" />
              <div className="pointer-events-none absolute -left-16 -bottom-16 size-64 rounded-full bg-black/10 blur-2xl" />

              <h2 className="text-2xl font-bold sm:text-4xl">
                পড়াশোনায় কোনো সমস্যা? আমরা প্রস্তুত সাহায্য করতে
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-xs text-white/90 sm:text-sm sm:leading-relaxed">
                আমাদের কোর্স সংক্রান্ত যেকোনো জিজ্ঞাসায় সরাসরি আমাদের কো-অর্ডিনেটর টিমের সাথে যোগাযোগ করুন।
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button
                  asChild
                  size="lg"
                  className="rounded-xl bg-white text-xs font-semibold text-primary hover:bg-white/95 sm:text-sm"
                >
                  <Link href="/teachers">শিক্ষক তালিকা দেখুন</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-xl border-white/40 bg-transparent text-xs font-semibold text-white hover:bg-white/10 sm:text-sm"
                >
                  <Link href="/video">ভিডিও ক্লাসসমূহ</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
