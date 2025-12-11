'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
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
import { Truck, Loader2, Download } from 'lucide-react'

interface CreateLabelButtonProps {
  orderId: string
  orderNumber: string
  hasTrackingNumber: boolean
  onLabelCreated: () => void
}

const FEDEX_SERVICE_TYPES = [
  { value: 'FEDEX_GROUND', label: 'FedEx Ground (3-7 business days)' },
  { value: 'GROUND_HOME_DELIVERY', label: 'FedEx Home Delivery (3-7 business days)' },
  { value: 'FEDEX_EXPRESS_SAVER', label: 'FedEx Express Saver (3 business days)' },
  { value: 'FEDEX_2_DAY', label: 'FedEx 2Day' },
  { value: 'FEDEX_2_DAY_AM', label: 'FedEx 2Day A.M.' },
  { value: 'STANDARD_OVERNIGHT', label: 'FedEx Standard Overnight' },
  { value: 'PRIORITY_OVERNIGHT', label: 'FedEx Priority Overnight' },
]

export function CreateLabelButton({
  orderId,
  orderNumber,
  hasTrackingNumber,
  onLabelCreated,
}: CreateLabelButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [serviceType, setServiceType] = useState('FEDEX_GROUND')
  const [labelData, setLabelData] = useState<string | null>(null)
  const { success, error: showError } = useToast()

  const handleCreateLabel = async () => {
    setIsCreating(true)

    try {
      const response = await fetch('/api/admin/shipping/create-label', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          serviceType,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create label')
      }

      setLabelData(data.labelData)
      success(
        'Shipping label created',
        `Tracking number: ${data.trackingNumber}`
      )
      onLabelCreated()
    } catch (err) {
      console.error('Create label error:', err)
      showError(
        'Failed to create label',
        err instanceof Error ? err.message : 'Please try again.'
      )
    } finally {
      setIsCreating(false)
    }
  }

  const handleDownloadLabel = () => {
    if (!labelData) return

    // Convert base64 to blob and download
    const byteCharacters = atob(labelData)
    const byteNumbers = new Array(byteCharacters.length)
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: 'application/pdf' })

    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `shipping-label-${orderNumber}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  if (hasTrackingNumber) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Truck className="mr-2 h-4 w-4" />
          Create Shipping Label
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Shipping Label</DialogTitle>
          <DialogDescription>
            Generate a FedEx shipping label for order #{orderNumber}
          </DialogDescription>
        </DialogHeader>

        {labelData ? (
          <div className="space-y-4 py-4">
            <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-lg text-center">
              <p className="text-green-500 font-medium">Label created successfully!</p>
            </div>
            <Button onClick={handleDownloadLabel} className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Download Label (PDF)
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div>
              <Label>Shipping Service</Label>
              <Select value={serviceType} onValueChange={setServiceType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FEDEX_SERVICE_TYPES.map((service) => (
                    <SelectItem key={service.value} value={service.value}>
                      {service.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg">
              <p className="text-sm text-yellow-500">
                This will create a shipping label and charge your FedEx account.
                Make sure the shipping address is correct before proceeding.
              </p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            {labelData ? 'Close' : 'Cancel'}
          </Button>
          {!labelData && (
            <Button onClick={handleCreateLabel} disabled={isCreating}>
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Truck className="mr-2 h-4 w-4" />
                  Create Label
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
