import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { parseArgs } from 'node:util';
import Ajv2020 from 'ajv/dist/2020.js';
import standalone from 'ajv/dist/standalone/index.js';
import openapiTS, { astToString } from 'openapi-typescript';
import { compile } from 'json-schema-to-typescript';
import { build } from 'esbuild';
import { loadRegistry } from './schema-registry.mjs';
import { formats, formatCode, runtimeFormatSource } from './formats.mjs';
const scriptRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
/**
 * Compile strict schema validators and bundle their helpers into self-contained client ESM.
 * @param {object} registry - Normalized schema documents and HTTP operations from createRegistry.
 * @returns {Promise<{code: string, index: object}>} ESM source and validator/operation lookup metadata.
 * @throws {Error} If schema compilation, reference resolution or bundling fails.
 * Does not write files or mutate fixtures. Binary flags mark byte-validation boundaries, not byte validation success.
 */
export async function renderValidators(registry) {
  const ajv = new Ajv2020({ strict: true, strictTypes: false, strictRequired: false, allowUnionTypes: true, allErrors: true, coerceTypes: false, useDefaults: false, removeAdditional: false, inlineRefs: false, code: { source: true, esm: true, formats: formatCode } });
  for (const [name, format] of Object.entries(formats)) ajv.addFormat(name, format);
  for (const document of registry.documents) ajv.addSchema(document);
  const exported = {}, index = { http: {}, runtime: {}, operations: {} };
  let counter = 0;
  const registered = new Map();
  /**
   * Register a unique schema once and assign a stable standalone export name.
   * @param {object} schema - Normalized schema or reference wrapper.
   * @returns {string} Validator export name, reused for byte-identical schema descriptions.
   * @throws {Error} If Ajv rejects schema registration. Updates this generation's local registry and export map.
   */
  function register(schema) {
    const fingerprint = JSON.stringify(schema);
    if (registered.has(fingerprint)) return registered.get(fingerprint);
    const id = 'https://holdlog.invalid/validator/' + counter;
    const name = 'contractCheck' + counter++;
    ajv.addSchema({ ...schema, $id: id });
    exported[name] = id;
    registered.set(fingerprint, name);
    return name;
  }
  for (const [scope, document] of [['http', registry.documents[0]], ['runtime', registry.documents[1]]]) {
    for (const name of Object.keys(document.$defs)) index[scope][name] = register({ $ref: document.$id + '#/$defs/' + name.replaceAll('~', '~0').replaceAll('/', '~1') });
  }
  for (const [id, operation] of Object.entries(registry.operations)) {
    const item = structuredClone(operation);
    item.parameters = item.parameters.map(param => ({ ...param, validator: register(param.schema) }));
    for (const [media, schema] of Object.entries(item.body)) item.body[media] = { validator: register(schema), binary: hasBinary(schema, registry) };
    for (const content of Object.values(item.responses)) for (const [media, schema] of Object.entries(content)) content[media] = { validator: register(schema), binary: hasBinary(schema, registry) };
    for (const headers of Object.values(item.responseHeaders)) for (const [header, schema] of Object.entries(headers)) headers[header] = register(schema);
    index.operations[id] = item;
  }
  const source = standalone(ajv, exported);
  const result = await build({ stdin: { contents: source, resolveDir: scriptRoot, sourcefile: 'validators-source.mjs' }, bundle: true, write: false, format: 'esm', platform: 'neutral', target: 'es2022', logLevel: 'silent', plugins: [{ name: 'contract-formats',
    /**
     * Supply the format helper as a virtual build module so client output has no runtime import.
     * @param {object} builder - esbuild plugin registration API.
     * @returns {void} Registers resolve/load hooks for this build only.
     */
    setup(builder) {
    builder.onResolve({ filter: /^holdlog-formats$/ }, () => ({ path: 'formats', namespace: 'contract-formats' }));
    builder.onLoad({ filter: /.*/, namespace: 'contract-formats' }, () => ({ contents: runtimeFormatSource, resolveDir: scriptRoot }));
  } }] });
  return { code: result.outputFiles[0].text, index };
}
/**
 * Detect a binary format anywhere in a schema, including referenced definitions.
 * @param {object|boolean} schema - Normalized schema subtree.
 * @param {object} registry - Registry providing local normalized reference resolution.
 * @param {Set<string>} [seen] - References visited during traversal; updated to break cycles.
 * @returns {boolean} Whether downstream byte validation must be tracked separately.
 * @throws {Error} If a referenced schema cannot be resolved.
 */
