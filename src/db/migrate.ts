import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import type { Pool, RowDataPacket } from 'mysql2/promise';
export async function migrate(pool: Pool, directory = new URL('../../migrations/', import.meta.url)) {
  const connection = await pool.getConnection();
  let locked = false;
  try {
    const [lock] = await connection.query<RowDataPacket[]>("SELECT GET_LOCK(CONCAT(DATABASE(), ':migrate'), 10) AS acquired");
    if (String(lock[0]?.acquired) !== '1') throw new Error('Migration lock unavailable');
    locked = true;
    await connection.query('CREATE TABLE IF NOT EXISTS schema_migrations (name VARCHAR(255) PRIMARY KEY, checksum CHAR(64) NOT NULL, applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB');
    for (const name of (await readdir(directory)).filter(n => /^\d+.*\.sql$/.test(n)).sort()) {
      const sql = await readFile(new URL(name, directory), 'utf8');
      const checksum = createHash('sha256').update(sql).digest('hex');
      const [rows] = await connection.execute<RowDataPacket[]>('SELECT checksum FROM schema_migrations WHERE name=?', [name]);
      if (rows.length) {
        if (rows[0]?.checksum !== checksum) throw new Error('Applied migration checksum mismatch');
        continue;
      }
      // One restart-safe DDL statement per migration; MySQL DDL is not transactional.
      await connection.query(sql);
      await connection.execute('INSERT INTO schema_migrations (name, checksum) VALUES (?, ?)', [name, checksum]);
    }
  } finally {
    if (locked) await connection.query("SELECT RELEASE_LOCK(CONCAT(DATABASE(), ':migrate'))").catch(() => undefined);
    connection.release();
  }
}
