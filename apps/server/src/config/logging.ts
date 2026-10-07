/** Emit a fixed event category; raw requests, payloads and exceptions never enter logs. */
export function logEvent(event: 'api.started' | 'api.failed' | 'request.finished' | 'database.failed' | 'migration.completed' | 'migration.failed' | 'worker.started' | 'worker.failed' | 'worker.stopped', status?: number): void {
  console.info(JSON.stringify(status === undefined ? { event } : { event, status }));
}

/** Report only validated setting names; all other startup errors use a fixed category. */
export function reportStartupFailure(error: unknown, target: 'api' | 'worker' | 'migration'): void {
  if (error instanceof Error && /^Missing or invalid settings: [A-Z_, ]+$/.test(error.message)) console.error(error.message);
  else logEvent(`${target}.failed`);
  process.exitCode = 1;
}
