"use client"

import React, { useState } from "react"
import { CldImage, type CldImageProps } from "next-cloudinary"
import { cn } from "@/lib/utils"

export interface SafeCldImageProps extends Omit<CldImageProps, "src" | "alt"> {
  src: string
  alt: string
  fallbackSrc?: string
}

import { isCloudinarySrc, extractCloudinarySecureUrl } from "@/utils/cloudinary"

export { isCloudinarySrc, extractCloudinarySecureUrl }

/**
 * Safe wrapper around next-cloudinary's CldImage.
 * Uses Cloudinary edge CDN directly without local server proxying.
 * Accepts both Cloudinary public IDs and direct links from res.cloudinary.com.
 * Ignores/rejects local image links.
 */
export function SafeCldImage({
  src,
  width = 960,
  height = 600,
  sizes = "100vw",
  alt,
  className,
  fallbackSrc,
  ...props
}: SafeCldImageProps) {
  const [hasError, setHasError] = useState(false)

  if (!src || hasError) {
    if (fallbackSrc && isCloudinarySrc(fallbackSrc)) {
      return (
        <CldImage
          width={width}
          height={height}
          src={fallbackSrc}
          sizes={sizes}
          alt={alt}
          className={className}
          {...props}
        />
      )
    }
    return null
  }

  // If Cloudinary asset (res.cloudinary link or public ID), use CldImage directly
  if (isCloudinarySrc(src)) {
    return (
      <CldImage
        width={width}
        height={height}
        src={src}
        sizes={sizes}
        alt={alt}
        className={className}
        onError={() => setHasError(true)}
        {...props}
      />
    )
  }

  // If non-Cloudinary or local image, do not use CldImage
  if (fallbackSrc && isCloudinarySrc(fallbackSrc)) {
    return (
      <CldImage
        width={width}
        height={height}
        src={fallbackSrc}
        sizes={sizes}
        alt={alt}
        className={className}
        {...props}
      />
    )
  }

  return null
}

export { CldImage }
export default SafeCldImage
