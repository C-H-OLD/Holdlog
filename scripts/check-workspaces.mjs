import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';

const targets = [
  { name: '@holdlog/admin', directory: 'apps/admin' },
  { name: '@holdlog/mobile', directory: 'apps/mobile' },
  { name: '@holdlog/server', directory: 'apps/server' },
  { name: '@holdlog/contracts', directory: 'packages/contracts' },
];
const rootTarget = { name: 'holdlog', directory: '' };

/** Describe a required npm script without interpreting shell text or environment values. */
function job(target, script) { return { ...target, script }; }

/** Select all required jobs; DB and native device execution stay explicit opt-in tasks. */
function jobsFor(task) {
  /** List every required workspace for a common command. */
  const workspaceJobs = script => targets.map(target => job(target, script));
  const unitJobs = [job(rootTarget, 'test:tooling'), job(rootTarget, 'test:runner'), ...targets.slice(0, 3).map(target => job(target, 'test'))];
  const lintJobs = [job(rootTarget, 'lint:tooling'), ...workspaceJobs('lint')];
  const buildJobs = [job(targets[0], 'build'), job(targets[2], 'build')];
  const choices = {
    check: [job(rootTarget, 'check:lockfile'), job(rootTarget, 'contracts:check'), ...lintJobs, ...workspaceJobs('typecheck'), ...unitJobs, ...buildJobs],
    lint: lintJobs,
    typecheck: workspaceJobs('typecheck'),
    test: [job(rootTarget, 'contracts:check'), ...unitJobs],
    'build:admin': [buildJobs[0]],
    'build:api': [buildJobs[1]],
    'test:foundation': [job(targets[2], 'test:foundation')],
    'dev:admin': [job(targets[0], 'dev')],
    'dev:mobile': [job(targets[1], 'dev')],
    'dev:api': [job(targets[2], 'dev:api')],
    'dev:worker': [job(targets[2], 'dev:worker')],
  };
  if (!Object.hasOwn(choices, task)) throw new Error('Unknown task; use a documented root npm command');
  return choices[task];
}

/** Fail before execution when any required target or script is missing or malformed. */
function preflight(root, jobs, task) {
  for (const { name, directory, script } of jobs) {
    let manifest;
    try { manifest = JSON.parse(readFileSync(join(root, directory, 'package.json'), 'utf8')); }
    catch { throw new Error(`${name}: manifest missing or invalid`); }
    if (manifest.name !== name) throw new Error(`${name}: manifest name mismatch`);
    if (typeof manifest.scripts?.[script] !== 'string' || !manifest.scripts[script].trim()) throw new Error(`${name}: ${script} required command missing`);
  }
  if (task === 'test:foundation' && !process.env.TEST_DATABASE_URL?.trim()) throw new Error('@holdlog/server: test:foundation requires TEST_DATABASE_URL');
}

/**
 * Run required workspace commands sequentially and propagate the first failure.
 * @param {string} root - Repository root containing the expected workspace manifests.
 * @param {string} task - Documented command group; defaults to check.
 * @returns {number} Zero only for successful execution of every selected command.
 * Throws on invalid task/configuration. Child commands inherit configuration and stdio;
 * the runner never prints environment values or raw spawn errors. DB checks require
 * explicit test configuration and are excluded from the default check.
 */
function runChecks(root, task = 'check') {
  const jobs = jobsFor(task);
  preflight(root, jobs, task);
  if (task === 'check' || task === 'test') {
    console.log('NOT RUN: test:foundation (explicit local test DB required).');
    console.log('NOT RUN: browser/API integration, native device builds and real-device checks (separate verification).');
  }
  for (const { name, directory, script } of jobs) {
    console.log(`RUN ${name}: ${script}`);
    // Do not use --if-present: a missing command is a failure, never a silent skip.
    const result = spawnSync('npm', ['run', script], { cwd: join(root, directory), stdio: 'inherit', shell: false });
    if (result.error || result.signal || result.status !== 0) {
      const code = result.status && result.status > 0 ? result.status : 1;
      const reason = result.error ? 'npm could not start' : result.signal ? 'command interrupted' : `exit ${code}`;
      console.error(`FAIL ${name}: ${script} (${reason})`);
      return code;
    }
    console.log(`PASS ${name}: ${script}`);
  }
  return 0;
}

try {
  const { values } = parseArgs({ options: { root: { type: 'string', default: process.cwd() }, task: { type: 'string', default: 'check' } } });
  process.exitCode = runChecks(values.root, values.task);
} catch (error) {
  // Parser errors can contain arbitrary input. Only our controlled failures are displayed.
  console.error(error?.code ? 'Invalid runner arguments' : error.message);
  process.exitCode = 1;
}
