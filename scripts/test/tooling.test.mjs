import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { ESLint } from 'eslint';
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

test('browser typecheck rejects server globals and restores cleanly', () => {
  const path = 'apps/admin/checks/type-probe.ts';
  try {
    writeFileSync(path, 'export const secret = process.env.SECRET;\n', { flag: 'wx' });
    const result = spawnSync(process.execPath, ['node_modules/typescript/bin/tsc', '-p', 'apps/admin/tsconfig.json'], { encoding: 'utf8' });
    assert.equal(result.status, 2);
    assert.match(result.stdout, /process/);
  } finally { rmSync(path, { force: true }); }
});

test('type-aware lint rejects unhandled promises', async () => {
  const path = 'apps/server/checks/async-probe.ts';
  try {
    writeFileSync(path, 'export const start = (): void => { Promise.resolve(1); };\n', { flag: 'wx' });
    const [result] = await new ESLint().lintFiles(path);
    assert.ok(result.messages.some(m => m.ruleId === '@typescript-eslint/no-floating-promises'));
  } finally { rmSync(path, { force: true }); }
});
