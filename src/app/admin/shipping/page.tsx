'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { formatPrice } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Plus, Edit, Trash2, Truck } from 'lucide-react'
import type { ShippingRate } from '@/types/database'

export default function AdminShippingPage() {
  const { success, error: showError } = useToast()
  const [rates, setRates] = useState<ShippingRate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingRate, setEditingRate] = useState<ShippingRate | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    rateCents: '',
    minOrderCents: '',
    maxOrderCents: '',
    estimatedDaysMin: '',
    estimatedDaysMax: '',
    isActive: true,
  })

  const supabase = createClient()

  useEffect(() => {
    fetchRates()
  }, [])

  const fetchRates = async () => {
    const { data } = await supabase
      .from('shipping_rates')
      .select('*')
      .order('min_order_cents')

    setRates(data || [])
    setIsLoading(false)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      rateCents: '',
      minOrderCents: '',
      maxOrderCents: '',
      estimatedDaysMin: '',
      estimatedDaysMax: '',
      isActive: true,
    })
    setEditingRate(null)
  }

  const handleOpenDialog = (rate?: ShippingRate) => {
    if (rate) {
      setEditingRate(rate)
      setFormData({
        name: rate.name,
        description: rate.description || '',
        rateCents: String(rate.price_cents / 100),
        minOrderCents: rate.min_order_cents ? String(rate.min_order_cents / 100) : '',
        maxOrderCents: rate.max_order_cents ? String(rate.max_order_cents / 100) : '',
        estimatedDaysMin: rate.estimated_days_min ? String(rate.estimated_days_min) : '',
        estimatedDaysMax: rate.estimated_days_max ? String(rate.estimated_days_max) : '',
        isActive: rate.is_active,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const url = editingRate
        ? `/api/admin/shipping?id=${editingRate.id}`
        : '/api/admin/shipping'

      const response = await fetch(url, {
        method: editingRate ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          rateCents: Math.round(parseFloat(formData.rateCents) * 100),
          minOrderCents: formData.minOrderCents
            ? Math.round(parseFloat(formData.minOrderCents) * 100)
            : 0,
          maxOrderCents: formData.maxOrderCents
            ? Math.round(parseFloat(formData.maxOrderCents) * 100)
            : null,
          estimatedDaysMin: formData.estimatedDaysMin
            ? parseInt(formData.estimatedDaysMin)
            : null,
          estimatedDaysMax: formData.estimatedDaysMax
            ? parseInt(formData.estimatedDaysMax)
            : null,
          isActive: formData.isActive,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save shipping rate')
      }

      success(
        editingRate ? 'Shipping rate updated' : 'Shipping rate created',
        `The shipping rate has been ${editingRate ? 'updated' : 'created'} successfully.`
      )
      handleCloseDialog()
      fetchRates()
    } catch (err) {
      console.error('Save error:', err)
      showError('Error', err instanceof Error ? err.message : 'Failed to save shipping rate.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (rate: ShippingRate) => {
    if (!confirm(`Are you sure you want to delete "${rate.name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/shipping?id=${rate.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete shipping rate')
      }

      success('Shipping rate deleted', 'The shipping rate has been deleted.')
      fetchRates()
    } catch (err) {
      console.error('Delete error:', err)
      showError('Error', err instanceof Error ? err.message : 'Failed to delete shipping rate.')
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-brand-white mb-2">
            Shipping Rates
          </h1>
          <p className="text-brand-light-gray">
            Configure shipping options and pricing.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Rate
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingRate ? 'Edit Shipping Rate' : 'Add Shipping Rate'}
                </DialogTitle>
                <DialogDescription>
                  {editingRate
                    ? 'Update the shipping rate details.'
                    : 'Create a new shipping rate option.'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="name" required>
                    Rate Name
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Standard Shipping"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="e.g., Delivery in 5-7 business days"
                  />
                </div>
                <div>
                  <Label htmlFor="rateCents" required>
                    Rate ($)
                  </Label>
                  <Input
                    id="rateCents"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.rateCents}
                    onChange={(e) =>
                      setFormData({ ...formData, rateCents: e.target.value })
                    }
                    placeholder="0.00 for free shipping"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minOrderCents">Min Order ($)</Label>
                    <Input
                      id="minOrderCents"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.minOrderCents}
                      onChange={(e) =>
                        setFormData({ ...formData, minOrderCents: e.target.value })
                      }
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxOrderCents">Max Order ($)</Label>
                    <Input
                      id="maxOrderCents"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.maxOrderCents}
                      onChange={(e) =>
                        setFormData({ ...formData, maxOrderCents: e.target.value })
                      }
                      placeholder="No limit"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="estimatedDaysMin">Est. Days (Min)</Label>
                    <Input
                      id="estimatedDaysMin"
                      type="number"
                      min="1"
                      value={formData.estimatedDaysMin}
                      onChange={(e) =>
                        setFormData({ ...formData, estimatedDaysMin: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="estimatedDaysMax">Est. Days (Max)</Label>
                    <Input
                      id="estimatedDaysMax"
                      type="number"
                      min="1"
                      value={formData.estimatedDaysMax}
                      onChange={(e) =>
                        setFormData({ ...formData, estimatedDaysMax: e.target.value })
                      }
                    />
                  </div>
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
                    Active (available at checkout)
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
                  {editingRate ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Rates Table */}
      <div className="bg-brand-darker border border-brand-gray clip-corners overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-brand-gray animate-pulse" />
            ))}
          </div>
        ) : rates.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Rate</TableHead>
                <TableHead>Order Range</TableHead>
                <TableHead>Est. Delivery</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rates.map((rate) => (
                <TableRow key={rate.id}>
                  <TableCell>
                    <div>
                      <p className="text-brand-white font-medium">{rate.name}</p>
                      {rate.description && (
                        <p className="text-xs text-brand-light-gray">
                          {rate.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-brand-neon">
                      {rate.price_cents === 0 ? 'FREE' : formatPrice(rate.price_cents)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-brand-light-gray">
                      {rate.min_order_cents > 0 && (
                        <>Min: {formatPrice(rate.min_order_cents)}</>
                      )}
                      {rate.max_order_cents && (
                        <>
                          {rate.min_order_cents > 0 && ' - '}
                          Max: {formatPrice(rate.max_order_cents)}
                        </>
                      )}
                      {!rate.min_order_cents && !rate.max_order_cents && 'Any order'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-brand-light-gray">
                      {rate.estimated_days_min && rate.estimated_days_max
                        ? `${rate.estimated_days_min}-${rate.estimated_days_max} days`
                        : rate.estimated_days_min
                        ? `${rate.estimated_days_min}+ days`
                        : '-'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={rate.is_active ? 'success' : 'secondary'}>
                      {rate.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDialog(rate)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(rate)}
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
            <Truck className="h-16 w-16 text-brand-gray mx-auto mb-4" />
            <h2 className="font-display text-xl text-brand-white mb-2">
              No Shipping Rates
            </h2>
            <p className="text-brand-light-gray mb-6">
              Add shipping rates to enable checkout.
            </p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Rate
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
