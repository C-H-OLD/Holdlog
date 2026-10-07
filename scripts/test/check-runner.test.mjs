import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import test from 'node:test';

const runner = resolve('scripts/check-workspaces.mjs');
const names = ['admin', 'mobile', 'server', 'contracts'];

/** Create isolated synthetic manifests; clean them up even when a check fails. */
function withFixture(action) {
  const root = mkdtempSync(join(tmpdir(), 'holdlog-runner-'));
  const manifests = {};
  for (const name of ['root', ...names]) {
    const directory = name === 'root' ? '' : `${name === 'contracts' ? 'packages' : 'apps'}/${name}`;
    mkdirSync(join(root, directory), { recursive: true });
    const scripts = {};
    for (const script of ['check:lockfile', 'contracts:check', 'lint:tooling', 'lint', 'typecheck', 'test:tooling', 'test:runner', 'test', 'build', 'test:foundation', 'dev', 'dev:api', 'dev:worker']) {
      scripts[script] = `node -e "require('node:fs').appendFileSync('${root}/trace', '${name}:${script},')"`;
    }
    manifests[name] = { directory, value: { name: name === 'root' ? 'holdlog' : `@holdlog/${name}`, scripts } };
  }
  /** Persist modified fixture manifests before launching the real runner CLI. */
  const run = (task, env = {}) => {
    for (const { directory, value } of Object.values(manifests)) writeFileSync(join(root, directory, 'package.json'), JSON.stringify(value));
    return spawnSync(process.execPath, [runner, '--root', root, '--task', task], { encoding: 'utf8', env: { ...process.env, ...env } });
  };
  /** Read only the synthetic execution trace to verify work was not silently skipped. */
  const trace = () => existsSync(join(root, 'trace')) ? readFileSync(join(root, 'trace'), 'utf8') : '';
  try { action({ root, manifests, run, trace }); }
  finally { rmSync(root, { recursive: true, force: true }); }
}

test('default checks cover contracts, every workspace, unit tests and web/API builds without claiming DB/device execution', () => {
  withFixture(({ run, trace }) => {
    const result = run('check');
    assert.equal(result.status, 0, result.stdout + result.stderr);
    const executed = trace().split(',').filter(Boolean);
    for (const name of names) for (const task of ['lint', 'typecheck']) assert.ok(executed.includes(`${name}:${task}`));
    for (const item of ['root:check:lockfile', 'root:contracts:check', 'root:test:tooling', 'root:test:runner', 'admin:test', 'mobile:test', 'server:test', 'admin:build', 'server:build']) assert.ok(executed.includes(item));
    assert.ok(!executed.includes('server:test:foundation'));
    assert.match(result.stdout, /NOT RUN.*test:foundation/);
    assert.match(result.stdout, /NOT RUN.*device/i);
  });
});

test('a workspace failure retains its exit code, names the target and stops later checks', () => {
  withFixture(({ manifests, run, trace }) => {
    manifests.mobile.value.scripts.lint = 'node -e "process.exit(17)"';
    const result = run('lint');
    assert.equal(result.status, 17);
    assert.match(result.stderr, /@holdlog\/mobile.*lint.*17/);
    assert.doesNotMatch(trace(), /server:lint|contracts:lint/);
    assert.doesNotMatch(result.stdout, /PASS @holdlog\/mobile/);
  });
});

test('missing required workspace script fails preflight before any target executes', () => {
  withFixture(({ manifests, run, trace }) => {
    delete manifests.server.value.scripts.typecheck;
    const result = run('typecheck');
    assert.equal(result.status, 1);
    assert.match(result.stderr, /@holdlog\/server.*typecheck.*missing/i);
    assert.equal(trace(), '');
  });
});

test('missing manifest fails with the expected target rather than skipping it', () => {
  withFixture(({ manifests, run, trace }) => {
    manifests.mobile.value.name = '@holdlog/wrong';
    const result = run('lint');
    assert.equal(result.status, 1);
    assert.match(result.stderr, /@holdlog\/mobile.*manifest/i);
    assert.equal(trace(), '');
  });
});

test('foundation requires an explicit test DB and does not print unrelated secrets', () => {
  withFixture(({ run, trace }) => {
    const result = run('test:foundation', { TEST_DATABASE_URL: '', RUNNER_TEST_SECRET: 'synthetic-secret-marker' });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /TEST_DATABASE_URL/);
    assert.doesNotMatch(result.stdout + result.stderr, /synthetic-secret-marker/);
    assert.equal(trace(), '');
  });
});

test('foundation invokes the existing server test command with its configuration', () => {
  withFixture(({ run, trace }) => {
    const result = run('test:foundation', { TEST_DATABASE_URL: 'postgres://synthetic:marker@127.0.0.1:55433/holdlog_test' });
    assert.equal(result.status, 0, result.stdout + result.stderr);
    assert.equal(trace(), 'server:test:foundation,');
    assert.doesNotMatch(result.stdout + result.stderr, /postgres:\/\//);
  });
});

test('build and development tasks dispatch only their designated workspace command', () => {
  const cases = { 'build:admin': 'admin:build,', 'build:api': 'server:build,', 'dev:admin': 'admin:dev,', 'dev:mobile': 'mobile:dev,', 'dev:api': 'server:dev:api,', 'dev:worker': 'server:dev:worker,' };
  for (const [task, expected] of Object.entries(cases)) withFixture(({ run, trace }) => {
    const result = run(task);
    assert.equal(result.status, 0, result.stdout + result.stderr);
    assert.equal(trace(), expected);
  });
});

test('unknown task fails without echoing arbitrary input or running checks', () => {
  withFixture(({ run, trace }) => {
    const result = run('synthetic-secret-marker');
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Unknown task/);
    assert.doesNotMatch(result.stdout + result.stderr, /synthetic-secret-marker/);
    assert.equal(trace(), '');
  });
});

test('missing npm executable is reported as a target failure', () => {
  withFixture(({ run, trace }) => {
    const result = run('build:api', { PATH: '/nonexistent', npm_execpath: '' });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /@holdlog\/server.*build.*npm/i);
    assert.equal(trace(), '');
  });
});


test('development configuration failures retain their status and do not report success', () => {
  withFixture(({ manifests, run }) => {
    manifests.admin.value.scripts.dev = 'node -e "console.error(\'Missing ADMIN_DEV_API_ORIGIN\');process.exit(9)"';
    const result = run('dev:admin');
    assert.equal(result.status, 9);
    assert.match(result.stderr, /ADMIN_DEV_API_ORIGIN/);
    assert.match(result.stderr, /FAIL @holdlog\/admin: dev/);
    assert.doesNotMatch(result.stdout, /PASS/);
  });
});
