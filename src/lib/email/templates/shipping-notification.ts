import { sendEmail } from '../index'
import { baseEmailTemplate, formatPrice } from './base'

interface OrderItem {
  product_name: string
  product_image?: string | null
  quantity: number
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

interface ShippingData {
  order_number: string
  email: string
  shipping_carrier?: string | null
  tracking_number?: string | null
  tracking_url?: string | null
  estimated_delivery?: string | null
  shipping_address: ShippingAddress
  order_items: OrderItem[]
}

export async function sendShippingNotificationEmail(order: ShippingData): Promise<boolean> {
  const address = order.shipping_address

  const itemsHtml = order.order_items.map((item) => `
    <table width="100%" cellpadding="0" cellspacing="0" style="padding: 12px 0;">
      <tr>
        <td width="80" style="padding-right: 16px;">
          ${item.product_image
            ? `<img src="${item.product_image}" alt="${item.product_name}" width="48" height="48" style="background-color: #f5f5f5; object-fit: cover;">`
            : `<div style="width: 48px; height: 48px; background-color: #f5f5f5;"></div>`
          }
        </td>
        <td>
          <p style="margin: 0; font-weight: 600; color: #0a0a0a;">${item.product_name}</p>
          <p style="margin: 4px 0 0 0; color: #666666; font-size: 14px;">Qty: ${item.quantity}</p>
        </td>
      </tr>
    </table>
  `).join('')

  const content = `
    <h2>Your order is on its way!</h2>
    <p>Hi ${address.fullName || 'there'},</p>
    <p>Great news! Your order <strong>#${order.order_number}</strong> has shipped and is on its way to you.</p>

    ${order.tracking_number ? `
    <div class="tracking-info">
      <h3>Tracking Information</h3>
      ${order.shipping_carrier ? `<p style="margin: 0 0 8px 0; color: #888888;">${order.shipping_carrier}</p>` : ''}
      <p class="tracking-number">${order.tracking_number}</p>
      ${order.tracking_url ? `
      <p style="margin-top: 16px;">
        <a href="${order.tracking_url}" class="button" style="background-color: #d4ff00; color: #0a0a0a;">Track Your Package</a>
      </p>
      ` : ''}
    </div>
    ` : ''}

    ${order.estimated_delivery ? `
    <p style="text-align: center; color: #666666;">
      <strong>Estimated Delivery:</strong> ${new Date(order.estimated_delivery).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}
    </p>
    ` : ''}

    <div class="address-box">
      <h3>Shipping To</h3>
      <p style="margin: 0;">
        ${address.fullName || ''}<br>
        ${address.addressLine1 || ''}<br>
        ${address.addressLine2 ? `${address.addressLine2}<br>` : ''}
        ${address.city || ''}, ${address.state || ''} ${address.postalCode || ''}<br>
        ${address.country || ''}
      </p>
    </div>

    <div style="margin-top: 24px;">
      <h3 style="color: #666666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px;">Items Shipped</h3>
      ${itemsHtml}
    </div>

    <p style="text-align: center; margin-top: 32px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/account/orders" class="button">View Order Details</a>
    </p>

    <p style="color: #666666; font-size: 14px;">
      If you have any questions about your shipment, please contact us at
      <a href="mailto:support@3tekdesign.com" style="color: #0a0a0a;">support@3tekdesign.com</a>.
    </p>
  `

  return sendEmail({
    to: order.email,
    subject: `Your Order Has Shipped - #${order.order_number}`,
    html: baseEmailTemplate(content),
  })
}
