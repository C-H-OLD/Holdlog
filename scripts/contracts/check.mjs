import { spawnSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
const tests = readdirSync('packages/contracts/test').filter(name => name.endsWith('.test.mjs')).sort().map(name => 'packages/contracts/test/' + name);
const commands = [
  ['npm', ['exec', '--no', '--', 'redocly', 'lint', 'packages/contracts/openapi.json']],
  [process.execPath, ['scripts/contracts/check-generated.mjs']],
  [process.execPath, ['--experimental-vm-modules', '--test', ...tests]],
  [process.execPath, ['scripts/contracts/check-examples.mjs']],
  ['npm', ['run', 'typecheck', '--workspace', '@holdlog/contracts']],
];
if (!tests.length) throw new Error('Missing contract tests');
for (const [command, args] of commands) {
  console.log(`Contracts: ${args.join(' ')}`);
  const result = spawnSync(command, args, { stdio: 'inherit', shell: false });
  if (result.error) console.error(result.error.message);
  if (result.status !== 0) process.exit(result.status ?? 1);
}
