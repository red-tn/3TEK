'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
import { ArrowLeft, Save } from 'lucide-react'
import { ImageUploader } from '@/components/admin/image-uploader'
import { slugify, generateSku } from '@/lib/utils'
import type { Category } from '@/types/database'

export default function NewProductPage() {
  const router = useRouter()
  const { success, error: showError } = useToast()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
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
    fetchCategories()
  }, [])

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
    // Only auto-generate SKU if it hasn't been manually edited
    // (check if current SKU matches the pattern from the previous name)
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
    setIsLoading(true)

    try {
      const response = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          shortDescription: formData.shortDescription,
          description: formData.description,
          categoryId: formData.categoryId || null,
          priceCents: parseInt(formData.priceCents) * 100,
          compareAtPriceCents: formData.compareAtPriceCents
            ? parseInt(formData.compareAtPriceCents) * 100
            : null,
          sku: formData.sku || null,
          stockQuantity: parseInt(formData.stockQuantity),
          trackInventory: formData.trackInventory,
          material: formData.material || null,
          color: formData.color || null,
          isActive: formData.isActive,
          isFeatured: formData.isFeatured,
          badge: formData.badge || null,
          images: formData.images,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create product')
      }

      success('Product created', 'The product has been created successfully.')
      router.push('/admin/products')
    } catch (err) {
      console.error('Create error:', err)
      showError('Error', err instanceof Error ? err.message : 'Failed to create product.')
    } finally {
      setIsLoading(false)
    }
  }

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
        <h1 className="font-display text-3xl text-brand-white">
          Add New Product
        </h1>
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
              <Button type="submit" className="w-full" isLoading={isLoading}>
                <Save className="mr-2 h-4 w-4" />
                Create Product
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
