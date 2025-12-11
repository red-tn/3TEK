import { sendEmail } from '../index'
import { baseEmailTemplate, formatPrice } from './base'

interface RefundData {
  order_number: string
  email: string
  customer_name?: string
  refund_amount_cents: number
  total_cents: number
  is_full_refund: boolean
  reason?: string
}

export async function sendRefundNotificationEmail(data: RefundData): Promise<boolean> {
  const content = `
    <h2>Refund Processed</h2>
    <p>Hi ${data.customer_name || 'there'},</p>
    <p>
      We've processed a ${data.is_full_refund ? 'full' : 'partial'} refund for your order
      <strong>#${data.order_number}</strong>.
    </p>

    <div style="background-color: #f5f5f5; padding: 24px; margin: 24px 0; text-align: center;">
      <p style="color: #666666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">
        Refund Amount
      </p>
      <p style="font-family: monospace; font-size: 32px; font-weight: 700; color: #22c55e; margin: 0;">
        ${formatPrice(data.refund_amount_cents)}
      </p>
      ${!data.is_full_refund ? `
      <p style="color: #666666; font-size: 14px; margin-top: 8px;">
        out of ${formatPrice(data.total_cents)} total
      </p>
      ` : ''}
    </div>

    <p>
      The refund has been submitted to your original payment method. Depending on your bank or card issuer,
      it may take <strong>5-10 business days</strong> to appear on your statement.
    </p>

    ${data.reason ? `
    <p style="color: #666666;">
      <strong>Reason:</strong> ${data.reason}
    </p>
    ` : ''}

    <p style="text-align: center; margin-top: 32px;">
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/account/orders" class="button">View Order History</a>
    </p>

    <p style="color: #666666; font-size: 14px;">
      If you have any questions about this refund, please contact us at
      <a href="mailto:support@3tekdesign.com" style="color: #0a0a0a;">support@3tekdesign.com</a>.
    </p>
  `

  return sendEmail({
    to: data.email,
    subject: `Refund Processed - #${data.order_number}`,
    html: baseEmailTemplate(content),
  })
}
