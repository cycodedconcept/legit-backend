import pino from 'pino';
export function createLogger(level = 'info') {
  return pino({level, redact:{paths:['password','token','authorization','cookie','req.headers.authorization','req.headers.cookie'], censor:'[REDACTED]'}});
}
