import { readConfig } from '../config.js';
import { createPool } from './pool.js';
import { migrate } from './migrate.js';
try {
  const pool = createPool(readConfig());
  try { await migrate(pool); console.log('Migrations applied'); } finally { await pool.end(); }
} catch { console.error('Migration failed; check configuration, database availability and migration integrity'); process.exitCode=1; }
