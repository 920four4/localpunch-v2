import { cn } from '@/lib/utils'

const INK = '#1a1a1a'
const YELLOW = '#FFE566'

type LogoMarkProps = {
  size?: number
  className?: string
  /** When true, renders the ring on a rounded brand-yellow app tile. */
  tile?: boolean
}

/**
 * LocalPunch mark — a bold punch ring. On its own it's the ring; with `tile`
 * it sits on the rounded brand-yellow app tile (favicon / logo lockup).
 */
export function LogoMark({ size = 28, className, tile = false }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="LocalPunch"
      className={cn('flex-shrink-0', className)}
    >
      {tile && (
        <rect x="7" y="7" width="498" height="498" rx="95" fill={YELLOW} stroke={INK} strokeWidth="14" />
      )}
      <circle cx="256" cy="256" r="154" fill="none" stroke={INK} strokeWidth="61" />
    </svg>
  )
}
