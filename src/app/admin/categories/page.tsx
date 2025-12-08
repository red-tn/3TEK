'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Edit, Trash2, FolderOpen, GripVertical } from 'lucide-react'
import { slugify } from '@/lib/utils'
import type { Category } from '@/types/database'

type CategoryWithCount = Category & {
  products: { count: number }[]
}

export default function AdminCategoriesPage() {
  const { success, error: showError } = useToast()
  const [categories, setCategories] = useState<CategoryWithCount[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    imageUrl: '',
    isActive: true,
  })

  const supabase = createClient()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*, products(count)')
      .order('display_order')

    setCategories((data as CategoryWithCount[]) || [])
    setIsLoading(false)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      imageUrl: '',
      isActive: true,
    })
    setEditingCategory(null)
  }

  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        imageUrl: category.image_url || '',
        isActive: category.is_active,
      })
    } else {
      resetForm()
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    resetForm()
  }

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: editingCategory ? formData.slug : slugify(name),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const url = editingCategory
        ? `/api/admin/categories?id=${editingCategory.id}`
        : '/api/admin/categories'

      const response = await fetch(url, {
        method: editingCategory ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          imageUrl: formData.imageUrl,
          isActive: formData.isActive,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save category')
      }

      success(
        editingCategory ? 'Category updated' : 'Category created',
        `The category has been ${editingCategory ? 'updated' : 'created'} successfully.`
      )
      handleCloseDialog()
      fetchCategories()
    } catch (err) {
      console.error('Save error:', err)
      showError('Error', err instanceof Error ? err.message : 'Failed to save category.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (category: Category) => {
    if (!confirm(`Are you sure you want to delete "${category.name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/categories?id=${category.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete category')
      }

      success('Category deleted', 'The category has been deleted.')
      fetchCategories()
    } catch (err) {
      console.error('Delete error:', err)
      showError('Error', err instanceof Error ? err.message : 'Failed to delete category.')
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-brand-white mb-2">
            Categories
          </h1>
          <p className="text-brand-light-gray">
            Organize your products into categories.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? 'Edit Category' : 'Add New Category'}
                </DialogTitle>
                <DialogDescription>
                  {editingCategory
                    ? 'Update the category details below.'
                    : 'Create a new category to organize your products.'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="name" required>
                    Category Name
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
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, imageUrl: e.target.value })
                    }
                    placeholder="https://..."
                  />
                </div>
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
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseDialog}
                >
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSaving}>
                  {editingCategory ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories Table */}
      <div className="bg-brand-darker border border-brand-gray clip-corners overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-brand-gray animate-pulse" />
            ))}
          </div>
        ) : categories.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <GripVertical className="h-4 w-4 text-brand-light-gray/50 cursor-move" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 flex-shrink-0 bg-brand-gray clip-corners-sm overflow-hidden">
                        {category.image_url ? (
                          <Image
                            src={category.image_url}
                            alt={category.name}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <FolderOpen className="h-4 w-4 text-brand-light-gray/50" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-brand-white font-medium">
                          {category.name}
                        </p>
                        {category.description && (
                          <p className="text-xs text-brand-light-gray line-clamp-1">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm text-brand-light-gray">
                      {category.slug}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">
                      {category.products?.[0]?.count || 0}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={category.is_active ? 'success' : 'secondary'}>
                      {category.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(category)}
                        disabled={(category.products?.[0]?.count || 0) > 0}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-16">
            <FolderOpen className="h-16 w-16 text-brand-gray mx-auto mb-4" />
            <h2 className="font-display text-xl text-brand-white mb-2">
              No Categories Yet
            </h2>
            <p className="text-brand-light-gray mb-6">
              Start by adding your first category.
            </p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
