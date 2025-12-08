'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/shared/logo'
import { Nav } from './nav'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import { X, User, Package, Settings, LogOut, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileMenuProps {
  open: boolean
  onClose: () => void
}

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const { user, profile, isAdmin, signOut } = useAuth()

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const handleSignOut = async () => {
    await signOut()
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-brand-black/80 backdrop-blur-sm transition-opacity md:hidden',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-brand-darker border-l border-brand-gray transform transition-transform duration-300 md:hidden',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-brand-gray">
            <Logo size="md" />
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto py-6">
            <Nav vertical onLinkClick={onClose} />
          </div>

          {/* User Section */}
          <div className="border-t border-brand-gray p-4">
            {user ? (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="font-mono text-sm text-brand-white">
                    {profile?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-brand-light-gray">{user.email}</p>
                </div>

                <div className="space-y-2">
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={onClose}
                      className="flex items-center gap-3 px-4 py-2 text-brand-light-gray hover:text-brand-neon transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <span className="font-mono text-sm uppercase tracking-wider">
                        Admin Dashboard
                      </span>
                    </Link>
                  )}
                  <Link
                    href="/account"
                    onClick={onClose}
                    className="flex items-center gap-3 px-4 py-2 text-brand-light-gray hover:text-brand-neon transition-colors"
                  >
                    <User className="h-4 w-4" />
                    <span className="font-mono text-sm uppercase tracking-wider">
                      My Account
                    </span>
                  </Link>
                  <Link
                    href="/account/orders"
                    onClick={onClose}
                    className="flex items-center gap-3 px-4 py-2 text-brand-light-gray hover:text-brand-neon transition-colors"
                  >
                    <Package className="h-4 w-4" />
                    <span className="font-mono text-sm uppercase tracking-wider">
                      Orders
                    </span>
                  </Link>
                  <Link
                    href="/account/settings"
                    onClick={onClose}
                    className="flex items-center gap-3 px-4 py-2 text-brand-light-gray hover:text-brand-neon transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    <span className="font-mono text-sm uppercase tracking-wider">
                      Settings
                    </span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 px-4 py-2 text-red-500 hover:text-red-400 transition-colors w-full"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="font-mono text-sm uppercase tracking-wider">
                      Sign Out
                    </span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Button className="w-full" asChild>
                  <Link href="/login" onClick={onClose}>
                    Sign In
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/register" onClick={onClose}>
                    Create Account
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
