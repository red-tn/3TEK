'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useCart } from '@/hooks/use-cart'
import { useToast } from '@/hooks/use-toast'
import { ShoppingCart, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AddToCartButtonProps {
  product: {
    id: string
    name: string
    price: number
    image?: string
    sku?: string
  }
  quantity?: number
  size?: 'sm' | 'default' | 'lg'
  className?: string
  showText?: boolean
}

export function AddToCartButton({
  product,
  quantity = 1,
  size = 'default',
  className,
  showText = false,
}: AddToCartButtonProps) {
  const [added, setAdded] = useState(false)
  const { addItem, openCart } = useCart()
  const { success } = useToast()

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      image: product.image,
      sku: product.sku,
    })

    setAdded(true)
    success('Added to cart', `${product.name} has been added to your cart`)

    setTimeout(() => {
      setAdded(false)
    }, 2000)
  }

  const iconSize = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5'

  if (showText) {
    return (
      <Button
        onClick={handleAddToCart}
        size={size}
        className={cn('gap-2', className)}
        disabled={added}
      >
        {added ? (
          <>
            <Check className={iconSize} />
            Added
          </>
        ) : (
          <>
            <ShoppingCart className={iconSize} />
            Add to Cart
          </>
        )}
      </Button>
    )
  }

  return (
    <Button
      onClick={handleAddToCart}
      size="icon"
      variant="outline"
      className={cn(
        'transition-all',
        added && 'bg-brand-neon text-brand-black border-brand-neon',
        className
      )}
      disabled={added}
    >
      {added ? (
        <Check className={iconSize} />
      ) : (
        <ShoppingCart className={iconSize} />
      )}
    </Button>
  )
}
