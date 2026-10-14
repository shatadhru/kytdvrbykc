'use client';

import '../styles/base.css';
import '../styles/audio/theme.css';
import '../styles/video/captions.css';
import '../styles/video/theme.css';
import { SeekButton as SeekButtonPrimitive } from '@videojs/react';
import { RotateCcw, RotateCw } from 'lucide-react';
import type { ComponentProps } from 'react';

import { Button } from '@/components/videojs/ui/button';
import { resolveClassName } from '@/payload/lib/resolve-class-name';
import { cn } from '@/payload/lib/utils';

export interface SeekButtonProps extends Omit<ComponentProps<typeof SeekButtonPrimitive>, 'children'> {
  seconds?: number;
  direction?: 'backward' | 'forward';
}

export function SeekButton({
  seconds = 10,
  direction = 'forward',
  className,
  ...props
}: SeekButtonProps) {
  const seekSeconds = direction === 'backward' ? -Math.abs(seconds) : Math.abs(seconds);

  return (
    <SeekButtonPrimitive
      seconds={seekSeconds}
      render={<Button />}
      className={(state) =>
        cn(
          'group/seek relative inline-flex items-center justify-center',
          resolveClassName(className, state)
        )
      }
      {...props}
    >
      {direction === 'backward' ? (
        <span className="relative flex items-center justify-center">
          <RotateCcw className="size-media-icon drop-shadow-media-icon" />
          <span className="absolute text-[8px] font-bold leading-none select-none tracking-tighter">
            10
          </span>
        </span>
      ) : (
        <span className="relative flex items-center justify-center">
          <RotateCw className="size-media-icon drop-shadow-media-icon" />
          <span className="absolute text-[8px] font-bold leading-none select-none tracking-tighter">
            10
          </span>
        </span>
      )}
    </SeekButtonPrimitive>
  );
}

