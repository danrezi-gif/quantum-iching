import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const dir = mkdtempSync(join(tmpdir(), 'quantum-kofi-test-'))
process.env.DATA_DIR = dir
process.env.KOFI_WEBHOOK_TOKEN = 'local-test-token'
process.env.KOFI_PRODUCT_CODE = 'reading-pack-9'
const { recordKoFiOrder, claimOrder, creditBalance, spendCredit, refundCredit } =
  await import('./credits')
const tx = '8f2b6c11-77aa-4c33-9b21-abcabcabcabc'
const event = {
  verification_token: 'local-test-token',
  message_id: 'abc123-message',
  type: 'Shop Order',
  currency: 'USD',
  amount: '9.00',
  email: 'Buyer@Example.com',
  kofi_transaction_id: tx,
  shop_items: [{ direct_link_code: 'reading-pack-9', quantity: 1 }],
}
test('rejects forged Ko-fi event', () => {
  assert.throws(() => recordKoFiOrder({ ...event, verification_token: 'wrong' }))
})
test('credits only matching shop purchases, not donations', () => {
  assert.equal(recordKoFiOrder({ ...event, type: 'Donation' }), 'ignored')
  assert.equal(recordKoFiOrder({ ...event, shop_items: [{ direct_link_code: 'other-item', quantity: 1 }] }), 'ignored')
  assert.equal(recordKoFiOrder(event), 'recorded')
  assert.equal(recordKoFiOrder({ ...event, message_id: 'webhook-retry' }), 'duplicate')
})
test('valid receipt is required for activation and entitlement', () => {
  assert.equal(claimOrder(tx, 'wrong@example.com'), null)
  const claimed = claimOrder(tx, 'buyer@example.com')
  assert.ok(claimed)
  assert.equal(claimed.remaining, 5)
  assert.equal(creditBalance(claimed.token), 5)
  assert.equal(spendCredit(claimed.token), true)
  assert.equal(creditBalance(claimed.token), 4)
  refundCredit(claimed.token)
  assert.equal(creditBalance(claimed.token), 5)
  const rotated = claimOrder(tx, 'BUYER@EXAMPLE.COM')
  assert.ok(rotated && rotated.token !== claimed.token)
  assert.equal(creditBalance(claimed.token), null)
  assert.equal(creditBalance(rotated.token), 5)
})
test('remove isolated temporary order ledger', () => {
  rmSync(dir, { recursive: true, force: true })
})
