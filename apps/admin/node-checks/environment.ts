/**
 * Read the process working directory to verify the administrator Node configuration environment.
 * @returns The process working directory; this is separate from browser code.
 */
export const root = (): string => process.cwd();
