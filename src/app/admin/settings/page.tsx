'use client'

import { useState, useEffect } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Save, Store, Mail, CreditCard, Truck, Loader2 } from 'lucide-react'

export default function AdminSettingsPage() {
  const { success, error: showError } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [storeSettings, setStoreSettings] = useState({
    storeName: '3TEK Design',
    tagline: 'High-Quality 3D Printed Products',
    description: 'Custom 3D printed designs for enthusiasts and collectors.',
    contactEmail: 'support@3tekdesign.com',
    contactPhone: '',
    address: '',
  })

  const [emailSettings, setEmailSettings] = useState({
    orderConfirmation: true,
    shippingNotification: true,
    deliveryNotification: true,
    marketingEmails: false,
    fromName: '3TEK Design',
    fromEmail: 'noreply@3tekdesign.com',
  })

  const [paymentSettings, setPaymentSettings] = useState({
    stripeEnabled: true,
    testMode: true,
    currency: 'USD',
    taxRate: '0',
    autoCapture: true,
  })

  const [shippingSettings, setShippingSettings] = useState({
    freeShippingThreshold: '75',
    defaultShippingDays: '5-7',
    enableLocalPickup: false,
    pickupAddress: '',
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      if (response.ok) {
        const { settings } = await response.json()
        if (settings.store) setStoreSettings(settings.store)
        if (settings.email) setEmailSettings(settings.email)
        if (settings.payment) setPaymentSettings(settings.payment)
        if (settings.shipping) setShippingSettings(settings.shipping)
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (section: string, data: unknown) => {
    setIsSaving(true)

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: section.toLowerCase(), value: data }),
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }

      success('Settings saved', `${section} settings have been updated.`)
    } catch (err) {
      console.error('Save error:', err)
      showError('Error', 'Failed to save settings.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-brand-neon animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl text-brand-white mb-2">
          Settings
        </h1>
        <p className="text-brand-light-gray">
          Configure your store settings and preferences.
        </p>
      </div>

      <Tabs defaultValue="store" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="store" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            <span className="hidden sm:inline">Store</span>
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Email</span>
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Payment</span>
          </TabsTrigger>
          <TabsTrigger value="shipping" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            <span className="hidden sm:inline">Shipping</span>
          </TabsTrigger>
        </TabsList>

        {/* Store Settings */}
        <TabsContent value="store">
          <div className="bg-brand-darker border border-brand-gray p-6 clip-corners">
            <h2 className="font-display text-xl text-brand-white mb-6">
              Store Information
            </h2>
            <div className="space-y-4 max-w-2xl">
              <div>
                <Label htmlFor="storeName">Store Name</Label>
                <Input
                  id="storeName"
                  value={storeSettings.storeName}
                  onChange={(e) =>
                    setStoreSettings({ ...storeSettings, storeName: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="tagline">Tagline</Label>
                <Input
                  id="tagline"
                  value={storeSettings.tagline}
                  onChange={(e) =>
                    setStoreSettings({ ...storeSettings, tagline: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={storeSettings.description}
                  onChange={(e) =>
                    setStoreSettings({ ...storeSettings, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={storeSettings.contactEmail}
                    onChange={(e) =>
                      setStoreSettings({ ...storeSettings, contactEmail: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    value={storeSettings.contactPhone}
                    onChange={(e) =>
                      setStoreSettings({ ...storeSettings, contactPhone: e.target.value })
                    }
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Business Address</Label>
                <Textarea
                  id="address"
                  value={storeSettings.address}
                  onChange={(e) =>
                    setStoreSettings({ ...storeSettings, address: e.target.value })
                  }
                  rows={2}
                  placeholder="Optional - displayed in footer"
                />
              </div>
              <Button
                onClick={() => handleSave('Store', storeSettings)}
                isLoading={isSaving}
              >
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email">
          <div className="bg-brand-darker border border-brand-gray p-6 clip-corners">
            <h2 className="font-display text-xl text-brand-white mb-6">
              Email Configuration
            </h2>
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="text-brand-white font-medium mb-4">
                  Notification Preferences
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="orderConfirmation"
                      checked={emailSettings.orderConfirmation}
                      onCheckedChange={(checked) =>
                        setEmailSettings({
                          ...emailSettings,
                          orderConfirmation: !!checked,
                        })
                      }
                    />
                    <Label htmlFor="orderConfirmation" className="cursor-pointer">
                      Send order confirmation emails
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="shippingNotification"
                      checked={emailSettings.shippingNotification}
                      onCheckedChange={(checked) =>
                        setEmailSettings({
                          ...emailSettings,
                          shippingNotification: !!checked,
                        })
                      }
                    />
                    <Label htmlFor="shippingNotification" className="cursor-pointer">
                      Send shipping notification emails
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="deliveryNotification"
                      checked={emailSettings.deliveryNotification}
                      onCheckedChange={(checked) =>
                        setEmailSettings({
                          ...emailSettings,
                          deliveryNotification: !!checked,
                        })
                      }
                    />
                    <Label htmlFor="deliveryNotification" className="cursor-pointer">
                      Send delivery confirmation emails
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="marketingEmails"
                      checked={emailSettings.marketingEmails}
                      onCheckedChange={(checked) =>
                        setEmailSettings({
                          ...emailSettings,
                          marketingEmails: !!checked,
                        })
                      }
                    />
                    <Label htmlFor="marketingEmails" className="cursor-pointer">
                      Enable marketing emails (requires customer consent)
                    </Label>
                  </div>
                </div>
              </div>

              <div className="border-t border-brand-gray pt-6">
                <h3 className="text-brand-white font-medium mb-4">
                  Sender Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fromName">From Name</Label>
                    <Input
                      id="fromName"
                      value={emailSettings.fromName}
                      onChange={(e) =>
                        setEmailSettings({ ...emailSettings, fromName: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="fromEmail">From Email</Label>
                    <Input
                      id="fromEmail"
                      type="email"
                      value={emailSettings.fromEmail}
                      onChange={(e) =>
                        setEmailSettings({ ...emailSettings, fromEmail: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <Button
                onClick={() => handleSave('Email', emailSettings)}
                isLoading={isSaving}
              >
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment">
          <div className="bg-brand-darker border border-brand-gray p-6 clip-corners">
            <h2 className="font-display text-xl text-brand-white mb-6">
              Payment Configuration
            </h2>
            <div className="space-y-6 max-w-2xl">
              <div className="p-4 bg-brand-dark border border-brand-gray clip-corners-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-[#635BFF] rounded flex items-center justify-center">
                      <span className="text-white font-bold text-sm">S</span>
                    </div>
                    <div>
                      <p className="text-brand-white font-medium">Stripe</p>
                      <p className="text-xs text-brand-light-gray">
                        Accept credit cards and more
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="stripeEnabled"
                      checked={paymentSettings.stripeEnabled}
                      onCheckedChange={(checked) =>
                        setPaymentSettings({
                          ...paymentSettings,
                          stripeEnabled: !!checked,
                        })
                      }
                    />
                    <Label htmlFor="stripeEnabled" className="cursor-pointer">
                      Enabled
                    </Label>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <Checkbox
                    id="testMode"
                    checked={paymentSettings.testMode}
                    onCheckedChange={(checked) =>
                      setPaymentSettings({
                        ...paymentSettings,
                        testMode: !!checked,
                      })
                    }
                  />
                  <Label htmlFor="testMode" className="cursor-pointer text-sm">
                    Test mode (no real charges)
                  </Label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={paymentSettings.currency}
                    onChange={(e) =>
                      setPaymentSettings({
                        ...paymentSettings,
                        currency: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="USD"
                  />
                </div>
                <div>
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.01"
                    min="0"
                    value={paymentSettings.taxRate}
                    onChange={(e) =>
                      setPaymentSettings({
                        ...paymentSettings,
                        taxRate: e.target.value,
                      })
                    }
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="autoCapture"
                  checked={paymentSettings.autoCapture}
                  onCheckedChange={(checked) =>
                    setPaymentSettings({
                      ...paymentSettings,
                      autoCapture: !!checked,
                    })
                  }
                />
                <Label htmlFor="autoCapture" className="cursor-pointer">
                  Auto-capture payments (uncheck for manual capture)
                </Label>
              </div>

              <Button
                onClick={() => handleSave('Payment', paymentSettings)}
                isLoading={isSaving}
              >
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Shipping Settings */}
        <TabsContent value="shipping">
          <div className="bg-brand-darker border border-brand-gray p-6 clip-corners">
            <h2 className="font-display text-xl text-brand-white mb-6">
              Shipping Configuration
            </h2>
            <div className="space-y-6 max-w-2xl">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="freeShippingThreshold">
                    Free Shipping Threshold ($)
                  </Label>
                  <Input
                    id="freeShippingThreshold"
                    type="number"
                    step="0.01"
                    min="0"
                    value={shippingSettings.freeShippingThreshold}
                    onChange={(e) =>
                      setShippingSettings({
                        ...shippingSettings,
                        freeShippingThreshold: e.target.value,
                      })
                    }
                    placeholder="0 for no free shipping"
                  />
                  <p className="text-xs text-brand-light-gray mt-1">
                    Orders above this amount get free shipping
                  </p>
                </div>
                <div>
                  <Label htmlFor="defaultShippingDays">
                    Default Shipping Time
                  </Label>
                  <Input
                    id="defaultShippingDays"
                    value={shippingSettings.defaultShippingDays}
                    onChange={(e) =>
                      setShippingSettings({
                        ...shippingSettings,
                        defaultShippingDays: e.target.value,
                      })
                    }
                    placeholder="e.g., 5-7 business days"
                  />
                </div>
              </div>

              <div className="border-t border-brand-gray pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Checkbox
                    id="enableLocalPickup"
                    checked={shippingSettings.enableLocalPickup}
                    onCheckedChange={(checked) =>
                      setShippingSettings({
                        ...shippingSettings,
                        enableLocalPickup: !!checked,
                      })
                    }
                  />
                  <Label htmlFor="enableLocalPickup" className="cursor-pointer">
                    Enable local pickup option
                  </Label>
                </div>
                {shippingSettings.enableLocalPickup && (
                  <div>
                    <Label htmlFor="pickupAddress">Pickup Address</Label>
                    <Textarea
                      id="pickupAddress"
                      value={shippingSettings.pickupAddress}
                      onChange={(e) =>
                        setShippingSettings({
                          ...shippingSettings,
                          pickupAddress: e.target.value,
                        })
                      }
                      rows={2}
                      placeholder="Enter the address where customers can pick up orders"
                    />
                  </div>
                )}
              </div>

              <Button
                onClick={() => handleSave('Shipping', shippingSettings)}
                isLoading={isSaving}
              >
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
