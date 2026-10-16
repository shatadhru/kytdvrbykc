import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BookOpen, Gift } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const freeResources = [
  {
    name: "এস এস সি - ২০২৭",
    description: "এস এস সি ২০২৭ ব্যাচের জন্য প্রয়োজনীয় বিনামূল্যের শিক্ষাসামগ্রী।",
    url: "/video",
    image:
      "https://res.cloudinary.com/doqcv0ywi/image/upload/v1789305933/ssc27_mamvtg.png",
  },
  {
    name: "এস এস সি - ২০২৮",
    description: "এস এস সি ২০২৮ ব্যাচের প্রস্তুতির জন্য বিনামূল্যের রিসোর্স।",
    url: "/video",
    image:
      "https://res.cloudinary.com/doqcv0ywi/image/upload/v1789305933/%E0%A7%81%E0%A7%81%E0%A7%A8%E0%A7%87%E0%A7%AE_o3naui.png",
  },
  {
    name: "এইচ এস সি - ২০২৭",
    description: "এইচ এস সি ২০২৭ ব্যাচের জন্য সাজানো প্রয়োজনীয় শিক্ষাসামগ্রী।",
    url: "/video",
    image:
      "https://res.cloudinary.com/doqcv0ywi/image/upload/v1789305933/hsc27_academic_naapzc.png",
  },
  {
    name: "এইচ এস সি - ২০২৮",
    description: "এইচ এস সি ২০২৮ ব্যাচের প্রস্তুতির জন্য বিনামূল্যের রিসোর্স।",
    url: "/video",
    image:
      "https://res.cloudinary.com/doqcv0ywi/image/upload/v1789306254/Untitled-1_dpemy8.png",
  },
];

export function FreeResourses() {
  return (
    <section className="relative overflow-hidden py-10 sm:py-16 lg:py-24">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-1/2 top-0 size-72 -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 size-64 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
          <div className="mb-3 sm:mb-4 flex justify-center">
            <Badge
              variant="outline"
              className="gap-1.5 rounded-full border-primary/20 bg-primary/10 px-3.5 py-1 text-xs sm:text-sm font-medium text-primary shadow-xs"
            >
              <Gift className="size-3.5" />
              <span>বিনামূল্যের রিসোর্স</span>
            </Badge>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-primary sm:text-4xl lg:text-5xl">
            আপনার প্রস্তুতির জন্য{" "}
            <span className="block text-foreground sm:inline">
              প্রয়োজনীয় ফ্রি রিসোর্স
            </span>
          </h2>

          <p className="mt-2.5 max-w-2xl text-xs leading-5 text-muted-foreground sm:mt-4 sm:text-base sm:leading-7 lg:text-lg">
            পড়াশোনার প্রস্তুতিকে আরও সহজ করতে ইউনিক টিচিং মেথডের
            বিনামূল্যের শিক্ষাসামগ্রী এক জায়গায় সাজানো হয়েছে।
          </p>
        </div>

        {/* Resource Cards */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4 sm:gap-5">
          {freeResources.map((resource) => (
            <Card
              key={resource.name}
              className="group overflow-hidden rounded-2xl border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md sm:rounded-3xl"
            >
              <CardContent className="p-0">
                {/* Image */}
                <div className="relative aspect-[4/3] flex overflow-hidden items-center justify-center bg-muted/20">
                  <Image
                    src={resource.image}
                    alt={resource.name}
                    width={250}
                    height={250}
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Free Badge */}
                  <div className="absolute left-3 top-3">
                    <Badge
                      variant="secondary"
                      className="gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                    >
                      <Gift className="size-3" />
                      বিনামূল্যে
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-5">
                  <div className="mb-2.5 flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary sm:mb-3 sm:size-10 sm:rounded-2xl">
                    <BookOpen className="size-4 sm:size-5" />
                  </div>

                  <h3 className="text-base font-bold tracking-tight text-card-foreground sm:text-lg">
                    {resource.name}
                  </h3>

                  <p className="mt-1.5 min-h-[40px] text-xs leading-5 text-muted-foreground sm:mt-2 sm:min-h-[48px] sm:text-sm sm:leading-6">
                    {resource.description}
                  </p>

                  <Button
                    asChild
                    className="mt-4 h-10 w-full rounded-xl text-xs font-semibold sm:mt-5 sm:h-11 sm:text-sm"
                  >
                    <Link href={resource.url}>
                      রিসোর্স দেখুন
                      <ArrowUpRight className="ml-1 size-3.5 sm:size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card p-5 sm:mt-10 sm:rounded-3xl sm:p-8">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
            <div>
              <h3 className="text-lg font-bold text-primary sm:text-xl lg:text-2xl">
                আজই আপনার প্রস্তুতি শুরু করুন
              </h3>

              <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm sm:leading-6">
                সঠিক রিসোর্স দিয়ে নিয়মিত পড়াশোনার অভ্যাস গড়ে তুলুন।
              </p>
            </div>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-10 w-full rounded-xl text-xs font-semibold sm:h-11 sm:w-auto sm:text-sm"
            >
              <Link href="/video">
                সব ক্লাস দেখুন
                <ArrowUpRight className="ml-1 size-3.5 sm:size-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FreeResourses;