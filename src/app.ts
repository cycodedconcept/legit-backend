import express, { type ErrorRequestHandler } from 'express';
import { randomUUID } from 'node:crypto';
import type { Logger } from 'pino';
export class HttpError extends Error {
  constructor(public status: number, public code: string, message: string) { super(message); }
}
export function createApp(checkReady: () => Promise<void>, logger: Logger) {
  const app = express();
  app.disable('x-powered-by');
  app.use((_req, res, next) => {
    const requestId = randomUUID();
    res.locals.requestId = requestId;
    res.set({'X-Request-ID':requestId, 'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
    const start = performance.now();
    res.on('finish', () => logger.info({requestId, status:res.statusCode, durationMs:Math.round(performance.now()-start)}, 'request completed'));
    next();
  });
  app.use(express.json({limit:'16kb'}));
  const success = (res: express.Response, data: unknown) => res.json({data, meta:{requestId:res.locals.requestId}});
  app.get('/health', (_req, res) => success(res, {status:'ok'}));
  app.get('/ready', async (_req, res) => {
    try { await checkReady(); } catch { throw new HttpError(503, 'NOT_READY', 'Service is not ready'); }
    success(res, {status:'ready'});
  });
  app.use('/api/v1', express.Router());
  app.use((_req, _res, next) => next(new HttpError(404, 'NOT_FOUND', 'Route not found')));
  const errors: ErrorRequestHandler = (err: unknown, _req, res, _next) => {
    let status = 500, code = 'INTERNAL_ERROR', message = 'An unexpected error occurred';
    if (err instanceof HttpError) ({status, code, message} = err);
    else if (typeof err === 'object' && err !== null && 'type' in err) {
      if (err.type === 'entity.parse.failed') { status=400; code='INVALID_JSON'; message='Invalid JSON body'; }
      if (err.type === 'entity.too.large') { status=413; code='BODY_TOO_LARGE'; message='Request body too large'; }
    }
    // Only allowlisted metadata: never log raw exceptions, URLs, headers or bodies.
    logger.warn({requestId:res.locals.requestId, status, code}, 'request failed');
    res.status(status).json({error:{code, message}, meta:{requestId:res.locals.requestId}});
  };
  app.use(errors);
  return app;
}
