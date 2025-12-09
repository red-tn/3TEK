'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

interface SortSelectProps {
  defaultValue?: string
}

export function SortSelect({ defaultValue = 'newest' }: SortSelectProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', e.target.value)
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <select
      className="bg-brand-darker border border-brand-gray px-3 py-2 font-mono text-sm text-brand-white focus:outline-none focus:border-brand-neon"
      defaultValue={defaultValue}
      onChange={handleChange}
    >
      <option value="newest">Newest</option>
      <option value="price-asc">Price: Low to High</option>
      <option value="price-desc">Price: High to Low</option>
      <option value="name">Name</option>
    </select>
  )
}
