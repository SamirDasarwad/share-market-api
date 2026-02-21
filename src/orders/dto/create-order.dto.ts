import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsEnum,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { UniqueSymbols } from '../validators/unique-symbols.validator';
import { WeightsSumToOne } from '../validators/weights-sum-to-one.validator';

export enum OrderType {
  BUY = 'BUY',
  SELL = 'SELL',
}

export class PortfolioItemDto {
  @ApiProperty({ example: 'AAPL' })
  @IsString()
  @Matches(/^[A-Z]{1,10}$/)
  @Transform(({ value }) => String(value).trim().toUpperCase())
  symbol!: string;

  @ApiProperty({ example: 0.6, description: 'Weight as a decimal that sums to 1.0' })
  @IsNumber({ maxDecimalPlaces: 8 })
  @Min(0)
  @Max(1)
  weight!: number;

  @ApiProperty({ example: 195.12, required: false })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 6 })
  @IsPositive()
  price?: number;
}

export class CreateOrderDto {
  @ApiProperty({ enum: OrderType, example: OrderType.BUY })
  @IsEnum(OrderType)
  orderType!: OrderType;

  @ApiProperty({ example: 1000, description: 'Total USD amount to allocate' })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount!: number;

  @ApiProperty({ type: [PortfolioItemDto] })
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PortfolioItemDto)
  @UniqueSymbols({ message: 'portfolio symbols must be unique' })
  @WeightsSumToOne({ message: 'portfolio weights must sum to 1.0' })
  portfolio!: PortfolioItemDto[];
}
