import Link from 'next/link'
import { Logo } from '@/components/shared/logo'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-brand-black flex flex-col">
      {/* Header */}
      <header className="p-6">
        <Logo size="lg" />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center">
        <p className="text-sm text-brand-light-gray">
          &copy; {new Date().getFullYear()} 3TEK Design. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
