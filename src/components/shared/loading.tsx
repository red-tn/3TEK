import { cn } from '@/lib/utils'

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

const sizes = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-3',
}

export function Loading({ size = 'md', className, text }: LoadingProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center gap-4', className)}>
      <div
        className={cn(
          'animate-spin rounded-full border-brand-gray border-t-brand-neon',
          sizes[size]
        )}
      />
      {text && (
        <p className="font-mono text-sm text-brand-light-gray uppercase tracking-wider">
          {text}
        </p>
      )}
    </div>
  )
}

export function LoadingPage() {
  return (
    <div className="flex h-screen items-center justify-center bg-brand-black">
      <Loading size="lg" text="Loading..." />
    </div>
  )
}

export function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-black/80 backdrop-blur-sm">
      <Loading size="lg" text="Processing..." />
    </div>
  )
}
