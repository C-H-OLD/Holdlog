import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { checkExamples } from '../../../scripts/contracts/check-examples.mjs';
import { loadRegistry } from '../../../scripts/contracts/schema-registry.mjs';
import * as validators from '../generated/validators.mjs';
import { index } from '../generated/index.mjs';
import { getFixtures } from '../generated/fixtures.mjs';
const examples = JSON.parse(readFileSync('packages/contracts/examples.json', 'utf8'));
const registry = loadRegistry();
test('source examples pass and every mustReject fails', () => {
  const result = checkExamples(examples, registry, validators, index);
  assert.equal(result.accepted, 27);
  assert.equal(result.rejected, 6);
  assert.equal(result.bindings.length, 21);
});
test('missing schema/operation and unrelated bindings are rejected', () => {
  for (const change of [{ schema: 'Missing' }, { operationId: 'Missing' }, { operationId: 'listBrands' }]) {
    const copy = structuredClone(examples);
    Object.assign(copy.http[1], change);
    assert.throws(() => checkExamples(copy, registry, validators, index));
  }
});
test('fixtures preserve source and callers cannot mutate later reads', () => {
  assert.deepEqual(getFixtures(), examples);
  const fixture = getFixtures(); fixture.http[0].value.code = 'changed';
  assert.deepEqual(getFixtures(), examples);
});
