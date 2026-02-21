import { ValidationPipe } from '@nestjs/common';
import { NestFastifyApplication } from '@nestjs/platform-fastify';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { ResponseTimeInterceptor } from './response-time.interceptor';
import { setupSwagger } from './swagger';

export async function setupApp(app: NestFastifyApplication): Promise<void> {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      forbidUnknownValues: true,
    }),
  );

  app.useGlobalInterceptors(new ResponseTimeInterceptor());

  await app.register(helmet);
  await app.register(rateLimit, { max: 100, timeWindow: '1 minute' });

  setupSwagger(app);

  app.enableShutdownHooks();
}
