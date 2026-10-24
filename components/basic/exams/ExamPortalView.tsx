'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  GraduationCap,
  Clock,
  Search,
  CheckCircle2,
  FileText,
  ChevronRight,
  Award,
  Layers,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export interface ExamCatalogProps {
  categories: Array<{
    id: string
    name: string
    slug: string
    total_mcq: number
    total_cq: number
  }>
  subjects: Array<{
    id: string
    category_id: string
    name: string
    slug: string
    total_mcq: number
    total_cq: number
    chapters: Array<{
      id: string
      subject_id: string
      title: string
      chapter_index: number
      total_mcq: number
      total_cq: number
    }>
  }>
}

export function ExamPortalView({ categories, subjects }: ExamCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(null)

  // Filter subjects based on category & search query
  const filteredSubjects = useMemo(() => {
    return subjects.filter((subj) => {
      const matchesCategory =
        selectedCategory === 'all' || subj.category_id === selectedCategory

      const query = searchQuery.trim().toLowerCase()
      if (!query) return matchesCategory

      const matchesSubjName = subj.name.toLowerCase().includes(query)
      const matchesChapter = subj.chapters?.some((ch) =>
        ch.title.toLowerCase().includes(query),
      )

      return matchesCategory && (matchesSubjName || matchesChapter)
    })
  }, [subjects, selectedCategory, searchQuery])

  // Total stats
  const totalMcq = categories.reduce((sum, c) => sum + (c.total_mcq || 0), 0)
  const totalCq = categories.reduce((sum, c) => sum + (c.total_cq || 0), 0)

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* 1. Hero Section */}
      <div className="relative overflow-hidden rounded-2xl border border-teal-500/20 bg-gradient-to-br from-teal-500/10 via-card to-emerald-500/5 p-6 sm:p-8 shadow-sm">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/15 border border-teal-500/30 text-teal-700 dark:text-teal-300 text-xs font-semibold">
            <GraduationCap className="size-4" />
            <span>১০০% ফ্রি ওপেন এক্সাম ও প্রশ্নব্যাংক পোর্টাল</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            এসএসসি ও এইচএসসি প্রশ্নব্যাংক ও লাইভ পরীক্ষা
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            অধ্যায়ভিত্তিক স্ট্যান্ডার্ড টাইমারসহ আনলিমিটেড MCQ পরীক্ষা দাও, সঠিক উত্তর ও বিশদ ব্যাখ্যাসহ তাৎক্ষণিক রেজাল্ট জেনে নাও। সৃজনশীল (CQ) প্রশ্ন অনুশীলনের জন্য রয়েছে উন্মুক্ত আর্কাইভ।
          </p>

          {/* Quick Stats Pill */}
          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-foreground">
            <span className="flex items-center gap-1.5 bg-background/80 px-3 py-1.5 rounded-lg border border-border shadow-xs">
              <CheckCircle2 className="size-4 text-emerald-500" />
              <span>{totalMcq.toLocaleString('bn-BD')} টি বহুনির্বাচনি (MCQ)</span>
            </span>
            <span className="flex items-center gap-1.5 bg-background/80 px-3 py-1.5 rounded-lg border border-border shadow-xs">
              <FileText className="size-4 text-blue-500" />
              <span>{totalCq.toLocaleString('bn-BD')} টি সৃজনশীল প্রশ্ন (CQ)</span>
            </span>
            <span className="flex items-center gap-1.5 bg-background/80 px-3 py-1.5 rounded-lg border border-border shadow-xs">
              <Clock className="size-4 text-amber-500" />
              <span>রিয়েল-টাইম এক্সাম টাইমার ও প্রোফাইল ট্র্যাকিং</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Category Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
            className="rounded-full text-xs h-8 px-4"
          >
            সকল বিষয় ({subjects.length})
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategory === cat.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat.id)}
              className="rounded-full text-xs h-8 px-4 shrink-0"
            >
              {cat.name}
            </Button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="বিষয় বা অধ্যায় খুঁজুন..."
            className="pl-9 h-9 text-xs"
          />
        </div>
      </div>

      {/* 3. Subjects Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <BookOpen className="size-5 text-teal-600" />
            <span>বিষয় তালিকা ({filteredSubjects.length})</span>
          </h2>
          <span className="text-xs text-muted-foreground">
            বিষয় নির্বাচন করে অধ্যায়ভিত্তিক পরীক্ষা শুরু করুন
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubjects.map((subj) => {
            const isExpanded = expandedSubjectId === subj.id
            const chapterCount = subj.chapters?.length || 0

            return (
              <Card
                key={subj.id}
                className={`transition-all border hover:border-teal-500/50 ${
                  isExpanded ? 'ring-2 ring-teal-500/30' : ''
                }`}
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <Badge variant="outline" className="text-[10px] uppercase font-bold text-teal-600 dark:text-teal-400 border-teal-500/30 mb-1">
                        {subj.category_id === 'hsc' ? 'এইচএসসি' : subj.category_id === 'ssc' ? 'এসএসসি' : 'সাধারণ'}
                      </Badge>
                      <CardTitle className="text-base font-bold text-foreground leading-snug line-clamp-1">
                        {subj.name}
                      </CardTitle>
                    </div>
                  </div>
                  <CardDescription className="text-xs flex items-center gap-3 pt-1">
                    <span>{chapterCount} টি অধ্যায়</span>
                    <span>•</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium">{subj.total_mcq} MCQ</span>
                    {subj.total_cq > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-blue-600 dark:text-blue-400 font-medium">{subj.total_cq} CQ</span>
                      </>
                    )}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-4 pt-2">
                  <Button
                    variant={isExpanded ? 'default' : 'outline'}
                    size="sm"
                    className="w-full text-xs h-8 justify-between"
                    onClick={() =>
                      setExpandedSubjectId(isExpanded ? null : subj.id)
                    }
                  >
                    <span>{isExpanded ? 'অধ্যায়সমূহ লুকান' : 'অধ্যায়সমূহ দেখুন'}</span>
                    <ChevronRight
                      className={`size-4 transition-transform duration-200 ${
                        isExpanded ? 'rotate-90' : ''
                      }`}
                    />
                  </Button>

                  {/* Expandable Chapter List */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-border space-y-2 max-h-72 overflow-y-auto pr-1">
                      {subj.chapters.map((ch) => (
                        <div
                          key={ch.id}
                          className="rounded-lg border border-border p-2.5 bg-muted/40 hover:bg-muted/70 transition-colors space-y-2"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-xs font-semibold text-foreground line-clamp-2 leading-relaxed">
                              {ch.title}
                            </h4>
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/50 text-[11px]">
                            <div className="flex items-center gap-2 text-muted-foreground">
                              {ch.total_mcq > 0 && (
                                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                  {ch.total_mcq} MCQ
                                </span>
                              )}
                              {ch.total_cq > 0 && (
                                <span className="text-blue-600 dark:text-blue-400 font-medium">
                                  {ch.total_cq} CQ
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              {ch.total_mcq > 0 && (
                                <Button
                                  asChild
                                  size="sm"
                                  className="h-7 text-[11px] px-2.5 bg-teal-600 hover:bg-teal-500 text-white font-medium"
                                >
                                  <Link href={`/exams/${ch.id}/mcq`}>
                                    <Clock className="size-3 mr-1" />
                                    MCQ পরীক্ষা
                                  </Link>
                                </Button>
                              )}
                              {ch.total_cq > 0 && (
                                <Button
                                  asChild
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-[11px] px-2.5 border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/10"
                                >
                                  <Link href={`/exams/${ch.id}/cq`}>
                                    <FileText className="size-3 mr-1" />
                                    সৃজনশীল
                                  </Link>
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredSubjects.length === 0 && (
          <div className="text-center py-12 border border-dashed rounded-xl p-8 space-y-2">
            <BookOpen className="size-10 mx-auto text-muted-foreground/60" />
            <h3 className="text-base font-bold text-foreground">কোন বিষয় পাওয়া যায়নি</h3>
            <p className="text-xs text-muted-foreground">
              অনুগ্রহ করে ভিন্ন কোনো শব্দ বা ক্যাটাগরি নির্বাচন করে পুনরায় চেষ্টা করুন।
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

