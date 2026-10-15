import type Database from 'better-sqlite3';

/** A transaction result that is never awaited: Promise-like values fail the type constraint. */
export type SyncResult = string | number | boolean | bigint | symbol | null | undefined | void | (object & { then?: never });

/**
 * Run synchronous work in one BEGIN IMMEDIATE transaction on the process connection and commit its result.
 * Taking the write lock first keeps read-then-write work from failing with SQLITE_BUSY after it has read.
 * work must pass this same connection to every repository call and avoid external I/O; it cannot await
 * (a returned Promise is a type error, and better-sqlite3 throws TypeError and rolls back).
 * Throws the original work or COMMIT error after rollback, or SQLITE_BUSY after the busy timeout; no retries.
 */
export function withTransaction<T extends SyncResult>(db: Database.Database, work: () => T): T {
  return db.transaction(work).immediate();
}

/**
 * Expose synchronous storage work through an existing Promise-returning API.
 * work runs immediately; a thrown error becomes a rejection, so callers keep their await/rejects semantics.
 */
export function asPromise<T>(work: () => T): Promise<T> {
  return new Promise<T>(resolve => { resolve(work()); });
}
