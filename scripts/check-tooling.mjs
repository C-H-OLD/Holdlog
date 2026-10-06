import { spawnSync } from 'node:child_process';
import { parseArgs } from 'node:util';
const { values } = parseArgs({ options: { root: { type: 'string', default: process.cwd() }, script: { type: 'string' } } });
const scripts = values.script ? [values.script] : ['lint', 'typecheck', 'test:tooling'];
console.log('Tooling checks: configuration samples and any existing source. Application build/integration checks are separate.');
for (const script of scripts) {
  console.log(`Checking ${script}`);
  const result = spawnSync('npm', ['run', script], { cwd: values.root, stdio: 'inherit', shell: false });
  if (result.error) console.error(`${script}: ${result.error.message}`);
  if (result.status !== 0) process.exit(result.status ?? 1);
}
