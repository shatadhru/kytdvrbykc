"use client";

import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CldImage } from "next-cloudinary";

type LearningStep = {
  number: string;
  image: string;
  title: string;
  description: string;
  button: string;
  href: string;
};

const learningSteps: LearningStep[] = [
  {
    number: "০১",
    image:
      "https://res.cloudinary.com/dccbp4dpb/image/upload/v1789398084/Gemini_Generated_Image_5brpm55brpm55brp_a5tnix.jpg",
    title: "কোর্স নির্বাচন করুন",
    description:
      "আপনার লক্ষ্য ও প্রয়োজন অনুযায়ী পছন্দের কোর্সটি বেছে নিন।",
    button: "কোর্স দেখুন",
    href: "/video",
  },
  {
    number: "০২",
    image:
      "https://res.cloudinary.com/dccbp4dpb/image/upload/v1789398086/Gemini_Generated_Image_yo0vhryo0vhryo0v_zypixm.jpg",
    title: "ক্লাস করুন",
    description:
      "সহজ ও কার্যকর পাঠদানের মাধ্যমে প্রতিটি বিষয় বুঝে শিখুন।",
    button: "ক্লাস শুরু করুন",
    href: "/video",
  },
  {
    number: "০৩",
    image:
      "https://res.cloudinary.com/dccbp4dpb/image/upload/v1789398086/Gemini_Generated_Image_72e96e72e96e72e9_3_i1bheo.jpg",
    title: "অনুশীলন করুন",
    description:
      "নিয়মিত অনুশীলনের মাধ্যমে শেখা বিষয়গুলো আরও শক্তিশালী করুন।",
    button: "অনুশীলন করুন",
    href: "/dashboard",
  },
  {
    number: "০৪",
    image:
      "https://res.cloudinary.com/dccbp4dpb/image/upload/v1789398081/Gemini_Generated_Image_ilbmxlilbmxlilbm_1_xiqlwp.jpg",
    title: "পরিক্ষা দিন",
    description:
      "নিয়মিত শেখা ও অনুশীলনের মাধ্যমে আত্মবিশ্বাসের সঙ্গে লক্ষ্যে পৌঁছান।",
    button: "এগিয়ে যান",
    href: "/dashboard",
  },
];

export function Learning() {
  return (
    <section className="relative overflow-hidden bg-background py-10 sm:py-16 lg:py-24">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 size-72 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -left-32 bottom-0 size-72 rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute -right-32 top-1/3 size-72 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex flex-col items-center gap-6 sm:gap-10 lg:gap-14">
          {/* Heading */}
          <div className="flex max-w-3xl flex-col items-center text-center">
            <div className="mb-3 sm:mb-4 flex justify-center">
              <Badge
                variant="outline"
                className="gap-1.5 rounded-full border-primary/20 bg-primary/10 px-3.5 py-1 text-xs sm:text-sm font-medium text-primary shadow-xs"
              >
                <Sparkles className="size-3.5" />
                <span>সহজ শেখার পদ্ধতি</span>
              </Badge>
            </div>

            <h2 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:mt-3 sm:text-4xl lg:text-5xl">
              শেখার প্রতিটি ধাপ হোক{" "}
              <span className="text-primary block sm:inline">সহজ ও সুন্দর</span>
            </h2>

            <p className="mt-2.5 max-w-2xl text-xs leading-5 text-muted-foreground sm:mt-4 sm:text-base sm:leading-7 lg:text-lg">
              সঠিক কোর্স নির্বাচন থেকে শুরু করে নিয়মিত অনুশীলন
              প্রতিটি ধাপে আপনাকে এগিয়ে যেতে সাহায্য করবে ইউনিক টিচিং মেথড।
            </p>
          </div>

          {/* Learning Steps */}
          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-5">
            {learningSteps.map((step) => (
              <Card
                key={step.number}
                className="group  h-full overflow-hidden rounded-2xl border-border bg-card p-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md sm:rounded-3xl"
              >
                <CardContent className="flex h-full flex-col p-0">
                  {/* Image */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/30">
                    <CldImage
                      src={step.image}
                      alt={step.title}
                      fill
                      className="object-contain bg-white p-4 transition-transform duration-500 group-hover:scale-105 sm:p-5"
                      sizes="(max-width: 640px) 85vw, (max-width: 1024px) 40vw, 20vw"
                    />

                    {/* Number Badge */}
                    <div className="absolute left-3 top-3 sm:left-4 sm:top-4 flex size-7 sm:size-9 items-center justify-center rounded-full border border-border bg-card text-[11px] sm:text-xs font-bold text-primary shadow-xs">
                      {step.number}
                    </div>

                    {/* Image overlay */}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card/80 to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col p-4 sm:p-5 lg:p-6">
                    <h3 className="text-base font-bold tracking-tight text-card-foreground sm:text-lg lg:text-xl">
                      {step.title}
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-muted-foreground sm:mt-2.5 sm:text-sm sm:leading-6">
                      {step.description}
                    </p>

                    {/* Button */}
                    <Button
                      asChild
                      className="group/button mt-4 sm:mt-6 h-10 sm:h-11 w-full rounded-full text-xs sm:text-sm font-semibold"
                    >
                      <Link href={step.href}>
                        <span>{step.button}</span>

                        <span className="ml-auto flex size-7 sm:size-8 items-center justify-center rounded-full bg-primary-foreground text-primary transition-transform duration-300 group-hover/button:rotate-45">
                          <ArrowUpRight className="size-3.5 sm:size-4" />
                        </span>
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Learning;
