import { AdminSidebar } from '@/components/layout/admin-sidebar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-brand-black">
      <AdminSidebar />
      <main className="pl-64">
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
