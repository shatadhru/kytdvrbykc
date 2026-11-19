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
  GraduationCap,
  Lightbulb,
  BookOpen,
  Users,
  Award,
  CheckCircle2,
  Mail,
  Phone,
  ArrowRight,
  Video,
  Layers,
  HelpCircle,
} from 'lucide-react'
import type { Teacher as TeacherType } from '@/payload/payload-types'

export const dynamic = 'force-dynamic'

export async function generateMetadata(): Promise<Metadata> {
  const title = 'আমাদের শিক্ষকবৃন্দ | Faculty Members'
  const description =
    'ইউনিক টিচিং মেথডের অভিজ্ঞ ও নিবেদিতপ্রাণ শিক্ষকবৃন্দ। জটিল বিষয়কে সহজভাবে বুঝিয়ে শিক্ষার্থীদের কনসেপ্টভিত্তিক আত্মবিশ্বাস গড়ে তোলাই আমাদের লক্ষ্য।'
  const canonicalUrl = `${SiteConfig.site.url}/teachers`

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

function resolveTeacherImageUrl(image: TeacherType['image']): string | null {
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

export default async function TeachersPage() {
  // Query active teachers from Payload CMS sorted by order
  let teachers: TeacherType[] = []
  try {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'teachers',
      where: {
        isActive: { equals: true },
      },
      sort: 'order',
      limit: 100,
    })
    teachers = result.docs as TeacherType[]
  } catch (error) {
    console.error('Failed to fetch teachers from Payload:', error)
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-primary/5 via-background to-background py-14 sm:py-20 lg:py-24">
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute left-1/3 top-10 size-80 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute right-1/4 bottom-0 size-72 rounded-full bg-teal-500/10 blur-3xl" />
          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="mb-4 flex justify-center">
              <Badge
                variant="outline"
                className="gap-1.5 rounded-full border-primary/30 bg-primary/10 px-3.5 py-1 text-xs sm:text-sm font-medium text-primary shadow-xs"
              >
                <Lightbulb className="size-3.5" />
                <span>আমাদের শিক্ষক মণ্ডলী</span>
              </Badge>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              যাঁদের দিকনির্দেশনায় তৈরি হয়{' '}
              <span className="text-primary block sm:inline">আগামীর ভবিষ্যৎ</span>
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7 lg:text-lg">
              ইউনিক টিচিং মেথডের প্রতিটি বিষয় পরিচালিত হয় অভিজ্ঞ ও দক্ষ বিষয়-বিশেষজ্ঞদের দ্বারা। জটিল
              কনসেপ্ট সহজ ও বাস্তব জীবনের উদাহরণের মাধ্যমে উপস্থাপন করাই আমাদের শক্তি।
            </p>

            {/* Quick Stats Grid */}
            <div className="mx-auto mt-8 grid max-w-3xl grid-cols-2 gap-3 sm:mt-10 sm:grid-cols-4 sm:gap-4">
              <div className="rounded-xl border border-border/60 bg-card/60 p-3.5 backdrop-blur-xs sm:p-4">
                <div className="flex items-center justify-center gap-1.5 text-primary">
                  <Users className="size-4" />
                  <span className="text-lg font-bold sm:text-2xl text-card-foreground">
                    ৫,৫০,০০০+
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">শিক্ষার্থী সংযুক্ত</p>
              </div>

              <div className="rounded-xl border border-border/60 bg-card/60 p-3.5 backdrop-blur-xs sm:p-4">
                <div className="flex items-center justify-center gap-1.5 text-primary">
                  <Video className="size-4" />
                  <span className="text-lg font-bold sm:text-2xl text-card-foreground">
                    ৬২০+
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">ভিডিও লেকচার</p>
              </div>

              <div className="rounded-xl border border-border/60 bg-card/60 p-3.5 backdrop-blur-xs sm:p-4">
                <div className="flex items-center justify-center gap-1.5 text-primary">
                  <Award className="size-4" />
                  <span className="text-lg font-bold sm:text-2xl text-card-foreground">১০০%</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">কনসেপ্ট ক্লিয়ারিং</p>
              </div>

              <div className="rounded-xl border border-border/60 bg-card/60 p-3.5 backdrop-blur-xs sm:p-4">
                <div className="flex items-center justify-center gap-1.5 text-primary">
                  <BookOpen className="size-4" />
                  <span className="text-lg font-bold sm:text-2xl text-card-foreground">৮+ বছর</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">শিক্ষাদানের অভিজ্ঞতা</p>
              </div>
            </div>
          </div>
        </section>

        {/* Teachers Grid Section */}
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                  সকল ফ্যাকাল্টি ও প্রশিক্ষকবৃন্দ
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  আমাদের দক্ষ শিক্ষকদের প্রোফাইল ও বিস্তারিত পরিচিতি দেখুন।
                </p>
              </div>

              <div className="text-xs text-muted-foreground">
                মোট শিক্ষক:{' '}
                <span className="font-semibold text-foreground">
                  {teachers.length > 0 ? teachers.length : 1} জন
                </span>
              </div>
            </div>

            {teachers.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                {teachers.map((teacher) => {
                  const imageUrl = resolveTeacherImageUrl(teacher.image)

                  return (
                    <Card
                      key={teacher.id}
                      className="group flex flex-col overflow-hidden rounded-2xl border-border/70 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
                    >
                      {/* Image Area */}
                      <div className="relative aspect-4/3 w-full overflow-hidden bg-muted/30">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={teacher.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-primary/10 via-muted to-primary/5 text-primary">
                            <div className="flex size-20 items-center justify-center rounded-full bg-primary/20 text-3xl font-bold">
                              {teacher.name.charAt(0)}
                            </div>
                            <span className="mt-2 text-xs text-muted-foreground">
                              ছবি সংযুক্ত নেই
                            </span>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                        {/* Top Badges */}
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                          {teacher.designation && (
                            <Badge className="bg-primary/90 text-primary-foreground text-[11px] backdrop-blur-xs font-medium">
                              {teacher.designation}
                            </Badge>
                          )}
                        </div>

                        {/* Bottom Name on Image */}
                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <h3 className="text-lg font-bold tracking-tight drop-shadow-xs">
                            {teacher.name}
                          </h3>
                        </div>
                      </div>

                      {/* Content Area */}
                      <CardContent className="flex flex-1 flex-col p-5">
                        {/* Bio */}
                        {teacher.bio ? (
                          <p className="line-clamp-4 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                            {teacher.bio}
                          </p>
                        ) : (
                          <p className="text-xs italic text-muted-foreground">
                            ইউনিক টিচিং মেথডের সম্মানিত শিক্ষক ও বিষয় বিশেষজ্ঞ।
                          </p>
                        )}

                        <div className="mt-auto pt-5">
                          {/* Contact information */}
                          <div className="space-y-1.5 border-t border-border/50 pt-3 text-xs text-muted-foreground">
                            {teacher.email && (
                              <div className="flex items-center gap-2 truncate">
                                <Mail className="size-3.5 shrink-0 text-primary" />
                                <span className="truncate">{teacher.email}</span>
                              </div>
                            )}
                            {teacher.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="size-3.5 shrink-0 text-primary" />
                                <span>{teacher.phone}</span>
                              </div>
                            )}
                          </div>

                          {/* Social links & CTA */}
                          <div className="mt-4 flex items-center justify-between gap-2">
                            {teacher.socialLinks && teacher.socialLinks.length > 0 ? (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {teacher.socialLinks.map((item, idx) => (
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
                                ইউটিএম ফ্যাকাল্টি
                              </div>
                            )}

                            <Button
                              asChild
                              size="sm"
                              variant="outline"
                              className="gap-1 rounded-lg text-xs"
                            >
                              <Link href="/video">
                                ক্লাস দেখুন
                                <ArrowRight className="size-3" />
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              /* Fallback Founder Card if CMS has no teacher records yet */
              <Card className="mx-auto max-w-4xl overflow-hidden rounded-2xl border-border bg-card p-0 shadow-sm">
                <CardContent className="p-0">
                  <div className="grid md:grid-cols-2">
                    <div className="relative min-h-[320px] bg-muted/40">
                      <Image
                        src="https://res.cloudinary.com/dccbp4dpb/image/upload/v1789397957/Gemini_Generated_Image_1wos3a1wos3a1wos_lvk1gm.jpg"
                        alt="দেলোয়ার হোসেন"
                        fill
                        className="object-cover object-top"
                      />
                    </div>
                    <div className="flex flex-col justify-center p-6 sm:p-8">
                      <Badge className="w-fit rounded-full bg-primary text-xs">
                        ফাউন্ডার ও প্রধান শিক্ষক
                      </Badge>
                      <h3 className="mt-3 text-2xl font-bold text-card-foreground">
                        দেলোয়ার হোসেন
                      </h3>
                      <p className="mt-1 text-xs text-primary font-medium">
                        ইউনিক টিচিং মেথড (UTM)
                      </p>
                      <p className="mt-3 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                        ২০১৭ সাল থেকে শিক্ষার্থীদের জন্য জটিল বিষয়গুলো সহজ ও আকর্ষণীয়ভাবে উপস্থাপন
                        করছেন। প্র্যাক্টিকাল উদাহরণ ও ভিজুয়ালাইজেশনের মাধ্যমে শতভাগ কনসেপ্ট ক্লিয়ার
                        করাই তাঁর মূল ব্রত।
                      </p>
                      <div className="mt-5 flex items-center gap-3">
                        <Button asChild size="sm" className="rounded-lg text-xs">
                          <Link href="/video">ভিডিও ক্লাসসমূহ দেখুন</Link>
                        </Button>
                        <Button asChild size="sm" variant="outline" className="rounded-lg text-xs">
                          <Link href="/dashboard">ড্যাশবোর্ড</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* Philosophy Section */}
        <section className="border-t border-border/40 bg-muted/20 py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="outline" className="rounded-full text-xs text-primary border-primary/20 bg-primary/5">
                কেন আমাদের শিক্ষক দল অনন্য?
              </Badge>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                মুখস্থ নয়, বাস্তবমুখী কনসেপ্টে পাঠদান
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                আমরা বিশ্বাস করি, বিষয়বস্তুকে সুন্দরভাবে উপস্থাপন করা গেলে যেকোনো শিক্ষার্থী পড়াশোনায়
                সেরা ফলাফল অর্জন করতে পারে।
              </p>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
              <div className="rounded-2xl border border-border/60 bg-card p-5 sm:p-6 shadow-2xs">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Lightbulb className="size-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">
                  সহজ ও প্রাণবন্ত উপস্থাপনা
                </h3>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                  অ্যানিমেশন, বাস্তব উদাহরণ ও ভিজ্যুয়াল মেথড ব্যবহারের ফলে কঠিন টপিকও পানির মতো সহজ
                  হয়ে যায়।
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-card p-5 sm:p-6 shadow-2xs">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Layers className="size-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">
                  বেসিক টু অ্যাডভান্সড ধাপ
                </h3>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                  প্রতিটি বিষয়ের গোড়া থেকে শুরু করে বোর্ড পরীক্ষা ও ভর্তি পরীক্ষার সর্বোচ্চ লেভেল পর্যন্ত
                  ধাপে ধাপে শেখানো হয়।
                </p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-card p-5 sm:p-6 shadow-2xs">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <CheckCircle2 className="size-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">
                  সার্বক্ষণিক ডাউট ক্লিয়ারিং
                </h3>
                <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                  পড়াশোনার কোনো জায়গায় আটকে গেলে আমাদের একাডেমিক কো-অর্ডিনেটর ও শিক্ষক দল তাৎক্ষণিক সমাধান
                  দেয়।
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/90 via-primary to-teal-700 px-6 py-10 text-white shadow-xl sm:px-12 sm:py-14 text-center">
              <div className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-2xl" />
              <div className="pointer-events-none absolute -left-16 -bottom-16 size-64 rounded-full bg-black/10 blur-2xl" />

              <h2 className="text-2xl font-bold sm:text-4xl">
                আজই শুরু হোক আপনার আত্মবিশ্বাসী পথচলা
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-xs text-white/90 sm:text-sm sm:leading-relaxed">
                আমাদের এক্সক্লুসিভ ভিডিও ক্লাস ও ফুল কোর্সগুলোতে জয়েন করে নিজের পড়াশোনায় আনুন আমূল পরিবর্তন।
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button
                  asChild
                  size="lg"
                  className="rounded-xl bg-white text-xs font-semibold text-primary hover:bg-white/95 sm:text-sm"
                >
                  <Link href="/store">কোর্সসমূহ দেখুন</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="rounded-xl border-white/40 bg-transparent text-xs font-semibold text-white hover:bg-white/10 sm:text-sm"
                >
                  <Link href="/coordinators">কো-অর্ডিনেটর সহায়তা</Link>
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
