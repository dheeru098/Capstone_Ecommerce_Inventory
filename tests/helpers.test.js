const test = require('node:test');
const assert = require('node:assert/strict');
const { roundMoney, subtotal } = require('../src/utils/money');
const { canChangeStatus } = require('../src/utils/orderRules');

test('cart totals are calculated in the backend', () => {
  assert.equal(subtotal(299.5, 2), 599);
  assert.equal(roundMoney(24.799999999), 24.8);
});

test('a placed order can move to processing or cancelled', () => {
  assert.equal(canChangeStatus('placed', 'processing'), true);
  assert.equal(canChangeStatus('placed', 'cancelled'), true);
});

test('a delivered order cannot be cancelled or processed', () => {
  assert.equal(canChangeStatus('delivered', 'cancelled'), false);
  assert.equal(canChangeStatus('delivered', 'processing'), false);
});

test('shipping cannot happen before processing', () => {
  assert.equal(canChangeStatus('placed', 'shipped'), false);
  assert.equal(canChangeStatus('processing', 'shipped'), true);
});
