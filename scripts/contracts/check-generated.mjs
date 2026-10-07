import { mkdtempSync, rmSync, readdirSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { generate, provenance } from './generate.mjs';
/**
 * Compare committed outputs with a fresh temporary generation, without repairing them.
 * @param {string} [root] - Repository root; defaults to the current working directory.
 * @returns {Promise<number>} Number of generated files when metadata, file lists and bytes match.
 * @throws {Error} If metadata/outputs are missing, invalid or stale, or temporary generation fails.
 * Creates and removes its own temporary directory; existing generated files remain untouched on success or failure.
 */
export async function checkGenerated(root = process.cwd()) {
  const actual = resolve(root, 'packages/contracts/generated');
  let manifest;
  try { manifest = JSON.parse(readFileSync(resolve(actual, 'manifest.json'), 'utf8')); } catch { throw new Error('Generated manifest missing or invalid; run contracts:generate'); }
  const current = provenance(root);
  for (const key of Object.keys(current)) if (JSON.stringify(manifest[key]) !== JSON.stringify(current[key])) throw new Error(`Generated manifest ${key} differs; run contracts:generate`);
  const temporary = mkdtempSync(resolve(tmpdir(), 'holdlog-contract-generation-'));
  try {
    await generate(root, temporary);
    const expected = readdirSync(temporary).sort(), present = readdirSync(actual).sort();
    if (JSON.stringify(expected) !== JSON.stringify(present)) throw new Error('Generated file list differs');
    for (const name of expected) if (!readFileSync(resolve(actual, name)).equals(readFileSync(resolve(temporary, name)))) throw new Error(`Generated content differs: ${name}`);
    return expected.length;
  } finally { rmSync(temporary, { recursive: true, force: true }); }
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  console.log(`Generated contracts match: ${await checkGenerated()} files`);
}
