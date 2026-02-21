import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderRecord, OrdersService } from './orders.service';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { OrderResponseDto } from './dto/order-response.dto';

@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('split')
  @ApiOperation({ summary: 'Split a model portfolio order' })
  @ApiCreatedResponse({ description: 'Order split created', type: OrderResponseDto })
  @ApiBadRequestResponse({
    description: 'Validation error',
    type: ErrorResponseDto,
    schema: {
      example: {
        statusCode: 400,
        error: 'Bad Request',
        message: ['portfolio weights must sum to 1.0'],
      },
    },
  })
  createOrder(@Body() dto: CreateOrderDto): OrderRecord {
    return this.ordersService.createOrder(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List historic orders' })
  @ApiOkResponse({ description: 'Historic orders returned', type: [OrderResponseDto] })
  listOrders(): OrderRecord[] {
    return this.ordersService.listOrders();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a historic order by id' })
  @ApiParam({ name: 'id', required: true, example: 'ord_abc123', schema: { type: 'string' } })
  @ApiOkResponse({ description: 'Order returned', type: OrderResponseDto })
  @ApiNotFoundResponse({
    description: 'Order not found',
    type: ErrorResponseDto,
    schema: {
      example: {
        statusCode: 404,
        error: 'Not Found',
        message: 'Order not found',
      },
    },
  })
  getOrder(@Param('id') id: string): OrderRecord {
    const record = this.ordersService.getOrder(id);
    if (!record) {
      throw new NotFoundException('Order not found');
    }
    return record;
  }
}
