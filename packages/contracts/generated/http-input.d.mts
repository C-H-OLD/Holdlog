/**
 * Decode one wire parameter before applying its generated schema validator.
 * @param {object} parameter - OpenAPI location, required flag, serialization and scalar/array schema.
 * @param {string|string[]|undefined} value - Wire string(s), or undefined when absent.
 * @returns {unknown} Parsed primitive/array, or undefined for an absent optional value.
 * @throws {Error} For missing required values, unsupported serialization/types or lossy numeric parsing.
 * JSON bodies are not decoded here and no defaults or schema constraints are applied.
 */
export declare function parseParameter(parameter: { in: string; name?: string; required?: boolean; style?: string; explode?: boolean; schema: { type?: string; items?: { type?: string }; default?: unknown } }, value: string | string[] | undefined): unknown;
