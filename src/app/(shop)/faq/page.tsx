'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'

const faqs = [
  {
    category: 'Orders & Shipping',
    questions: [
      {
        q: 'How long does shipping take?',
        a: 'Standard shipping takes 5-7 business days within the US. Express shipping is available for 2-3 business day delivery. International shipping typically takes 10-14 business days depending on the destination.',
      },
      {
        q: 'Do you ship internationally?',
        a: 'Yes! We ship to most countries worldwide. International shipping rates are calculated at checkout based on your location and order weight.',
      },
      {
        q: 'How can I track my order?',
        a: "Once your order ships, you'll receive an email with your tracking number. You can also track your order anytime by visiting our Track Order page and entering your order number.",
      },
      {
        q: 'Can I modify or cancel my order?',
        a: "Orders can be modified or cancelled within 2 hours of placement. After that, we begin the printing process. Contact us immediately if you need to make changes.",
      },
    ],
  },
  {
    category: 'Products & Materials',
    questions: [
      {
        q: 'What materials do you use for printing?',
        a: 'We primarily use PLA and PETG plastics, which are durable, eco-friendly, and safe for home use. For specialized items, we also offer ABS, TPU (flexible), and resin prints. Check individual product pages for material specifications.',
      },
      {
        q: 'Are your products food-safe?',
        a: "Not all products are food-safe. Items specifically listed as food-safe use FDA-approved materials and coatings. Check the product description for food-safe certifications.",
      },
      {
        q: 'How durable are 3D printed products?',
        a: "Our products are designed for everyday use and are quite durable. PLA items are best for indoor use, while PETG and ABS are more heat and UV resistant for varied environments.",
      },
      {
        q: 'Can I request custom colors?',
        a: "Yes! Many products are available in multiple colors. If you don't see your preferred color, contact us for custom color options. Additional fees may apply.",
      },
    ],
  },
  {
    category: 'Custom Orders',
    questions: [
      {
        q: 'Do you accept custom design requests?',
        a: "Absolutely! We love bringing custom ideas to life. Send us your concept through our contact form, and we'll provide a quote within 48 hours.",
      },
      {
        q: 'Can I send my own 3D model files?',
        a: "Yes, we accept STL, OBJ, and 3MF files. We'll review your file for printability and provide a quote. Design modifications may be suggested for optimal print quality.",
      },
      {
        q: 'What's the turnaround time for custom orders?',
        a: "Custom orders typically take 7-14 business days depending on complexity. Rush orders are available for an additional fee.",
      },
      {
        q: 'Is there a minimum order for custom projects?',
        a: "No minimum for single custom items. For bulk/wholesale custom orders, we require a minimum of 10 units per design.",
      },
    ],
  },
  {
    category: 'Returns & Refunds',
    questions: [
      {
        q: 'What is your return policy?',
        a: "We offer a 30-day return policy for unused items in original packaging. Custom orders are final sale unless there's a manufacturing defect.",
      },
      {
        q: 'How do I initiate a return?',
        a: "Contact us with your order number and reason for return. We'll provide a return shipping label and process your refund within 5-7 business days of receiving the item.",
      },
      {
        q: 'What if my item arrives damaged?',
        a: "We're sorry to hear that! Take photos of the damage and contact us within 48 hours of delivery. We'll send a replacement at no additional cost.",
      },
      {
        q: 'Do you offer exchanges?',
        a: "Yes, we offer exchanges for different sizes or colors when available. Contact us to arrange an exchange.",
      },
    ],
  },
]

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-brand-gray last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-4 flex items-center justify-between text-left hover:text-brand-neon transition-colors"
      >
        <span className="text-brand-white font-medium pr-4">{question}</span>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-brand-neon flex-shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-brand-light-gray flex-shrink-0" />
        )}
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-300',
          isOpen ? 'max-h-96 pb-4' : 'max-h-0'
        )}
      >
        <p className="text-brand-light-gray">{answer}</p>
      </div>
    </div>
  )
}

export default function FAQPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="font-display text-4xl md:text-5xl text-brand-white mb-4">
          Frequently Asked Questions
        </h1>
        <p className="text-brand-light-gray max-w-2xl mx-auto">
          Find answers to common questions about our products, ordering process,
          shipping, and more.
        </p>
      </div>

      {/* FAQ Sections */}
      <div className="max-w-3xl mx-auto space-y-8">
        {faqs.map((section) => (
          <div
            key={section.category}
            className="bg-brand-darker border border-brand-gray p-6 clip-corners"
          >
            <h2 className="font-display text-xl text-brand-neon mb-4">
              {section.category}
            </h2>
            <div>
              {section.questions.map((faq) => (
                <FAQItem key={faq.q} question={faq.q} answer={faq.a} />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Still have questions */}
      <div className="mt-12 text-center">
        <div className="bg-brand-darker border border-brand-gray p-8 clip-corners max-w-xl mx-auto">
          <h3 className="font-display text-2xl text-brand-white mb-3">
            Still have questions?
          </h3>
          <p className="text-brand-light-gray mb-6">
            Can't find what you're looking for? Our team is here to help.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 bg-brand-neon text-brand-black font-mono text-sm uppercase tracking-wider hover:bg-brand-neon/90 transition-colors clip-corners-sm"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  )
}
