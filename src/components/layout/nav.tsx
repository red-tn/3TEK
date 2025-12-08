'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { NAV_LINKS } from '@/lib/constants'

interface NavProps {
  className?: string
  vertical?: boolean
  onLinkClick?: () => void
}

export function Nav({ className, vertical = false, onLinkClick }: NavProps) {
  const pathname = usePathname()

  return (
    <nav
      className={cn(
        'items-center gap-1',
        vertical ? 'flex flex-col' : 'flex',
        className
      )}
    >
      {NAV_LINKS.map((link) => {
        const isActive = pathname === link.href || pathname.startsWith(link.href + '/')

        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onLinkClick}
            className={cn(
              'px-4 py-2 font-mono text-sm uppercase tracking-wider transition-colors',
              vertical && 'w-full text-center',
              isActive
                ? 'text-brand-neon'
                : 'text-brand-light-gray hover:text-brand-white'
            )}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
