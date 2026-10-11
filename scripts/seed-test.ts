import { testPool } from '../test/database.js';
import { migrate } from '../src/db/migrate.js';
const pool = testPool();
try {
  await migrate(pool);
  await pool.execute("INSERT INTO service_metadata (name,value) VALUES ('fixture','b01-synthetic') ON DUPLICATE KEY UPDATE value=VALUES(value)");
  console.log('Synthetic fixture: service_metadata.name=fixture; health routes need no fixture IDs');
} finally { await pool.end(); }
