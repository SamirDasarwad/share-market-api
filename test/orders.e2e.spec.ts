import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from '../src/app.module';
import { OrderType } from '../src/orders/dto/create-order.dto';
import { setupApp } from '../src/common/app-setup';

const buildApp = async (): Promise<NestFastifyApplication> => {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const adapter = new FastifyAdapter() as any;
  const app = moduleRef.createNestApplication(adapter);
  const fastifyApp = app as NestFastifyApplication;
  await setupApp(fastifyApp);
  await fastifyApp.init();
  await fastifyApp.getHttpAdapter().getInstance().ready();
  return fastifyApp;
};

describe('Orders API (e2e)', () => {
  let app: NestFastifyApplication;
  let fastify: any;

  beforeAll(async () => {
    app = await buildApp();
    fastify = app.getHttpAdapter().getInstance();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('splits an order and returns allocations', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/orders/split',
      payload: {
        orderType: OrderType.BUY,
        amount: 100,
        portfolio: [
          { symbol: 'AAPL', weight: 0.6 },
          { symbol: 'TSLA', weight: 0.4 },
        ],
      },
    });

    expect(response.statusCode).toBe(201);
    const body = response.json();
    expect(body.allocations).toHaveLength(2);
    expect(body.allocations[0].amount).toBe(60);
  });

  it('returns swagger docs', async () => {
    const docs = await fastify.inject({ method: 'GET', url: '/docs' });
    expect(docs.statusCode).toBe(200);
    const json = await fastify.inject({ method: 'GET', url: '/docs-json' });
    expect(json.statusCode).toBe(200);
  });
});
