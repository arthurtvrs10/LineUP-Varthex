import assert from 'node:assert/strict';
import test from 'node:test';
import { canAccessPortal, portalForRole } from '../lib/portal-access.ts';

const roles = { ADMIN: '/admin', BARBER: '/barbeiro', CLIENT: '/clientes', SUPER_ADMIN: '/superadmin' };
for (const [role, portal] of Object.entries(roles)) {
  test(`${role} only accesses its own portal`, () => {
    assert.equal(portalForRole(role), `${portal}/dashboard`);
    assert.equal(canAccessPortal(role, portal), true);
    assert.equal(canAccessPortal(role, `${portal}/agenda/details`), true);
    assert.equal(canAccessPortal(role, `${portal}-other`), false);
    for (const other of Object.values(roles).filter(p => p !== portal)) {
      assert.equal(canAccessPortal(role, `${other}/dashboard`), false);
    }
  });
}
test('missing, unknown and inherited object properties are not roles', () => {
  for (const role of [undefined, null, '', 'admin', 'UNKNOWN', 'constructor', '__proto__', 1, {}]) {
    assert.equal(portalForRole(role), undefined);
    assert.equal(canAccessPortal(role, '/admin'), false);
  }
});
