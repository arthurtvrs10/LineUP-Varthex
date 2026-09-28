import assert from 'node:assert/strict';
import test from 'node:test';
import { clientDestination, selectedShop, selectShop } from '../lib/client-barbershop.ts';

test('onboarding preserves linked shop, isolates accounts and falls back on invalid storage', () => {
  const values = new Map();
  globalThis.window = {};
  globalThis.sessionStorage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  try {
    assert.equal(clientDestination('a@example.test'), '/clientes/barbearias');
    const shop = { id: 'shop-a', name: 'Barbearia A', slug: 'barbearia-a' };
    selectShop('A@example.test', shop);
    assert.deepEqual(selectedShop('a@example.test'), shop);
    assert.equal(selectedShop('b@example.test'), undefined);
    assert.equal(clientDestination('a@example.test'), '/clientes/dashboard');
    assert.equal(clientDestination('a@example.test', 'barbearia-b'), '/clientes/barbearias?barbearia=barbearia-b');
    assert.equal(clientDestination('a@example.test', 'x&next=https://evil.test'), '/clientes/barbearias?barbearia=x%26next%3Dhttps%3A%2F%2Fevil.test');
    values.set('lineup:barbershop:a@example.test', '{broken');
    assert.equal(clientDestination('a@example.test'), '/clientes/barbearias');
  } finally {
    delete globalThis.window;
    delete globalThis.sessionStorage;
  }
});
