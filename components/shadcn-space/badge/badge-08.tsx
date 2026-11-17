'use client'

import React from 'react'
import { GraduationCap } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface AnimatedBadgeProps {
  label: string
  icon?: React.ReactNode
  className?: string
  iconClassName?: string
}

export function AnimatedBadge({
  label,
  icon,
  className,
  iconClassName,
}: AnimatedBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'group relative inline-flex items-center gap-2 rounded-full border border-primary/30 bg-background/80 px-3.5 py-1 text-xs sm:text-sm font-medium backdrop-blur-md shadow-xs transition-all duration-300 hover:border-primary/50 hover:bg-background/95',
        className
      )}
    >
      <span className={cn('relative flex items-center justify-center shrink-0', iconClassName)}>
        {icon ?? (
          <span className="flex items-center gap-1.5">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            <GraduationCap className="size-3.5 text-primary" />
          </span>
        )}
      </span>
      <span className="font-semibold tracking-wide">{label}</span>
    </Badge>
  )
}

export default AnimatedBadge
