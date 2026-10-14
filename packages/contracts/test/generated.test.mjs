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
    for (const mutation of ['missing', 'extra', 'modified', 'source', 'tool-declaration', 'tool-metadata']) {
      if (mutation === 'missing') rmSync(resolve(generated, 'http.d.ts'));
      if (mutation === 'extra') writeFileSync(resolve(generated, 'extra.txt'), 'unexpected');
      if (mutation === 'modified') writeFileSync(resolve(generated, 'http.d.ts'), 'changed');
      const source = resolve(root, mutation === 'tool-declaration' ? 'package.json' : 'packages/contracts/openapi.json');
      const before = readFileSync(source, 'utf8');
      if (mutation === 'source') { const api = JSON.parse(before); api.info.title += ' changed'; writeFileSync(source, JSON.stringify(api)); }
      if (mutation === 'tool-declaration') { const manifest = JSON.parse(before); manifest.devDependencies.ajv = '0.0.0'; writeFileSync(source, JSON.stringify(manifest)); }
      if (mutation === 'tool-metadata') {
        const manifestPath = resolve(generated, 'manifest.json');
        const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
        manifest.tools.ajv += '-changed';
        writeFileSync(manifestPath, JSON.stringify(manifest));
        assert.equal(readFileSync(source, 'utf8'), before);
        await assert.rejects(checkGenerated(root), /Generated manifest tools differs/);
      } else await assert.rejects(checkGenerated(root), /Generated|generated|manifest|input|tool/i);
      if (mutation === 'missing') assert.equal(readdirSync(generated).includes('http.d.ts'), false);
      if (mutation === 'modified') assert.equal(readFileSync(resolve(generated, 'http.d.ts'), 'utf8'), 'changed');
      writeFileSync(source, before);
      rmSync(generated, { recursive: true }); mkdirSync(generated);
      for (const [name, text] of Object.entries(snapshot)) writeFileSync(resolve(generated, name), text);
    }
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('operation checks bind generated validators without a namespace import and preserve operation metadata',async()=>{
  const output=mkdtempSync(resolve(tmpdir(),'holdlog-operation-checks-'));
  try {
    await generate(process.cwd(),output);
    const checks=await import('file://'+resolve(output,'admin-auth-checks.mjs'));
    const validators=await import('file://'+resolve(output,'admin-auth-validators.mjs'));
    const {index}=await import('file://'+resolve(output,'index.mjs'));
    const login=checks.adminLoginChecks;
    assert.equal(login.path,index.operations.adminLogin.path);assert.equal(login.method,'post');
    assert.equal(login.parameters[0].validator,validators[index.operations.adminLogin.parameters[0].validator]);
    assert.equal(login.body['application/json'].validator({loginId:'fixture',password:'fixture'}),true);
    assert.equal(login.body['application/json'].validator({loginId:'fixture',password:'fixture',unknown:true}),false);
    assert.equal(checks.adminSessionChecks.responses['200']['application/json'].validator,validators[index.http.AdminSession]);
    assert.equal(readFileSync(resolve(output,'admin-auth-checks.mjs'),'utf8').includes('import *'),false);
    assert.match(readFileSync(resolve(output,'admin-auth-checks.d.mts'),'utf8'),/adminLoginChecks/);
  } finally {rmSync(output,{recursive:true});}
});
