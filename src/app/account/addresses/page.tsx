'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { MapPin, Plus, Trash2, Edit2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { addressSchema, type AddressInput } from '@/lib/validations'
import type { Address } from '@/types/database'

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const { success, error: showError } = useToast()
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      country: 'US',
    },
  })

  useEffect(() => {
    fetchAddresses()
  }, [])

  const fetchAddresses = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { data } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false })

    setAddresses(data || [])
    setIsLoading(false)
  }

  const onSubmit = async (data: AddressInput) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      if (editingAddress) {
        // Update existing address
        const { error } = await supabase
          .from('addresses')
          .update({
            full_name: data.fullName,
            address_line1: data.addressLine1,
            address_line2: data.addressLine2,
            city: data.city,
            state: data.state,
            postal_code: data.postalCode,
            country: data.country,
            phone: data.phone,
          })
          .eq('id', editingAddress.id)

        if (error) throw error
        success('Address updated', 'Your address has been updated.')
      } else {
        // Create new address
        const { error } = await supabase.from('addresses').insert({
          user_id: user.id,
          full_name: data.fullName,
          address_line1: data.addressLine1,
          address_line2: data.addressLine2,
          city: data.city,
          state: data.state,
          postal_code: data.postalCode,
          country: data.country,
          phone: data.phone,
          is_default: addresses.length === 0,
        })

        if (error) throw error
        success('Address added', 'Your new address has been saved.')
      }

      setDialogOpen(false)
      setEditingAddress(null)
      reset()
      fetchAddresses()
    } catch (err) {
      console.error('Address error:', err)
      showError('Error', 'Failed to save address. Please try again.')
    }
  }

  const handleEdit = (address: Address) => {
    setEditingAddress(address)
    reset({
      fullName: address.full_name,
      addressLine1: address.address_line1,
      addressLine2: address.address_line2 || '',
      city: address.city,
      state: address.state,
      postalCode: address.postal_code,
      country: address.country,
      phone: address.phone || '',
    })
    setDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return

    try {
      const { error } = await supabase.from('addresses').delete().eq('id', id)

      if (error) throw error
      success('Address deleted', 'The address has been removed.')
      fetchAddresses()
    } catch (err) {
      console.error('Delete error:', err)
      showError('Error', 'Failed to delete address.')
    }
  }

  const handleSetDefault = async (id: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      // Remove default from all addresses
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', user.id)

      // Set new default
      const { error } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', id)

      if (error) throw error
      success('Default updated', 'Default address has been changed.')
      fetchAddresses()
    } catch (err) {
      console.error('Set default error:', err)
      showError('Error', 'Failed to set default address.')
    }
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setEditingAddress(null)
    reset({
      fullName: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US',
      phone: '',
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl text-brand-white">My Addresses</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Address
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="fullName" required>
                  Full Name
                </Label>
                <Input
                  id="fullName"
                  {...register('fullName')}
                  error={errors.fullName?.message}
                />
              </div>
              <div>
                <Label htmlFor="addressLine1" required>
                  Address Line 1
                </Label>
                <Input
                  id="addressLine1"
                  {...register('addressLine1')}
                  error={errors.addressLine1?.message}
                />
              </div>
              <div>
                <Label htmlFor="addressLine2">Address Line 2</Label>
                <Input id="addressLine2" {...register('addressLine2')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city" required>
                    City
                  </Label>
                  <Input
                    id="city"
                    {...register('city')}
                    error={errors.city?.message}
                  />
                </div>
                <div>
                  <Label htmlFor="state" required>
                    State
                  </Label>
                  <Input
                    id="state"
                    {...register('state')}
                    error={errors.state?.message}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="postalCode" required>
                    ZIP Code
                  </Label>
                  <Input
                    id="postalCode"
                    {...register('postalCode')}
                    error={errors.postalCode?.message}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" type="tel" {...register('phone')} />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDialogClose}
                >
                  Cancel
                </Button>
                <Button type="submit" isLoading={isSubmitting}>
                  {editingAddress ? 'Update' : 'Save'} Address
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-48 bg-brand-darker border border-brand-gray clip-corners animate-pulse"
            />
          ))}
        </div>
      ) : addresses.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`bg-brand-darker border p-6 clip-corners ${
                address.is_default ? 'border-brand-neon' : 'border-brand-gray'
              }`}
            >
              {address.is_default && (
                <span className="inline-block font-mono text-xs text-brand-neon uppercase tracking-wider mb-2">
                  Default Address
                </span>
              )}
              <address className="not-italic text-sm text-brand-light-gray space-y-1">
                <p className="text-brand-white font-medium">
                  {address.full_name}
                </p>
                <p>{address.address_line1}</p>
                {address.address_line2 && <p>{address.address_line2}</p>}
                <p>
                  {address.city}, {address.state} {address.postal_code}
                </p>
                <p>{address.country}</p>
                {address.phone && <p>{address.phone}</p>}
              </address>
              <div className="flex gap-2 mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEdit(address)}
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                {!address.is_default && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSetDefault(address.id)}
                  >
                    Set Default
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-400"
                  onClick={() => handleDelete(address.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-brand-darker border border-brand-gray clip-corners">
          <MapPin className="h-16 w-16 text-brand-gray mx-auto mb-4" />
          <h2 className="font-display text-xl text-brand-white mb-2">
            No Saved Addresses
          </h2>
          <p className="text-brand-light-gray mb-6">
            Add an address for faster checkout.
          </p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Address
          </Button>
        </div>
      )}
    </div>
  )
}
