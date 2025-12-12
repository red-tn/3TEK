'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface DeleteProductButtonProps {
  productId: string
  productName: string
  isActive: boolean
}

export function DeleteProductButton({ productId, productName, isActive }: DeleteProductButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const { success, error: showError } = useToast()

  const handleDelete = async () => {
    const message = isActive
      ? `Are you sure you want to deactivate "${productName}"? It will be hidden from the store.`
      : `Are you sure you want to permanently delete "${productName}"? This action cannot be undone.`

    if (!confirm(message)) {
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

      const data = await response.json()

      if (data.action === 'deleted') {
        success('Product deleted', `"${productName}" has been permanently deleted.`)
      } else {
        success('Product deactivated', `"${productName}" has been deactivated.`)
      }

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
      className={isActive ? "text-brand-light-gray hover:text-yellow-500" : "text-brand-light-gray hover:text-red-500"}
      title={isActive ? "Deactivate product" : "Permanently delete product"}
    >
      {isDeleting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </Button>
  )
}
