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
export async function renderValidators(registry) {
  const ajv = new Ajv2020({ strict: true, strictTypes: false, strictRequired: false, allowUnionTypes: true, allErrors: true, coerceTypes: false, useDefaults: false, removeAdditional: false, inlineRefs: false, code: { source: true, esm: true, formats: formatCode } });
  for (const [name, format] of Object.entries(formats)) ajv.addFormat(name, format);
  for (const document of registry.documents) ajv.addSchema(document);
  const exported = {}, index = { http: {}, runtime: {}, operations: {} };
  let counter = 0;
  const registered = new Map();
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
  const result = await build({ stdin: { contents: source, resolveDir: scriptRoot, sourcefile: 'validators-source.mjs' }, bundle: true, write: false, format: 'esm', platform: 'neutral', target: 'es2022', logLevel: 'silent', plugins: [{ name: 'contract-formats', setup(builder) {
    builder.onResolve({ filter: /^holdlog-formats$/ }, () => ({ path: 'formats', namespace: 'contract-formats' }));
    builder.onLoad({ filter: /.*/, namespace: 'contract-formats' }, () => ({ contents: runtimeFormatSource, resolveDir: scriptRoot }));
  } }] });
  return { code: result.outputFiles[0].text, index };
}
function hasBinary(schema, registry, seen = new Set()) {
  if (!schema || typeof schema !== 'object') return false;
  if (schema.format === 'binary') return true;
  if (schema.$ref && !seen.has(schema.$ref)) {
    seen.add(schema.$ref);
    if (hasBinary(registry.resolveSchema(schema.$ref), registry, seen)) return true;
  }
  return Object.values(schema).some(value => Array.isArray(value) ? value.some(item => hasBinary(item, registry, seen)) : hasBinary(value, registry, seen));
}
function runtimeTypes(registry) {
  const defs = { ...registry.documents[1].$defs, ...Object.fromEntries(Object.entries(registry.documents[0].$defs).map(([key, value]) => ['HTTP_' + key, value])) };
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
export function provenance(root) {
  const files = ['packages/contracts/openapi.json', 'packages/contracts/runtime.schema.json', 'packages/contracts/examples.json', 'packages/contracts/conventions.md', 'packages/contracts/package.json', 'package.json', 'package-lock.json', 'redocly.yaml', ...readdirSync(resolve(root, 'scripts/contracts')).filter(name => /\.(mjs|cjs)$/.test(name)).map(name => 'scripts/contracts/' + name)].sort();
  const inputs = Object.fromEntries(files.map(name => [name, createHash('sha256').update(readFileSync(resolve(root, name))).digest('hex')]));
  const manifest = JSON.parse(readFileSync(resolve(root, 'package.json')));
  const tools = Object.fromEntries(['openapi-typescript', 'ajv', 'ajv-formats', 'json-schema-to-typescript', '@redocly/cli', 'esbuild', 'typescript'].map(name => [name, JSON.parse(readFileSync(resolve(scriptRoot, 'node_modules', name, 'package.json'))).version]));
  return { contractVersion: JSON.parse(readFileSync(resolve(root, 'packages/contracts/openapi.json'))).info.version, node: manifest.engines.node, npm: manifest.engines.npm, inputs, tools };
}
export async function generate(root = scriptRoot, output = resolve(root, 'packages/contracts/generated')) {
  const registry = loadRegistry(root);
  const { code, index } = await renderValidators(registry);
  const http = astToString(await openapiTS(registry.api));
  const runtime = await runtimeTypes(registry);
  const fixtures = JSON.parse(readFileSync(resolve(root, 'packages/contracts/examples.json')));
  const files = {
    'http.d.ts': http,
    'empty.mjs': 'export {};\n',
    'client.d.ts': 'export type { ClimbCount, WorkoutDraft, WorkoutLifecycle, WorkoutDisplay, AnnouncementSuppression, PendingInvite, Route, PushPayload, NoticeEntry, OpenSourceManifest } from \'./runtime\';\n',
    'fixtures.d.mts': 'export declare function getFixtures(): { status: string; http: unknown[]; runtime: unknown[]; mustReject: unknown[] };\n',
    'http-input.mjs': readFileSync(resolve(root, 'scripts/contracts/http-input.mjs'), 'utf8'),
    'http-input.d.mts': 'export declare function parseParameter(parameter: { in: string; name?: string; required?: boolean; style?: string; explode?: boolean; schema: { type?: string; items?: { type?: string }; default?: unknown } }, value: string | string[] | undefined): unknown;\n',
    'runtime.d.ts': runtime,
    'validators.mjs': code,
    'validators.d.mts': Object.keys({ ...index.http, ...index.runtime }).length ? [...new Set([...Object.values(index.http), ...Object.values(index.runtime), ...Object.values(index.operations).flatMap(op => [...op.parameters.map(p => p.validator), ...Object.values(op.body).map(v => v.validator), ...Object.values(op.responses).flatMap(c => Object.values(c).map(v => v.validator)), ...Object.values(op.responseHeaders).flatMap(h => Object.values(h))])])].map(name => `export declare const ${name}: ((value: unknown) => boolean) & { errors?: unknown };`).join('\n') + '\n' : '',
    'index.mjs': `export const index = ${JSON.stringify(index, null, 2)};\n`,
    'index.d.mts': 'export declare const index: { http: Record<string, string>; runtime: Record<string, string>; operations: Record<string, unknown> };\n',
    'fixtures.mjs': `const source = ${JSON.stringify(fixtures, null, 2)};\nexport function getFixtures() { return JSON.parse(JSON.stringify(source)); }\n`,
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
