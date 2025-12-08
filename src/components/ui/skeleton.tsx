import { cn } from '@/lib/utils'

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse bg-brand-gray/50',
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
