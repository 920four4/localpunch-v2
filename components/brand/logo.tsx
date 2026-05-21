import { cn } from '@/lib/utils'
import { SITE_NAME } from '@/lib/site'
import { LogoMark } from './logo-mark'

type LogoProps = {
  /** Outer tile size (mark scales inside). */
  size?: 'sm' | 'md' | 'lg'
  showWordmark?: boolean
  wordmarkClassName?: string
  className?: string
}

const sizes = {
  sm: 24,
  md: 32,
  lg: 40,
} as const

export function Logo({
  size = 'md',
  showWordmark = true,
  wordmarkClassName,
  className,
}: LogoProps) {
  const px = sizes[size]

  return (
    <span className={cn('inline-flex items-center gap-2 min-w-0', className)}>
      <LogoMark size={px} tile />
      {showWordmark && (
        <span
          className={cn('font-bold tracking-tight truncate', wordmarkClassName)}
          style={{ fontFamily: 'var(--font-space-grotesk)' }}
        >
          {SITE_NAME}
        </span>
      )}
    </span>
  )
}
