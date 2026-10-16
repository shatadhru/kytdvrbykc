'use client'

import { useEffect, useState } from 'react'
import { VideoPlayer } from '@videojs/react/video'
import { YouTubeVideo } from '@videojs/react/media/youtube-video'

import { VideoSkin } from '@/components/videojs/video/skin'
import { resolveVideoHash } from '@/app/actions/video'

export interface CourseVideoPlayerProps {
  /** Raw YouTube URL or video ID (for preview/free mode) */
  url?: string
  /** Tamper-proof AES-256-GCM video token */
  videoHash?: string
  /** Additional container styling */
  className?: string
  /** Poster thumbnail image URL */
  poster?: string
}

function normalizeVideoUrl(input?: string | null): string | null {
  if (!input) return null
  const trimmed = input.trim()
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return `https://www.youtube.com/watch?v=${trimmed}`
  }
  return trimmed
}

export default function CourseVideoPlayer({
  url: initialUrl = '',
  videoHash,
  className = '',
  poster,
}: CourseVideoPlayerProps) {
  const [playableUrl, setPlayableUrl] = useState<string | null>(() => {
    if (videoHash) return null
    return normalizeVideoUrl(initialUrl)
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(() => Boolean(videoHash))

  useEffect(() => {
    const target = (videoHash || initialUrl || '').trim()
    if (!target) {
      setPlayableUrl(null)
      setIsLoading(false)
      return
    }

    // Encrypted hash token detection
    const isEncryptedHash =
      !target.startsWith('http://') &&
      !target.startsWith('https://') &&
      !target.startsWith('/') &&
      target.length > 25 &&
      !/^[a-zA-Z0-9_-]{11}$/.test(target)

    if (isEncryptedHash) {
      setIsLoading(true)
      setError(null)
      resolveVideoHash(target).then((res) => {
        if (res.success && res.url) {
          setPlayableUrl(normalizeVideoUrl(res.url))
        } else {
          setError(res.error || 'Failed to authenticate video access.')
        }
        setIsLoading(false)
      })
    } else {
      setPlayableUrl(normalizeVideoUrl(target))
      setIsLoading(false)
      setError(null)
    }
  }, [videoHash, initialUrl])

  return (
    <div
      className={`group/player relative w-full select-none overflow-hidden rounded-xl bg-black shadow-2xl ${className}`}
      onContextMenu={(e) => e.preventDefault()}
    >
      {isLoading ? (
        <div className="aspect-video flex w-full flex-col items-center justify-center gap-2 bg-zinc-950 text-zinc-400">
          <div className="size-8 animate-spin rounded-full border-2 border-zinc-600 border-t-teal-400" />
          <span className="text-xs font-medium tracking-wide">Securing playback stream...</span>
        </div>
      ) : error ? (
        <div className="aspect-video flex w-full flex-col items-center justify-center gap-2 bg-zinc-950 p-6 text-center text-red-400">
          <span className="text-sm font-semibold">{error}</span>
          <span className="text-xs text-zinc-500">Access denied or session token expired.</span>
        </div>
      ) : playableUrl ? (
        <VideoPlayer>
          <VideoSkin
            className="aspect-video w-full select-none"
            renderPoster={poster ? () => <img src={poster} alt="Course Poster" className="size-full object-cover" /> : undefined}
            onContextMenu={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
          >
            {/* 
              Responsive YouTube Player:
              - aspect-video & pointer-events-none completely prevent direct YouTube iframe interaction
              - rel=0, disablekb=1, modestbranding=1 eliminate external recommended links & branding
            */}
            <div className="pointer-events-none absolute inset-0 size-full select-none overflow-hidden [&>iframe]:pointer-events-none [&>iframe]:size-full">
              <YouTubeVideo
                key={playableUrl}
                src={playableUrl}
                source={{
                  src: playableUrl,
                  engine: {
                    youtube: {
                      disablekb: 1,
                      fs: 0,
                      rel: 0,
                      iv_load_policy: 3,
                      modestbranding: 1,
                      playsinline: 1,
                    },
                  },
                }}
              />
            </div>

            {/* 
              Protection Shield Layer:
              - Positioned directly over YouTube iframe (z-10) and underneath Video.js controls (z-30).
              - Dispatches touch & mouse gestures to Video.js: double-tap seeks 10s, single tap toggles controls.
            */}
            <div
              className="absolute inset-0 z-10 cursor-pointer select-none bg-transparent touch-manipulation"
              aria-hidden="true"
              onContextMenu={(e) => {
                e.preventDefault()
                e.stopPropagation()
              }}
            />
          </VideoSkin>
        </VideoPlayer>
      ) : (
        <div className="aspect-video flex w-full flex-col items-center justify-center bg-zinc-950 text-zinc-500 text-xs">
          No video selected.
        </div>
      )}
    </div>
  )
}
export { CourseVideoPlayer }

