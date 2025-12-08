import Link from 'next/link'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { User, Package, MapPin, Settings } from 'lucide-react'

const accountNav = [
  { label: 'Dashboard', href: '/account', icon: User },
  { label: 'Orders', href: '/account/orders', icon: Package },
  { label: 'Addresses', href: '/account/addresses', icon: MapPin },
  { label: 'Settings', href: '/account/settings', icon: Settings },
]

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <aside className="lg:col-span-1">
              <nav className="bg-brand-darker border border-brand-gray p-4 clip-corners sticky top-24">
                <h2 className="font-display text-lg text-brand-white mb-4">
                  My Account
                </h2>
                <ul className="space-y-1">
                  {accountNav.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 px-3 py-2 font-mono text-sm text-brand-light-gray hover:text-brand-neon hover:bg-brand-gray/30 transition-colors clip-corners-sm"
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </aside>

            {/* Content */}
            <div className="lg:col-span-3">{children}</div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
