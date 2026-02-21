import 'reflect-metadata';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { OrdersController } from '../src/orders/orders.controller';
import { OrdersService, OrderRecord } from '../src/orders/orders.service';
import { OrderType } from '../src/orders/dto/create-order.dto';

describe('OrdersController', () => {
  let controller: OrdersController;
  let service: OrdersService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: {
            createOrder: jest.fn(),
            listOrders: jest.fn(),
            getOrder: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = moduleRef.get(OrdersController);
    service = moduleRef.get(OrdersService);
  });

  it('lists orders', () => {
    const records: OrderRecord[] = [];
    jest.spyOn(service, 'listOrders').mockReturnValue(records);
    expect(controller.listOrders()).toBe(records);
  });

  it('returns order by id', () => {
    const record: OrderRecord = {
      id: 'ord_1',
      orderType: OrderType.BUY,
      amount: 100,
      createdAt: '2026-02-21T10:00:00.000Z',
      executeAt: '2026-02-21T10:00:00.000Z',
      allocations: [],
    };
    jest.spyOn(service, 'getOrder').mockReturnValue(record);
    expect(controller.getOrder('ord_1')).toBe(record);
  });

  it('throws NotFound when order missing', () => {
    jest.spyOn(service, 'getOrder').mockReturnValue(undefined);
    expect(() => controller.getOrder('missing')).toThrow(NotFoundException);
  });
});
