import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readDevelopmentOrigin,readAdministratorDevelopmentOrigin } from '../node-checks/development-origin.ts';

void test('missing and unsafe development origins fail with setting name only', () => {
  for (const origin of [undefined, '', 'https://user:synthetic-secret@localhost:3100', 'http://example.com:3100', 'file:///tmp/test', 'http://localhost:3100/api/v1', 'http://localhost:3100?token=synthetic-secret', 'http://0.0.0.0:3100']) {
    assert.throws(() => readDevelopmentOrigin({ ADMIN_DEV_API_ORIGIN: origin }), error => error instanceof Error && error.message === 'Missing or invalid setting: ADMIN_DEV_API_ORIGIN');
  }
});
void test('a local development origin is retained only in Node configuration', () => {
  assert.equal(readDevelopmentOrigin({ ADMIN_DEV_API_ORIGIN: 'http://127.0.0.1:3100' }), 'http://127.0.0.1:3100');
  assert.equal(readDevelopmentOrigin({ ADMIN_DEV_API_ORIGIN: 'https://localhost:3100' }), 'https://localhost:3100');
});

void test('administrator HTTPS proxy allows plaintext only on loopback and preserves verified HTTPS upstreams',()=>{
  assert.equal(readAdministratorDevelopmentOrigin({ADMIN_DEV_API_ORIGIN:'http://127.0.0.1:3100'}),'http://127.0.0.1:3100');
  assert.equal(readAdministratorDevelopmentOrigin({ADMIN_DEV_API_ORIGIN:'https://10.1.2.3:3100'}),'https://10.1.2.3:3100');
  for(const host of ['10.1.2.3','192.168.1.5','172.16.1.2'])assert.throws(()=>readAdministratorDevelopmentOrigin({ADMIN_DEV_API_ORIGIN:'http://'+host+':3100'}),{message:'Missing or invalid setting: ADMIN_DEV_API_ORIGIN'});
});
