import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe, VersioningType, Logger } from '@nestjs/common';
import fastifyCookie from '@fastify/cookie';
import fastifyMultipart from '@fastify/multipart';
import fastifyHelmet from '@fastify/helmet';
import { AppModule } from './app.module';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

const REQUIRED_ENV_VARS = [
  'SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_ANON_KEY',
  'COOKIE_SECRET',
  'NEXT_REVALIDATION_URL',
  'NEXT_REVALIDATION_SECRET',
];

function validateEnv(): void {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing env vars: ${missing.join(', ')}`);
  }
  const redisDisabled = process.env['REDIS_DISABLED'] === 'true';
  // Require either REDIS_URL or REDIS_HOST
  if (!redisDisabled && !process.env['REDIS_URL'] && !process.env['REDIS_HOST']) {
    throw new Error('Missing env vars: REDIS_URL or REDIS_HOST is required');
  }
  if (process.env.SUPABASE_SERVICE_ROLE_KEY === process.env.SUPABASE_ANON_KEY) {
    throw new Error('SERVICE_ROLE_KEY must not equal ANON_KEY');
  }
}

async function bootstrap(): Promise<void> {
  const logger = new Logger('Bootstrap');

  // Fail fast if env vars are missing
  validateEnv();

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: false }),
  );

  // Register Fastify plugins
  await app.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET,
  });
  await app.register(fastifyMultipart, {
    limits: { fileSize: 15 * 1024 * 1024 }, // 15MB
  });
  await app.register(fastifyHelmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'blob:', '*.supabase.co', 'storage.expertly.net', 'storage.expertly.network'],
        fontSrc: ["'self'", 'fonts.googleapis.com', 'fonts.gstatic.com'],
        frameSrc: ["'none'"],
        connectSrc: ["'self'", '*.supabase.co'],
      },
    },
  });

  // CORS
  const isProd = process.env.NODE_ENV === 'production';
  const prodOrigins = ['https://expertly.net', 'https://www.expertly.net', 'https://expertly.network', 'https://www.expertly.network'];
  const isLocalDevOrigin = (origin: string): boolean =>
    /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow non-browser / server-to-server calls without Origin header.
      if (!origin) {
        callback(null, true);
        return;
      }

      if (isProd) {
        callback(null, prodOrigins.includes(origin));
        return;
      }

      callback(null, isLocalDevOrigin(origin));
    },
    credentials: true,
    maxAge: 86400,
  });

  // URI versioning: /api/v1/...
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
    prefix: 'api/v',
  });

  // Global pipes, interceptors, filters
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalInterceptors(new LoggingInterceptor(), new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = parseInt(process.env.PORT ?? '4001', 10);
  // Bind dual-stack so localhost resolution to ::1 or 127.0.0.1 both work in dev.
  await app.listen(port, '::');
  logger.log(`API running on http://localhost:${port}`);
}

bootstrap().catch((err: unknown) => {
  console.error('Fatal error during bootstrap:', err);
  process.exit(1);
});
