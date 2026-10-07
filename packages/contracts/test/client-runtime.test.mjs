import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
test('actual client exports run in a browser/RN-like context without Node or eval', async () => {
  const context = vm.createContext({ Intl }, { codeGeneration: { strings: false, wasm: false } });
  const loaded = {};
  for (const name of ['validators', 'index', 'fixtures', 'http-input', 'empty']) {
    const module = new vm.SourceTextModule(readFileSync(`packages/contracts/generated/${name}.mjs`, 'utf8'), { context });
    await module.link(() => { throw new Error('Client dependency requires an external runtime module'); });
    await module.evaluate();
    loaded[name] = module.namespace;
  }
  const { index } = loaded.index;
  const parameter = index.operations.myCrews.parameters.find(item => item.name === 'pageSize');
  const parse = loaded['http-input'].parseParameter;
  assert.equal(loaded.validators[parameter.validator](parse(parameter, '20')), true);
  assert.equal(loaded.validators[parameter.validator](parse(parameter, '201')), false);
  assert.throws(() => parse(parameter, '20x'));
  assert.equal(loaded.fixtures.getFixtures().http.length, 13);
  const binary = index.operations.uploadPatch.body['application/offset+octet-stream'];
  assert.equal(binary.binary, true);
  // This flag is a boundary marker; format validation does not validate file bytes.
});
