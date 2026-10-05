'use client'

import { useEffect, useState } from 'react'
import { VideoPlayer } from '@videojs/react/video'
import { YouTubeVideo } from '@videojs/react/media/youtube-video'

import { VideoSkin } from '@/components/videojs/video/skin'
import { resolveVideoHash } from '@/app/actions/video'

function normalizeVideoUrl(input?: string | null): string | null {
  if (!input) return null
  const trimmed = input.trim()
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return `https://www.youtube.com/watch?v=${trimmed}`
  }
  return trimmed
}

export default function CustomVideoPlayer({
  url: initialUrl = 'https://youtu.be/Ce5NRFL8Kao',
  videoHash,
  className = '',
}: {
  url?: string
  videoHash?: string
  className?: string
}) {
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

    // Encrypted hash (base64url token > 25 chars and not a URL)
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
          <div className="size-8 animate-spin rounded-full border-2 border-zinc-600 border-t-zinc-200" />
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
            onContextMenu={(e) => {
              e.preventDefault()
              e.stopPropagation()
            }}
          >
            {/* 
              YouTube Player Wrapper:
              - pointer-events-none completely prevents mouse/touch from reaching the iframe.
              - key={playableUrl} ensures clean unmount and remount when switching videos.
            */}
            <div className="pointer-events-none absolute inset-0 size-full select-none [&>iframe]:pointer-events-none [&>iframe]:size-full">
              <YouTubeVideo
                key={playableUrl}
                src={playableUrl}
                source={{
                  src: playableUrl,
                  engine: {
                    youtube: {
                      disablekb: 1, // Disable YouTube internal keyboard controls
                      fs: 0, // Disable native YouTube fullscreen button
                      rel: 0, // Disable third-party recommended videos
                      iv_load_policy: 3, // Disable YouTube interactive annotations/cards
                      modestbranding: 1, // Minimize YouTube logo/branding
                      playsinline: 1, // Prevent iOS mobile native player hijacking
                    },
                  },
                }}
              />
            </div>

            {/* 
              Protection Shield Layer:
              - Positioned directly over the YouTube player (z-10) and underneath Video.js controls (z-30).
              - Completely blocks right-click, link clicks, channel navigation, and YouTube branding.
              - Bubbles pointer events to Video.js Container for gestures (play/pause, seek, fullscreen).
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
      ) : null}
    </div>
  )
}


