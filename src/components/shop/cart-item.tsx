'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/hooks/use-cart'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { Minus, Plus, Trash2 } from 'lucide-react'
import type { CartItem as CartItemType } from '@/types/cart'

interface CartItemProps {
  item: CartItemType
  showControls?: boolean
}

export function CartItem({ item, showControls = true }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart()

  return (
    <div className="flex gap-4 py-4 border-b border-brand-gray last:border-0">
      {/* Image */}
      <div className="relative h-20 w-20 flex-shrink-0 bg-brand-gray clip-corners-sm overflow-hidden">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.name}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <svg
              className="w-8 h-8 text-brand-light-gray/50"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/products/${item.productId}`}
          className="font-display text-brand-white hover:text-brand-neon transition-colors line-clamp-1"
        >
          {item.name}
        </Link>

        {item.sku && (
          <p className="font-mono text-xs text-brand-light-gray mt-0.5">
            SKU: {item.sku}
          </p>
        )}

        <div className="flex items-center justify-between mt-2">
          <span className="font-mono text-brand-neon">
            {formatPrice(item.price)}
          </span>

          {showControls && (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <span className="font-mono text-sm w-8 text-center">
                {item.quantity}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {showControls && (
          <div className="flex items-center justify-between mt-2">
            <span className="font-mono text-sm text-brand-light-gray">
              Total: {formatPrice(item.price * item.quantity)}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-red-500 hover:text-red-400"
              onClick={() => removeItem(item.productId)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
