import 'reflect-metadata';
import { OrdersService } from '../src/orders/orders.service';
import { OrderType } from '../src/orders/dto/create-order.dto';

const createService = () => new OrdersService();

describe('OrdersService', () => {
  beforeAll(() => {
    process.env.SHARE_DECIMALS = '3';
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('splits an order using default price when no price is provided', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-02-18T15:00:00.000Z'));
    const service = createService();
    const order = service.createOrder({
      orderType: OrderType.BUY,
      amount: 100,
      portfolio: [
        { symbol: 'AAPL', weight: 0.6 },
        { symbol: 'TSLA', weight: 0.4 },
      ],
    });

    expect(order.allocations[0].amount).toBe(60);
    expect(order.allocations[0].quantity).toBe(0.6);
    expect(order.allocations[1].amount).toBe(40);
    expect(order.allocations[1].quantity).toBe(0.4);
  });

  it('uses provided market price when supplied', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-02-18T15:00:00.000Z'));
    const service = createService();
    const order = service.createOrder({
      orderType: OrderType.SELL,
      amount: 100,
      portfolio: [
        { symbol: 'AAPL', weight: 1, price: 50 },
      ],
    });

    expect(order.allocations[0].priceUsed).toBe(50);
    expect(order.allocations[0].quantity).toBe(2);
  });

  it('schedules execution for next Monday when today is weekend', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-02-21T12:00:00.000Z'));
    const service = createService();
    const order = service.createOrder({
      orderType: OrderType.BUY,
      amount: 100,
      portfolio: [{ symbol: 'AAPL', weight: 1 }],
    });

    expect(order.executeAt.startsWith('2026-02-23')).toBe(true);
  });

  it('executes immediately on weekdays', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-02-18T12:00:00.000Z'));
    const service = createService();
    const order = service.createOrder({
      orderType: OrderType.BUY,
      amount: 100,
      portfolio: [{ symbol: 'AAPL', weight: 1 }],
    });

    expect(order.executeAt.startsWith('2026-02-18')).toBe(true);
  });

  it('lists and finds orders', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-02-18T12:00:00.000Z'));
    const service = createService();
    const order = service.createOrder({
      orderType: OrderType.BUY,
      amount: 100,
      portfolio: [{ symbol: 'AAPL', weight: 1 }],
    });

    const list = service.listOrders();
    expect(list.length).toBe(1);
    expect(service.getOrder(order.id)?.id).toBe(order.id);
  });

  it('falls back to default share decimals when config is invalid', () => {
    process.env.SHARE_DECIMALS = 'bad';
    const service = createService();
    const order = service.createOrder({
      orderType: OrderType.BUY,
      amount: 100,
      portfolio: [{ symbol: 'AAPL', weight: 1 }],
    });
    expect(order.allocations[0].quantity).toBe(1);
    process.env.SHARE_DECIMALS = '3';
  });
});
