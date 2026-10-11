export type BkashGrantTokenResponse = {
  id_token: string
  token_type: string
  expires_in: number
  refresh_token?: string
  statusCode?: string
  statusMessage?: string
  message?: string
}

export type BkashPayment = {
  paymentID: string
  bkashURL: string

  callbackURL?: string
  successCallbackURL?: string
  failureCallbackURL?: string
  cancelledCallbackURL?: string

  amount: string
  intent: string
  currency: string

  paymentCreateTime?: string
  transactionStatus?: string

  merchantInvoiceNumber: string

  statusCode?: string
  statusMessage?: string
  errorMessage?: string
}

export type BkashCreatePaymentResponse = {
  success: boolean
  payment?: BkashPayment
  paymentID?: string
  bkashURL?: string
  statusCode?: string
  statusMessage?: string
  errorMessage?: string
}

export type BkashExecutePaymentResponse = {
  success: boolean
  paymentID?: string
  trxID?: string
  transactionStatus?: string
  payment?: {
    paymentID: string
    trxID: string
    transactionStatus?: string
    amount?: string
    currency?: string
    intent?: string
    merchantInvoiceNumber?: string
    paymentExecuteTime?: string
    statusCode?: string
    statusMessage?: string
    errorMessage?: string
  }
  statusCode?: string
  statusMessage?: string
  errorMessage?: string
}