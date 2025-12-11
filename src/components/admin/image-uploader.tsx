'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Upload, X, Loader2, GripVertical } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface ImageUploaderProps {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
  folder?: string
}

export function ImageUploader({
  images,
  onChange,
  maxImages = 8,
  folder = 'products',
}: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { error: showError } = useToast()

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const remainingSlots = maxImages - images.length
    if (remainingSlots <= 0) {
      showError('Limit reached', `Maximum ${maxImages} images allowed`)
      return
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots)
    setIsUploading(true)

    try {
      const uploadPromises = filesToUpload.map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', folder)

        const response = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Upload failed')
        }

        const data = await response.json()
        return data.url
      })

      const newUrls = await Promise.all(uploadPromises)
      onChange([...images, ...newUrls])
    } catch (err) {
      console.error('Upload error:', err)
      showError('Upload failed', err instanceof Error ? err.message : 'Failed to upload images')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index)
    onChange(newImages)
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newImages = [...images]
    const [removed] = newImages.splice(draggedIndex, 1)
    newImages.splice(index, 0, removed)
    onChange(newImages)
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  return (
    <div className="space-y-4">
      {/* Image Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {images.map((url, index) => (
          <div
            key={url}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={`relative aspect-square bg-brand-gray clip-corners overflow-hidden group cursor-move ${
              draggedIndex === index ? 'opacity-50' : ''
            }`}
          >
            <Image
              src={url}
              alt={`Product image ${index + 1}`}
              fill
              className="object-cover"
              sizes="150px"
            />
            {/* Primary Badge */}
            {index === 0 && (
              <div className="absolute top-2 left-2 bg-brand-neon text-brand-black text-xs px-2 py-1 clip-corners-sm font-mono">
                PRIMARY
              </div>
            )}
            {/* Drag Handle */}
            <div className="absolute top-2 right-10 bg-brand-black/70 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="h-4 w-4 text-brand-white" />
            </div>
            {/* Remove Button */}
            <button
              type="button"
              onClick={() => handleRemove(index)}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>
        ))}

        {/* Upload Button */}
        {images.length < maxImages && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="aspect-square border-2 border-dashed border-brand-gray hover:border-brand-neon bg-brand-gray/20 clip-corners flex flex-col items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-8 w-8 text-brand-neon animate-spin" />
                <span className="text-xs text-brand-light-gray">Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-brand-light-gray" />
                <span className="text-xs text-brand-light-gray">Add Image</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Help Text */}
      <div className="flex items-center justify-between text-xs text-brand-light-gray">
        <span>
          {images.length}/{maxImages} images. Drag to reorder. First image is primary.
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || images.length >= maxImages}
        >
          <Upload className="mr-2 h-3 w-3" />
          Upload Images
        </Button>
      </div>
    </div>
  )
}
