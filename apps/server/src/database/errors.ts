/**
 * Recognize a primary-key or unique-constraint collision raised by better-sqlite3.
 * PostgreSQL's 23505 covered both; SQLite reports SQLITE_CONSTRAINT_PRIMARYKEY (1555) and SQLITE_CONSTRAINT_UNIQUE (2067).
 * Returns false for every other value, including CHECK, NOT NULL and foreign-key failures.
 */
export function isUniqueViolation(error: unknown): boolean {
  return !!error && typeof error === 'object' && 'code' in error && (error.code === 'SQLITE_CONSTRAINT_UNIQUE' || error.code === 'SQLITE_CONSTRAINT_PRIMARYKEY');
}
