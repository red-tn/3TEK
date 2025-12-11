'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Logo } from '@/components/shared/logo'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  FolderTree,
  Users,
  Truck,
  Tag,
  BarChart3,
  Settings,
  ArrowLeft,
} from 'lucide-react'

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Categories', href: '/admin/categories', icon: FolderTree },
  { label: 'Customers', href: '/admin/customers', icon: Users },
  { label: 'Shipping', href: '/admin/shipping', icon: Truck },
  { label: 'Coupons', href: '/admin/coupons', icon: Tag },
  { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-brand-gray bg-brand-darker">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-brand-gray px-6">
          <Logo size="md" href="/admin" />
          <span className="ml-2 font-mono text-xs text-brand-rust uppercase">
            Admin
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/admin' && pathname.startsWith(item.href))

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 font-mono text-sm uppercase tracking-wider transition-colors clip-corners-sm',
                      isActive
                        ? 'bg-brand-neon/10 text-brand-neon border-l-2 border-brand-neon'
                        : 'text-brand-light-gray hover:bg-brand-gray/50 hover:text-brand-white'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Back to Store */}
        <div className="border-t border-brand-gray p-4">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2 font-mono text-xs uppercase tracking-wider text-brand-light-gray hover:text-brand-neon transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Store
          </Link>
        </div>
      </div>
    </aside>
  )
}
