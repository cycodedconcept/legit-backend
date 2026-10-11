import { readConfig } from '../src/config.js';
import { createPool } from '../src/db/pool.js';
export function testConfig(env: NodeJS.ProcessEnv = process.env) {
  if (env.NODE_ENV === 'production' || env.DB_NAME || env.DB_HOST) throw new Error('Tests refuse application database configuration');
  if (!env.TEST_DB_PASSWORD) throw new Error('TEST_DB_PASSWORD required');
  if (env.TEST_DB_HOST && !['127.0.0.1','localhost'].includes(env.TEST_DB_HOST)) throw new Error('Tests require loopback MySQL');
  if (env.TEST_DB_PORT && env.TEST_DB_PORT !== '3307') throw new Error('Tests require dedicated port 3307');
  return readConfig({NODE_ENV:'test', DB_HOST:'127.0.0.1', DB_PORT:'3307', DB_NAME:'legit_test_b01', DB_USER:'legit_test', DB_PASSWORD:env.TEST_DB_PASSWORD});
}
export function testPool() { return createPool(testConfig()); }
