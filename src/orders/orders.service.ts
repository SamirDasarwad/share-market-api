import { Injectable } from '@nestjs/common';
import Decimal from 'decimal.js';
import { CreateOrderDto, OrderType } from './dto/create-order.dto';

export interface Allocation {
  symbol: string;
  weight: number;
  priceUsed: number;
  amount: number;
  quantity: number;
}

export interface OrderRecord {
  id: string;
  orderType: OrderType;
  amount: number;
  createdAt: string;
  executeAt: string;
  allocations: Allocation[];
}

@Injectable()
export class OrdersService {
  private readonly orders: OrderRecord[] = [];
  private readonly defaultPrice = new Decimal(100);
  private readonly shareDecimals: number;

  constructor() {
    const configured = Number(process.env.SHARE_DECIMALS ?? 3);
    this.shareDecimals = Number.isInteger(configured) && configured >= 0 && configured <= 10
      ? configured
      : 3;
  }

  createOrder(dto: CreateOrderDto): OrderRecord {
    const totalAmount = new Decimal(dto.amount);
    const allocations: Allocation[] = dto.portfolio.map((item) => {
      const price = item.price !== undefined ? new Decimal(item.price) : this.defaultPrice;
      const amount = totalAmount.mul(item.weight).toDecimalPlaces(2, Decimal.ROUND_HALF_UP);
      const quantity = amount
        .div(price)
        .toDecimalPlaces(this.shareDecimals, Decimal.ROUND_HALF_UP);

      return {
        symbol: item.symbol,
        weight: item.weight,
        priceUsed: Number(price.toFixed(6)),
        amount: Number(amount.toFixed(2)),
        quantity: Number(quantity.toFixed(this.shareDecimals)),
      };
    });

    const now = new Date();
    const executeAt = this.getExecutionTime(now);
    const record: OrderRecord = {
      id: this.generateId(),
      orderType: dto.orderType,
      amount: Number(totalAmount.toFixed(2)),
      createdAt: now.toISOString(),
      executeAt: executeAt.toISOString(),
      allocations,
    };

    this.orders.unshift(record);
    return record;
  }

  listOrders(): OrderRecord[] {
    return [...this.orders];
  }

  getOrder(id: string): OrderRecord | undefined {
    return this.orders.find((order) => order.id === id);
  }

  private getExecutionTime(now: Date): Date {
    const day = now.getDay();
    if (day >= 1 && day <= 5) {
      return now;
    }
    const next = new Date(now);
    const daysUntilMonday = (8 - day) % 7;
    next.setDate(now.getDate() + daysUntilMonday);
    next.setHours(9, 30, 0, 0);
    return next;
  }

  private generateId(): string {
    return `ord_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
  }
}
