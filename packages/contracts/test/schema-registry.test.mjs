import test from 'node:test';
import assert from 'node:assert/strict';
import { loadRegistry, createRegistry } from '../../../scripts/contracts/schema-registry.mjs';

test('all source operations and runtime definitions are registered', () => {
  const registry = loadRegistry();
  assert.equal(Object.keys(registry.operations).length, 109);
  assert.equal(Object.keys(registry.runtime.$defs).length, 22);
  assert.equal(registry.resolve('runtime.schema.json#/$defs/ClimbCount').$ref, 'openapi.json#/components/schemas/ClimbCount');
  assert.ok(registry.operations.createPersonalRecord.body['application/json']);
});
test('local pointers escape correctly and unresolved or remote refs fail', () => {
  const api = { components: { schemas: { 'a/b~c': { type: 'string' } } }, paths: {} };
  const runtime = { $defs: { Child: { $ref: 'openapi.json#/components/schemas/a~1b~0c' } } };
  assert.equal(createRegistry(api, runtime).resolve('openapi.json#/components/schemas/a~1b~0c').type, 'string');
  for (const ref of ['#/missing', 'https://example.com/schema', 'openapi.json#']) {
    assert.throws(() => createRegistry(api, { $defs: { Child: { $ref: ref } } }), /reference/);
  }
});
test('unknown validation keywords fail; recursive schemas stay references', () => {
  assert.throws(() => createRegistry({ paths: {}, components: { schemas: { Bad: { type: 'string', minLenght: 2 } } } }, { $defs: {} }), /minLenght/);
  const registry = createRegistry({ paths: {}, components: { schemas: { Node: { type: 'object', properties: { next: { $ref: '#/components/schemas/Node' } } } } } }, { $defs: {} });
  assert.match(registry.documents[0].$defs.Node.properties.next.$ref, /Node$/);
});
test('operation override, body, response and headers are extracted', () => {
  const string = { type: 'string' };
  const registry = createRegistry({ components: { schemas: {} }, paths: { '/x': {
    parameters: [{ in: 'query', name: 'n', schema: string }],
    get: { operationId: 'getX', parameters: [{ in: 'query', name: 'n', schema: { type: 'integer' } }], requestBody: { content: { 'application/json': { schema: string } } }, responses: { 200: { headers: { ETag: { schema: string } }, content: { 'application/json': { schema: string } } }, 204: {} } },
  } } }, { $defs: {} });
  assert.equal(registry.operations.getX.parameters[0].schema.type, 'integer');
  assert.equal(registry.operations.getX.responseHeaders['200'].ETag.type, 'string');
  assert.deepEqual(registry.operations.getX.responses['204'], {});
});
