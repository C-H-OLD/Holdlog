import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

// Cleanup owns only the uniquely created directory, never a caller's existing file.
/**
 * Run an inspection against a uniquely owned temporary source file, then remove only that directory.
 * @param {string} directory - Existing parent directory where the tool resolves its project configuration.
 * @param {string} filename - Relative probe filename used inside the owned directory.
 * @param {string} source - Probe source text to write.
 * @param {function(string): unknown} inspect - Synchronous or asynchronous inspection callback.
 * @returns {Promise<unknown>} The callback result after successful inspection.
 * @throws {Error} Propagates filesystem or callback failures; cleanup still runs after file creation begins.
 * Does not overwrite or remove pre-existing files in the parent directory.
 */
export async function withProbe(directory, filename, source, inspect) {
  const owned = mkdtempSync(join(directory, 'tooling-probe-'));
  try {
    const file = join(owned, filename);
    writeFileSync(file, source, { flag: 'wx' });
    return await inspect(file);
  } finally {
    rmSync(owned, { recursive: true, force: true });
  }
}
