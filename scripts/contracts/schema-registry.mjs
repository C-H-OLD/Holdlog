import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
const base = 'https://holdlog.invalid/contracts/';
const methods = new Set(['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace']);
const keywords = new Set('$schema $id $ref $anchor $defs definitions title description default examples deprecated readOnly writeOnly type enum const allOf anyOf oneOf not if then else properties patternProperties additionalProperties unevaluatedProperties required dependentRequired dependentSchemas propertyNames minProperties maxProperties items prefixItems additionalItems contains minContains maxContains unevaluatedItems minItems maxItems uniqueItems minimum maximum exclusiveMinimum exclusiveMaximum multipleOf minLength maxLength pattern format contentEncoding contentMediaType contentSchema'.split(' '));
/**
 * Build a registry from the local HTTP and runtime contract documents.
 * @param {object} api - OpenAPI source; only its schema sections are treated as JSON Schema.
 * @param {object} runtime - JSON Schema source with runtime definitions and local references.
 * @returns {object} Original documents, normalized schema documents, operation metadata and reference resolvers.
 * @throws {Error} If references, schema keywords, parameters or operation identifiers are unsupported or invalid.
 * Normalized schemas are copied; no network resolution or source-file writes occur. Original documents remain caller-owned.
 */
export function createRegistry(api, runtime) {
  const raw = { 'openapi.json': api, 'runtime.schema.json': runtime };
  /**
   * Resolve a document-relative JSON Pointer against the original local contract sources.
   * @param {string} ref - Local document name and optional JSON Pointer fragment.
   * @param {string} [document] - Source document used for fragment-only references.
   * @returns {unknown} Referenced source value, without expanding recursive references.
   * @throws {Error} For unsupported documents/fragments or missing pointer targets.
   * @throws {URIError} For malformed percent-encoded pointer segments.
   */
  function resolveRef(ref, document = 'runtime.schema.json') {
    const [file, fragment = ''] = ref.split('#');
    const name = file || document;
    if (!Object.hasOwn(raw, name) || (fragment && !fragment.startsWith('/'))) throw new Error(`Unsupported reference: ${ref}`);
    let result = raw[name];
    for (const part of fragment.split('/').slice(1)) {
      const key = decodeURIComponent(part).replaceAll('~1', '/').replaceAll('~0', '~');
      if (!result || typeof result !== 'object' || !Object.hasOwn(result, key)) throw new Error(`Unresolved reference: ${name}#${fragment}`);
      result = result[key];
    }
    return result;
  }
  /**
   * Copy a schema while checking keywords and rewriting local references to registry IDs.
   * @param {object|boolean} value - Schema assertion or boolean schema.
   * @param {string} document - Owning source used to resolve relative references.
   * @returns {object|boolean} Normalized schema; x- annotations are omitted from validator input.
   * @throws {Error} For malformed schemas, unsupported keywords or references outside HTTP schema sections.
   */
  function schema(value, document) {
    if (typeof value === 'boolean') return value;
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid schema');
    const out = {};
    for (const [key, child] of Object.entries(value)) {
      if (key.startsWith('x-')) continue;
      if (!keywords.has(key)) throw new Error(`Unsupported schema keyword: ${key}`);
      if (key === '$ref') {
        resolveRef(child, document);
        const [file, fragment = ''] = child.split('#');
        if ((file || document) === 'openapi.json' && !fragment.startsWith('/components/schemas/')) throw new Error(`Unsupported schema reference: ${child}`);
        out[key] = base + (file || document) + '#' + fragment.replace(/^\/components\/schemas\//, '/$defs/');
      } else if (['properties', 'patternProperties', '$defs', 'definitions', 'dependentSchemas'].includes(key)) {
        out[key] = Object.fromEntries(Object.entries(child).map(([name, item]) => [name, schema(item, document)]));
      } else if (['allOf', 'oneOf', 'anyOf', 'prefixItems'].includes(key)) {
        out[key] = child.map(item => schema(item, document));
      } else if (['items', 'additionalProperties', 'unevaluatedProperties', 'contains', 'not', 'if', 'then', 'else', 'propertyNames', 'contentSchema', 'unevaluatedItems'].includes(key)) {
        out[key] = schema(child, document);
      } else out[key] = structuredClone(child);
    }
    return out;
  }
  const httpDoc = { $id: base + 'openapi.json', $defs: schema({ $defs: api.components?.schemas ?? {} }, 'openapi.json').$defs };
  const runtimeDoc = { ...schema(runtime, 'runtime.schema.json'), $id: base + 'runtime.schema.json' };
  /**
   * Resolve an OpenAPI Reference Object while leaving inline or absent objects intact.
   * @param {object|undefined} value - Parameter, request body, response or header object.
   * @returns {object|undefined} Inline object or the referenced local source object.
   * @throws {Error} If a referenced target cannot be resolved.
   */
  const dereference = value => value?.$ref ? resolveRef(value.$ref, 'openapi.json') : value;
  /**
   * Extract schema-bearing media types, preserving no-body responses as empty maps.
   * @param {object|undefined} value - OpenAPI content map.
   * @returns {object} Media-type keys mapped to normalized schemas.
   * @throws {Error} If an included schema cannot be normalized.
   */
  function content(value) {
    return Object.fromEntries(Object.entries(value ?? {}).filter(([, entry]) => entry.schema !== undefined).map(([type, entry]) => [type, schema(entry.schema, 'openapi.json')]));
  }
  const operations = {};
  for (const [path, pathItem] of Object.entries(api.paths ?? {})) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (!methods.has(method)) continue;
      if (!operation.operationId || operations[operation.operationId]) throw new Error(`Missing/duplicate operationId: ${path}`);
      const merged = new Map();
      for (const item of [...(pathItem.parameters ?? []), ...(operation.parameters ?? [])]) {
        const param = dereference(item);
        if (!param.schema) throw new Error(`Unsupported parameter content: ${param.name}`);
        merged.set(`${param.in}:${param.name}`, { ...param, schema: schema(param.schema, 'openapi.json') });
      }
      const body = dereference(operation.requestBody);
      const responses = {}, responseHeaders = {};
      for (const [status, entry] of Object.entries(operation.responses ?? {})) {
        const response = dereference(entry);
        responses[status] = content(response.content);
        responseHeaders[status] = Object.fromEntries(Object.entries(response.headers ?? {}).map(([name, header]) => [name, schema(dereference(header).schema, 'openapi.json')]));
      }
      operations[operation.operationId] = { path, method, parameters: [...merged.values()], bodyRequired: body?.required ?? false, body: content(body?.content), responses, responseHeaders };
    }
  }
  /**
   * Resolve an absolute registry reference without loading remote documents.
   * @param {string} ref - Absolute normalized document ID plus JSON Pointer fragment.
   * @returns {unknown} Referenced normalized schema value.
   * @throws {Error} For unknown registry documents or missing pointer targets.
   * @throws {TypeError|URIError} For malformed URLs or encoded pointer segments.
   */
  function resolveSchema(ref) {
    const url = new URL(ref);
    const document = [httpDoc, runtimeDoc].find(item => item.$id === url.origin + url.pathname);
    if (!document) throw new Error(`Unsupported schema reference: ${ref}`);
    let value = document;
    for (const part of url.hash.slice(1).split('/').slice(1)) {
      const key = decodeURIComponent(part).replaceAll('~1', '/').replaceAll('~0', '~');
      if (!value || !Object.hasOwn(value, key)) throw new Error(`Unresolved schema reference: ${ref}`);
      value = value[key];
    }
    return value;
  }
  return { api, runtime, documents: [httpDoc, runtimeDoc], operations, resolve: resolveRef, resolveSchema };
}
/**
 * Read contract JSON sources and create their local schema/operation registry.
 * @param {string} [root] - Repository root; defaults to the current working directory.
 * @returns {object} Registry returned by createRegistry.
 * @throws {Error} If source files cannot be read or their contracts are unsupported.
 * @throws {SyntaxError} If either source is invalid JSON. No source files are modified.
 */
export function loadRegistry(root = process.cwd()) {
  /**
   * Read one JSON contract relative to the selected repository root.
   * @param {string} name - Contract source filename.
   * @returns {object} Parsed source document.
   * @throws {Error|SyntaxError} If the source cannot be read or parsed.
   */
  const read = name => JSON.parse(readFileSync(resolve(root, 'packages/contracts', name), 'utf8'));
  return createRegistry(read('openapi.json'), read('runtime.schema.json'));
}
