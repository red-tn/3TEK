'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '@/lib/validations'
import { LogIn } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/'
  const { error: showError, success } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        throw error
      }

      success('Welcome back!', 'You have been signed in successfully.')
      router.push(redirectTo)
      router.refresh()
    } catch (err) {
      console.error('Login error:', err)
      showError(
        'Sign in failed',
        err instanceof Error ? err.message : 'Please check your credentials and try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-brand-darker border border-brand-gray p-8 clip-corners">
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl text-brand-white mb-2">
          Welcome Back
        </h1>
        <p className="text-brand-light-gray">
          Sign in to your account to continue
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="your@email.com"
            {...register('email')}
            error={errors.email?.message}
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <Label htmlFor="password">Password</Label>
            <Link
              href="/forgot-password"
              className="text-xs text-brand-neon hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register('password')}
            error={errors.password?.message}
          />
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading}>
          <LogIn className="mr-2 h-4 w-4" />
          Sign In
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-brand-light-gray">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-brand-neon hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
