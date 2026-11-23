"use client"

import React, { useEffect, useState, useMemo } from "react"
import Header from "@/components/basic/header"
import { Footer } from "@/components/basic/footer"
import Image from "next/image"
import Link from "next/link"
import {
  Gift,
  Search,
  BookOpen,
  Video,
  FileText,
  ExternalLink,
  ArrowRight,
  Filter,
  CheckCircle2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

interface ResourceItem {
  id?: string
  title: string
  description?: string
  category: string
  type: string
  url: string
  imageUrl: string
  badge?: string
}

const DEFAULT_RESOURCES: ResourceItem[] = [
  {
    id: "default-1",
    title: "এস এস সি - ২০২৭",
    description: "এস এস সি ২০২৭ ব্যাচের জন্য প্রয়োজনীয় বিনামূল্যের শিক্ষাসামগ্রী ও ভিডিও ক্লাস।",
    category: "এস এস সি - ২০২৭",
    type: "video",
    url: "/video",
    imageUrl: "https://res.cloudinary.com/doqcv0ywi/image/upload/v1789305933/ssc27_mamvtg.png",
    badge: "বিনামূল্যে",
  },
  {
    id: "default-2",
    title: "এস এস সি - ২০২৮",
    description: "এস এস সি ২০২৮ ব্যাচের প্রস্তুতির জন্য বিনামূল্যের শিক্ষাসামগ্রী ও শর্টকাট গাইড।",
    category: "এস এস সি - ২০২৮",
    type: "video",
    url: "/video",
    imageUrl: "https://res.cloudinary.com/doqcv0ywi/image/upload/v1789305933/%E0%A7%81%E0%A7%81%E0%A7%A8%E0%A7%87%E0%A7%AE_o3naui.png",
    badge: "বিনামূল্যে",
  },
  {
    id: "default-3",
    title: "এইচ এস সি - ২০২৭",
    description: "এইচ এস সি ২০২৭ ব্যাচের জন্য সাজানো প্রয়োজনীয় একাডেমিক শিক্ষাসামগ্রী।",
    category: "এইচ এস সি - ২০২৭",
    type: "video",
    url: "/video",
    imageUrl: "https://res.cloudinary.com/doqcv0ywi/image/upload/v1789305933/hsc27_academic_naapzc.png",
    badge: "বিনামূল্যে",
  },
  {
    id: "default-4",
    title: "এইচ এস সি - ২০২৮",
    description: "এইচ এস সি ২০২৮ ব্যাচের একাডেমিক ফাউন্ডেশন ও পূর্ণাঙ্গ প্রস্তুতির রিসোর্স।",
    category: "এইচ এস সি - ২০২৮",
    type: "video",
    url: "/video",
    imageUrl: "https://res.cloudinary.com/doqcv0ywi/image/upload/v1789306254/Untitled-1_dpemy8.png",
    badge: "বিনামূল্যে",
  },
]

export default function FreeResourcesPage() {
  const [resources, setResources] = useState<ResourceItem[]>(DEFAULT_RESOURCES)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("সকল")
  const [selectedType, setSelectedType] = useState("সকল")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    fetch("/api/resources")
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data?.resources && Array.isArray(data.resources) && data.resources.length > 0) {
          setResources(data.resources)
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  // Dynamic Categories from available resources
  const categories = useMemo(() => {
    const set = new Set<string>()
    set.add("সকল")
    resources.forEach((r) => {
      if (r.category && r.category.trim()) set.add(r.category.trim())
    })
    return Array.from(set)
  }, [resources])

  // Filtered resources
  const filteredResources = useMemo(() => {
    return resources.filter((item) => {
      const matchSearch =
        searchQuery === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchCategory =
        selectedCategory === "সকল" || item.category === selectedCategory

      const matchType =
        selectedType === "সকল" ||
        (selectedType === "video" && item.type === "video") ||
        (selectedType === "pdf" && item.type === "pdf") ||
        (selectedType === "exam" && item.type === "exam")

      return matchSearch && matchCategory && matchType
    })
  }, [resources, searchQuery, selectedCategory, selectedType])

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 py-10 sm:py-14 lg:py-18">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Hero Header */}
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-3 sm:mb-4 flex justify-center">
              <Badge
                variant="outline"
                className="gap-1.5 rounded-full border-red-500/30 bg-red-950/30 px-3.5 py-1 text-xs sm:text-sm font-semibold text-red-500 shadow-xs"
              >
                <Gift className="size-3.5" />
                <span>১০০% ফ্রি রিসোর্স ও ক্লাস</span>
              </Badge>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl text-foreground">
              আপনার একাডেমিক প্রস্তুতিতে{" "}
              <span className="bg-gradient-to-r from-red-600 via-rose-500 to-red-600 bg-clip-text text-transparent">
                ফ্রি রিসোর্স ও লেকচার
              </span>
            </h1>

            <p className="mt-3 sm:mt-4 text-xs sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              কোনো প্রকার সাবস্ক্রিপশন ছাড়াই যেকোনো সময় আমাদের ফ্রি ক্লাস, কনসেপ্ট ক্লিয়ারিং লেকচার ও
              অনুশীলনী শিট দিয়ে আপনার প্রস্তুতি আরও এগিয়ে রাখুন।
            </p>
          </div>

          {/* Search & Filter Bar */}
          <div className="mt-8 sm:mt-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card/60 p-4 sm:p-5 rounded-2xl border border-border shadow-xs backdrop-blur-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="রিসোর্স বা টপিক খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 sm:h-11 rounded-xl"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-1">
                <Filter className="size-3.5" />
                <span>ধরন:</span>
              </div>
              {[
                { label: "সকল", value: "সকল" },
                { label: "ভিডিও ক্লাস", value: "video" },
                { label: "পিডিএফ শিট", value: "pdf" },
                { label: "প্রশ্নব্যাংক", value: "exam" },
              ].map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setSelectedType(t.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedType === t.value
                      ? "bg-red-600 text-white shadow-xs"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="mt-5 flex flex-wrap gap-2 pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer border ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-card hover:bg-muted text-muted-foreground border-border"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Resources Grid */}
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {filteredResources.map((resource, index) => (
              <Card
                key={resource.id || `${resource.title}-${index}`}
                className="group flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl border-2 border-border/80 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-red-500/40 hover:shadow-lg"
              >
                <CardContent className="p-0 flex flex-col flex-1">
                  {/* Thumbnail */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-muted/30">
                    <Image
                      src={resource.imageUrl}
                      alt={resource.title}
                      width={400}
                      height={250}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    <div className="absolute left-3 top-3">
                      <Badge
                        variant="secondary"
                        className="gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-black/70 text-white backdrop-blur-md border border-white/10"
                      >
                        <Gift className="size-3 text-red-400" />
                        {resource.badge || "বিনামূল্যে"}
                      </Badge>
                    </div>

                    <div className="absolute right-3 top-3">
                      <Badge
                        variant="outline"
                        className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-white/90 dark:bg-zinc-900/90 text-foreground border-none shadow-xs"
                      >
                        {resource.type === "pdf" ? "PDF" : resource.type === "exam" ? "EXAM" : "VIDEO"}
                      </Badge>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 sm:p-5 flex flex-col flex-1 justify-between">
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-red-600 dark:text-red-400">
                          {resource.category}
                        </span>
                      </div>

                      <h2 className="text-base sm:text-lg font-bold tracking-tight text-card-foreground group-hover:text-red-600 transition-colors line-clamp-1">
                        {resource.title}
                      </h2>

                      <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2">
                        {resource.description || "বিস্তারিত তথ্যের জন্য ক্লিক করুন।"}
                      </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-border/50">
                      <Button
                        asChild
                        className="w-full h-10 rounded-xl bg-red-600 hover:bg-red-500 text-white font-semibold text-xs sm:text-sm shadow-xs cursor-pointer"
                      >
                        <Link href={resource.url || "/video"}>
                          {resource.type === "pdf" ? (
                            <>
                              <FileText className="mr-1.5 size-4" />
                              <span>শিট ডাউনলোড করুন</span>
                            </>
                          ) : (
                            <>
                              <Video className="mr-1.5 size-4" />
                              <span>ক্লাস দেখুন</span>
                            </>
                          )}
                          <ArrowRight className="ml-1.5 size-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredResources.length === 0 && (
            <div className="mt-12 text-center py-12 bg-card rounded-2xl border border-dashed border-border">
              <BookOpen className="mx-auto size-10 text-muted-foreground/50 mb-3" />
              <p className="text-base font-semibold text-foreground">কোনো রিসোর্স পাওয়া যায়নি</p>
              <p className="text-xs text-muted-foreground mt-1">অন্য কোনো কি-ওয়ার্ড দিয়ে খুঁজে দেখুন।</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
