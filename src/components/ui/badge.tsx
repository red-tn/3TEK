import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center px-2.5 py-0.5 font-mono text-xs font-semibold uppercase tracking-wider transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-brand-neon text-brand-black',
        secondary: 'bg-brand-gray text-brand-white',
        rust: 'bg-brand-rust text-brand-white',
        outline: 'border border-brand-neon text-brand-neon bg-transparent',
        success: 'bg-green-600 text-white',
        warning: 'bg-yellow-600 text-black',
        destructive: 'bg-red-600 text-white',
        info: 'bg-blue-600 text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
