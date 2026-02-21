import 'reflect-metadata';
import { validateSync } from 'class-validator';
import { CreateOrderDto, OrderType } from '../src/orders/dto/create-order.dto';
import { UniqueSymbols } from '../src/orders/validators/unique-symbols.validator';
import { WeightsSumToOne } from '../src/orders/validators/weights-sum-to-one.validator';

const buildDto = (overrides?: Partial<CreateOrderDto>): CreateOrderDto => {
  const dto = new CreateOrderDto();
  Object.assign(dto, {
    orderType: OrderType.BUY,
    amount: 100,
    portfolio: [
      { symbol: 'AAPL', weight: 0.6 },
      { symbol: 'TSLA', weight: 0.4 },
    ],
    ...overrides,
  });
  return dto;
};

describe('Custom validators', () => {
  it('rejects non-array portfolio', () => {
    const dto = buildDto({ portfolio: 'bad' as any });
    const errors = validateSync(dto);
    const portfolioError = errors.find((err) => err.property === 'portfolio');
    expect(portfolioError).toBeDefined();
    expect(portfolioError?.constraints).toBeDefined();
  });

  it('rejects weights not summing to 1', () => {
    const dto = buildDto();
    dto.portfolio[1].weight = 0.5;
    const errors = validateSync(dto);
    const portfolioError = errors.find((err) => err.property === 'portfolio');
    expect(portfolioError).toBeDefined();
    expect(portfolioError?.constraints).toBeDefined();
  });

  it('rejects duplicate symbols', () => {
    const dto = buildDto();
    dto.portfolio[1].symbol = 'AAPL';
    const errors = validateSync(dto);
    const portfolioError = errors.find((err) => err.property === 'portfolio');
    expect(portfolioError).toBeDefined();
    expect(portfolioError?.constraints).toBeDefined();
  });

  it('handles weights validator errors', () => {
    const dto = buildDto();
    const badItem = {} as any;
    Object.defineProperty(badItem, 'weight', {
      get() {
        throw new Error('boom');
      },
    });
    dto.portfolio = [badItem];

    const errors = validateSync(dto);
    const portfolioError = errors.find((err) => err.property === 'portfolio');
    expect(portfolioError).toBeDefined();
  });

  it('emits UniqueSymbols default message', () => {
    class Dummy {
      @UniqueSymbols()
      portfolio!: Array<{ symbol: string }>;
    }

    const dto = new Dummy();
    dto.portfolio = [{ symbol: 'AAPL' }, { symbol: 'AAPL' }];
    const errors = validateSync(dto);
    const portfolioError = errors.find((err) => err.property === 'portfolio');
    expect(portfolioError?.constraints?.UniqueSymbols).toBe(
      'portfolio symbols must be unique',
    );
  });

  it('emits WeightsSumToOne default message and ignores non-numeric weights', () => {
    class Dummy {
      @WeightsSumToOne()
      portfolio!: Array<{ weight: any }>;
    }

    const dto = new Dummy();
    dto.portfolio = [{ weight: 'bad' }];
    const errors = validateSync(dto);
    const portfolioError = errors.find((err) => err.property === 'portfolio');
    expect(portfolioError?.constraints?.WeightsSumToOne).toBe(
      'portfolio weights must sum to 1.0',
    );
  });
});
