import test from 'node:test';
import assert from 'node:assert/strict';
import { financeSummary, sixMonths, monthRange } from '../lib/finance.ts';
const movement = (id, kind, amount, extra = {}) => ({ id, kind, amount, createdAt: '2026-09-29T10:00:00', ...extra });
test('separates receipts, supplies and signed reversals; partial payments count one appointment', () => {
  const result = financeSummary([movement('1','SUPPLY',100), movement('2','PAYMENT','30.10',{appointmentId:'a'}), movement('3','PAYMENT','20.20',{appointmentId:'a'}), movement('4','PRODUCT_SALE',10), movement('5','WITHDRAWAL',-15), movement('6','REVERSAL','-30.10'), movement('7','REVERSAL',5), movement('8','PAYMENT',999,{createdAt:'2026-08-31T23:59:59'})], '2026-09');
  assert.equal(result.receipts,60.3); assert.equal(result.incoming,165.3); assert.equal(result.outgoing,45.1); assert.equal(result.balance,120.2); assert.equal(result.ticket,50.3);
});
test('handles empty month, year boundaries and leap days', () => {
  assert.equal(financeSummary([],'2026-09').ticket,0);
  assert.deepEqual(sixMonths('2026-02'),['2025-09','2025-10','2025-11','2025-12','2026-01','2026-02']);
  assert.equal(monthRange('2024-02').to,'2024-02-29');
});