function hasBinary(schema, registry, seen = new Set()) {
  if (!schema || typeof schema !== 'object') return false;
  if (schema.format === 'binary') return true;
  if (schema.$ref && !seen.has(schema.$ref)) {
    seen.add(schema.$ref);
    if (hasBinary(registry.resolveSchema(schema.$ref), registry, seen)) return true;
  }
  return Object.values(schema).some(value => Array.isArray(value) ? value.some(item => hasBinary(item, registry, seen)) : hasBinary(value, registry, seen));
}
/**
 * Generate declarations for every runtime definition using local HTTP type references.
 * @param {object} registry - Normalized runtime and HTTP schema documents.
 * @returns {Promise<string>} TypeScript declarations with reachable and unreachable runtime definitions.
 * @throws {Error} If the schema-to-TypeScript compiler cannot resolve or compile a definition.
 * No separate product model is introduced; compiler input is derived from the shared sources.
 */
function runtimeTypes(registry) {
  const defs = { ...registry.documents[1].$defs, ...Object.fromEntries(Object.entries(registry.documents[0].$defs).map(([key, value]) => ['HTTP_' + key, value])) };
  /**
   * Copy schema data while translating registry references to local compiler definitions.
   * @param {unknown} value - Schema node, array or primitive.
   * @returns {unknown} Copied value with HTTP references prefixed to avoid runtime name collisions.
   */
  function local(value) {
    if (Array.isArray(value)) return value.map(local);
    if (!value || typeof value !== 'object') return value;
    return Object.fromEntries(Object.entries(value).map(([key, child]) => {
      if (key === '$ref') return [key, child.replace('https://holdlog.invalid/contracts/runtime.schema.json#/$defs/', '#/definitions/').replace('https://holdlog.invalid/contracts/openapi.json#/$defs/', '#/definitions/HTTP_')];
      return [key, local(child)];
    }));
  }
  return compile({ definitions: local(defs), anyOf: Object.keys(registry.documents[1].$defs).map(name => ({ $ref: '#/definitions/' + name })), additionalProperties: false }, 'Runtime', { bannerComment: '/* Generated from contract sources. Do not edit. */', unreachableDefinitions: true, format: false });
}
/**
 * Describe the inputs and installed tool versions used to reproduce contract outputs.
 * @param {string} root - Repository containing source, manifest, lockfile and generation scripts.
 * @returns {object} Contract/Node/npm versions, sorted input SHA-256 hashes and installed tool versions.
 * @throws {Error|SyntaxError} If a required file or installed tool manifest cannot be read or parsed.
 * Tool versions come from this generator's installed dependencies; no timestamps or absolute paths are emitted.
 */
export function provenance(root) {
  const files = ['packages/contracts/openapi.json', 'packages/contracts/runtime.schema.json', 'packages/contracts/examples.json', 'packages/contracts/conventions.md', 'packages/contracts/package.json', 'package.json', 'package-lock.json', 'redocly.yaml', ...readdirSync(resolve(root, 'scripts/contracts')).filter(name => /\.(mjs|cjs)$/.test(name)).map(name => 'scripts/contracts/' + name)].sort();
  const inputs = Object.fromEntries(files.map(name => [name, createHash('sha256').update(readFileSync(resolve(root, name))).digest('hex')]));
  const manifest = JSON.parse(readFileSync(resolve(root, 'package.json')));
  const tools = Object.fromEntries(['openapi-typescript', 'ajv', 'ajv-formats', 'json-schema-to-typescript', '@redocly/cli', 'esbuild', 'typescript'].map(name => [name, JSON.parse(readFileSync(resolve(scriptRoot, 'node_modules', name, 'package.json'))).version]));
  return { contractVersion: JSON.parse(readFileSync(resolve(root, 'packages/contracts/openapi.json'))).info.version, node: manifest.engines.node, npm: manifest.engines.npm, inputs, tools };
}
/**
 * Generate contract types, validators, fixture adapters and provenance metadata.
 * @param {string} [root] - Repository root; defaults to the generator's repository.
 * @param {string} [output] - Output directory; defaults to packages/contracts/generated under root.
 * @returns {Promise<string[]>} Names of the files written, including the manifest.
 * @throws {Error|SyntaxError} If sources/tools are invalid or compilation/bundling/file writes fail.
 * Creates the output directory and overwrites known outputs. Extra files are retained and rejected by checkGenerated.
 * Contract sources are not changed; an interrupted write may leave partial output which the checker detects.
 */
