'use client'

import React from 'react'
import { useFormFields } from '@payloadcms/ui'
import { Video } from 'lucide-react'

/**
 * Extracts a standard 11-character YouTube video ID from various URL formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - Raw 11-char ID
 */
export function extractYouTubeId(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null
  const trimmed = url.trim()

  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
  const match = trimmed.match(regExp)
  if (match && match[1]) {
    return match[1]
  }

  // Handle direct 11-character video ID input
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed
  }

  return null
}

export const YouTubePreview: React.FC<{ path?: string }> = ({ path }) => {
  // If placed inside an array item (e.g. 'lessons.0.lessonVideoPreview'),
  // dynamically resolve the sibling 'youtubeVideoIdOrUrl' field.
  // Otherwise default to the root 'introductoryVideo' field.
  const isLessonArray = Boolean(path && path.includes('lessons.'))
  const targetFieldName = isLessonArray && path
    ? path.replace(/\.[^.]+$/, '.youtubeVideoIdOrUrl')
    : 'introductoryVideo'

  const videoUrl = useFormFields(([fields]) => {
    return (fields?.[targetFieldName]?.value as string) || ''
  })

  const videoId = extractYouTubeId(videoUrl)

  if (!videoUrl || !videoUrl.trim()) {
    return (
      <div className="my-2 p-3 rounded-lg border border-dashed border-border bg-muted/20 text-muted-foreground text-xs flex items-center gap-2">
        <Video className="size-4 shrink-0 opacity-70" />
        <span>ইউটিউব ভিডিও প্রিভিউ: উপরে একটি বৈধ YouTube URL বা ভিডিও আইডি দিলে এখানে প্রিভিউ প্রদর্শিত হবে।</span>
      </div>
    )
  }

  if (!videoId) {
    return (
      <div className="my-2 p-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2">
        <span>⚠️ কোনো ভিডিও শনাক্ত করা যায়নি। অনুগ্রহ করে সঠিক ভিডিও আইডি বা লিঙ্ক দিন।</span>
      </div>
    )
  }

  return (
    <div className="my-3 p-3.5 rounded-xl border border-border bg-card shadow-xs max-w-xl">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
          <Video className="size-3.5 text-primary" />
          ভিডিও প্রিভিউ (Live Preview)
        </span>
      </div>
      <div className="relative aspect-video w-full rounded-lg overflow-hidden border border-border bg-black shadow-xs">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`}
          title="Video preview player"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="absolute inset-0 w-full h-full border-0"
        />
      </div>
    </div>
  )
}
