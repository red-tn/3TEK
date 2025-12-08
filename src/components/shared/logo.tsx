import Link from 'next/link'
import { cn } from '@/lib/utils'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  href?: string
}

const sizes = {
  sm: 'text-xl',
  md: 'text-2xl',
  lg: 'text-4xl',
  xl: 'text-6xl',
}

export function Logo({ className, size = 'md', href = '/' }: LogoProps) {
  const content = (
    <>
      <span className="text-brand-neon drop-shadow-[0_0_10px_rgba(57,255,20,0.4)]">
        3
      </span>
      <span className="text-brand-white">TEK</span>
    </>
  )

  return (
    <Link
      href={href}
      className={cn(
        'font-display tracking-wider inline-flex items-baseline',
        sizes[size],
        className
      )}
    >
      {content}
    </Link>
  )
}
