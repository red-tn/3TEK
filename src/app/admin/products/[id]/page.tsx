'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, Save, Trash2 } from 'lucide-react'
import { ImageUploader } from '@/components/admin/image-uploader'
import { slugify, generateSku } from '@/lib/utils'
import type { Category, Product } from '@/types/database'

export default function EditProductPage() {
  const params = useParams()
  const router = useRouter()
  const { success, error: showError } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [product, setProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    shortDescription: '',
    description: '',
    categoryId: '',
    priceCents: '',
    compareAtPriceCents: '',
    sku: '',
    stockQuantity: '0',
    trackInventory: true,
    material: '',
    color: '',
    isActive: true,
    isFeatured: false,
    badge: '',
    images: [] as string[],
  })

  const supabase = createClient()

  useEffect(() => {
    fetchProduct()
    fetchCategories()
  }, [params.id])

  const fetchProduct = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !data) {
      showError('Error', 'Product not found')
      router.push('/admin/products')
      return
    }

    setProduct(data)
    // Extra fields may be in metadata JSON column
    const metadata = data.metadata || {}
    // Handle images - could be array of strings or array of objects
    const imageUrls = (data.images || []).map((img: string | { url: string }) =>
      typeof img === 'string' ? img : img.url
    )
    setFormData({
      name: data.name,
      slug: data.slug,
      shortDescription: metadata.short_description || '',
      description: data.description || '',
      categoryId: data.category_id || '',
      priceCents: String(data.price_cents / 100),
      compareAtPriceCents: data.compare_at_price_cents
        ? String(data.compare_at_price_cents / 100)
        : '',
      sku: data.sku || '',
      stockQuantity: String(data.stock_quantity),
      trackInventory: true, // Default since column doesn't exist
      material: metadata.material || '',
      color: metadata.color || '',
      isActive: data.is_active,
      isFeatured: data.is_featured,
      badge: metadata.badge || '',
      images: imageUrls,
    })
    setIsLoading(false)
  }

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('display_order')

    setCategories(data || [])
  }

  const handleNameChange = (name: string) => {
    const newSlug = slugify(name)
    // Only auto-generate SKU if it's empty or follows the auto-generated pattern
    const shouldGenerateSku = !formData.sku || formData.sku.startsWith('3T-')
    setFormData({
      ...formData,
      name,
      slug: newSlug,
      sku: shouldGenerateSku ? generateSku(name) : formData.sku,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!product) return

    setIsSaving(true)

    try {
      const response = await fetch(`/api/admin/products?id=${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          categoryId: formData.categoryId || null,
          priceCents: Math.round(parseFloat(formData.priceCents) * 100),
          compareAtPriceCents: formData.compareAtPriceCents
            ? Math.round(parseFloat(formData.compareAtPriceCents) * 100)
            : null,
          sku: formData.sku || null,
          stockQuantity: parseInt(formData.stockQuantity),
          isActive: formData.isActive,
          isFeatured: formData.isFeatured,
          images: formData.images,
          // Extra fields stored in metadata
          shortDescription: formData.shortDescription || null,
          material: formData.material || null,
          color: formData.color || null,
          badge: formData.badge || null,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to update product')
      }

      success('Product updated', 'The product has been updated successfully.')
      router.push('/admin/products')
    } catch (err) {
      console.error('Update error:', err)
      showError('Error', err instanceof Error ? err.message : 'Failed to update product.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!product) return
    if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)

    try {
      const response = await fetch(`/api/admin/products?id=${product.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete product')
      }

      success('Product deleted', 'The product has been deleted.')
      router.push('/admin/products')
    } catch (err) {
      console.error('Delete error:', err)
      showError('Error', 'Failed to delete product.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading || !product) {
    return (
      <div className="space-y-8">
        <div className="h-8 w-48 bg-brand-gray animate-pulse" />
        <div className="h-96 bg-brand-darker border border-brand-gray animate-pulse" />
      </div>
    )
  }

  // Handle images - could be array of strings or array of objects
  const getImageUrl = (img: string | { url: string }) =>
    typeof img === 'string' ? img : img.url

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/admin/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Link>
        </Button>
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl text-brand-white">
            Edit Product
          </h1>
          <Button
            variant="destructive"
            onClick={handleDelete}
            isLoading={isDeleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Product
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <div className="bg-brand-darker border border-brand-gray p-6 clip-corners">
              <h2 className="font-display text-xl text-brand-white mb-4">
                Basic Information
              </h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" required>
                    Product Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="slug" required>
                    URL Slug
                  </Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="shortDescription">Short Description</Label>
                  <Input
                    id="shortDescription"
                    value={formData.shortDescription}
                    onChange={(e) =>
                      setFormData({ ...formData, shortDescription: e.target.value })
                    }
                    placeholder="Brief product summary"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Full Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Detailed product description"
                    rows={6}
                  />
                </div>
              </div>
            </div>

            {/* Images */}
            <div className="bg-brand-darker border border-brand-gray p-6 clip-corners">
              <h2 className="font-display text-xl text-brand-white mb-4">
                Images
              </h2>
              <ImageUploader
                images={formData.images}
                onChange={(images) => setFormData({ ...formData, images })}
                maxImages={8}
                folder="products"
              />
            </div>

            {/* Pricing */}
            <div className="bg-brand-darker border border-brand-gray p-6 clip-corners">
              <h2 className="font-display text-xl text-brand-white mb-4">
                Pricing
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price" required>
                    Price ($)
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.priceCents}
                    onChange={(e) =>
                      setFormData({ ...formData, priceCents: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="comparePrice">Compare at Price ($)</Label>
                  <Input
                    id="comparePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.compareAtPriceCents}
                    onChange={(e) =>
                      setFormData({ ...formData, compareAtPriceCents: e.target.value })
                    }
                    placeholder="Original price for sale items"
                  />
                </div>
              </div>
            </div>

            {/* Inventory */}
            <div className="bg-brand-darker border border-brand-gray p-6 clip-corners">
              <h2 className="font-display text-xl text-brand-white mb-4">
                Inventory
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sku">SKU</Label>
                    <Input
                      id="sku"
                      value={formData.sku}
                      onChange={(e) =>
                        setFormData({ ...formData, sku: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="stock">Stock Quantity</Label>
                    <Input
                      id="stock"
                      type="number"
                      min="0"
                      value={formData.stockQuantity}
                      onChange={(e) =>
                        setFormData({ ...formData, stockQuantity: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="trackInventory"
                    checked={formData.trackInventory}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, trackInventory: !!checked })
                    }
                  />
                  <Label htmlFor="trackInventory" className="cursor-pointer">
                    Track inventory
                  </Label>
                </div>
              </div>
            </div>

            {/* Attributes */}
            <div className="bg-brand-darker border border-brand-gray p-6 clip-corners">
              <h2 className="font-display text-xl text-brand-white mb-4">
                Attributes
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="material">Material</Label>
                  <Input
                    id="material"
                    value={formData.material}
                    onChange={(e) =>
                      setFormData({ ...formData, material: e.target.value })
                    }
                    placeholder="e.g., PLA, PETG, ABS"
                  />
                </div>
                <div>
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    placeholder="e.g., Black, White, Custom"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Status */}
            <div className="bg-brand-darker border border-brand-gray p-6 clip-corners">
              <h2 className="font-display text-xl text-brand-white mb-4">
                Status
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isActive: !!checked })
                    }
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">
                    Active (visible in store)
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isFeatured: !!checked })
                    }
                  />
                  <Label htmlFor="isFeatured" className="cursor-pointer">
                    Featured product
                  </Label>
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="bg-brand-darker border border-brand-gray p-6 clip-corners">
              <h2 className="font-display text-xl text-brand-white mb-4">
                Category
              </h2>
              <Select
                value={formData.categoryId}
                onValueChange={(value) =>
                  setFormData({ ...formData, categoryId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Badge */}
            <div className="bg-brand-darker border border-brand-gray p-6 clip-corners">
              <h2 className="font-display text-xl text-brand-white mb-4">
                Badge
              </h2>
              <Select
                value={formData.badge || 'none'}
                onValueChange={(value) =>
                  setFormData({ ...formData, badge: value === 'none' ? '' : value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="No badge" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="popular">Popular</SelectItem>
                  <SelectItem value="sale">Sale</SelectItem>
                  <SelectItem value="limited">Limited</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="bg-brand-darker border border-brand-gray p-6 clip-corners">
              <Button type="submit" className="w-full" isLoading={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
