'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface DeleteProductButtonProps {
  productId: string
  productName: string
}

export function DeleteProductButton({ productId, productName }: DeleteProductButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const { success, error: showError } = useToast()

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/admin/products?id=${productId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete product')
      }

      success('Product deleted', `"${productName}" has been deleted.`)
      router.refresh()
    } catch (err) {
      console.error('Delete error:', err)
      showError('Error', 'Failed to delete product.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleDelete}
      disabled={isDeleting}
      className="text-brand-light-gray hover:text-red-500"
    >
      {isDeleting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </Button>
  )
}
