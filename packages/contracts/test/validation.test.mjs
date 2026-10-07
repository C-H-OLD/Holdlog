import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { createRegistry } from '../../../scripts/contracts/schema-registry.mjs';
import { renderValidators } from '../../../scripts/contracts/generate.mjs';

const formats = ['uuid', 'date', 'date-time', 'email', 'uri', 'iana-time-zone'];
const good = ['00000000-0000-4000-8000-000000000001', '2024-02-29', '2026-10-07T01:00:00Z', 'a@example.invalid', 'https://example.invalid', 'Asia/Seoul'];
const bad = ['bad', '2023-02-29', '2026-10-07T01:00:00', 'bad', '/relative', 'Made/Up'];
test('standalone formats run without Node globals or dynamic compilation', async () => {
  const schemas = Object.fromEntries(formats.map(format => [format.replaceAll('-', '_'), { type: 'string', format }]));
  const { code, index } = await renderValidators(createRegistry({ paths: {}, components: { schemas } }, { $defs: {} }));
  const context = vm.createContext({ Intl }, { codeGeneration: { strings: false, wasm: false } });
  const module = new vm.SourceTextModule(code, { context });
  await module.link(() => { throw new Error('Unexpected runtime import'); });
  await module.evaluate();
  for (let i = 0; i < formats.length; i++) {
    const validate = module.namespace[index.http[formats[i].replaceAll('-', '_')]];
    assert.equal(validate(good[i]), true, formats[i]);
    assert.equal(validate(bad[i]), false, formats[i]);
  }
});
test('strict validators preserve input and reject wrong values and unknown keywords', async () => {
  const registry = createRegistry({ paths: {}, components: { schemas: { Input: { type: 'object', properties: { n: { type: 'integer', minimum: 0, default: 2 } }, required: ['n'], additionalProperties: false } } } }, { $defs: {} });
  const { code, index } = await renderValidators(registry);
  const validators = await import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));
  for (const value of [{}, { n: '2' }, { n: -1 }, { n: 2, extra: true }]) {
    const before = structuredClone(value);
    assert.equal(validators[index.http.Input](value), false);
    assert.deepEqual(value, before);
  }
  assert.equal(validators[index.http.Input]({ n: 2 }), true);
});
