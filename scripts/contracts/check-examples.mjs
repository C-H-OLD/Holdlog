import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadRegistry } from './schema-registry.mjs';
/**
 * Find operation slots that reference a named HTTP schema directly or through nested schemas.
 * @param {object} registry - Local schema registry with normalized documents and operations.
 * @param {string} operationId - Operation whose parameters/body/responses/headers are inspected.
 * @param {string} name - HTTP component schema name to find.
 * @returns {string[]} Matching slot identifiers; an empty result means no binding was found.
 * @throws {Error} If the operation is absent or a traversed reference cannot be resolved.
 * A nested-schema match proves structural linkage, not a complete response or HTTP status outcome.
 */
export function findBindings(registry, operationId, name) {
  const operation = registry.operations[operationId];
  if (!operation) throw new Error(`Missing operation: ${operationId}`);
  const target = 'https://holdlog.invalid/contracts/openapi.json#/$defs/' + name;
  /**
   * Follow schema references to the requested component without recursing forever.
   * @param {object|boolean} schema - Current schema subtree.
   * @param {Set<string>} [seen] - References visited within this slot; updated during traversal.
   * @returns {boolean} Whether the subtree references the target component.
   * @throws {Error} If a traversed registry reference cannot be resolved.
   */
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
/**
 * Verify source examples, HTTP structural bindings and all required rejection cases.
 * @param {object} examples - HTTP/runtime/mustReject fixture groups from the source contract.
 * @param {object} registry - Local schema/operation registry.
 * @param {object} validators - Generated validator functions keyed by export name.
 * @param {object} index - Generated HTTP/runtime validator-name index.
 * @returns {{accepted: number, rejected: number, bindings: object[]}} Counts and HTTP binding evidence.
 * @throws {Error} For duplicate IDs, missing schemas/operations, invalid fixtures or incorrect acceptance results.
 * Validators update their errors property; values are not corrected. This does not test permissions, DB effects or bytes.
 */
export function checkExamples(examples, registry, validators, index) {
  let accepted = 0, rejected = 0;
  const bindings = [], ids = new Set();
  /**
   * Check one fixture and reserve its ID across all source groups.
   * @param {string} scope - HTTP or runtime index namespace.
   * @param {object} example - Source fixture with ID and schema name.
   * @param {unknown} value - Normal value or synthesized rejection value to validate.
   * @param {boolean} expected - Required acceptance result.
   * @returns {void}
   * @throws {Error} For duplicate IDs, missing validators or an unexpected result.
   */
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
