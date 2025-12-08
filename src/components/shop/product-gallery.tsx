'use client'

import { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { ProductImage } from '@/types/database'

interface ProductGalleryProps {
  images: ProductImage[]
  productName: string
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  if (!images || images.length === 0) {
    return (
      <div className="aspect-square bg-brand-gray flex items-center justify-center clip-corners-lg">
        <svg
          className="w-24 h-24 text-brand-light-gray/50"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        </svg>
      </div>
    )
  }

  const selectedImage = images[selectedIndex]

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square bg-brand-darker border border-brand-gray overflow-hidden clip-corners-lg">
        <Image
          src={selectedImage.url}
          alt={selectedImage.alt || productName}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                'relative h-20 w-20 flex-shrink-0 bg-brand-darker border overflow-hidden transition-all clip-corners-sm',
                index === selectedIndex
                  ? 'border-brand-neon'
                  : 'border-brand-gray hover:border-brand-light-gray'
              )}
            >
              <Image
                src={image.url}
                alt={image.alt || `${productName} ${index + 1}`}
                fill
                className="object-cover"
                sizes="80px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
