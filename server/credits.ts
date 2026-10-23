import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'

export const PACK_PRICE_USD = 9
export const CREDITS_PER_PACK = 5

type Order = {
  email: string
  remaining: number
  tokenHash: string | null
  purchasedAt: string
}
type Ledger = { orders: Record<string, Order> }
export type KofiWebhook = {
  verification_token?: string
  message_id?: string
  type?: string
  currency?: string
  amount?: string
  email?: string
  kofi_transaction_id?: string
  shop_items?: Array<{ direct_link_code?: string; quantity?: number }>
}

const dataDir = resolve(process.env.DATA_DIR || '.data')
const file = join(dataDir, 'oracle-credits.json')
let ledger: Ledger | null = null

function load(): Ledger {
  if (ledger) return ledger
  mkdirSync(dataDir, { recursive: true, mode: 0o700 })
  ledger = existsSync(file)
    ? JSON.parse(readFileSync(file, 'utf8')) as Ledger
    : { orders: {} }
  return ledger
}

function save(): void {
  const tmp = file + '.' + process.pid + '.tmp'
  writeFileSync(tmp, JSON.stringify(load()), { encoding: 'utf8', mode: 0o600 })
  renameSync(tmp, file)
}

const hash = (s: string) => createHash('sha256').update(s).digest('hex')
function equalSecret(a: string, b: string): boolean {
  const aa = Buffer.from(a)
  const bb = Buffer.from(b)
  return aa.length === bb.length && timingSafeEqual(aa, bb)
}
const normalizeEmail = (s: string) => s.trim().toLowerCase()

// A verified Shop Order can be delivered more than once; transaction IDs are idempotent.
// IMPORTANT: run only on one Node instance with a persistent DATA_DIR volume.
export function recordKoFiOrder(data: KofiWebhook): 'recorded' | 'duplicate' | 'ignored' {
  const expectedToken = process.env.KOFI_WEBHOOK_TOKEN || ''
  if (!expectedToken || !data.verification_token ||
      !equalSecret(expectedToken, data.verification_token)) {
    throw new Error('Invalid webhook verification token')
  }
  const productCode = process.env.KOFI_PRODUCT_CODE || ''
  if (data.type !== 'Shop Order' || data.currency !== 'USD' || !productCode) return 'ignored'
  const qty = (data.shop_items || [])
    .filter(item => item.direct_link_code === productCode)
    .reduce((sum, item) => sum + (Number.isInteger(item.quantity) ? Math.max(0, Math.min(10, item.quantity!)) : 1), 0)
  if (qty < 1 || qty > 10 || Number(data.amount) < PACK_PRICE_USD * qty) return 'ignored'
  const transactionId = String(data.kofi_transaction_id || '').trim()
  const email = normalizeEmail(String(data.email || ''))
  if (!/^[\w-]{12,120}$/.test(transactionId) ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'ignored'
  const store = load()
  if (store.orders[transactionId]) return 'duplicate'
  store.orders[transactionId] = {
    email,
    remaining: qty * CREDITS_PER_PACK,
    tokenHash: null,
    purchasedAt: new Date().toISOString(),
  }
  save()
  return 'recorded'
}

export function claimOrder(transactionId: string, email: string): { token: string; remaining: number } | null {
  const order = load().orders[transactionId.trim()]
  if (!order || !equalSecret(order.email, normalizeEmail(email))) return null
  // Re-claiming from the receipt rotates the credential and invalidates an old browser.
  const token = randomBytes(32).toString('hex')
  order.tokenHash = hash(token)
  save()
  return { token, remaining: order.remaining }
}

function orderForToken(token: string): Order | null {
  if (!/^[a-f0-9]{64}$/.test(token)) return null
  const hashed = hash(token)
  for (const order of Object.values(load().orders)) {
    if (order.tokenHash && equalSecret(order.tokenHash, hashed)) return order
  }
  return null
}

export function creditBalance(token: string): number | null {
  const order = orderForToken(token)
  return order ? order.remaining : null
}

export function spendCredit(token: string): boolean {
  const order = orderForToken(token)
  if (!order || order.remaining < 1) return false
  order.remaining--
  save()
  return true
}

export function refundCredit(token: string): void {
  const order = orderForToken(token)
  if (!order) return
  order.remaining++
  save()
}
