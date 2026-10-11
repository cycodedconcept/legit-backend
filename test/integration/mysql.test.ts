import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';
import request from 'supertest';
import pino from 'pino';
import type { Pool, RowDataPacket } from 'mysql2/promise';
import { testPool, testConfig } from '../database.js';
import { migrate } from '../../src/db/migrate.js';
import { createPool, readiness } from '../../src/db/pool.js';
import { createApp } from '../../src/app.js';
describe('isolated real MySQL', () => {
  let pool: Pool;
  before(async () => {
    pool=testPool();
    const [rows]=await pool.query<RowDataPacket[]>('SELECT VERSION() AS version');
    assert.match(rows[0]?.version,/^8\.4\./);
    assert.doesNotMatch(rows[0]?.version,/MariaDB/i);
    console.log(`Database evidence: MySQL ${rows[0]?.version}`);
    await pool.query('DROP TABLE IF EXISTS service_metadata');
    await pool.query('DROP TABLE IF EXISTS schema_migrations');
  });
  after(async () => {if(pool) await pool.end();});
  it('applies clean migrations and serializes concurrent replays', async () => {
    await Promise.all([migrate(pool),migrate(pool)]);
    await migrate(pool);
    const [rows]=await pool.query<RowDataPacket[]>('SELECT COUNT(*) AS count FROM schema_migrations');
    assert.equal(String(rows[0]?.count),'1');
    await pool.query('SELECT * FROM service_metadata');
  });
  it('rejects modified applied migrations', async () => {
    const directory=await mkdtemp(`${tmpdir()}/legit-migration-`);
    try {
      await writeFile(`${directory}/001_foundation.sql`,'SELECT 2');
      await assert.rejects(migrate(pool,pathToFileURL(`${directory}/`)),/checksum/);
    } finally {await rm(directory,{recursive:true});}
  });
  it('recovers DDL applied before migration history was persisted', async () => {
    await pool.query('DELETE FROM schema_migrations');
    await migrate(pool);
    const [rows]=await pool.query<RowDataPacket[]>('SELECT COUNT(*) AS count FROM schema_migrations');
    assert.equal(String(rows[0]?.count),'1');
  });
  it('proves readiness against live MySQL and a refused connection', async () => {
    await request(createApp(readiness(pool),pino({level:'silent'}))).get('/ready').expect(200);
    const unavailable=createPool({...testConfig(),DB_PORT:1});
    try {await request(createApp(readiness(unavailable),pino({level:'silent'}))).get('/ready').expect(503);}
    finally {await unavailable.end();}
  });
});
