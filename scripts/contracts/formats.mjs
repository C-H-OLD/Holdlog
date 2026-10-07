import { fullFormats } from 'ajv-formats/dist/formats.js';
import { _ } from 'ajv/dist/compile/codegen/index.js';
/**
 * Check whether Intl accepts an IANA time-zone name or alias, excluding offset identifiers.
 * @param {string} value - Time-zone identifier from a validated string field.
 * @returns {boolean} Whether the identifier is supported by this runtime's Intl data.
 * Unsupported identifiers return false; this does not install missing Intl time-zone data.
 */
export function isTimeZone(value) {
  if (!value || /^[+-]/.test(value)) return false;
  try { new Intl.DateTimeFormat('en', { timeZone: value }); return true; } catch { return false; }
}
export const formats = { ...fullFormats, 'iana-time-zone': isTimeZone, binary: true };
export const formatCode = _`require("holdlog-formats").formats`;
export const runtimeFormatSource = `import { fullFormats } from 'ajv-formats/dist/formats.js';\nconst isTimeZone = ${isTimeZone.toString()};\nexport const formats = { ...fullFormats, 'iana-time-zone': isTimeZone, binary: true };`;
