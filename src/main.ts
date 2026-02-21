import 'reflect-metadata';
/* istanbul ignore file */
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { setupApp } from './common/app-setup';

export async function bootstrap(): Promise<void> {
  const adapter = new FastifyAdapter({ logger: false }) as any;
  const app = await NestFactory.create(AppModule, adapter);
  const fastifyApp = app as NestFastifyApplication;

  await setupApp(fastifyApp);

  const port = Number(process.env.PORT ?? 3000);
  await fastifyApp.listen({ port, host: '0.0.0.0' });
  Logger.log(`API listening on http://localhost:${port}`);
}

if (require.main === module) {
  void bootstrap();
}
