import type Database from 'better-sqlite3';
import { logEvent } from '../config/logging.js';
import { claim, complete, fail, type ClaimedJob, type QueuePolicy } from './queue.js';

/** Runs one claimed job outside SQL transactions; it must settle promptly once signal aborts. */
export type JobHandler = (job: ClaimedJob, signal: AbortSignal) => Promise<void>;
/** Handle for a started loop. */
export interface QueueRunner { stop(waitMs?: number): Promise<void> }

/** Apply a completion/failure write; a fenced (false) or failed write is logged by category only. */
function record(write: () => boolean): void {
  try { if (!write()) logEvent('worker.failed'); }
  catch { logEvent('worker.failed'); }
}

/**
 * Run one queue with concurrency 1: claim, run the handler outside transactions, then complete it or fail it
 * with HANDLER_FAILED. Waits pollMs between empty claims. stop() stops claiming, waits up to waitMs (default 10 s)
 * for the active handler, then aborts it without recording, so its lease expires and another runner retries it.
 * Claim/record storage errors (for example SQLITE_BUSY) only log worker.failed; the loop keeps running.
 */
export function startQueue(db: Database.Database, queue: string, policy: QueuePolicy, handler: JobHandler, pollMs = 500): QueueRunner {
  let stopping = false;
  let active: AbortController | undefined;
  let wake: (() => void) | undefined;
  /** Sleep for pollMs, or less when stop() wakes the loop. */
  const idle = (): Promise<void> => new Promise<void>(resolve => {
    const timer = setTimeout(() => { wake = undefined; resolve(); }, pollMs);
    wake = () => { clearTimeout(timer); wake = undefined; resolve(); };
  });
  const loop = (async (): Promise<void> => {
    while (!stopping) {
      let job: ClaimedJob | undefined;
      try { job = claim(db, queue, policy.leaseMs); } catch { logEvent('worker.failed'); }
      if (!job) { await idle(); continue; }
      const claimed = job, controller = new AbortController();
      active = controller;
      try {
        await handler(claimed, controller.signal);
        if (!controller.signal.aborted) record(() => complete(db, claimed.id, claimed.claimId));
      } catch {
        if (!controller.signal.aborted) record(() => fail(db, claimed.id, claimed.claimId, 'HANDLER_FAILED', policy.baseDelayMs));
      } finally { active = undefined; }
    }
  })();
  return {
    async stop(waitMs = 10_000): Promise<void> {
      stopping = true;
      wake?.();
      let timer: NodeJS.Timeout | undefined;
      const expired = new Promise<'expired'>(resolve => { timer = setTimeout(resolve, waitMs, 'expired'); });
      const outcome = await Promise.race([loop.then(() => 'stopped' as const), expired]);
      clearTimeout(timer);
      if (outcome === 'expired') active?.abort();
    },
  };
}
