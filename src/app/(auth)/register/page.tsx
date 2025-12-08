'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { registerSchema, type RegisterInput } from '@/lib/validations'
import { UserPlus } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const { error: showError, success } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
          },
        },
      })

      if (error) {
        throw error
      }

      success(
        'Account created!',
        'Please check your email to verify your account.'
      )
      router.push('/login')
    } catch (err) {
      console.error('Registration error:', err)
      showError(
        'Registration failed',
        err instanceof Error ? err.message : 'Please try again.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-brand-darker border border-brand-gray p-8 clip-corners">
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl text-brand-white mb-2">
          Create Account
        </h1>
        <p className="text-brand-light-gray">
          Join 3TEK Design to start shopping
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            placeholder="John Doe"
            {...register('fullName')}
            error={errors.fullName?.message}
          />
        </div>

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
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register('password')}
            error={errors.password?.message}
          />
          <p className="text-xs text-brand-light-gray mt-1">
            Must be at least 8 characters
          </p>
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            {...register('confirmPassword')}
            error={errors.confirmPassword?.message}
          />
        </div>

        <Button type="submit" className="w-full" isLoading={isLoading}>
          <UserPlus className="mr-2 h-4 w-4" />
          Create Account
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-brand-light-gray">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-neon hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      <p className="mt-6 text-xs text-center text-brand-light-gray">
        By creating an account, you agree to our{' '}
        <Link href="/terms" className="text-brand-neon hover:underline">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="text-brand-neon hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  )
}
