import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
  try {
    const supabase = await createClient()

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const orderId = searchParams.get('orderId')

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID required' }, { status: 400 })
    }

    // Fetch order with items
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const shippingAddress = order.shipping_address as {
      fullName?: string
      addressLine1?: string
      addressLine2?: string
      city?: string
      state?: string
      postalCode?: string
      country?: string
    }

    // Generate invoice HTML
    const invoiceHtml = generateInvoiceHtml({
      order,
      shippingAddress,
      items: order.order_items || [],
    })

    return new NextResponse(invoiceHtml, {
      headers: {
        'Content-Type': 'text/html',
      },
    })
  } catch (error) {
    console.error('Invoice generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate invoice' },
      { status: 500 }
    )
  }
}

function generateInvoiceHtml({
  order,
  shippingAddress,
  items,
}: {
  order: {
    order_number: string
    email: string
    created_at: string
    subtotal_cents: number
    discount_cents: number
    shipping_cents: number
    tax_cents: number
    total_cents: number
    coupon_code?: string | null
    status: string
    payment_status: string
  }
  shippingAddress: {
    fullName?: string
    addressLine1?: string
    addressLine2?: string
    city?: string
    state?: string
    postalCode?: string
    country?: string
  }
  items: Array<{
    product_name: string
    product_image?: string | null
    quantity: number
    price_cents: number
  }>
}): string {
  const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

  const itemRows = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">${item.product_name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: right; font-family: monospace;">${formatPrice(item.price_cents)}</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: right; font-family: monospace;">${formatPrice(item.price_cents * item.quantity)}</td>
    </tr>
  `
    )
    .join('')

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${order.order_number}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      background-color: #ffffff;
      padding: 40px;
    }
    .invoice {
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #0a0a0a;
    }
    .logo {
      font-size: 28px;
      font-weight: 700;
      color: #0a0a0a;
      letter-spacing: 2px;
    }
    .logo span {
      color: #d4ff00;
    }
    .invoice-title {
      text-align: right;
    }
    .invoice-title h1 {
      font-size: 32px;
      color: #0a0a0a;
      margin-bottom: 8px;
    }
    .invoice-number {
      font-family: monospace;
      font-size: 14px;
      color: #666;
    }
    .meta {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-bottom: 40px;
    }
    .meta-section h3 {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #666;
      margin-bottom: 12px;
    }
    .meta-section p {
      color: #1a1a1a;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
    }
    th {
      background-color: #0a0a0a;
      color: #ffffff;
      padding: 12px;
      text-align: left;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    th:last-child {
      text-align: right;
    }
    .totals {
      width: 300px;
      margin-left: auto;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e5e5e5;
    }
    .totals-row.discount {
      color: #22c55e;
    }
    .totals-row.grand-total {
      border-bottom: none;
      padding-top: 16px;
      font-size: 18px;
      font-weight: 700;
    }
    .totals-row .label {
      color: #666;
    }
    .totals-row .amount {
      font-family: monospace;
    }
    .footer {
      margin-top: 60px;
      padding-top: 20px;
      border-top: 1px solid #e5e5e5;
      text-align: center;
      color: #666;
      font-size: 12px;
    }
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .status-paid {
      background-color: #dcfce7;
      color: #166534;
    }
    .status-pending {
      background-color: #fef3c7;
      color: #92400e;
    }
    @media print {
      body {
        padding: 20px;
      }
      .no-print {
        display: none;
      }
    }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <div class="logo">3TEK<span>.</span>DESIGN</div>
      <div class="invoice-title">
        <h1>INVOICE</h1>
        <p class="invoice-number">#${order.order_number}</p>
        <p style="margin-top: 8px;">
          <span class="status-badge ${order.payment_status === 'paid' ? 'status-paid' : 'status-pending'}">
            ${order.payment_status}
          </span>
        </p>
      </div>
    </div>

    <div class="meta">
      <div class="meta-section">
        <h3>Bill To</h3>
        <p><strong>${shippingAddress.fullName || 'Customer'}</strong></p>
        <p>${shippingAddress.addressLine1 || ''}</p>
        ${shippingAddress.addressLine2 ? `<p>${shippingAddress.addressLine2}</p>` : ''}
        <p>${shippingAddress.city || ''}, ${shippingAddress.state || ''} ${shippingAddress.postalCode || ''}</p>
        <p>${order.email}</p>
      </div>
      <div class="meta-section" style="text-align: right;">
        <h3>Invoice Details</h3>
        <p><strong>Date:</strong> ${formatDate(order.created_at)}</p>
        <p><strong>Order #:</strong> ${order.order_number}</p>
        <p><strong>Status:</strong> ${order.status.replace('_', ' ')}</p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Item</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Unit Price</th>
          <th style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>

    <div class="totals">
      <div class="totals-row">
        <span class="label">Subtotal</span>
        <span class="amount">${formatPrice(order.subtotal_cents)}</span>
      </div>
      ${
        order.discount_cents > 0
          ? `
      <div class="totals-row discount">
        <span class="label">Discount${order.coupon_code ? ` (${order.coupon_code})` : ''}</span>
        <span class="amount">-${formatPrice(order.discount_cents)}</span>
      </div>
      `
          : ''
      }
      <div class="totals-row">
        <span class="label">Shipping</span>
        <span class="amount">${order.shipping_cents === 0 ? 'FREE' : formatPrice(order.shipping_cents)}</span>
      </div>
      <div class="totals-row">
        <span class="label">Tax</span>
        <span class="amount">${formatPrice(order.tax_cents)}</span>
      </div>
      <div class="totals-row grand-total">
        <span class="label">Total</span>
        <span class="amount">${formatPrice(order.total_cents)}</span>
      </div>
    </div>

    <div class="footer">
      <p>Thank you for your business!</p>
      <p style="margin-top: 8px;">3TEK Design | ${process.env.NEXT_PUBLIC_APP_URL || 'https://3tekdesign.com'}</p>
    </div>

    <div class="no-print" style="text-align: center; margin-top: 40px;">
      <button onclick="window.print()" style="
        background-color: #0a0a0a;
        color: #ffffff;
        border: none;
        padding: 12px 24px;
        font-size: 14px;
        cursor: pointer;
        font-weight: 600;
      ">
        Print Invoice
      </button>
    </div>
  </div>
</body>
</html>
`
}
