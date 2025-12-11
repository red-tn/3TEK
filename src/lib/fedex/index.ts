// FedEx API Integration
// Documentation: https://developer.fedex.com/api/en-us/catalog.html

const FEDEX_API_URL = process.env.FEDEX_API_URL || 'https://apis-sandbox.fedex.com'
const FEDEX_CLIENT_ID = process.env.FEDEX_CLIENT_ID || ''
const FEDEX_CLIENT_SECRET = process.env.FEDEX_CLIENT_SECRET || ''
const FEDEX_ACCOUNT_NUMBER = process.env.FEDEX_ACCOUNT_NUMBER || ''

// Store token in memory with expiration
let accessToken: string | null = null
let tokenExpiry: number = 0

interface FedExAddress {
  streetLines: string[]
  city: string
  stateOrProvinceCode: string
  postalCode: string
  countryCode: string
  residential?: boolean
}

interface FedExParcel {
  weight: {
    value: number
    units: 'LB' | 'KG'
  }
  dimensions?: {
    length: number
    width: number
    height: number
    units: 'IN' | 'CM'
  }
}

export interface FedExRate {
  serviceType: string
  serviceName: string
  totalCharges: number
  currency: string
  deliveryDate?: string
  transitDays?: number
}

export interface FedExShipment {
  trackingNumber: string
  labelData: string // Base64 encoded PDF
  trackingUrl: string
}

// Get OAuth access token
async function getAccessToken(): Promise<string> {
  // Return cached token if still valid
  if (accessToken && Date.now() < tokenExpiry) {
    return accessToken
  }

  if (!FEDEX_CLIENT_ID || !FEDEX_CLIENT_SECRET) {
    throw new Error('FedEx API credentials not configured')
  }

  const response = await fetch(`${FEDEX_API_URL}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: FEDEX_CLIENT_ID,
      client_secret: FEDEX_CLIENT_SECRET,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('FedEx auth error:', error)
    throw new Error('Failed to authenticate with FedEx')
  }

  const data = await response.json()
  accessToken = data.access_token
  // Set expiry with 5 minute buffer
  tokenExpiry = Date.now() + (data.expires_in - 300) * 1000

  return accessToken!
}

// Get shipping rates
export async function getFedExRates(
  origin: FedExAddress,
  destination: FedExAddress,
  parcels: FedExParcel[]
): Promise<FedExRate[]> {
  const token = await getAccessToken()

  const requestBody = {
    accountNumber: {
      value: FEDEX_ACCOUNT_NUMBER,
    },
    requestedShipment: {
      shipper: {
        address: origin,
      },
      recipient: {
        address: destination,
      },
      pickupType: 'DROPOFF_AT_FEDEX_LOCATION',
      rateRequestType: ['LIST', 'ACCOUNT'],
      requestedPackageLineItems: parcels.map((parcel) => ({
        weight: parcel.weight,
        dimensions: parcel.dimensions,
      })),
    },
  }

  const response = await fetch(`${FEDEX_API_URL}/rate/v1/rates/quotes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-locale': 'en_US',
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('FedEx rate error:', error)
    throw new Error('Failed to get FedEx rates')
  }

  const data = await response.json()
  const rates: FedExRate[] = []

  if (data.output?.rateReplyDetails) {
    for (const detail of data.output.rateReplyDetails) {
      const ratedShipmentDetails = detail.ratedShipmentDetails?.[0]
      if (ratedShipmentDetails) {
        rates.push({
          serviceType: detail.serviceType,
          serviceName: getServiceName(detail.serviceType),
          totalCharges: ratedShipmentDetails.totalNetCharge,
          currency: ratedShipmentDetails.currency || 'USD',
          deliveryDate: detail.commit?.dateDetail?.dayOfWeek,
          transitDays: detail.commit?.transitDays?.days,
        })
      }
    }
  }

  return rates.sort((a, b) => a.totalCharges - b.totalCharges)
}

