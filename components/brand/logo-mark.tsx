import { cn } from '@/lib/utils'

const INK = '#1a1a1a'
const YELLOW = '#FFE566'
const BORDER = '#E0CF4A'
const EMPTY = '#F5F4EF'
const EMPTY_STROKE = '#C9C5BA'

type LogoMarkProps = {
  size?: number
  className?: string
  /** When false, renders only the card mark (no yellow app tile behind it). */
  tile?: boolean
}

/**
 * LocalPunch mark — a loyalty punch card with stamped slots (not a boxing glove).
 */
export function LogoMark({ size = 28, className, tile = false }: LogoMarkProps) {
  const mark = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-hidden={tile ? true : undefined}
      aria-label={tile ? undefined : 'LocalPunch'}
      className={cn('flex-shrink-0', className)}
    >
      <rect x="3" y="8" width="26" height="17" rx="4" fill={YELLOW} stroke={INK} strokeWidth="2" />
      <rect x="5.5" y="10.5" width="21" height="12" rx="2" fill="#FFFFFF" stroke={INK} strokeWidth="1" />
      <circle cx="10.5" cy="16.5" r="3" fill={YELLOW} stroke={INK} strokeWidth="1.25" />
      <circle cx="16" cy="16.5" r="3" fill={YELLOW} stroke={INK} strokeWidth="1.25" />
      <circle cx="21.5" cy="16.5" r="3" fill={EMPTY} stroke={EMPTY_STROKE} strokeWidth="1.25" />
      <path
        d="M8.8 16.6 L10 18 L12.2 15.2"
        stroke={INK}
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.3 16.6 L15.5 18 L17.7 15.2"
        stroke={INK}
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )

  if (!tile) return mark

  const pad = Math.max(2, Math.round(size * 0.12))
  const inner = Math.round(size - pad * 2)

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center flex-shrink-0 bg-[#FFE566] border border-[#E0CF4A] rounded-lg',
        className,
      )}
      style={{ width: size, height: size, padding: pad }}
    >
      <LogoMark size={inner} tile={false} />
    </span>
  )
}
