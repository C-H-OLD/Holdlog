import type pg from 'pg';

/**
 * Run work on one checked-out READ COMMITTED client, committing only its successful result.
 * The callback must pass this client to every participating repository and avoid external I/O.
 * Throws the original connection/work/commit error after rollback; no automatic business retries.
 * Always returns the client, discarding it when BEGIN or rollback leaves connection state uncertain.
 */
export async function withTransaction<T>(pool: pg.Pool, work: (client: pg.PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  let started = false;
  let discard = false;
  try {
    await client.query('BEGIN ISOLATION LEVEL READ COMMITTED');
    started = true;
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    if (started) {
      try { await client.query('ROLLBACK'); }
      catch { discard = true; }
    } else { discard = true; }
    throw error;
  } finally { client.release(discard); }
}
