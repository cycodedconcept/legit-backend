import { z } from 'zod';
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'silent']).default('info'),
  DB_HOST: z.string().min(1), DB_PORT: z.coerce.number().int().min(1).max(65535).default(3306),
  DB_NAME: z.string().regex(/^[a-zA-Z0-9_]+$/), DB_USER: z.string().min(1), DB_PASSWORD: z.string().min(1),
  DB_TLS: z.enum(['true', 'false']).default('false').transform(v => v === 'true'),
}).refine(v => v.NODE_ENV !== 'production' || v.DB_TLS, {path:['DB_TLS'], message:'TLS required'});
export function readConfig(env: NodeJS.ProcessEnv = process.env) {
  const result = schema.safeParse(env);
  if (!result.success) throw new Error(`Invalid configuration: ${[...new Set(result.error.issues.map(i => i.path.join('.')))].join(', ')}`);
  return result.data;
}
export type Config = ReturnType<typeof readConfig>;