// Create shipment and generate label
export async function createFedExShipment(
  origin: FedExAddress & { contact: { personName: string; phoneNumber: string; companyName?: string } },
  destination: FedExAddress & { contact: { personName: string; phoneNumber: string; emailAddress?: string } },
  parcels: FedExParcel[],
  serviceType: string = 'FEDEX_GROUND'
): Promise<FedExShipment> {
  const token = await getAccessToken()

  const requestBody = {
    labelResponseOptions: 'LABEL',
    accountNumber: {
      value: FEDEX_ACCOUNT_NUMBER,
    },
    requestedShipment: {
      shipper: {
        contact: origin.contact,
        address: {
          streetLines: origin.streetLines,
          city: origin.city,
          stateOrProvinceCode: origin.stateOrProvinceCode,
          postalCode: origin.postalCode,
          countryCode: origin.countryCode,
        },
      },
      recipients: [
        {
          contact: destination.contact,
          address: {
            streetLines: destination.streetLines,
            city: destination.city,
            stateOrProvinceCode: destination.stateOrProvinceCode,
            postalCode: destination.postalCode,
            countryCode: destination.countryCode,
            residential: destination.residential ?? true,
          },
        },
      ],
      pickupType: 'DROPOFF_AT_FEDEX_LOCATION',
      serviceType: serviceType,
      packagingType: 'YOUR_PACKAGING',
      shippingChargesPayment: {
        paymentType: 'SENDER',
        payor: {
          responsibleParty: {
            accountNumber: {
              value: FEDEX_ACCOUNT_NUMBER,
            },
          },
        },
      },
      labelSpecification: {
        labelFormatType: 'COMMON2D',
        labelStockType: 'PAPER_4X6',
        imageType: 'PDF',
      },
      requestedPackageLineItems: parcels.map((parcel, index) => ({
        sequenceNumber: index + 1,
        weight: parcel.weight,
        dimensions: parcel.dimensions,
      })),
    },
  }

  const response = await fetch(`${FEDEX_API_URL}/ship/v1/shipments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-locale': 'en_US',
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('FedEx shipment error:', error)
    throw new Error('Failed to create FedEx shipment')
  }

  const data = await response.json()
  const shipmentDetails = data.output?.transactionShipments?.[0]

  if (!shipmentDetails) {
    throw new Error('No shipment details returned from FedEx')
  }

  const trackingNumber = shipmentDetails.pieceResponses?.[0]?.trackingNumber
  const labelData = shipmentDetails.pieceResponses?.[0]?.packageDocuments?.[0]?.encodedLabel

  if (!trackingNumber || !labelData) {
    throw new Error('Missing tracking number or label from FedEx response')
  }

  return {
    trackingNumber,
    labelData,
    trackingUrl: `https://www.fedex.com/fedextrack/?trknbr=${trackingNumber}`,
  }
}

// Track shipment
export async function trackFedExShipment(trackingNumber: string): Promise<{
  status: string
  statusDescription: string
  estimatedDelivery?: string
  events: Array<{
    timestamp: string
    eventDescription: string
    city?: string
    stateOrProvinceCode?: string
  }>
}> {
  const token = await getAccessToken()

  const requestBody = {
    trackingInfo: [
      {
        trackingNumberInfo: {
          trackingNumber: trackingNumber,
        },
      },
    ],
    includeDetailedScans: true,
  }

  const response = await fetch(`${FEDEX_API_URL}/track/v1/trackingnumbers`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      'X-locale': 'en_US',
    },
    body: JSON.stringify(requestBody),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('FedEx tracking error:', error)
    throw new Error('Failed to track FedEx shipment')
  }

  const data = await response.json()
  const trackResult = data.output?.completeTrackResults?.[0]?.trackResults?.[0]

  if (!trackResult) {
    throw new Error('No tracking results found')
  }

  return {
    status: trackResult.latestStatusDetail?.statusByLocale || 'Unknown',
    statusDescription: trackResult.latestStatusDetail?.description || '',
    estimatedDelivery: trackResult.dateAndTimes?.find(
      (d: { type: string }) => d.type === 'ESTIMATED_DELIVERY'
    )?.dateTime,
    events: (trackResult.scanEvents || []).map((event: {
      date?: string
      eventDescription?: string
      scanLocation?: { city?: string; stateOrProvinceCode?: string }
    }) => ({
      timestamp: event.date,
      eventDescription: event.eventDescription,
      city: event.scanLocation?.city,
      stateOrProvinceCode: event.scanLocation?.stateOrProvinceCode,
    })),
  }
}

// Helper to map service codes to friendly names
function getServiceName(serviceType: string): string {
  const serviceNames: Record<string, string> = {
    FEDEX_GROUND: 'FedEx Ground',
    FEDEX_HOME_DELIVERY: 'FedEx Home Delivery',
    FEDEX_EXPRESS_SAVER: 'FedEx Express Saver',
    FEDEX_2_DAY: 'FedEx 2Day',
    FEDEX_2_DAY_AM: 'FedEx 2Day A.M.',
    STANDARD_OVERNIGHT: 'FedEx Standard Overnight',
    PRIORITY_OVERNIGHT: 'FedEx Priority Overnight',
    FIRST_OVERNIGHT: 'FedEx First Overnight',
    FEDEX_FREIGHT_ECONOMY: 'FedEx Freight Economy',
    FEDEX_FREIGHT_PRIORITY: 'FedEx Freight Priority',
    GROUND_HOME_DELIVERY: 'FedEx Ground Home Delivery',
  }
  return serviceNames[serviceType] || serviceType
}

// Check if FedEx is configured
export function isFedExConfigured(): boolean {
  return !!(FEDEX_CLIENT_ID && FEDEX_CLIENT_SECRET && FEDEX_ACCOUNT_NUMBER)
}
