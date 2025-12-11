'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { formatPrice } from '@/lib/utils'
import { RefreshCcw, Loader2 } from 'lucide-react'

interface RefundButtonProps {
  orderId: string
  orderNumber: string
  totalCents: number
  paymentStatus: string
  onRefundComplete: () => void
}

export function RefundButton({
  orderId,
  orderNumber,
  totalCents,
  paymentStatus,
  onRefundComplete,
}: RefundButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [refundType, setRefundType] = useState<'full' | 'partial'>('full')
  const [partialAmount, setPartialAmount] = useState('')
  const [reason, setReason] = useState('requested_by_customer')
  const { success, error: showError } = useToast()

  const canRefund = paymentStatus === 'paid' || paymentStatus === 'partially_refunded'

  const handleRefund = async () => {
    const refundAmount = refundType === 'full'
      ? totalCents
      : Math.round(parseFloat(partialAmount) * 100)

    if (refundType === 'partial') {
      if (!partialAmount || isNaN(parseFloat(partialAmount))) {
        showError('Invalid amount', 'Please enter a valid refund amount.')
        return
      }
      if (refundAmount <= 0) {
        showError('Invalid amount', 'Refund amount must be greater than $0.')
        return
      }
      if (refundAmount > totalCents) {
        showError('Invalid amount', 'Refund amount cannot exceed order total.')
        return
      }
    }

    setIsProcessing(true)

    try {
      const response = await fetch('/api/admin/orders/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          amount: refundAmount,
          reason,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Refund failed')
      }

      success(
        'Refund processed',
        `${formatPrice(refundAmount)} has been refunded to the customer.`
      )
      setIsOpen(false)
      onRefundComplete()
    } catch (err) {
      console.error('Refund error:', err)
      showError(
        'Refund failed',
        err instanceof Error ? err.message : 'Please try again.'
      )
    } finally {
      setIsProcessing(false)
    }
  }

  if (!canRefund) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-red-500 hover:text-red-400 hover:border-red-500">
          <RefreshCcw className="mr-2 h-4 w-4" />
          Issue Refund
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Issue Refund</DialogTitle>
          <DialogDescription>
            Process a refund for order #{orderNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-brand-gray/20 p-4 rounded-lg">
            <p className="text-sm text-brand-light-gray">Order Total</p>
            <p className="text-2xl font-mono text-brand-white">
              {formatPrice(totalCents)}
            </p>
          </div>

          <div>
            <Label>Refund Type</Label>
            <Select
              value={refundType}
              onValueChange={(value: 'full' | 'partial') => setRefundType(value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full Refund ({formatPrice(totalCents)})</SelectItem>
                <SelectItem value="partial">Partial Refund</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {refundType === 'partial' && (
            <div>
              <Label>Refund Amount ($)</Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                max={(totalCents / 100).toFixed(2)}
                value={partialAmount}
                onChange={(e) => setPartialAmount(e.target.value)}
                placeholder="0.00"
                className="font-mono"
              />
              <p className="text-xs text-brand-light-gray mt-1">
                Maximum: {formatPrice(totalCents)}
              </p>
            </div>
          )}

          <div>
            <Label>Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="requested_by_customer">Customer Request</SelectItem>
                <SelectItem value="duplicate">Duplicate Order</SelectItem>
                <SelectItem value="fraudulent">Fraudulent</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg">
            <p className="text-sm text-yellow-500">
              This action cannot be undone. The refund will be processed through Stripe
              and credited to the customer&apos;s original payment method.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleRefund}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Process Refund
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
