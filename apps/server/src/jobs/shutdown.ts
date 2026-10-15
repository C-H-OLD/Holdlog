/**
 * Close the connection after a startup failure and rethrow the original error.
 * A close failure never replaces the original startup failure; cleanup values are never logged.
 */
export function cleanupStartupFailure(db: { close(): unknown }, originalError: unknown): never {
  try { db.close(); }
  catch { /* Cleanup must not replace the original startup failure. */ }
  throw originalError;
}
