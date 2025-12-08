'use client'

import { useToastStore, type Toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { X, CheckCircle, XCircle, AlertTriangle, Info } from 'lucide-react'

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

const styles = {
  success: 'border-green-500 bg-green-500/10',
  error: 'border-red-500 bg-red-500/10',
  warning: 'border-yellow-500 bg-yellow-500/10',
  info: 'border-blue-500 bg-blue-500/10',
}

const iconStyles = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
}

function ToastItem({ toast }: { toast: Toast }) {
  const { removeToast } = useToastStore()
  const Icon = icons[toast.type]

  return (
    <div
      className={cn(
        'flex items-start gap-3 w-full max-w-sm p-4 border-l-4 bg-brand-darker shadow-lg',
        'animate-in slide-in-from-right-full fade-in-0 duration-300',
        styles[toast.type]
      )}
    >
      <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', iconStyles[toast.type])} />
      <div className="flex-1 min-w-0">
        <p className="font-mono text-sm font-semibold text-brand-white">
          {toast.title}
        </p>
        {toast.description && (
          <p className="mt-1 text-sm text-brand-light-gray">
            {toast.description}
          </p>
        )}
      </div>
      <button
        onClick={() => removeToast(toast.id)}
        className="shrink-0 text-brand-light-gray hover:text-brand-white transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export function Toaster() {
  const { toasts } = useToastStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}
