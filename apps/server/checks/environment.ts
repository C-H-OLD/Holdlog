/**
 * Read the Node environment mode to verify server globals are available.
 * @returns NODE_ENV, or undefined when it is unset; does not initialize server configuration.
 */
export const environment = (): string | undefined => process.env.NODE_ENV;
