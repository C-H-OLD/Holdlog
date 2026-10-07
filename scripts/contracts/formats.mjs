import { fullFormats } from 'ajv-formats/dist/formats.js';
import { _ } from 'ajv/dist/compile/codegen/index.js';
export function isTimeZone(value) {
  if (!value || /^[+-]/.test(value)) return false;
  try { new Intl.DateTimeFormat('en', { timeZone: value }); return true; } catch { return false; }
}
export const formats = { ...fullFormats, 'iana-time-zone': isTimeZone, binary: true };
export const formatCode = _`require("holdlog-formats").formats`;
export const runtimeFormatSource = `import { fullFormats } from 'ajv-formats/dist/formats.js';\nconst isTimeZone = ${isTimeZone.toString()};\nexport const formats = { ...fullFormats, 'iana-time-zone': isTimeZone, binary: true };`;
