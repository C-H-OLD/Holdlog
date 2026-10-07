import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

// Cleanup owns only the uniquely created directory, never a caller's existing file.
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
