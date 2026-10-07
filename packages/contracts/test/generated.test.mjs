import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, cpSync, mkdirSync, readFileSync, writeFileSync, rmSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, dirname } from 'node:path';
import { generate, provenance } from '../../../scripts/contracts/generate.mjs';
import { checkGenerated } from '../../../scripts/contracts/check-generated.mjs';
test('deterministic generation; missing, extra, modified output and stale inputs fail without repair', async () => {
  const root = mkdtempSync(resolve(tmpdir(), 'holdlog-contract-check-'));
  try {
    for (const name of Object.keys(provenance(process.cwd()).inputs)) {
      const target = resolve(root, name); mkdirSync(dirname(target), { recursive: true }); cpSync(name, target);
    }
    const generated = resolve(root, 'packages/contracts/generated');
    await generate(root);
    const snapshot = Object.fromEntries(readdirSync(generated).map(name => [name, readFileSync(resolve(generated, name), 'utf8')]));
    await generate(root);
    assert.deepEqual(Object.fromEntries(readdirSync(generated).map(name => [name, readFileSync(resolve(generated, name), 'utf8')])), snapshot);
    await checkGenerated(root);
    for (const mutation of ['missing', 'extra', 'modified', 'source', 'tool']) {
      if (mutation === 'missing') rmSync(resolve(generated, 'http.d.ts'));
      if (mutation === 'extra') writeFileSync(resolve(generated, 'extra.txt'), 'unexpected');
      if (mutation === 'modified') writeFileSync(resolve(generated, 'http.d.ts'), 'changed');
      const source = resolve(root, mutation === 'tool' ? 'package.json' : 'packages/contracts/openapi.json');
      const before = readFileSync(source, 'utf8');
      if (mutation === 'source') { const api = JSON.parse(before); api.info.title += ' changed'; writeFileSync(source, JSON.stringify(api)); }
      if (mutation === 'tool') { const manifest = JSON.parse(before); manifest.devDependencies.ajv = '0.0.0'; writeFileSync(source, JSON.stringify(manifest)); }
      await assert.rejects(checkGenerated(root), /Generated|generated|manifest|input|tool/i);
      if (mutation === 'missing') assert.equal(readdirSync(generated).includes('http.d.ts'), false);
      if (mutation === 'modified') assert.equal(readFileSync(resolve(generated, 'http.d.ts'), 'utf8'), 'changed');
      writeFileSync(source, before);
      rmSync(generated, { recursive: true }); mkdirSync(generated);
      for (const [name, text] of Object.entries(snapshot)) writeFileSync(resolve(generated, name), text);
    }
  } finally { rmSync(root, { recursive: true, force: true }); }
});
