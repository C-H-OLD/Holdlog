/**
 * Read the current document title to verify the browser type environment.
 * @returns The title of the current browser document. Requires a DOM window.
 */
export const title = (): string => window.document.title;
