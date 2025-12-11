'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { profileSchema, type ProfileInput } from '@/lib/validations'
import { Save, LogOut } from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const { success, error: showError } = useToast()
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [email, setEmail] = useState('')
  const supabase = createClient()

  useEffect(() => {
    setMounted(true)
  }, [])

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    setEmail(user.email || '')

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profile) {
      reset({
        fullName: profile.full_name || '',
        phone: profile.phone || '',
      })
    }

    setIsLoading(false)
  }

  const onSubmit = async (data: ProfileInput) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.fullName,
          phone: data.phone,
        })
        .eq('id', user.id)

      if (error) throw error

      success('Profile updated', 'Your profile has been saved.')
    } catch (err) {
      console.error('Profile update error:', err)
      showError('Error', 'Failed to update profile.')
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  if (!mounted || isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-8 w-48 bg-brand-gray animate-pulse" />
        <div className="bg-brand-darker border border-brand-gray p-6 clip-corners space-y-4">
          <div className="h-10 bg-brand-gray animate-pulse" />
          <div className="h-10 bg-brand-gray animate-pulse" />
          <div className="h-10 bg-brand-gray animate-pulse" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl text-brand-white">
        Account Settings
      </h1>

      {/* Profile Settings */}
      <div className="bg-brand-darker border border-brand-gray p-6 clip-corners">
        <h2 className="font-display text-xl text-brand-white mb-6">Profile</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} disabled />
            <p className="text-xs text-brand-light-gray mt-1">
              Contact support to change your email address.
            </p>
          </div>
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
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(555) 555-5555"
              {...register('phone')}
            />
          </div>
          <Button type="submit" isLoading={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </form>
      </div>

      {/* Password */}
      <div className="bg-brand-darker border border-brand-gray p-6 clip-corners">
        <h2 className="font-display text-xl text-brand-white mb-4">Password</h2>
        <p className="text-brand-light-gray mb-4">
          To change your password, use the password reset flow.
        </p>
        <Button variant="outline" asChild>
          <a href="/forgot-password">Reset Password</a>
        </Button>
      </div>

      {/* Sign Out */}
      <div className="bg-brand-darker border border-brand-gray p-6 clip-corners">
        <h2 className="font-display text-xl text-brand-white mb-4">
          Sign Out
        </h2>
        <p className="text-brand-light-gray mb-4">
          Sign out of your account on this device.
        </p>
        <Button variant="destructive" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>

      {/* Danger Zone */}
      <div className="bg-brand-darker border border-red-500/50 p-6 clip-corners">
        <h2 className="font-display text-xl text-red-500 mb-4">Danger Zone</h2>
        <p className="text-brand-light-gray mb-4">
          Once you delete your account, there is no going back. Please be
          certain.
        </p>
        <Button
          variant="outline"
          className="border-red-500 text-red-500 hover:bg-red-500/10"
          onClick={() => {
            showError(
              'Contact Support',
              'Please contact support to delete your account.'
            )
          }}
        >
          Delete Account
        </Button>
      </div>
    </div>
  )
}
