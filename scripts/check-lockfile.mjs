import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

/**
 * Check that root and workspace manifests match their npm lockfile snapshots.
 * @param {string} [root] - Repository root; defaults to the current working directory.
 * @returns {number} Number of manifest snapshots checked.
 * @throws {Error|SyntaxError} If required JSON cannot be read or parsed.
 * @throws {import('node:assert').AssertionError} For unsupported lockfile versions or snapshot/workspace drift.
 * Read-only: this checks direct manifest metadata, not transitive integrity or installation success.
 */
export function checkLockfile(root = process.cwd()) {
  /**
   * Read JSON metadata beneath the selected repository root.
   * @param {string} path - Repository-relative JSON filename.
   * @returns {object} Parsed manifest or lockfile data.
   * @throws {Error|SyntaxError} If the file cannot be read or parsed.
   */
  const read = path => JSON.parse(readFileSync(join(root, path), 'utf8'));
  const lock = read('package-lock.json');
  assert.equal(lock.lockfileVersion, 3, 'Expected lockfileVersion 3');
  const paths = [''];
  for (const directory of ['apps', 'packages']) {
    for (const entry of readdirSync(join(root, directory), { withFileTypes: true })) {
      const path = `${directory}/${entry.name}`;
      if (entry.isDirectory() && existsSync(join(root, path, 'package.json'))) paths.push(path);
    }
  }
  for (const path of paths) {
    const manifest = read(join(path, 'package.json'));
    const snapshot = lock.packages[path];
    assert.ok(snapshot, `${path || 'root'} missing from lockfile`);
    for (const field of ['name', 'version', 'engines', 'dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies']) {
      assert.deepEqual(snapshot[field] ?? {}, manifest[field] ?? {}, `${path || 'root'}: ${field} differs from lockfile`);
    }
  }
  assert.deepEqual(lock.packages[''].workspaces, read('package.json').workspaces, 'Workspace list differs from lockfile');
  return paths.length;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  console.log(`Lockfile matches ${checkLockfile()} manifests`);
}
