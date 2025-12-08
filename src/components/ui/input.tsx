import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(
            'flex h-11 w-full bg-brand-darker border-2 border-brand-gray px-4 py-2 font-mono text-sm text-brand-white placeholder:text-brand-light-gray/50 transition-colors',
            'focus:outline-none focus:border-brand-neon focus:shadow-[0_0_10px_rgba(57,255,20,0.2)]',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'file:border-0 file:bg-transparent file:text-sm file:font-medium',
            error && 'border-red-500 focus:border-red-500',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-red-500 font-mono">{error}</p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

export { Input }
