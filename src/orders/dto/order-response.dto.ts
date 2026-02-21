import { ApiProperty } from '@nestjs/swagger';
import { OrderType } from './create-order.dto';

export class AllocationDto {
  @ApiProperty({ example: 'AAPL' })
  symbol!: string;

  @ApiProperty({ example: 0.6 })
  weight!: number;

  @ApiProperty({ example: 100 })
  priceUsed!: number;

  @ApiProperty({ example: 60 })
  amount!: number;

  @ApiProperty({ example: 0.6 })
  quantity!: number;
}

export class OrderResponseDto {
  @ApiProperty({ example: 'ord_abc123' })
  id!: string;

  @ApiProperty({ enum: OrderType, example: OrderType.BUY })
  orderType!: OrderType;

  @ApiProperty({ example: 100 })
  amount!: number;

  @ApiProperty({ example: '2026-02-21T10:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2026-02-21T10:00:00.000Z' })
  executeAt!: string;

  @ApiProperty({ type: [AllocationDto] })
  allocations!: AllocationDto[];
}
