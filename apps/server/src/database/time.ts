/** SQLite strftime format equal to JavaScript toISOString(): UTC with milliseconds and a Z suffix. */
export const TIME_FORMAT = '%Y-%m-%dT%H:%M:%fZ';

const modifierPattern = /^[+-]\d+(?:\.\d+)? (?:seconds|minutes|hours|days)$/;
const columnPattern = /^[a-z_][a-z0-9_]*(?:\.[a-z_][a-z0-9_]*)?$/;

/** Reject anything but a fixed SQLite date modifier such as '+15 minutes'; values never come from requests. */
function checkedModifiers(modifiers: string[]): string[] {
  for (const modifier of modifiers) if (!modifierPattern.test(modifier)) throw new Error('Invalid time modifier');
  return modifiers.map(modifier => `'${modifier}'`);
}

/**
 * Build the SQL expression for the statement's current UTC time, optionally shifted by fixed modifiers.
 * SQLite keeps 'now' equal within one statement and advances it between statements, like statement_timestamp().
 * Returns SQL text only; throws on a malformed modifier.
 */
export function now(...modifiers: string[]): string {
  return `strftime('${TIME_FORMAT}', ${["'now'", ...checkedModifiers(modifiers)].join(', ')})`;
}

/** Build the SQL expression shifting a stored time column by fixed modifiers; throws on an unexpected column or modifier. */
export function at(column: string, ...modifiers: string[]): string {
  if (!columnPattern.test(column)) throw new Error('Invalid time column');
  return `strftime('${TIME_FORMAT}', ${[column, ...checkedModifiers(modifiers)].join(', ')})`;
}

/** Format a millisecond duration as a bindable SQLite modifier ('+1.500 seconds'); throws unless finite and non-negative. */
export function afterMilliseconds(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) throw new Error('Invalid duration');
  return `+${(ms / 1000).toFixed(3)} seconds`;
}
