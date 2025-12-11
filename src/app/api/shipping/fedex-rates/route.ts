import { NextResponse } from 'next/server'
import { getFedExRates, isFedExConfigured } from '@/lib/fedex'

const STORE_ADDRESS = {
  streetLines: [process.env.STORE_ADDRESS_LINE1 || '123 Main St'],
  city: process.env.STORE_CITY || 'Austin',
  stateOrProvinceCode: process.env.STORE_STATE || 'TX',
  postalCode: process.env.STORE_POSTAL_CODE || '78701',
  countryCode: 'US',
}

export async function POST(req: Request) {
  try {
    // Check if FedEx is configured
    if (!isFedExConfigured()) {
      return NextResponse.json(
        { error: 'FedEx integration not configured' },
        { status: 503 }
      )
    }

    const { destination, parcels } = await req.json()

    if (!destination || !destination.postalCode) {
      return NextResponse.json(
        { error: 'Destination postal code required' },
        { status: 400 }
      )
    }

    // Build destination address
    const destinationAddress = {
      streetLines: destination.streetLines || [''],
      city: destination.city || '',
      stateOrProvinceCode: destination.state || '',
      postalCode: destination.postalCode,
      countryCode: destination.country || 'US',
      residential: true,
    }

    // Default parcel if not provided
    const defaultParcels = parcels || [
      {
        weight: { value: 1, units: 'LB' as const },
        dimensions: { length: 10, width: 8, height: 4, units: 'IN' as const },
      },
    ]

    const rates = await getFedExRates(STORE_ADDRESS, destinationAddress, defaultParcels)

    // Convert to our standard format
    const formattedRates = rates.map((rate) => ({
      id: `fedex_${rate.serviceType.toLowerCase()}`,
      carrier: 'FedEx',
      name: rate.serviceName,
      serviceType: rate.serviceType,
      price_cents: Math.round(rate.totalCharges * 100),
      currency: rate.currency,
      deliveryDate: rate.deliveryDate,
      transitDays: rate.transitDays,
      description: rate.transitDays
        ? `${rate.transitDays} business day${rate.transitDays > 1 ? 's' : ''}`
        : undefined,
    }))

    return NextResponse.json({ rates: formattedRates })
  } catch (error) {
    console.error('FedEx rates error:', error)
    const message = error instanceof Error ? error.message : 'Failed to get shipping rates'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
