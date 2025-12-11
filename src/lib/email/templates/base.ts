export const emailStyles = `
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.6;
    color: #1a1a1a;
    background-color: #f5f5f5;
    margin: 0;
    padding: 0;
  }
  .container {
    max-width: 600px;
    margin: 0 auto;
    background-color: #ffffff;
  }
  .header {
    background-color: #0a0a0a;
    padding: 32px 24px;
    text-align: center;
  }
  .header h1 {
    color: #d4ff00;
    font-size: 24px;
    margin: 0;
    font-weight: 700;
    letter-spacing: 2px;
  }
  .content {
    padding: 32px 24px;
  }
  .footer {
    background-color: #1a1a1a;
    padding: 24px;
    text-align: center;
    color: #888888;
    font-size: 12px;
  }
  .footer a {
    color: #d4ff00;
    text-decoration: none;
  }
  h2 {
    color: #0a0a0a;
    font-size: 20px;
    margin: 0 0 16px 0;
  }
  p {
    margin: 0 0 16px 0;
  }
  .order-number {
    font-family: monospace;
    font-size: 18px;
    color: #0a0a0a;
    font-weight: 600;
  }
  .item {
    display: flex;
    padding: 16px 0;
    border-bottom: 1px solid #e5e5e5;
  }
  .item:last-child {
    border-bottom: none;
  }
  .item-image {
    width: 64px;
    height: 64px;
    background-color: #f5f5f5;
    margin-right: 16px;
  }
  .item-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .item-details {
    flex: 1;
  }
  .item-name {
    font-weight: 600;
    color: #0a0a0a;
    margin-bottom: 4px;
  }
  .item-qty {
    color: #666666;
    font-size: 14px;
  }
  .item-price {
    font-family: monospace;
    color: #0a0a0a;
    font-weight: 600;
  }
  .totals {
    margin-top: 24px;
    padding-top: 16px;
    border-top: 2px solid #0a0a0a;
  }
  .total-row {
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
  }
  .total-row.grand-total {
    font-size: 18px;
    font-weight: 700;
    padding-top: 16px;
    border-top: 1px solid #e5e5e5;
    margin-top: 8px;
  }
  .total-row.grand-total .amount {
    color: #0a0a0a;
  }
  .total-label {
    color: #666666;
  }
  .amount {
    font-family: monospace;
  }
  .discount {
    color: #22c55e;
  }
  .button {
    display: inline-block;
    background-color: #d4ff00;
    color: #0a0a0a;
    padding: 14px 28px;
    text-decoration: none;
    font-weight: 600;
    margin: 16px 0;
  }
  .address-box {
    background-color: #f5f5f5;
    padding: 16px;
    margin: 16px 0;
  }
  .address-box h3 {
    margin: 0 0 8px 0;
    font-size: 14px;
    color: #666666;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .tracking-info {
    background-color: #0a0a0a;
    color: #ffffff;
    padding: 24px;
    margin: 24px 0;
    text-align: center;
  }
  .tracking-info h3 {
    color: #d4ff00;
    margin: 0 0 16px 0;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .tracking-number {
    font-family: monospace;
    font-size: 24px;
    color: #ffffff;
    margin: 0;
  }
`

export function baseEmailTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>3TEK Design</title>
  <style>${emailStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>3TEK DESIGN</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} 3TEK Design. All rights reserved.</p>
      <p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}">Shop</a> |
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/contact">Contact</a>
      </p>
    </div>
  </div>
</body>
</html>
`
}

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}
