import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadRegistry } from './schema-registry.mjs';
export function findBindings(registry, operationId, name) {
  const operation = registry.operations[operationId];
  if (!operation) throw new Error(`Missing operation: ${operationId}`);
  const target = 'https://holdlog.invalid/contracts/openapi.json#/$defs/' + name;
  function contains(schema, seen = new Set()) {
    if (!schema || typeof schema !== 'object') return false;
    if (schema.$ref) {
      if (schema.$ref === target) return true;
      if (seen.has(schema.$ref)) return false;
      seen.add(schema.$ref);
      if (contains(registry.resolveSchema(schema.$ref), seen)) return true;
    }
    for (const value of Object.values(schema)) {
      if (typeof value === 'string') continue;
      if (Array.isArray(value) ? value.some(item => contains(item, seen)) : contains(value, seen)) return true;
    }
    return false;
  }
  const candidates = operation.parameters.map(param => [`parameter:${param.in}:${param.name}`, param.schema]);
  for (const [media, schema] of Object.entries(operation.body)) candidates.push([`body:${media}`, schema]);
  for (const [status, content] of Object.entries(operation.responses)) for (const [media, schema] of Object.entries(content)) candidates.push([`response:${status}:${media}`, schema]);
  for (const [status, headers] of Object.entries(operation.responseHeaders)) for (const [header, schema] of Object.entries(headers)) candidates.push([`response-header:${status}:${header}`, schema]);
  return candidates.filter(([, schema]) => contains(schema)).map(([slot]) => slot);
}
export function checkExamples(examples, registry, validators, index) {
  let accepted = 0, rejected = 0;
  const bindings = [], ids = new Set();
  function validate(scope, example, value, expected) {
    if (ids.has(example.id)) throw new Error(`Duplicate example: ${example.id}`);
    ids.add(example.id);
    const name = index[scope][example.schema];
    if (!name || typeof validators[name] !== 'function') throw new Error(`Missing example schema: ${example.schema}`);
    if (validators[name](value) !== expected) throw new Error(`Example ${example.id}: expected ${expected ? 'accept' : 'reject'}`);
  }
  for (const example of examples.http) {
    validate('http', example, example.value, true);
    const slots = findBindings(registry, example.operationId, example.schema);
    if (!slots.length) throw new Error(`Unrelated example ${example.id}: ${example.operationId}/${example.schema}`);
    bindings.push({ id: example.id, operationId: example.operationId, schema: example.schema, slots });
    accepted++;
  }
  for (const example of examples.runtime) { validate('runtime', example, example.value, true); accepted++; }
  for (const example of examples.mustReject) {
    if (example.baseValue) {
      const name = index.http[example.schema];
      if (!name || !validators[name](example.baseValue)) throw new Error(`Invalid rejection base: ${example.id}`);
    }
    validate(index.http[example.schema] ? 'http' : 'runtime', example, example.value ?? { ...example.baseValue, ...example.inject }, false);
    rejected++;
  }
  return { accepted, rejected, bindings };
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const root = process.cwd();
  const validators = await import(pathToFileURL(resolve(root, 'packages/contracts/generated/validators.mjs')));
  const { index } = await import(pathToFileURL(resolve(root, 'packages/contracts/generated/index.mjs')));
  const result = checkExamples(JSON.parse(readFileSync(resolve(root, 'packages/contracts/examples.json'))), loadRegistry(root), validators, index);
  console.log(`Contract examples: ${result.accepted} accepted, ${result.rejected} rejected; ${result.bindings.length} HTTP bindings`);
}
