import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { ESLint } from 'eslint';
import { withProbe } from './probe-files.mjs';
const eslint = new ESLint();
for (const [path, code] of [
  ['apps/server/probe.mjs', 'export const mode = process.env.NODE_ENV;'],
  ['apps/admin/src/probe.jsx', 'export const title = window.document.title;'],
  ['apps/mobile/src/probe.js', 'export const later = () => setTimeout(() => {}, 1);'],
]) {
  test(`environment configuration: ${path}`, async () => {
    const [result] = await eslint.lintText(code, { filePath: path });
    assert.deepEqual(result.messages, []);
  });
}
test('React Hooks conditional calls are rejected in web and mobile', async () => {
  for (const app of ['admin', 'mobile']) {
    const [result] = await eslint.lintText('import { useState } from "react"; export function View({ ready }) { if (ready) useState(0); return null; }', { filePath: `apps/${app}/src/probe.jsx` });
    assert.ok(result.messages.some(m => m.ruleId === 'react-hooks/rules-of-hooks'));
  }
});
test('browser JavaScript cannot access Node process global', async () => {
  const [result] = await eslint.lintText('export const secret = process.env.SECRET;', { filePath: 'apps/admin/src/probe.js' });
  assert.ok(result.messages.some(m => m.ruleId === 'no-undef'));
});
test('runner propagates failures and rejects missing npm scripts', () => {
  const root = mkdtempSync(join(tmpdir(), 'holdlog-tooling-'));
  try {
    writeFileSync(join(root, 'package.json'), JSON.stringify({ scripts: { lint: 'node -e "process.exit(17)"' } }));
    for (const script of ['lint', 'missing']) {
      const r = spawnSync(process.execPath, ['scripts/check-tooling.mjs', '--root', root, '--script', script], { encoding: 'utf8' });
      assert.equal(r.status, script == 'lint' ? 17 : 1);
      assert.match(r.stdout + r.stderr, new RegExp(script));
    }
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('browser typecheck rejects server globals', async () => {
  await withProbe('apps/admin/checks', 'type-probe.ts', 'export const secret = process.env.SECRET;\n', () => {
    const result = spawnSync(process.execPath, ['node_modules/typescript/bin/tsc', '-p', 'apps/admin/tsconfig.json'], { encoding: 'utf8' });
    assert.equal(result.status, 2);
    assert.match(result.stdout, /process/);
  });
});

test('type-aware lint rejects unhandled promises', async () => {
  await withProbe('apps/server/checks', 'async-probe.ts', 'export const start = (): void => { Promise.resolve(1); };\n', async path => {
    const [result] = await new ESLint().lintFiles(path);
    assert.ok(result.messages.some(m => m.ruleId === '@typescript-eslint/no-floating-promises'));
  });
});

test('Expo root JSX and contracts Node tests use their own environments', async () => {
  for (const [filePath, code] of [
    ['apps/mobile/App.jsx', 'export const later = () => setTimeout(() => {}, 1);'],
    ['packages/contracts/test/probe.mjs', 'export const root = process.cwd();'],
  ]) {
    const [result] = await eslint.lintText(code, { filePath });
    assert.deepEqual(result.messages, []);
  }
});

test('Vite Node configuration typecheck is separate from the browser', () => {
  const result = spawnSync(process.execPath, ['node_modules/typescript/bin/tsc', '-p', 'apps/admin/tsconfig.node.json'], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stdout + result.stderr);
});

test('probe cleanup preserves existing files on success and failure', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'holdlog-owned-probe-'));
  const existing = join(directory, 'type-probe.ts');
  try {
    writeFileSync(existing, 'preserve me');
    await withProbe(directory, 'type-probe.ts', 'temporary', path => assert.notEqual(path, existing));
    await assert.rejects(withProbe(directory, 'type-probe.ts', 'temporary', () => { throw new Error('probe failed'); }), /probe failed/);
    assert.equal(readFileSync(existing, 'utf8'), 'preserve me');
  } finally { rmSync(directory, { recursive: true, force: true }); }
});

test('Vite Node configuration passes type-aware lint', async () => {
  const [result] = await new ESLint().lintFiles('apps/admin/node-checks/environment.ts');
  assert.deepEqual(result.messages, []);
});

test('lockfile matches manifests and rejects version drift', async () => {
  const { checkLockfile } = await import('../check-lockfile.mjs');
  assert.equal(checkLockfile(), 5);
  const root = mkdtempSync(join(tmpdir(), 'holdlog-lock-'));
  try {
    const { mkdirSync } = await import('node:fs');
    mkdirSync(join(root, 'apps'));
    mkdirSync(join(root, 'packages'));
    const manifest = { version: '0.0.0', workspaces: ['apps/*', 'packages/*'], devDependencies: { typescript: '5.9.3' } };
    writeFileSync(join(root, 'package.json'), JSON.stringify(manifest));
    writeFileSync(join(root, 'package-lock.json'), JSON.stringify({ lockfileVersion: 3, packages: { '': manifest } }));
    assert.equal(checkLockfile(root), 1);
    manifest.devDependencies.typescript = '5.9.2';
    writeFileSync(join(root, 'package.json'), JSON.stringify(manifest));
    assert.throws(() => checkLockfile(root), /devDependencies differs/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
