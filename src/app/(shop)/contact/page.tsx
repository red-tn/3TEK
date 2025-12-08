'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react'

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
})

type ContactInput = z.infer<typeof contactSchema>

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { success, error: showError } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
  })

  const onSubmit = async (data: ContactInput) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to send message')

      success('Message sent!', "We'll get back to you within 24-48 hours.")
      reset()
    } catch {
      showError('Failed to send', 'Please try again or email us directly.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="font-display text-4xl md:text-5xl text-brand-white mb-4">
          Contact Us
        </h1>
        <p className="text-brand-light-gray max-w-2xl mx-auto">
          Have a question about our products or a custom project in mind?
          We'd love to hear from you. Reach out and we'll respond within 24-48 hours.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
        {/* Contact Form */}
        <div className="bg-brand-darker border border-brand-gray p-8 clip-corners">
          <h2 className="font-display text-2xl text-brand-white mb-6">
            Send us a Message
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  {...register('name')}
                  error={errors.name?.message}
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
            </div>

            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="What's this about?"
                {...register('subject')}
                error={errors.subject?.message}
              />
            </div>

            <div>
              <Label htmlFor="message">Message</Label>
              <textarea
                id="message"
                rows={6}
                placeholder="Tell us more about your question or project..."
                {...register('message')}
                className="w-full bg-brand-dark border border-brand-gray px-4 py-3 text-brand-white placeholder:text-brand-light-gray focus:outline-none focus:border-brand-neon transition-colors"
              />
              {errors.message && (
                <p className="mt-1 text-sm text-red-500">{errors.message.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" isLoading={isLoading}>
              <Send className="mr-2 h-4 w-4" />
              Send Message
            </Button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="space-y-8">
          <div className="bg-brand-darker border border-brand-gray p-8 clip-corners">
            <h2 className="font-display text-2xl text-brand-white mb-6">
              Get in Touch
            </h2>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-brand-neon/10 border border-brand-neon/30">
                  <Mail className="h-5 w-5 text-brand-neon" />
                </div>
                <div>
                  <h3 className="font-mono text-sm uppercase tracking-wider text-brand-light-gray mb-1">
                    Email
                  </h3>
                  <a href="mailto:hello@3tekdesign.com" className="text-brand-white hover:text-brand-neon transition-colors">
                    hello@3tekdesign.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-brand-neon/10 border border-brand-neon/30">
                  <Phone className="h-5 w-5 text-brand-neon" />
                </div>
                <div>
                  <h3 className="font-mono text-sm uppercase tracking-wider text-brand-light-gray mb-1">
                    Phone
                  </h3>
                  <a href="tel:+1-555-3TEK-3D" className="text-brand-white hover:text-brand-neon transition-colors">
                    +1 (555) 3TEK-3D
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-brand-neon/10 border border-brand-neon/30">
                  <MapPin className="h-5 w-5 text-brand-neon" />
                </div>
                <div>
                  <h3 className="font-mono text-sm uppercase tracking-wider text-brand-light-gray mb-1">
                    Location
                  </h3>
                  <p className="text-brand-white">
                    Austin, Texas<br />
                    United States
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-brand-neon/10 border border-brand-neon/30">
                  <Clock className="h-5 w-5 text-brand-neon" />
                </div>
                <div>
                  <h3 className="font-mono text-sm uppercase tracking-wider text-brand-light-gray mb-1">
                    Response Time
                  </h3>
                  <p className="text-brand-white">
                    24-48 hours<br />
                    <span className="text-brand-light-gray text-sm">Mon-Fri, 9AM-6PM CST</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Callout */}
          <div className="bg-brand-darker border border-brand-gray p-6 clip-corners">
            <h3 className="font-display text-lg text-brand-white mb-2">
              Looking for quick answers?
            </h3>
            <p className="text-brand-light-gray text-sm mb-4">
              Check out our FAQ page for answers to common questions about orders,
              shipping, returns, and custom projects.
            </p>
            <a
              href="/faq"
              className="font-mono text-sm text-brand-neon hover:underline uppercase tracking-wider"
            >
              View FAQ →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
