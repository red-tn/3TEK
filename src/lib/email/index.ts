import sgMail from '@sendgrid/mail'

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@3tekdesign.com'
const FROM_NAME = process.env.SENDGRID_FROM_NAME || '3TEK Design'

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SendGrid API key not configured, skipping email')
    return false
  }

  try {
    await sgMail.send({
      to: options.to,
      from: {
        email: FROM_EMAIL,
        name: FROM_NAME,
      },
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
    })
    return true
  } catch (error) {
    console.error('SendGrid email error:', error)
    return false
  }
}

export { sendOrderConfirmationEmail } from './templates/order-confirmation'
export { sendShippingNotificationEmail } from './templates/shipping-notification'
export { sendRefundNotificationEmail } from './templates/refund-notification'
