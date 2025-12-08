import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/toast'

export const metadata: Metadata = {
  title: {
    default: '3TEK Design | Premium 3D Printed Products',
    template: '%s | 3TEK Design',
  },
  description:
    'Premium 3D printed products with a cyberpunk industrial vibe. Designed and manufactured in the USA.',
  keywords: ['3D printing', '3D printed products', 'cyberpunk', 'industrial design', 'custom prints'],
  authors: [{ name: '3TEK Design' }],
  creator: '3TEK Design',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: '3TEK Design',
    title: '3TEK Design | Premium 3D Printed Products',
    description:
      'Premium 3D printed products with a cyberpunk industrial vibe. Designed and manufactured in the USA.',
  },
  twitter: {
    card: 'summary_large_image',
    title: '3TEK Design | Premium 3D Printed Products',
    description:
      'Premium 3D printed products with a cyberpunk industrial vibe. Designed and manufactured in the USA.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-brand-black text-brand-white antialiased font-body">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
