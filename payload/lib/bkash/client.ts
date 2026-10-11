import 'server-only'

import type {
  BkashCreatePaymentResponse,
  BkashExecutePaymentResponse,
  BkashGrantTokenResponse,
} from './types'

function getConfig() {
  const baseURL = process.env.BKASH_BASE_URL
  const username = process.env.BKASH_USERNAME
  const password = process.env.BKASH_PASSWORD
  const appKey = process.env.BKASH_APP_KEY
  const appSecret = process.env.BKASH_APP_SECRET
  const callbackURL = process.env.BKASH_CALLBACK_URL
  const merchantAssociationInfo =
    process.env.BKASH_MERCHANT_ASSOCIATION_INFO

  if (!baseURL) throw new Error('[BKASH ISSUE} : BKASH_BASE_URL is missing')
  if (!username) throw new Error('[BKASH ISSUE} : BKASH_USERNAME is missing')
  if (!password) throw new Error('[BKASH ISSUE} : BKASH_PASSWORD is missing')
  if (!appKey) throw new Error('[BKASH ISSUE} : BKASH_APP_KEY is missing')
  if (!appSecret) throw new Error('[BKASH ISSUE} : BKASH_APP_SECRET is missing')
  if (!callbackURL) throw new Error('[BKASH ISSUE} : BKASH_CALLBACK_URL is missing')

  return {
    baseURL,
    username,
    password,
    appKey,
    appSecret,
    callbackURL,
    merchantAssociationInfo,
  }
}

async function parseBkashJson<T>(response: Response, actionName: string): Promise<T> {
  const text = await response.text()
  try {
    return JSON.parse(text) as T
  } catch {
    try {
      // bKash Sandbox/Production APIs frequently contain unescaped newlines/tabs in statusMessage
      const sanitized = text.replace(/[\r\n\t]/g, ' ')
      return JSON.parse(sanitized) as T
    } catch {
      throw new Error(`Invalid response from bKash ${actionName} (HTTP ${response.status}): ${text.slice(0, 150)}`)
    }
  }
}

export async function getBkashToken(): Promise<string> {
  const config = getConfig()

  const response = await fetch(
    `${config.baseURL}/tokenized/checkout/token/grant`,
    {
      method: 'POST',
      headers: {
        accept: 'application/json',
        username: config.username,
        password: config.password,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        app_key: config.appKey,
        app_secret: config.appSecret,
      }),
      cache: 'no-store',
    },
  )

  const result = await parseBkashJson<BkashGrantTokenResponse>(response, 'token grant')

  if (!response.ok || !result.id_token) {
    throw new Error(
      result.statusMessage ||
        'Unable to get bKash token',
    )
  }

  return result.id_token
}

export async function createBkashPayment({
  amount,
  invoiceNumber,
  payerReference,
}: {
  amount: string
  invoiceNumber: string
  payerReference: string
}): Promise<BkashCreatePaymentResponse> {
  const config = getConfig()
  const token = await getBkashToken()

  const response = await fetch(
    `${config.baseURL}/tokenized/checkout/create`,
    {
      method: 'POST',
      headers: {
        accept: 'application/json',
        authorization: token,
        'x-app-key': config.appKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        mode: '0011',
        payerReference,
        callbackURL: config.callbackURL,
        ...(config.merchantAssociationInfo && {
          merchantAssociationInfo: config.merchantAssociationInfo,
        }),
        amount,
        currency: 'BDT',
        intent: 'sale',
        merchantInvoiceNumber: invoiceNumber,
      }),
      cache: 'no-store',
    },
  )

  const result = await parseBkashJson<any>(response, 'create payment')

  if (!response.ok || result.statusCode !== '0000') {
    throw new Error(
      result.statusMessage ||
        result.errorMessage ||
        'Unable to create bKash payment',
    )
  }

  return {
    ...result,
    success: true,
    paymentID: result.paymentID,
    bkashURL: result.bkashURL,
    payment: {
      ...result,
      paymentID: result.paymentID,
      bkashURL: result.bkashURL,
    },
  }
}

export async function executeBkashPayment(
  paymentID: string,
): Promise<BkashExecutePaymentResponse> {
  const config = getConfig()
  const token = await getBkashToken()

  const response = await fetch(
    `${config.baseURL}/tokenized/checkout/execute`,
    {
      method: 'POST',
      headers: {
        accept: 'application/json',
        authorization: token,
        'x-app-key': config.appKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        paymentID,
      }),
      cache: 'no-store',
    },
  )

  const result = await parseBkashJson<any>(response, 'execute payment')

  if (!response.ok || result.statusCode !== '0000') {
    throw new Error(
      result.statusMessage ||
        result.errorMessage ||
        'Unable to execute bKash payment',
    )
  }

  return {
    ...result,
    success: true,
    paymentID: result.paymentID || paymentID,
    trxID: result.trxID,
    transactionStatus: result.transactionStatus,
    payment: {
      ...result,
      paymentID: result.paymentID || paymentID,
      trxID: result.trxID,
      transactionStatus: result.transactionStatus,
    },
  }
}