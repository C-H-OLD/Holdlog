import test from 'node:test';
import assert from 'node:assert/strict';
import { loadRegistry } from '../../../scripts/contracts/schema-registry.mjs';
import { renderValidators } from '../../../scripts/contracts/generate.mjs';

const registry = loadRegistry();

test('notification inbox operations bind the authenticated recipient without account or crew filters', () => {
  for (const name of ['myNotifications', 'markNotificationRead', 'readAllNotifications']) {
    assert.ok(registry.operations[name], `missing ${name}`);
    const operation = registry.operations[name];
    assert.equal(operation.parameters.some(p => ['accountId', 'crewId'].includes(p.name)), false);
  }
});
test('notification inputs reject recipient spoofing and read timestamp injection', async () => {
  assert.ok(registry.api.components.schemas.NotificationReadInput);
  const { code, index } = await renderValidators(registry);
  const validators = await import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));
  const check = validators[index.http.NotificationReadInput];
  assert.equal(check({}), true);
  for (const input of [{ accountId: '00000000-0000-4000-8000-000000000001' }, { crewId: '00000000-0000-4000-8000-000000000001' }, { readAt: '2026-10-07T01:00:00Z' }, { readThrough: 'client-cutoff' }]) {
    assert.equal(check(input), false);
  }
});

test('all app consumers validate the same notification fixtures and reject forged results', async () => {
  const { existsSync } = await import('node:fs');
  const { getFixtures } = await import('../generated/fixtures.mjs');
  const fixtures = getFixtures().http;
  const page = fixtures.find(x => x.id === 'notification-inbox-all-crews')?.value;
  const single = fixtures.find(x => x.id === 'notification-single-read-result')?.value;
  const all = fixtures.find(x => x.id === 'notification-all-read-result')?.value;
  assert.ok(page && single && all, 'new fixtures missing');
  for (const app of ['mobile', 'admin', 'server']) {
    const path = new URL(`../../../apps/${app}/checks/notifications.ts`, import.meta.url);
    assert.ok(existsSync(path), `${app} consumer missing`);
    const { checkNotificationContracts } = await import(path.href);
    assert.equal(checkNotificationContracts(page, single, all), true, app);
    assert.equal(checkNotificationContracts(page, { ...single, readAt: 'invalid' }, all), false, app);
    assert.equal(checkNotificationContracts({ ...page, accountId: 'spoofed' }, single, all), false, app);
  }
});

test('notification fixtures preserve reverse chronological order and single crew ownership per schedule', async () => {
  const { getFixtures } = await import('../generated/fixtures.mjs');
  const owners = new Map();
  for (const fixture of getFixtures().http.filter(x => x.schema === 'NotificationPage')) {
    const rows = fixture.value.items;
    const sorted = [...rows].sort((a, b) => b.receivedAt.localeCompare(a.receivedAt) || b.id.localeCompare(a.id));
    assert.deepEqual(rows, sorted, fixture.id);
    for (const row of rows) {
      if (owners.has(row.scheduleId)) assert.equal(owners.get(row.scheduleId), row.crewId, fixture.id);
      owners.set(row.scheduleId, row.crewId);
    }
  }
});
