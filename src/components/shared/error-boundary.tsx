'use client'

import { Component, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-8">
          <div className="flex items-center gap-3 text-red-500">
            <AlertTriangle className="h-8 w-8" />
            <h2 className="font-display text-2xl">Something went wrong</h2>
          </div>
          <p className="text-brand-light-gray text-center max-w-md">
            An unexpected error occurred. Please try again or contact support if the
            problem persists.
          </p>
          <Button
            variant="outline"
            onClick={() => this.setState({ hasError: false })}
          >
            Try Again
          </Button>
        </div>
      )
    }

    return this.props.children
  }
}

export function ErrorMessage({
  title = 'Error',
  message = 'Something went wrong. Please try again.',
  onRetry,
}: {
  title?: string
  message?: string
  onRetry?: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
      <AlertTriangle className="h-12 w-12 text-red-500" />
      <h3 className="font-display text-xl text-brand-white">{title}</h3>
      <p className="text-brand-light-gray max-w-md">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  )
}
