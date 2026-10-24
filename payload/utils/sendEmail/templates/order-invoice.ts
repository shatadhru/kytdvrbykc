import { renderBaseTemplate } from './base'

export interface InvoiceItem {
  title: string
  quantity: number
  price: number
}

export interface OrderInvoiceTemplateProps {
  orderId: string
  customerName?: string | null
  customerEmail: string
  date: string
  paymentMethod: string
  trxId?: string | null
  amount: number
  currency?: string
  items: InvoiceItem[]
  dashboardUrl: string
}

export function getOrderInvoiceEmailTemplate({
  orderId,
  customerName,
  customerEmail,
  date,
  paymentMethod,
  trxId,
  amount,
  currency = 'BDT',
  items,
  dashboardUrl,
}: OrderInvoiceTemplateProps) {
  const shortOrderId = orderId.slice(-6).toUpperCase()
  const greeting = customerName ? `Hello, ${customerName}!` : 'Hello!'

  const itemsRows =
    items.length > 0
      ? items
          .map(
            (item) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #1e293b; font-weight: 500;">
        ${item.title}
        ${item.quantity > 1 ? `<span style="color: #64748b; font-size: 12px;"> × ${item.quantity}</span>` : ''}
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #0f172a; text-align: right; font-weight: 600;">
        ৳${(item.price * item.quantity).toLocaleString()}
      </td>
    </tr>
  `,
          )
          .join('')
      : `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #1e293b; font-weight: 500;">
        Course Enrollment
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #0f172a; text-align: right; font-weight: 600;">
        ৳${amount.toLocaleString()}
      </td>
    </tr>
  `

  const content = `
    <h2 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700; color: #0f172a;">Payment Received — Course Invoice</h2>
    <p style="margin: 0 0 20px 0; font-size: 14px; color: #64748b;">${greeting} Thank you for your purchase. Your payment was successful and your course enrollment is now active.</p>

    <!-- Invoice Summary Box -->
    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 4px 0; font-size: 13px; color: #64748b;">Invoice ID:</td>
          <td style="padding: 4px 0; font-size: 13px; font-weight: 600; color: #0f172a; text-align: right;">#${shortOrderId}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-size: 13px; color: #64748b;">Date:</td>
          <td style="padding: 4px 0; font-size: 13px; color: #0f172a; text-align: right;">${date}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-size: 13px; color: #64748b;">Payment Method:</td>
          <td style="padding: 4px 0; font-size: 13px; color: #0f172a; text-align: right; text-transform: uppercase; font-weight: 600;">${paymentMethod}</td>
        </tr>
        ${
          trxId
            ? `
        <tr>
          <td style="padding: 4px 0; font-size: 13px; color: #64748b;">Transaction ID:</td>
          <td style="padding: 4px 0; font-size: 13px; font-family: monospace; color: #0f172a; text-align: right;">${trxId}</td>
        </tr>
        `
            : ''
        }
        <tr>
          <td style="padding: 4px 0; font-size: 13px; color: #64748b;">Payment Status:</td>
          <td style="padding: 4px 0; font-size: 13px; font-weight: 700; color: #10b981; text-align: right;">PAID (পরিশোধিত)</td>
        </tr>
      </table>
    </div>

    <!-- Purchased Items Table -->
    <h3 style="margin: 24px 0 12px 0; font-size: 14px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">Order Details</h3>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <thead>
        <tr>
          <th style="padding: 8px 0; border-bottom: 2px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: left; text-transform: uppercase;">Course</th>
          <th style="padding: 8px 0; border-bottom: 2px solid #e2e8f0; font-size: 12px; color: #64748b; text-align: right; text-transform: uppercase;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
      <tfoot>
        <tr>
          <td style="padding: 16px 0; font-size: 15px; font-weight: 700; color: #0f172a;">Total Paid:</td>
          <td style="padding: 16px 0; font-size: 17px; font-weight: 800; color: #0f172a; text-align: right;">৳${amount.toLocaleString()} ${currency}</td>
        </tr>
      </tfoot>
    </table>

    <!-- Call to Action -->
    <div style="text-align: center; margin: 32px 0 16px 0;">
      <a href="${dashboardUrl}" class="btn" target="_blank" rel="noopener noreferrer">Go to My Courses & Dashboard</a>
    </div>

    <p style="margin: 20px 0 0 0; font-size: 13px; color: #64748b; text-align: center;">
      Need help? You can view your invoice anytime from your student profile.
    </p>
  `

  const html = renderBaseTemplate({
    title: `Invoice #${shortOrderId} - Payment Received`,
    previewText: `Your payment of ৳${amount} for order #${shortOrderId} has been received.`,
    content,
  })

  const text = `${greeting}
Thank you for your purchase! Your payment has been received and your course enrollment is active.

INVOICE SUMMARY:
Invoice ID: #${shortOrderId}
Date: ${date}
Payment Method: ${paymentMethod}
${trxId ? `Transaction ID: ${trxId}\n` : ''}Payment Status: PAID
Total Paid: ৳${amount} ${currency}

Start learning now: ${dashboardUrl}
`

  return {
    subject: `Invoice #${shortOrderId} - Course Purchase Confirmation | NextLoad`,
    html,
    text,
  }
}

