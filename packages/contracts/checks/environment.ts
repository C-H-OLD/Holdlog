/**
 * Parse JSON as an unknown value to verify the platform-neutral TypeScript environment.
 * @param value - JSON source text.
 * @returns Parsed data which still requires contract validation.
 * @throws SyntaxError when the source is not valid JSON.
 */
export const parseValue = (value: string): unknown => JSON.parse(value);
