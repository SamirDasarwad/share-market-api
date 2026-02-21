import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { setupApp } from '../src/common/app-setup';
import { bootstrap } from '../src/main';

jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn(),
  },
}));

jest.mock('../src/common/app-setup', () => ({
  setupApp: jest.fn(),
}));

describe('bootstrap', () => {
  it('starts app with configured port', async () => {
    const listen = jest.fn().mockResolvedValue(undefined);
    const app = { listen } as any;

    (NestFactory.create as jest.Mock).mockResolvedValue(app);
    const logSpy = jest.spyOn(Logger, 'log').mockImplementation();

    process.env.PORT = '4000';
    await bootstrap();

    expect(setupApp).toHaveBeenCalled();
    expect(listen).toHaveBeenCalledWith({ port: 4000, host: '0.0.0.0' });
    expect(logSpy).toHaveBeenCalled();

    logSpy.mockRestore();
    delete process.env.PORT;
  });
});
