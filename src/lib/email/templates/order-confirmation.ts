import { sendEmail } from '../index'
import { baseEmailTemplate, formatPrice } from './base'

interface OrderItem {
  product_name: string
  product_image?: string | null
  quantity: number
  price_cents: number
}

interface ShippingAddress {
  fullName?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
}

interface OrderData {
  order_number: string
  email: string
  subtotal_cents: number
  discount_cents: number
  shipping_cents: number
  tax_cents: number
  total_cents: number
  coupon_code?: string | null
  shipping_address: ShippingAddress
  order_items: OrderItem[]
}

export async function sendOrderConfirmationEmail(order: OrderData): Promise<boolean> {
  const itemsHtml = order.order_items.map((item) => `
    <table width="100%" cellpadding="0" cellspacing="0" style="border-bottom: 1px solid #e5e5e5; padding: 16px 0;">
      <tr>
        <td width="80" style="padding-right: 16px;">
          ${item.product_image
            ? `<img src="${item.product_image}" alt="${item.product_name}" width="64" height="64" style="background-color: #f5f5f5; object-fit: cover;">`
            : `<div style="width: 64px; height: 64px; background-color: #f5f5f5;"></div>`
          }
        </td>
        <td>
          <p style="margin: 0 0 4px 0; font-weight: 600; color: #0a0a0a;">${item.product_name}</p>
          <p style="margin: 0; color: #666666; font-size: 14px;">Qty: ${item.quantity} × ${formatPrice(item.price_cents)}</p>
        </td>
        <td align="right" style="font-family: monospace; font-weight: 600;">
          ${formatPrice(item.price_cents * item.quantity)}
        </td>
      </tr>
    </table>
  `).join('')

  const address = order.shipping_address

  const content = `
    <h2>Thanks for your order!</h2>
    <p>Hi ${address.fullName || 'there'},</p>
    <p>We've received your order and are getting it ready. We'll send you an email when it ships.</p>

    <p style="margin-top: 24px;">
      <strong>Order Number:</strong>
      <span class="order-number">${order.order_number}</span>
    </p>

    <div style="margin-top: 32px;">
      <h3 style="color: #666666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px;">Order Items</h3>
      ${itemsHtml}
    </div>

    <div class="totals">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="color: #666666; padding: 8px 0;">Subtotal</td>
          <td align="right" style="font-family: monospace;">${formatPrice(order.subtotal_cents)}</td>
        </tr>
        ${order.discount_cents > 0 ? `
        <tr>
          <td style="color: #666666; padding: 8px 0;">Discount${order.coupon_code ? ` (${order.coupon_code})` : ''}</td>
          <td align="right" style="font-family: monospace; color: #22c55e;">-${formatPrice(order.discount_cents)}</td>
        </tr>
        ` : ''}
        <tr>
          <td style="color: #666666; padding: 8px 0;">Shipping</td>
          <td align="right" style="font-family: monospace;">${order.shipping_cents === 0 ? 'FREE' : formatPrice(order.shipping_cents)}</td>
        </tr>
        <tr>
          <td style="color: #666666; padding: 8px 0;">Tax</td>
          <td align="right" style="font-family: monospace;">${formatPrice(order.tax_cents)}</td>
        </tr>
        <tr style="border-top: 1px solid #e5e5e5;">
          <td style="padding: 16px 0 8px; font-weight: 700; font-size: 18px;">Total</td>
          <td align="right" style="font-family: monospace; font-weight: 700; font-size: 18px;">${formatPrice(order.total_cents)}</td>
        </tr>
      </table>
    </div>

    <div class="address-box">
      <h3>Shipping Address</h3>
      <p style="margin: 0;">
        ${address.fullName || ''}<br>
        ${address.addressLine1 || ''}<br>
        ${address.addressLine2 ? `${address.addressLine2}<br>` : ''}
        ${address.city || ''}, ${address.state || ''} ${address.postalCode || ''}<br>
        ${address.country || ''}
      </p>
    </div>

    <p style="text-align: center;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/account/orders" class="button">View Your Order</a>
    </p>

    <p style="color: #666666; font-size: 14px;">
      If you have any questions, please reply to this email or contact us at
      <a href="mailto:support@3tekdesign.com" style="color: #0a0a0a;">support@3tekdesign.com</a>.
    </p>
  `

  return sendEmail({
    to: order.email,
    subject: `Order Confirmed - #${order.order_number}`,
    html: baseEmailTemplate(content),
  })
}
