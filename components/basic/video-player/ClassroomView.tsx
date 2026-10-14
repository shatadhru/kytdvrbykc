'use client'

import { useState } from 'react'
import CustomVideoPlayer from './VideoPlayer'
import {
  Play,
  BookOpen,
  ShieldCheck,
  Clock,
  PlayCircle,
} from 'lucide-react'

export interface ClassroomClassItem {
  id: string
  title: string
  subjectSlug: string
  order?: number | null
  duration?: string | null
  isFreePreview?: boolean | null
  videoSource?: string | null
  videoHash?: string | null
}

export interface ClassroomSubjectItem {
  name: string
  slug: string
  description?: string | null
}

export interface ClassroomCourseItem {
  id: string
  title: string
  slug?: string | null
  description?: string | null
  subjects?: ClassroomSubjectItem[] | null
  classes?: ClassroomClassItem[] | null
}

interface ClassroomViewProps {
  course: ClassroomCourseItem
  initialClasses: ClassroomClassItem[]
}

export default function ClassroomView({
  course,
  initialClasses,
}: ClassroomViewProps) {
  const [classes] = useState<ClassroomClassItem[]>(initialClasses)
  const defaultClass = classes[0]

  const [activeClassId, setActiveClassId] = useState<string>(defaultClass?.id || '')
  const [activeVideoUrl, setActiveVideoUrl] = useState<string>(
    defaultClass?.videoSource || 'https://youtu.be/Ce5NRFL8Kao'
  )
  const [activeVideoHash, setActiveVideoHash] = useState<string | undefined>(
    defaultClass?.videoHash || undefined
  )
  const [customInputUrl, setCustomInputUrl] = useState<string>('')
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [fetchingToken, setFetchingToken] = useState<boolean>(false)
  const [accessError, setAccessError] = useState<string | null>(null)

  const currentClass = classes.find((c) => c.id === activeClassId)

  // Filter classes by selected subject
  const filteredClasses = classes.filter((c) => {
    if (selectedSubject === 'all') return true
    return c.subjectSlug.toLowerCase() === selectedSubject.toLowerCase()
  })

  const handleSelectClass = async (cls: ClassroomClassItem) => {
    setActiveClassId(cls.id)
    setAccessError(null)

    // If we have a courseSlug, always fetch a fresh token from the access API.
    // Enrollment is verified server-side on every lesson click.
    if (course.slug && cls.id) {
      setFetchingToken(true)
      setActiveVideoHash(undefined)
      setActiveVideoUrl('')
      try {
        const res = await fetch(`/api/courses/${course.slug}/lessons/${cls.id}/access`)
        const data = await res.json()
        if (data.success && data.token) {
          setActiveVideoHash(data.token)
          setActiveVideoUrl('')
        } else {
          setAccessError(data.error || 'Access denied.')
          setActiveVideoHash(undefined)
        }
      } catch {
        setAccessError('Failed to load video. Please try again.')
      } finally {
        setFetchingToken(false)
      }
      return
    }

    // Fallback: direct URL (dev / demo mode without a real course slug)
    if (cls.videoHash) {
      setActiveVideoHash(cls.videoHash)
      setActiveVideoUrl('')
    } else if (cls.videoSource) {
      setActiveVideoUrl(cls.videoSource)
      setActiveVideoHash(undefined)
    }
  }

  const handleLoadCustomUrl = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = customInputUrl.trim()
    if (!trimmed) return
    setActiveClassId('')
    setActiveVideoHash(undefined)
    setActiveVideoUrl(trimmed)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 antialiased selection:bg-teal-500/30 selection:text-teal-200">
      {/* Top Banner Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-900/60 backdrop-blur-md px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <BookOpen className="size-5" />
            </div>
            <div className="truncate">
              <span className="block text-xs font-medium text-teal-400">NextLoad Classroom</span>
              <h1 className="truncate text-sm sm:text-base font-semibold text-zinc-100">
                {course.title || 'Course Classroom'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-500/30 bg-teal-500/10 px-2.5 py-1 text-[11px] font-medium text-teal-300">
              <ShieldCheck className="size-3.5" />
              <span className="hidden sm:inline">Anti-Piracy</span> Protected
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-6 lg:py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Left Column: Player & Active Lesson Info (8 Cols on Desktop, sticky on mobile) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {/* Sticky Player Container for mobile */}
            <div className="sticky top-0 z-20 -mx-3 sm:mx-0 sm:static sm:z-auto bg-zinc-950/90 sm:bg-transparent backdrop-blur-sm sm:backdrop-blur-none p-1 sm:p-0">
              <div className="rounded-xl border border-zinc-800 bg-black overflow-hidden shadow-2xl">
                {fetchingToken ? (
                  <div className="aspect-video flex w-full flex-col items-center justify-center gap-2 bg-zinc-950 text-zinc-400">
                    <div className="size-8 animate-spin rounded-full border-2 border-zinc-600 border-t-teal-400" />
                    <span className="text-xs font-medium tracking-wide">Verifying access...</span>
                  </div>
                ) : accessError ? (
                  <div className="aspect-video flex w-full flex-col items-center justify-center gap-2 bg-zinc-950 p-6 text-center">
                    <ShieldCheck className="size-8 text-red-400" />
                    <span className="text-sm font-semibold text-red-400">{accessError}</span>
                    <span className="text-xs text-zinc-500">Purchase this course to unlock access.</span>
                  </div>
                ) : (
                  <CustomVideoPlayer
                    key={activeVideoHash || activeVideoUrl}
                    url={activeVideoUrl}
                    videoHash={activeVideoHash}
                  />
                )}
              </div>

              {/* Protection Badge Underneath Player */}
              <div className="mt-2.5 flex items-center justify-between text-[11px] text-zinc-400 px-1">
                <span className="flex items-center gap-1 text-emerald-400 font-medium">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Piracy Protection Shield Active (No YouTube Clicks)
                </span>
                <span className="hidden sm:inline text-zinc-500">
                  Full Video.js gesture & keyboard controls enabled
                </span>
              </div>
            </div>

            {/* Current Lesson Title & Description */}
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800/60 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-teal-500/10 px-2 py-0.5 text-xs font-semibold text-teal-400 border border-teal-500/20 uppercase tracking-wide">
                    {currentClass?.subjectSlug || 'Direct URL'}
                  </span>
                  {currentClass?.isFreePreview && (
                    <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                      Free Preview
                    </span>
                  )}
                </div>
                {currentClass?.duration && (
                  <span className="flex items-center gap-1 text-xs text-zinc-400">
                    <Clock className="size-3.5" /> {currentClass.duration}
                  </span>
                )}
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-zinc-100">
                {currentClass?.title || 'Custom Video Playback'}
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-zinc-400 leading-relaxed">
                {course.description || 'Welcome to this class. Watch the complete lecture securely.'}
              </p>
            </div>

            {/* Quick Test Bar for Admin / Custom YouTube URL */}
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-4">
              <div className="flex items-center gap-2 mb-2.5">
                <PlayCircle className="size-4 text-teal-400" />
                <h3 className="text-xs sm:text-sm font-semibold text-zinc-200">
                  Test Any YouTube URL Instantly
                </h3>
              </div>
              <form onSubmit={handleLoadCustomUrl} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={customInputUrl}
                    onChange={(e) => setCustomInputUrl(e.target.value)}
                    placeholder="Paste any YouTube URL (e.g. https://youtu.be/... or watch?v=...)"
                    className="w-full rounded-lg border border-zinc-700/80 bg-zinc-950 px-3 py-2 text-xs sm:text-sm text-zinc-200 placeholder:text-zinc-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-teal-500 active:scale-95 transition-all shrink-0 cursor-pointer shadow-md shadow-teal-900/30"
                >
                  <Play className="size-3.5 fill-white" />
                  Load Video
                </button>
              </form>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-zinc-400">
                <span className="text-zinc-500">Quick samples:</span>
                <button
                  type="button"
                  onClick={() => {
                    setCustomInputUrl('https://youtu.be/Ce5NRFL8Kao')
                    setActiveVideoUrl('https://youtu.be/Ce5NRFL8Kao')
                    setActiveVideoHash(undefined)
                    setActiveClassId('')
                  }}
                  className="text-teal-400 hover:underline cursor-pointer"
                >
                  Sample 1 (Lofi)
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => {
                    setCustomInputUrl('https://youtu.be/oXtkoxmIiCc')
                    setActiveVideoUrl('https://youtu.be/oXtkoxmIiCc')
                    setActiveVideoHash(undefined)
                    setActiveClassId('')
                  }}
                  className="text-teal-400 hover:underline cursor-pointer"
                >
                  Sample 2 (Science)
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Curriculum / Subject Navigation (4 Cols on Desktop) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 shadow-xl flex flex-col">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <BookOpen className="size-4 text-teal-400" />
                  <h3 className="font-semibold text-sm sm:text-base text-zinc-100">
                    Course Curriculum
                  </h3>
                </div>
                <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-300 font-medium">
                  {classes.length} Classes
                </span>
              </div>

              {/* Subject Tabs Filter (Mobile / Desktop) */}
              {course.subjects && course.subjects.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedSubject('all')}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                      selectedSubject === 'all'
                        ? 'bg-teal-500 text-black font-semibold'
                        : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    All ({classes.length})
                  </button>
                  {course.subjects.map((sub) => {
                    const count = classes.filter(
                      (c) => c.subjectSlug.toLowerCase() === sub.slug.toLowerCase()
                    ).length
                    return (
                      <button
                        key={sub.slug}
                        type="button"
                        onClick={() => setSelectedSubject(sub.slug)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                          selectedSubject === sub.slug
                            ? 'bg-teal-500 text-black font-semibold'
                            : 'bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700'
                        }`}
                      >
                        {sub.name} ({count})
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Class List */}
              <div className="flex flex-col gap-2 max-h-[520px] overflow-y-auto pr-1">
                {filteredClasses.length === 0 ? (
                  <div className="p-6 text-center text-xs text-zinc-500">
                    No classes available for this subject yet.
                  </div>
                ) : (
                  filteredClasses.map((cls, idx) => {
                    const isActive = cls.id === activeClassId
                    return (
                      <button
                        key={cls.id || idx}
                        type="button"
                        onClick={() => handleSelectClass(cls)}
                        className={`group relative flex items-start gap-3 rounded-lg p-3 text-left transition-all cursor-pointer ${
                          isActive
                            ? 'bg-teal-500/10 border border-teal-500/40 text-teal-200 shadow-md shadow-teal-950/40'
                            : 'bg-zinc-950/60 border border-zinc-800/60 text-zinc-300 hover:bg-zinc-800/60 hover:border-zinc-700'
                        }`}
                      >
                        {/* Play Icon / Active Pulse Indicator */}
                        <div
                          className={`mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full transition-colors ${
                            isActive
                              ? 'bg-teal-500 text-black'
                              : 'bg-zinc-800 text-zinc-400 group-hover:bg-zinc-700 group-hover:text-zinc-200'
                          }`}
                        >
                          {isActive ? (
                            <Play className="size-3.5 fill-black" />
                          ) : (
                            <Play className="size-3.5 fill-current ml-0.5" />
                          )}
                        </div>

                        {/* Title & Metadata */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold truncate leading-snug">
                              {cls.title}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-[11px] text-zinc-400">
                            <span className="capitalize">{cls.subjectSlug}</span>
                            {cls.duration && (
                              <>
                                <span>•</span>
                                <span>{cls.duration}</span>
                              </>
                            )}
                            {cls.isFreePreview && (
                              <>
                                <span>•</span>
                                <span className="text-emerald-400 font-medium">Free</span>
                              </>
                            )}
                          </div>
                        </div>

                        {isActive && (
                          <span className="flex size-2 rounded-full bg-teal-400 animate-ping self-center" />
                        )}
                      </button>
                    )
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
