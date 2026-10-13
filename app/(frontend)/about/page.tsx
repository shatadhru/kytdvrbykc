import React from 'react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import Header from '@/components/basic/header'
import { Footer } from '@/components/basic/footer'
import { SiteConfig, getPageTitle } from '@/config/site'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Sparkles,
  BookOpen,
  Users,
  Video,
  Award,
  ShieldCheck,
  GraduationCap,
  HeartHandshake,
  Lightbulb,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Target,
  Compass,
} from 'lucide-react'

export const revalidate = 60 // ISR revalidation

export async function generateMetadata(): Promise<Metadata> {
  const title = 'আমাদের সম্পর্কে | About Us'
  const description =
    'ইউনিক টিচিং মেথড (Unique Teaching Method) - আধুনিক ও সহজ পদ্ধতিতে পাঠদান, আকর্ষণীয় ভিডিও ক্লাস এবং বিশ্বমানের অনলাইন শিক্ষা প্ল্যাটফর্ম।'
  const canonicalUrl = `${SiteConfig.site.url}/about`

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

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-primary/5 via-background to-background py-14 sm:py-20 lg:py-28">
          <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute left-1/4 top-10 size-80 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute right-1/4 bottom-0 size-80 rounded-full bg-teal-500/10 blur-3xl" />
          </div>

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
            <div className="mb-4 flex justify-center">
              <Badge
                variant="outline"
                className="gap-1.5 rounded-full border-primary/30 bg-primary/10 px-3.5 py-1 text-xs sm:text-sm font-medium text-primary shadow-xs"
              >
                <Sparkles className="size-3.5" />
                <span>আমাদের পরিচিতি ও লক্ষ্য</span>
              </Badge>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              সহজ পদ্ধতিতে শিক্ষা,{' '}
              <span className="text-primary block sm:inline">আত্মবিশ্বাসী আগামীর সূচনা</span>
            </h1>

            <p className="mx-auto mt-4 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7 lg:text-lg">
              <strong className="text-foreground">ইউনিক টিচিং মেথড (Unique Teaching Method)</strong>{' '}
              একটি আধুনিক এডুকেশন প্ল্যাটফর্ম, যা মুখস্থ বিদ্যার গতানুগতিক ধারা ভেঙে শিক্ষার্থীদের জন্য
              জটিল ও ভীতিজনক বিষয়গুলোকে সহজ, ভিজ্যুয়াল ও আনন্দদায়কভাবে উপস্থাপন করার প্রত্যয়ে নিবেদিত।
            </p>

            {/* Quick Metrics */}
            <div className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-3 sm:mt-12 sm:grid-cols-4 sm:gap-4">
              <div className="rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur-xs sm:p-5">
                <div className="flex items-center justify-center gap-1.5 text-primary">
                  <Users className="size-4 sm:size-5" />
                  <span className="text-xl font-bold sm:text-2xl text-card-foreground">৫,৫০,০০০+</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">সফল শিক্ষার্থী</p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur-xs sm:p-5">
                <div className="flex items-center justify-center gap-1.5 text-primary">
                  <Video className="size-4 sm:size-5" />
                  <span className="text-xl font-bold sm:text-2xl text-card-foreground">৬২০+</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">শিক্ষামূলক ভিডিও</p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur-xs sm:p-5">
                <div className="flex items-center justify-center gap-1.5 text-primary">
                  <TrendingUp className="size-4 sm:size-5" />
                  <span className="text-xl font-bold sm:text-2xl text-card-foreground">৮+ বছর</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">ধারাবাহিক পাঠদান</p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-card/60 p-4 backdrop-blur-xs sm:p-5">
                <div className="flex items-center justify-center gap-1.5 text-primary">
                  <Award className="size-4 sm:size-5" />
                  <span className="text-xl font-bold sm:text-2xl text-card-foreground">৯৮%</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">সন্তুষ্টির হার</p>
              </div>
            </div>
          </div>
        </section>

        {/* Founder & Story Section */}
        <section className="py-14 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
              {/* Left Image Area */}
              <div className="relative mx-auto aspect-4/3 w-full max-w-lg overflow-hidden rounded-3xl border border-border/80 bg-muted/30 shadow-md">
                <Image
                  src="https://res.cloudinary.com/dccbp4dpb/image/upload/v1789397957/Gemini_Generated_Image_1wos3a1wos3a1wos_lvk1gm.jpg"
                  alt="দেলোয়ার হোসেন - ফাউন্ডার ও সিইও"
                  fill
                  className="object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <Badge className="bg-primary text-xs">প্রতিষ্ঠাতার বাণী</Badge>
                  <h3 className="mt-2 text-xl font-bold drop-shadow-xs">দেলোয়ার হোসেন</h3>
                  <p className="text-xs text-white/90">ফাউন্ডার ও প্রধান শিক্ষক, ইউনিক টিচিং মেথড</p>
                </div>
              </div>

              {/* Right Content Area */}
              <div>
                <Badge variant="outline" className="rounded-full border-primary/20 bg-primary/5 text-primary text-xs">
                  আমাদের গল্প ও প্রেক্ষাপট
                </Badge>
                <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
                  যেভাবে শুরু হলো এই স্বপ্নযাত্রা
                </h2>

                <div className="mt-5 space-y-4 text-xs leading-relaxed text-muted-foreground sm:text-sm sm:leading-7">
                  <p>
                    ২০১৭ সালে একটি সাধারণ কিন্তু গুরুত্বপূর্ণ পর্যবেক্ষণ থেকে শুরু হয়{' '}
                    <strong className="text-foreground">ইউনিক টিচিং মেথড</strong>। আমাদের দেশের
                    অধিকাংশ শিক্ষার্থী বিজ্ঞান ও গণিতের মতো যৌক্তিক বিষয়গুলোকে ভয় পায় শুধু সঠিক
                    উপস্থাপনা ও কনসেপ্টের অভাবে।
                  </p>

                  <p>
                    আমরা লক্ষ্য করি, পাঠ্যবইয়ের সূত্র বা থিওরি মুখস্থ করার চেয়ে বাস্তব জীবনের উদাহরণ,
                    ভিজ্যুয়াল ডায়াগ্রাম ও বাস্তব পরীক্ষার সাথে মিলিয়ে শেখানো হলে যেকোনো সাধারণ
                    শিক্ষার্থীও অসাধারণ হয়ে উঠতে পারে।
                  </p>

                  <p>
                    এই অনুপ্রেরণা থেকেই আমরা শুরু করি ইউটিউব ও ডিজিটাল প্ল্যাটফর্মে পাঠদান। দীর্ঘ ৮
                    বছরে ৫ লক্ষাধিক শিক্ষার্থীর আস্থা ও ভালোবাসা আমাদের দায়িত্ব আরও বাড়িয়ে দিয়েছে। আজ
                    আমরা নিয়ে এসেছি একটি পরিপূর্ণ নিরাপদ, আধুনিক ও ছাত্রবান্ধব এডুকেশন প্ল্যাটফর্ম।
                  </p>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button asChild className="rounded-xl text-xs sm:text-sm">
                    <Link href="/teachers">
                      আমাদের শিক্ষকদল দেখুন
                      <ArrowRight className="ml-1.5 size-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="rounded-xl text-xs sm:text-sm">
                    <Link href="/coordinators">কো-অর্ডিনেটর সাপোর্ট</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="border-y border-border/40 bg-muted/20 py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-6 sm:grid-cols-2 sm:gap-8">
              {/* Mission Card */}
              <Card className="rounded-3xl border-border/70 bg-card p-6 sm:p-8 shadow-xs">
                <CardContent className="p-0">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Target className="size-6" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-card-foreground sm:text-2xl">
                    আমাদের মিশন (Our Mission)
                  </h3>
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground sm:text-sm sm:leading-7">
                    প্রতিটি শিক্ষার্থীর কাছে মানসম্মত, সহজবোধ্য ও সাশ্রয়ী শিক্ষা পৌঁছে দেওয়া। জটিল বিষয়কে
                    এতটাই সহজ করে তুলে ধরা যেন পড়াশোনা ভয়ের বদলে আনন্দের মাধ্যম হয়ে ওঠে এবং শিক্ষার্থী
                    নিজের মেধা বিকাশে পরিপূর্ণ সক্ষম হয়।
                  </p>
                </CardContent>
              </Card>

              {/* Vision Card */}
              <Card className="rounded-3xl border-border/70 bg-card p-6 sm:p-8 shadow-xs">
                <CardContent className="p-0">
                  <div className="flex size-12 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
                    <Compass className="size-6" />
                  </div>
                  <h3 className="mt-5 text-xl font-bold text-card-foreground sm:text-2xl">
                    আমাদের ভিশন (Our Vision)
                  </h3>
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground sm:text-sm sm:leading-7">
                    বাংলাদেশের সর্বসেরা কনসেপ্ট-বেসড ডিজিটাল অ্যাকাডেমিক লার্নিং প্ল্যাটফর্ম হিসেবে গড়ে ওঠা,
                    যেখান থেকে ভবিষ্যৎ প্রজন্ম কেবল সার্টিফিকেট অর্জন নয়, বরং সমস্যা সমাধানের দক্ষতায়
                    বিশ্বমানের যোগ্যতা নিয়ে গড়ে উঠবে।
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Core Pillars of UTM */}
        <section className="py-14 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <Badge variant="outline" className="rounded-full border-primary/20 bg-primary/5 text-primary text-xs">
                শিক্ষাদানের মূল স্তম্ভ
              </Badge>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
                কেন আমাদের মেথড সম্পূর্ণ ইউনিক?
              </h2>
              <p className="mt-3 text-xs text-muted-foreground sm:text-sm sm:leading-relaxed">
                চারটি মূল ভিত্তির ওপর দাঁড়িয়ে আছে আমাদের অনন্য শিক্ষাদান কৌশল।
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-2xs">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Lightbulb className="size-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">
                  বাস্তব জীবনের অ্যানালজি
                </h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  থিওরি মুখস্থের চেয়ে দৈনন্দিন জীবনের চেনা উদাহরণের মাধ্যমে কনসেপ্ট মাথায় গেঁথে দেওয়া হয়।
                </p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-2xs">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <GraduationCap className="size-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">
                  বেসিক টু অ্যাডভান্সড স্টেপ
                </h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  সহজ থেকে ক্রমান্বয়ে কঠিন লেভেলে নিয়ে যাওয়া হয়, যাতে কোনো শিক্ষার্থী মাঝপথে হারিয়ে না যায়।
                </p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-2xs">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ShieldCheck className="size-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">
                  পাইরেসি-মুক্ত সুরক্ষিত ক্লাস
                </h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  আমাদের আধুনিক ইন-হাউস প্লেয়ারের মাধ্যমে যেকোনো ডিভাইসে বাধাহীন ও সুরক্ষিত ভিডিও অভিজ্ঞতা।
                </p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-2xs">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <HeartHandshake className="size-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">
                  সার্বক্ষণিক কো-অর্ডিনেটর
                </h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  পড়াশোনার কোনো অংশে আটকে গেলে মেন্টর ও কো-অর্ডিনেটর টিম সরাসরি সমাধান পৌঁছে দেয়।
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Faculty & Team Invitation */}
        <section className="border-t border-border/40 bg-muted/20 py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-border/80 bg-card p-8 sm:p-12 shadow-xs">
              <div className="grid items-center gap-8 md:grid-cols-2">
                <div>
                  <Badge variant="outline" className="rounded-full border-primary/20 bg-primary/5 text-primary text-xs">
                    আমাদের টিম
                  </Badge>
                  <h3 className="mt-3 text-2xl font-bold text-card-foreground sm:text-3xl">
                    নিবেদিতপ্রাণ শিক্ষক ও কো-অর্ডিনেটর মণ্ডলী
                  </h3>
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground sm:text-sm sm:leading-7">
                    আমাদের প্রতিটি কোর্সের নেপথ্যে কাজ করেন অভিজ্ঞ শিক্ষক এবং সহানুভূতিশীল সাপোর্ট
                    কো-অর্ডিনেটরগণ। আমাদের পুরো দলের বিস্তারিত প্রোফাইল দেখে নিতে পারেন।
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button asChild className="rounded-xl text-xs sm:text-sm">
                      <Link href="/teachers">
                        শিক্ষক তালিকা
                        <ArrowRight className="ml-1.5 size-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="rounded-xl text-xs sm:text-sm">
                      <Link href="/coordinators">
                        কো-অর্ডিনেটর তালিকা
                        <ArrowRight className="ml-1.5 size-4" />
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 rounded-2xl border border-border/60 bg-muted/30 p-5 sm:p-6 text-xs text-muted-foreground sm:text-sm">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="size-5 shrink-0 text-primary" />
                    <span>বিষয়ভিত্তিক গভীর জ্ঞানসম্পন্ন অভিজ্ঞ ফ্যাকাল্টি সদস্য।</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="size-5 shrink-0 text-primary" />
                    <span>নিয়মিত মেন্টরিং এবং ব্যক্তিগত প্রশ্নোত্তরের সুযোগ।</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="size-5 shrink-0 text-primary" />
                    <span>সহজ ভাষায় প্রতিটি ক্লাসের লেকচার শিট ও প্র্যাকটিস ম্যাটেরিয়াল।</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="size-5 shrink-0 text-primary" />
                    <span>অনলাইন এক্সাম ও তাৎক্ষণিক অগ্রগতি পরিমাপের সুবিধা।</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="py-14 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary via-teal-700 to-primary px-6 py-10 text-white shadow-xl sm:px-12 sm:py-16 text-center">
              <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-white/10 blur-3xl" />
              <div className="pointer-events-none absolute -left-20 -bottom-20 size-72 rounded-full bg-black/10 blur-3xl" />

              <h2 className="text-2xl font-bold sm:text-4xl">
                আপনার শিক্ষার পথচলা হোক আরও সহজ ও আনন্দময়
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-xs text-white/90 sm:text-sm sm:leading-relaxed">
                আজই আমাদের কোর্সে এনরোল করুন অথবা ফ্রি ডেমো ক্লাস দেখে পরখ করে নিন আমাদের ইউনিক মেথড।
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
                  <Link href="/video">ডেমো ভিডিও ক্লাস</Link>
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

