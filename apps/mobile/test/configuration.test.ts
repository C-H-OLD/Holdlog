import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readDevelopmentOrigins } from '../configuration/development-origin.cjs';

void test('requires both host settings and never discloses rejected values', () => {
  const valid = { EXPO_PUBLIC_DEV_API_ORIGIN_IOS: 'http://127.0.0.1:3100', EXPO_PUBLIC_DEV_API_ORIGIN_ANDROID: 'http://10.0.2.2:3100' };
  assert.deepEqual(readDevelopmentOrigins(valid), { ios: valid.EXPO_PUBLIC_DEV_API_ORIGIN_IOS, android: valid.EXPO_PUBLIC_DEV_API_ORIGIN_ANDROID });
  for (const invalid of [undefined, '', 'https://user:synthetic-secret@localhost', 'https://example.com', 'http://127.0.0.1:3100/path', 'http://localhost:3100?secret=synthetic-secret']) {
    assert.throws(() => readDevelopmentOrigins({ ...valid, EXPO_PUBLIC_DEV_API_ORIGIN_IOS: invalid }), error => error instanceof Error && error.message === 'Missing or invalid setting: EXPO_PUBLIC_DEV_API_ORIGIN_IOS');
  }
});
void test('Android emulator does not silently use its own loopback host', () => {
  assert.throws(() => readDevelopmentOrigins({ EXPO_PUBLIC_DEV_API_ORIGIN_IOS: 'http://localhost:3100', EXPO_PUBLIC_DEV_API_ORIGIN_ANDROID: 'http://127.0.0.1:3100' }), /EXPO_PUBLIC_DEV_API_ORIGIN_ANDROID/);
});
