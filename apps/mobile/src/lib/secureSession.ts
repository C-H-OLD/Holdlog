import { isMobileSession, type MobileSession } from '../api/holdlog/auth.ts';
import { MobileIdentityError } from '../api/holdlog/client.ts';

export interface SecretStorage {
  read(): Promise<string | null>;
  write(value: string): Promise<void>;
  remove(): Promise<void>;
}
export interface RestoredSession { session: MobileSession; generation: number }
export interface SessionVault {
  load(): Promise<RestoredSession | null>;
  save(session: MobileSession, generation: number): Promise<void>;
  markRefreshPending(session: MobileSession, generation: number): Promise<void>;
  clear(): Promise<void>;
}

/**
 * Serialize one keychain record. The installation ID must come from an unbacked
 * installation marker; a surviving iOS keychain entry cannot establish identity.
 * Failures expose no platform exception or credential. Signup proofs are excluded.
 */
export function createSessionVault(storage: SecretStorage, installationId: string): SessionVault {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(installationId)) throw new MobileIdentityError('storage');
  let queue: Promise<unknown> = Promise.resolve();
  /** Continue serialization after failures, translating platform errors at this boundary. */
  function enqueue<T>(work: () => Promise<T>): Promise<T> {
    const pending = queue.then(work).catch(() => { throw new MobileIdentityError('storage'); });
    queue = pending.catch(() => undefined);
    return pending;
  }
  /** Snapshot credentials before queuing so caller mutation cannot alter a pending write. */
  function store(session: MobileSession, generation: number, refreshPending: boolean): Promise<void> {
    if (!isMobileSession(session) || !session.accessToken || !session.refreshToken || !Number.isSafeInteger(generation) || generation < 0) return Promise.reject(new MobileIdentityError('storage'));
    const value = JSON.stringify({ format: 1, installationId, generation, refreshPending, session });
    return enqueue(() => storage.write(value));
  }
  return {
    /** Invalid, reinstalled or interrupted-rotation records require a new SNS authentication. */
    load: () => enqueue(async () => {
      const raw = await storage.read();
      if (raw === null) return null;
      let record: Record<string, unknown> | null = null;
      try { record = JSON.parse(raw) as Record<string, unknown>; } catch { /* Corrupt records carry no authority. */ }
      if (record === null || typeof record !== 'object' || Array.isArray(record) || Object.keys(record).sort().join(',') !== 'format,generation,installationId,refreshPending,session' || record.format !== 1 || record.installationId !== installationId || !Number.isSafeInteger(record.generation) || (record.generation as number) < 0 || record.refreshPending !== false || !isMobileSession(record.session) || !record.session.accessToken || !record.session.refreshToken) {
        await storage.remove(); return null;
      }
      return { session: record.session, generation: record.generation as number };
    }),
    save: (session, generation) => store(session, generation, false),
    markRefreshPending: (session, generation) => store(session, generation, true),
    clear: () => enqueue(() => storage.remove()),
  };
}
