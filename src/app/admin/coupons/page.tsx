'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { formatPrice, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { Plus, Edit, Trash2, Ticket, Copy } from 'lucide-react'
import type { Coupon } from '@/types/database'

export default function AdminCouponsPage() {
  const { success, error: showError } = useToast()
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage' as 'percentage' | 'fixed',
    discountValue: '',
    minPurchaseCents: '',
    maxDiscountCents: '',
    usageLimit: '',
    startsAt: '',
    expiresAt: '',
    isActive: true,
  })

  const supabase = createClient()

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    const { data } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false })

    setCoupons(data || [])
    setIsLoading(false)
  }

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minPurchaseCents: '',
      maxDiscountCents: '',
      usageLimit: '',
      startsAt: '',
      expiresAt: '',
      isActive: true,
    })
    setEditingCoupon(null)
  }

  const handleOpenDialog = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon)
      setFormData({
        code: coupon.code,
        description: coupon.description || '',
        discountType: coupon.discount_type as 'percentage' | 'fixed',
        discountValue: String(coupon.discount_value),
        minPurchaseCents: coupon.min_purchase_cents
          ? String(coupon.min_purchase_cents / 100)
          : '',
        maxDiscountCents: coupon.max_discount_cents
          ? String(coupon.max_discount_cents / 100)
          : '',
        usageLimit: coupon.usage_limit ? String(coupon.usage_limit) : '',
        startsAt: coupon.starts_at
          ? new Date(coupon.starts_at).toISOString().slice(0, 16)
          : '',
        expiresAt: coupon.expires_at
          ? new Date(coupon.expires_at).toISOString().slice(0, 16)
          : '',
        isActive: coupon.is_active,
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
      const url = editingCoupon
        ? `/api/admin/coupons?id=${editingCoupon.id}`
        : '/api/admin/coupons'

      const response = await fetch(url, {
        method: editingCoupon ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: formData.code,
          description: formData.description,
          discountType: formData.discountType,
          discountValue: parseFloat(formData.discountValue),
          minPurchaseCents: formData.minPurchaseCents
            ? Math.round(parseFloat(formData.minPurchaseCents) * 100)
            : null,
          maxDiscountCents: formData.maxDiscountCents
            ? Math.round(parseFloat(formData.maxDiscountCents) * 100)
            : null,
          usageLimit: formData.usageLimit
            ? parseInt(formData.usageLimit)
            : null,
          startsAt: formData.startsAt || null,
          expiresAt: formData.expiresAt || null,
          isActive: formData.isActive,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save coupon')
      }

      success(
        editingCoupon ? 'Coupon updated' : 'Coupon created',
        `The coupon has been ${editingCoupon ? 'updated' : 'created'} successfully.`
      )
      handleCloseDialog()
      fetchCoupons()
    } catch (err) {
      console.error('Save error:', err)
      showError('Error', err instanceof Error ? err.message : 'Failed to save coupon.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (coupon: Coupon) => {
    if (!confirm(`Are you sure you want to delete coupon "${coupon.code}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/coupons?id=${coupon.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to delete coupon')
      }

      success('Coupon deleted', 'The coupon has been deleted.')
      fetchCoupons()
    } catch (err) {
      console.error('Delete error:', err)
      showError('Error', err instanceof Error ? err.message : 'Failed to delete coupon.')
    }
  }

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    success('Copied', 'Coupon code copied to clipboard.')
  }

  const getCouponStatus = (coupon: Coupon) => {
    if (!coupon.is_active) return { label: 'Inactive', variant: 'secondary' as const }

    const now = new Date()
    if (coupon.starts_at && new Date(coupon.starts_at) > now) {
      return { label: 'Scheduled', variant: 'warning' as const }
    }
    if (coupon.expires_at && new Date(coupon.expires_at) < now) {
      return { label: 'Expired', variant: 'destructive' as const }
    }
    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
      return { label: 'Exhausted', variant: 'destructive' as const }
    }
    return { label: 'Active', variant: 'success' as const }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-brand-white mb-2">
            Coupons
          </h1>
          <p className="text-brand-light-gray">
            Create and manage discount codes.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {editingCoupon ? 'Edit Coupon' : 'Add Coupon'}
                </DialogTitle>
                <DialogDescription>
                  {editingCoupon
                    ? 'Update the coupon details.'
                    : 'Create a new discount code.'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                <div>
                  <Label htmlFor="code" required>
                    Coupon Code
                  </Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                    placeholder="e.g., SAVE20"
                    required
                    className="font-mono uppercase"
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
                    placeholder="Internal description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label required>Discount Type</Label>
                    <Select
                      value={formData.discountType}
                      onValueChange={(value: 'percentage' | 'fixed') =>
                        setFormData({ ...formData, discountType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage (%)</SelectItem>
                        <SelectItem value="fixed">Fixed Amount ($)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="discountValue" required>
                      {formData.discountType === 'percentage' ? 'Percentage' : 'Amount ($)'}
                    </Label>
                    <Input
                      id="discountValue"
                      type="number"
                      step={formData.discountType === 'percentage' ? '1' : '0.01'}
                      min="0"
                      max={formData.discountType === 'percentage' ? '100' : undefined}
                      value={formData.discountValue}
                      onChange={(e) =>
                        setFormData({ ...formData, discountValue: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minPurchaseCents">Min Purchase ($)</Label>
                    <Input
                      id="minPurchaseCents"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.minPurchaseCents}
                      onChange={(e) =>
                        setFormData({ ...formData, minPurchaseCents: e.target.value })
                      }
                      placeholder="No minimum"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxDiscountCents">Max Discount ($)</Label>
                    <Input
                      id="maxDiscountCents"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.maxDiscountCents}
                      onChange={(e) =>
                        setFormData({ ...formData, maxDiscountCents: e.target.value })
                      }
                      placeholder="No limit"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="usageLimit">Usage Limit</Label>
                  <Input
                    id="usageLimit"
                    type="number"
                    min="1"
                    value={formData.usageLimit}
                    onChange={(e) =>
                      setFormData({ ...formData, usageLimit: e.target.value })
                    }
                    placeholder="Unlimited"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startsAt">Starts At</Label>
                    <Input
                      id="startsAt"
                      type="datetime-local"
                      value={formData.startsAt}
                      onChange={(e) =>
                        setFormData({ ...formData, startsAt: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="expiresAt">Expires At</Label>
                    <Input
                      id="expiresAt"
                      type="datetime-local"
                      value={formData.expiresAt}
                      onChange={(e) =>
                        setFormData({ ...formData, expiresAt: e.target.value })
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
                    Active (can be used at checkout)
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
                  {editingCoupon ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Coupons Table */}
      <div className="bg-brand-darker border border-brand-gray clip-corners overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-brand-gray animate-pulse" />
            ))}
          </div>
        ) : coupons.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Usage</TableHead>
                <TableHead>Valid</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => {
                const status = getCouponStatus(coupon)
                return (
                  <TableRow key={coupon.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-brand-neon font-medium">
                          {coupon.code}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyCode(coupon.code)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      {coupon.description && (
                        <p className="text-xs text-brand-light-gray">
                          {coupon.description}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono">
                        {coupon.discount_type === 'percentage'
                          ? `${coupon.discount_value}%`
                          : formatPrice(coupon.discount_value * 100)}
                      </span>
                      {coupon.min_purchase_cents && (
                        <p className="text-xs text-brand-light-gray">
                          Min: {formatPrice(coupon.min_purchase_cents)}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">
                        {coupon.usage_count}
                        {coupon.usage_limit && ` / ${coupon.usage_limit}`}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-brand-light-gray">
                        {coupon.starts_at && (
                          <p>From: {formatDate(coupon.starts_at)}</p>
                        )}
                        {coupon.expires_at && (
                          <p>Until: {formatDate(coupon.expires_at)}</p>
                        )}
                        {!coupon.starts_at && !coupon.expires_at && (
                          <p>Always valid</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(coupon)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(coupon)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-16">
            <Ticket className="h-16 w-16 text-brand-gray mx-auto mb-4" />
            <h2 className="font-display text-xl text-brand-white mb-2">
              No Coupons
            </h2>
            <p className="text-brand-light-gray mb-6">
              Create discount codes for your customers.
            </p>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Coupon
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
