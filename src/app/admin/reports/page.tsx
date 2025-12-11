'use client'

import { useState, useEffect } from 'react'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  TrendingUp,
  AlertTriangle,
  Loader2,
} from 'lucide-react'

interface AnalyticsData {
  summary: {
    totalOrders: number
    paidOrders: number
    totalRevenue: number
    avgOrderValue: number
    newCustomers: number
    totalProducts: number
    lowStockProducts: number
  }
  ordersByStatus: Record<string, number>
  revenueChart: Array<{
    date: string
    revenue: number
    orders: number
  }>
  topProducts: Array<{
    name: string
    revenue: number
    quantity: number
  }>
  period: {
    start: string
    end: string
    days: number
  }
}

export default function ReportsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dateRange, setDateRange] = useState('30')

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange])

  const fetchAnalytics = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/analytics?range=${dateRange}`)
      const result = await response.json()
      if (response.ok) {
        setData(result)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-brand-neon" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-20">
        <p className="text-brand-light-gray">Failed to load analytics data</p>
        <Button onClick={fetchAnalytics} className="mt-4">
          Retry
        </Button>
      </div>
    )
  }

  const maxRevenue = Math.max(...data.revenueChart.map((d) => d.revenue), 1)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-brand-white mb-2">
            Reports & Analytics
          </h1>
          <p className="text-brand-light-gray">
            Track your store performance and sales metrics.
          </p>
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatPrice(data.summary.totalRevenue)}
          icon={<DollarSign className="h-5 w-5" />}
          iconColor="text-brand-neon"
        />
        <StatCard
          title="Orders"
          value={data.summary.paidOrders.toString()}
          subtitle={`${data.summary.totalOrders} total`}
          icon={<ShoppingCart className="h-5 w-5" />}
          iconColor="text-blue-500"
        />
        <StatCard
          title="Avg Order Value"
          value={formatPrice(data.summary.avgOrderValue)}
          icon={<TrendingUp className="h-5 w-5" />}
          iconColor="text-purple-500"
        />
        <StatCard
          title="New Customers"
          value={data.summary.newCustomers.toString()}
          icon={<Users className="h-5 w-5" />}
          iconColor="text-green-500"
        />
      </div>

      {/* Charts and Tables */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Revenue Chart */}
        <div className="bg-brand-darker border border-brand-gray p-6 clip-corners">
          <h2 className="font-display text-xl text-brand-white mb-6">
            Revenue Over Time
          </h2>
          {data.revenueChart.length > 0 ? (
            <div className="space-y-4">
              <div className="h-64 flex items-end gap-1">
                {data.revenueChart.map((day, index) => (
                  <div
                    key={day.date}
                    className="flex-1 bg-brand-neon/20 hover:bg-brand-neon/40 transition-colors rounded-t relative group"
                    style={{
                      height: `${(day.revenue / maxRevenue) * 100}%`,
                      minHeight: day.revenue > 0 ? '4px' : '0px',
                    }}
                  >
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                      <div className="bg-brand-darker border border-brand-gray px-3 py-2 rounded text-xs whitespace-nowrap">
                        <p className="text-brand-white font-medium">
                          {formatPrice(day.revenue)}
                        </p>
                        <p className="text-brand-light-gray">
                          {day.orders} order{day.orders !== 1 ? 's' : ''}
                        </p>
                        <p className="text-brand-light-gray">{day.date}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-brand-light-gray">
                <span>{data.revenueChart[0]?.date}</span>
                <span>{data.revenueChart[data.revenueChart.length - 1]?.date}</span>
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-brand-light-gray">
              No revenue data for this period
            </div>
          )}
        </div>

        {/* Order Status Breakdown */}
        <div className="bg-brand-darker border border-brand-gray p-6 clip-corners">
          <h2 className="font-display text-xl text-brand-white mb-6">
            Orders by Status
          </h2>
          <div className="space-y-4">
            {Object.entries(data.ordersByStatus).map(([status, count]) => {
              const percentage = (count / data.summary.totalOrders) * 100
              return (
                <div key={status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-brand-light-gray capitalize">
                      {status.replace('_', ' ')}
                    </span>
                    <span className="text-brand-white font-mono">{count}</span>
                  </div>
                  <div className="h-2 bg-brand-gray rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-neon rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-brand-darker border border-brand-gray p-6 clip-corners">
        <h2 className="font-display text-xl text-brand-white mb-6">
          Top Products by Revenue
        </h2>
        {data.topProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-brand-gray">
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-wider text-brand-light-gray font-mono">
                    Product
                  </th>
                  <th className="text-right py-3 px-4 text-xs uppercase tracking-wider text-brand-light-gray font-mono">
                    Quantity Sold
                  </th>
                  <th className="text-right py-3 px-4 text-xs uppercase tracking-wider text-brand-light-gray font-mono">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.topProducts.map((product, index) => (
                  <tr
                    key={product.name}
                    className="border-b border-brand-gray/50 last:border-0"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <span className="text-brand-light-gray font-mono text-sm">
                          #{index + 1}
                        </span>
                        <span className="text-brand-white">{product.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-brand-light-gray">
                      {product.quantity}
                    </td>
                    <td className="py-4 px-4 text-right font-mono text-brand-neon">
                      {formatPrice(product.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-brand-light-gray py-8">
            No sales data for this period
          </p>
        )}
      </div>

      {/* Inventory Alert */}
      {data.summary.lowStockProducts > 0 && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 p-6 rounded-lg flex items-center gap-4">
          <AlertTriangle className="h-8 w-8 text-yellow-500 flex-shrink-0" />
          <div>
            <h3 className="text-yellow-500 font-medium">Low Stock Alert</h3>
            <p className="text-brand-light-gray">
              {data.summary.lowStockProducts} product
              {data.summary.lowStockProducts !== 1 ? 's' : ''} have low stock (5 or
              fewer units).{' '}
              <a
                href="/admin/products"
                className="text-brand-neon hover:underline"
              >
                View products
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconColor,
}: {
  title: string
  value: string
  subtitle?: string
  icon: React.ReactNode
  iconColor: string
}) {
  return (
    <div className="bg-brand-darker border border-brand-gray p-6 clip-corners">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-brand-light-gray">{title}</span>
        <div className={iconColor}>{icon}</div>
      </div>
      <p className="font-mono text-2xl text-brand-white">{value}</p>
      {subtitle && (
        <p className="text-xs text-brand-light-gray mt-1">{subtitle}</p>
      )}
    </div>
  )
}
