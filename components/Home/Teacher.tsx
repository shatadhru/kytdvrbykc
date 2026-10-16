"use client"

import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  PlayCircle,
  GraduationCap,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { CldImage } from "next-cloudinary";

export function Teacher() {
  return (
    <section className="relative overflow-hidden py-10 sm:py-16 lg:py-24">
      {/* Background with Theme-Aware Accents */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/4 top-10 size-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 size-72 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-3 sm:mb-4 flex justify-center">
            <Badge
              variant="outline"
              className="gap-1.5 rounded-full border-primary/20 bg-primary/10 px-3.5 py-1 text-xs sm:text-sm font-medium text-primary shadow-xs"
            >
              <GraduationCap className="size-3.5" />
              <span>আমাদের শিক্ষক</span>
            </Badge>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-primary sm:text-4xl lg:text-5xl">
            যিনি শেখান সহজভাবে,
            <span className="mt-1 block text-foreground">
              গড়ে তোলেন আত্মবিশ্বাস
            </span>
          </h2>

          <p className="mx-auto mt-2.5 max-w-2xl text-xs leading-5 text-muted-foreground sm:mt-4 sm:text-base sm:leading-7 lg:text-lg">
            জটিল বিষয়কে সহজভাবে বোঝানো এবং শিক্ষার্থীদের কনসেপ্টভিত্তিক
            শেখার অভ্যাস গড়ে তোলাই আমাদের শিক্ষাদানের মূল লক্ষ্য।
          </p>
        </div>

        {/* Teacher Card */}
        <Card className="mx-auto mt-8 max-w-6xl overflow-hidden rounded-2xl border-border bg-card p-0 shadow-sm sm:mt-12 sm:rounded-3xl">
          <CardContent className="p-0">
            <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
              {/* Teacher Image */}
              <div className="relative min-h-[300px] overflow-hidden bg-muted/40 sm:min-h-[460px] lg:min-h-[600px]">
                {/* Decorative circles */}
                <div className="absolute -left-16 -top-16 size-48 rounded-full bg-primary/10" />
                <div className="absolute -bottom-20 -right-20 size-64 rounded-full bg-primary/10" />

                <div className="absolute inset-x-6 bottom-0 top-6 overflow-hidden rounded-t-2xl sm:inset-x-8 sm:top-8 sm:rounded-t-3xl">
                  <CldImage
                    width={960}
                    height={600}
                    src="https://res.cloudinary.com/dccbp4dpb/image/upload/v1789397957/Gemini_Generated_Image_1wos3a1wos3a1wos_lvk1gm.jpg"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    alt="দেলোয়ার হোসেন"
                    className="h-full w-full object-cover object-top transition-transform duration-500 hover:scale-[1.02] rounded-2xl"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col justify-center p-5 sm:p-8 lg:p-12">
                {/* Role Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className="rounded-full bg-primary px-2.5 py-0.5 text-[11px] text-primary-foreground hover:bg-primary/90 sm:px-3 sm:py-1 sm:text-xs">
                    ফাউন্ডার ও সিইও
                  </Badge>

                  <Badge
                    variant="secondary"
                    className="rounded-full px-2.5 py-0.5 text-[11px] sm:px-3 sm:py-1 sm:text-xs"
                  >
                    ইউনিক টিচিং মেথড
                  </Badge>
                </div>

                {/* Name */}
                <h3 className="mt-4 text-2xl font-bold tracking-tight text-card-foreground sm:mt-5 sm:text-3xl lg:text-4xl">
                  দেলোয়ার হোসেন
                </h3>

                <div className="mt-2.5 h-1 w-14 rounded-full bg-primary sm:mt-3 sm:w-16" />

                {/* Description */}
                <div className="mt-4 space-y-3 text-xs leading-6 text-muted-foreground sm:mt-6 sm:space-y-4 sm:text-sm sm:leading-7 lg:text-base">
                  <p>
                    <span className="font-semibold text-foreground">
                      দেলোয়ার হোসেন
                    </span>
                    , ফাউন্ডার ও সিইও{" "}
                    <span className="font-semibold text-primary">
                      ইউনিক টিচিং মেথড
                    </span>
                    , ২০১৭ সাল থেকে শিক্ষার্থীদের জন্য জটিল বিষয়গুলো সহজ ও
                    আকর্ষণীয়ভাবে উপস্থাপন করছেন।
                  </p>

                  <p>
                    তিনি প্র্যাক্টিকাল উদাহরণ, ভিজুয়ালাইজেশন এবং বাস্তব জীবনের
                    প্রয়োগের মাধ্যমে শিক্ষার্থীদের কনসেপ্ট বোঝার ক্ষমতা বাড়ান।
                  </p>

                  <p>
                    তার লক্ষ্য শুধু পরীক্ষায় ভালো ফলাফল নয়; বরং শিক্ষার্থীদের
                    এমনভাবে শেখানো, যাতে তারা শেখা বিষয়গুলো বাস্তব জীবনেও
                    কাজে লাগাতে পারে।
                  </p>
                </div>

                {/* Stats */}
                <div className="mt-6 grid grid-cols-2 gap-2.5 sm:mt-8 sm:gap-4">
                  <div className="rounded-xl border border-border bg-muted/40 p-3 sm:rounded-2xl sm:p-4">
                    <div className="flex items-center gap-1.5 text-primary sm:gap-2">
                      <Users className="size-4 sm:size-5" />
                      <span className="text-lg font-bold sm:text-xl lg:text-2xl text-card-foreground">
                        ৫,৫৪,০০০+
                      </span>
                    </div>

                    <p className="mt-0.5 text-[11px] text-muted-foreground sm:mt-1 sm:text-xs">
                      শিক্ষার্থী
                    </p>
                  </div>

                  <div className="rounded-xl border border-border bg-muted/40 p-3 sm:rounded-2xl sm:p-4">
                    <div className="flex items-center gap-1.5 text-primary sm:gap-2">
                      <PlayCircle className="size-4 sm:size-5" />
                      <span className="text-lg font-bold sm:text-xl lg:text-2xl text-card-foreground">
                        ৬২২+
                      </span>
                    </div>

                    <p className="mt-0.5 text-[11px] text-muted-foreground sm:mt-1 sm:text-xs">
                      শিক্ষামূলক ভিডিও
                    </p>
                  </div>
                </div>

                {/* Highlights */}
                <div className="mt-5 space-y-2.5 sm:mt-7 sm:space-y-3">
                  {[
                    "জটিল বিষয়কে সহজভাবে উপস্থাপন",
                    "প্র্যাক্টিকাল উদাহরণ ও ভিজুয়ালাইজেশন",
                    "কনসেপ্টভিত্তিক শেখার ওপর গুরুত্ব",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2.5 text-xs text-card-foreground sm:gap-3 sm:text-sm"
                    >
                      <CheckCircle2 className="size-4 shrink-0 text-primary sm:size-5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Buttons */}
                <div className="mt-6 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:gap-3">
                  <Button
                    asChild
                    size="lg"
                    className="h-10 w-full rounded-xl text-xs font-semibold sm:h-11 sm:w-auto sm:text-sm"
                  >
                    <Link href="/video">
                      ক্লাসসমূহ দেখুন
                      <ArrowUpRight className="ml-1 size-3.5 sm:size-4" />
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-10 w-full rounded-xl text-xs font-semibold sm:h-11 sm:w-auto sm:text-sm"
                  >
                    <Link href="/teachers">
                      সকল শিক্ষক দেখুন
                      <BookOpen className="ml-1 size-3.5 sm:size-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

export default Teacher;