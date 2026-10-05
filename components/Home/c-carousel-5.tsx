"use client"

import Link from "next/link"
import Autoplay from "embla-carousel-autoplay"
import { Card } from "@/components/ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import { CldImage } from "next-cloudinary"

const images = [
  "https://res.cloudinary.com/dccbp4dpb/image/upload/v1789276947/UTM-math-cover-1536x864_tplfis.webp",
  "https://res.cloudinary.com/dccbp4dpb/image/upload/v1774289665/SSC-27-%E0%A6%AC%E0%A7%87%E0%A6%B8%E0%A6%BF%E0%A6%95-%E0%A6%9F%E0%A7%81-%E0%A6%AA%E0%A7%8D%E0%A6%B0%E0%A6%BF%E0%A6%AE%E0%A6%BF%E0%A6%AF%E0%A6%BC%E0%A6%BE%E0%A6%AE-%E0%A6%95%E0%A7%8B%E0%A6%B0%E0%A7%8D%E0%A6%B8-chemistry_kykgak.webp",
  "https://res.cloudinary.com/dccbp4dpb/image/upload/v1774289665/SSC-28-%E0%A6%AC%E0%A7%87%E0%A6%B8%E0%A6%BF%E0%A6%95-%E0%A6%9F%E0%A7%81-%E0%A6%AA%E0%A7%8D%E0%A6%B0%E0%A6%BF%E0%A6%AE%E0%A6%BF%E0%A6%AF%E0%A6%BC%E0%A6%BE%E0%A6%AE-%E0%A6%95%E0%A7%8B%E0%A6%B0%E0%A7%8D%E0%A6%B8-Physics_dm48n5.webp",
  "https://res.cloudinary.com/dccbp4dpb/image/upload/v1789276888/b3690e0c-ab10-4385-9652-dbf2808d401d.png",
  "https://res.cloudinary.com/dccbp4dpb/image/upload/v1789276983/SSC-28-%E0%A6%AC%E0%A7%87%E0%A6%B8%E0%A6%BF%E0%A6%95-%E0%A6%9F%E0%A7%81-%E0%A6%AA%E0%A7%8D%E0%A6%B0%E0%A6%BF%E0%A6%AE%E0%A6%BF%E0%A6%AF%E0%A6%BC%E0%A6%BE%E0%A6%AE-%E0%A6%95%E0%A7%8B%E0%A6%B0%E0%A7%8D%E0%A6%B8-hmath-1536x864_kawxh5.webp"
]

export function Pattern() {
  return (
    <section className="w-full py-2 sm:py-4">
      <Carousel
        plugins={[
          Autoplay({
            delay: 2500,
            stopOnInteraction: false,
          }),
        ]}
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-3 sm:-ml-4">
          {images.map((image, index) => (
            <CarouselItem
              key={image}
              className="basis-full pl-3 sm:basis-1/2 lg:basis-1/2 sm:pl-4"
            >
              <Link href="/video" className="block focus:outline-none">
                <Card className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-white/15 bg-card/80 p-0 shadow-md backdrop-blur-xs transition-all duration-300 hover:border-primary/60 hover:shadow-xl hover:-translate-y-1">
                  <CldImage
                    src={image}
                    alt={`Course ${index + 1}`}
                    width={960}
                    height={540}
                    loading={index === 0 ? "eager" : "lazy"}
                    className="aspect-[16/9] h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </Card>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  )
}

export default Pattern
