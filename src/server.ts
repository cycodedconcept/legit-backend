import { readConfig } from './config.js';
import { createLogger } from './logger.js';
import { createPool, readiness } from './db/pool.js';
import { createApp } from './app.js';
const logger = createLogger();
try {
  const config = readConfig();
  logger.level = config.LOG_LEVEL;
  const pool = createPool(config);
  const server = createApp(readiness(pool), logger).listen(config.PORT, () => logger.info({port:config.PORT}, 'listening'));
  server.on('error', () => { logger.fatal('HTTP server failed'); process.exit(1); });
  let stopping = false;
  const stop = () => {
    if (stopping) return;
    stopping = true;
    const timer = setTimeout(() => process.exit(1), 10000).unref();
    server.close(() => { void pool.end().then(() => {clearTimeout(timer); process.exit(0);}, () => process.exit(1)); });
  };
  process.on('SIGTERM', stop); process.on('SIGINT', stop);
} catch { logger.fatal('Startup failed: check required configuration'); process.exitCode = 1; }
