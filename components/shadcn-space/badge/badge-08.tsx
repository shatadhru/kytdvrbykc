'use client'

import React from 'react'
import { Loader } from 'lucide-react'
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
  icon = <Loader size={14} strokeWidth={2.5} className="animate-spin text-red-600" />,
  className,
  iconClassName,
}: AnimatedBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'inline-flex items-center gap-2 rounded-full border-border/70 bg-background/80 px-3.5 py-1 text-xs sm:text-sm font-medium backdrop-blur-sm shadow-xs',
        className
      )}
    >
      <span className={cn('shrink-0 flex items-center justify-center', iconClassName)}>
        {icon}
      </span>
      <span>{label}</span>
    </Badge>
  )
}

export default AnimatedBadge