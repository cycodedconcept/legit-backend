import mysql from 'mysql2/promise';
import type { Config } from '../config.js';
export function createPool(config: Config) {
  return mysql.createPool({host:config.DB_HOST, port:config.DB_PORT, database:config.DB_NAME,
    user:config.DB_USER, password:config.DB_PASSWORD, ssl:config.DB_TLS ? {rejectUnauthorized:true} : undefined,
    connectionLimit:5, waitForConnections:false, connectTimeout:2000, supportBigNumbers:true, bigNumberStrings:true,
    timezone:'Z', multipleStatements:false});
}
export function readiness(pool: mysql.Pool) {
  return async () => { await pool.query({sql:'SELECT 1', timeout:2000}); };
}