export async function generate(root = scriptRoot, output = resolve(root, 'packages/contracts/generated')) {
  const registry = loadRegistry(root);
  const { code, index } = await renderValidators(registry);
  const http = astToString(await openapiTS(registry.api));
  const runtime = await runtimeTypes(registry);
  const fixtures = JSON.parse(readFileSync(resolve(root, 'packages/contracts/examples.json')));
  const fixtureDocumentation = `/**
 * Return an independent copy of the source HTTP/runtime/rejection examples.
 * @returns {{status: string, http: unknown[], runtime: unknown[], mustReject: unknown[]}} Source fixture groups.
 * Values are format examples, not simulated permissions or database outcomes; caller changes do not affect later reads.
 */`;
  const parameterDocumentation = `/**
 * Decode one wire parameter before applying its generated schema validator.
 * @param {object} parameter - OpenAPI location, required flag, serialization and scalar/array schema.
 * @param {string|string[]|undefined} value - Wire string(s), or undefined when absent.
 * @returns {unknown} Parsed primitive/array, or undefined for an absent optional value.
 * @throws {Error} For missing required values, unsupported serialization/types or lossy numeric parsing.
 * JSON bodies are not decoded here and no defaults or schema constraints are applied.
 */`;
  const validatorDocumentation = `/**
 * Validate a JSON value against the schema identified by the operation/runtime index.
 * @param {unknown} value - Unmodified JSON data to validate.
 * @returns {boolean} Whether the schema accepts the value; updates this function's errors with the last result.
 * Does not coerce values, inject defaults, remove fields, authorize access or validate file bytes.
 */`;
  const files = {
    'http.d.ts': http,
    'empty.mjs': 'export {};\n',
    'client.d.ts': 'export type { ClimbCount, WorkoutDraft, WorkoutLifecycle, WorkoutDisplay, AnnouncementSuppression, PendingInvite, Route, PushPayload, NoticeEntry, OpenSourceManifest } from \'./runtime\';\n',
    'fixtures.d.mts': fixtureDocumentation + '\n' + 'export declare function getFixtures(): { status: string; http: unknown[]; runtime: unknown[]; mustReject: unknown[] };\n',
    'http-input.mjs': readFileSync(resolve(root, 'scripts/contracts/http-input.mjs'), 'utf8'),
    'http-input.d.mts': parameterDocumentation + '\n' + 'export declare function parseParameter(parameter: { in: string; name?: string; required?: boolean; style?: string; explode?: boolean; schema: { type?: string; items?: { type?: string }; default?: unknown } }, value: string | string[] | undefined): unknown;\n',
    'runtime.d.ts': runtime,
    'validators.mjs': code,
    'validators.d.mts': Object.keys({ ...index.http, ...index.runtime }).length ? [...new Set([...Object.values(index.http), ...Object.values(index.runtime), ...Object.values(index.operations).flatMap(op => [...op.parameters.map(p => p.validator), ...Object.values(op.body).map(v => v.validator), ...Object.values(op.responses).flatMap(c => Object.values(c).map(v => v.validator)), ...Object.values(op.responseHeaders).flatMap(h => Object.values(h))])])].map(name => `${validatorDocumentation}\nexport declare const ${name}: ((value: unknown) => boolean) & { errors?: unknown };`).join('\n') + '\n' : '',
    'index.mjs': `export const index = ${JSON.stringify(index, null, 2)};\n`,
    'index.d.mts': 'export declare const index: { http: Record<string, string>; runtime: Record<string, string>; operations: Record<string, unknown> };\n',
    'fixtures.mjs': `const source = ${JSON.stringify(fixtures, null, 2)};\n${fixtureDocumentation}\nexport function getFixtures() { return JSON.parse(JSON.stringify(source)); }\n`,
  };
  files['manifest.json'] = JSON.stringify({ ...provenance(root), outputs: [...Object.keys(files), 'manifest.json'].sort() }, null, 2) + '\n';
  mkdirSync(output, { recursive: true });
  for (const [name, text] of Object.entries(files)) writeFileSync(resolve(output, name), text);
  return Object.keys(files);
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const { values } = parseArgs({ options: { root: { type: 'string', default: scriptRoot }, output: { type: 'string' } } });
  const files = await generate(values.root, values.output);
  console.log(`Generated ${files.length} contract files`);
}
