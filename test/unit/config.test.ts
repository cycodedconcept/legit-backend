import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { readConfig } from '../../src/config.js';
import { testConfig } from '../database.js';
const valid = {DB_HOST:'localhost', DB_NAME:'example', DB_USER:'example', DB_PASSWORD:'SECRET_SENTINEL'};
describe('configuration and isolation', () => {
  it('validates defaults', () => assert.equal(readConfig(valid).PORT, 4000));
  it('requires every database setting without leaking values', () => {
    for (const key of Object.keys(valid)) {
      assert.throws(() => readConfig({...valid, [key]:undefined}), error => error instanceof Error && !error.message.includes('SECRET_SENTINEL'));
    }
  });
  it('rejects invalid ports and production without TLS', () => {
    for (const PORT of ['0','65536','abc']) assert.throws(() => readConfig({...valid,PORT}));
    assert.throws(() => readConfig({...valid,NODE_ENV:'production'}));
    assert.equal(readConfig({...valid,NODE_ENV:'production',DB_TLS:'true'}).DB_TLS,true);
  });
  it('fails startup safely before binding a port', () => {
    const result = spawnSync(process.execPath,['--import','tsx','src/server.ts'], {env:{PATH:process.env.PATH, DB_PASSWORD:'SECRET_SENTINEL'},encoding:'utf8',timeout:10000});
    assert.equal(result.status,1);
    assert.match(result.stdout,/Startup failed/);
    assert.doesNotMatch(result.stdout+result.stderr,/SECRET_SENTINEL/);
  });
  it('refuses production, application configuration and remote database targets', () => {
    for (const bad of [{NODE_ENV:'production'}, {DB_NAME:'production'}, {DB_HOST:'localhost'}, {TEST_DB_HOST:'db.example.com'}, {TEST_DB_PORT:'3306'}]) {
      assert.throws(() => testConfig({TEST_DB_PASSWORD:'synthetic',...bad}));
    }
    assert.throws(() => testConfig({}));
    assert.equal(testConfig({TEST_DB_PASSWORD:'synthetic'}).DB_NAME,'legit_test_b01');
  });
});
