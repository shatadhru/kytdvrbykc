import type { PaymentAdapter } from '@payloadcms/plugin-ecommerce/types'

import { bkashGroup } from './bkashPaymentGroup'
import {
  createBkashPayment,
  executeBkashPayment,
} from './client'

export const bkashAdapter = (): PaymentAdapter => ({
  name: 'bkash',
  label: 'bKash',

  initiatePayment: async ({
    data: {
      cart,
      currency,
      customerEmail,
      billingAddress,
      shippingAddress,
    },
    req,
    transactionsSlug,
  }) => {
    const { subtotal } = cart

    if (!subtotal || subtotal <= 0) {
      throw new Error('Cannot initiate bKash payment for a free order')
    }

    const invoiceNumber = `UTM-${Date.now()}`

    const response = await createBkashPayment({
      amount: subtotal.toString(),
      invoiceNumber,
      payerReference: customerEmail,
    })

    if (!response.success || !response.payment) {
      throw new Error(
        response.payment?.statusMessage ||
          'Failed to create bKash payment',
      )
    }

    const payment = response.payment

    if (!payment.paymentID || !payment.bkashURL) {
      throw new Error('Invalid bKash payment response')
    }

    return {
      message: payment.statusMessage || 'bKash payment created successfully',
      paymentID: payment.paymentID,
      bkashUrl: payment.bkashURL,
    }
  },

  confirmOrder: async ({
    data,
    req,
    ordersSlug,
    transactionsSlug,
  }) => {
    const paymentID = data.paymentID

    if (!paymentID || typeof paymentID !== 'string') {
      throw new Error('Payment ID is required')
    }

    /**
     * Execute bKash payment
     */
    const response = await executeBkashPayment(paymentID)

    /**
     * Make sure bKash API request was successful
     */
    if (!response.success || !response.payment) {
      throw new Error(
        response.payment?.statusMessage ||
          'Failed to execute bKash payment',
      )
    }

    const payment = response.payment

    /**
     * Verify payment status
     */
    if (payment.transactionStatus !== 'Completed') {
      throw new Error(
        `bKash payment was not completed. Status: ${payment.transactionStatus}`,
      )
    }

    /**
     * Verify payment ID
     */
    if (payment.paymentID !== paymentID) {
      throw new Error('bKash payment ID mismatch')
    }

    /**
     * Verify bKash status code
     */
    if (payment.statusCode !== '0000') {
      throw new Error(
        payment.statusMessage || 'bKash payment failed',
      )
    }

    /**
     * TODO:
     * Create Payload order
     */
    const orderID = 'order_123'

    /**
     * TODO:
     * Update Payload transaction
     */
    const transactionID = 'txn_123'

    return {
      message: 'Order confirmed successfully',
      orderID,
      transactionID,
    }
  },

  group: bkashGroup,

  endpoints: [],
})