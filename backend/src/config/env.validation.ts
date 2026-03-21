import { z } from 'zod';

const toNumber = (defaultValue: number) =>
  z.preprocess((value) => {
    if (value === undefined || value === null || value === '') {
      return defaultValue;
    }
    const parsed = Number(value);
    return Number.isNaN(parsed) ? value : parsed;
  }, z.number().int().positive());

const toBoolean = (defaultValue: boolean) =>
  z.preprocess((value) => {
    if (value === undefined || value === null || value === '') {
      return defaultValue;
    }
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return value;
  }, z.boolean());

const envSchema = z
  .object({
    NODE_ENV: z
      .enum(['development', 'production', 'test'])
      .default('development'),
    PORT: toNumber(3000),
    DATABASE_URL: z
      .string()
      .min(1)
      .default('mysql://root:@localhost:3306/invoicely'),
    GEMINI_API_KEY: z.string().optional(),
    EXCHANGE_RATE_API_KEY: z.string().optional(),
    EXCHANGE_RATE_API_URL: z
      .string()
      .url()
      .optional()
      .default('https://v6.exchangerate-api.com/v6'),
    JWT_SECRET: z.string().min(8).default('change-me-in-production'),
    JWT_EXPIRES_IN: z.string().default('7d'),
    THROTTLE_LIMIT: toNumber(120),
    THROTTLE_TTL: toNumber(60),
    CACHE_TTL_MS: z.string().optional(),
    CORS_ORIGIN: z.string().default('http://localhost:5173'),
    LOG_LEVEL: z.string().default('debug'),
    REDIS_URL: z.string().optional(),
    UPLOADS_DIR: z.string().default('./uploads'),
    CSRF_ORIGIN_CHECK_ENABLED: toBoolean(false),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV === 'production') {
      if (
        !env.JWT_SECRET ||
        env.JWT_SECRET === 'change-me-in-production' ||
        env.JWT_SECRET.length < 32
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['JWT_SECRET'],
          message:
            'JWT_SECRET must be set with at least 32 characters in production',
        });
      }

      if (!env.CORS_ORIGIN || env.CORS_ORIGIN.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['CORS_ORIGIN'],
          message: 'CORS_ORIGIN must be set in production',
        });
      }
    }
  });

export function validateEnv(config: Record<string, unknown>) {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join('.') || 'env'}: ${issue.message}`)
      .join(', ');
    throw new Error(`Invalid environment configuration: ${details}`);
  }

  return result.data;
}
