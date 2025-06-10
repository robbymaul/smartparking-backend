import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { CONFIG } from '../config/config.schema';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  CreateBookingDto,
  CreateBookingResponseDto,
} from '../bookings/dto/create-booking.dto';
import {
  WebErrorResponse,
  WebSuccessResponse,
} from '../common/constant/web.response';
import { JWTAuthorization } from '../common/decorators/auth.decorator';
import { ProcessPaymentDto } from './dto/process.payment.dto';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { PaymentsService } from './payments.service';
import { PaymentMethodResponseDto } from './dto/save.payment.method.dto';

@Controller(CONFIG.HEADER_API)
export class PaymentsController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly paymentsService: PaymentsService,
  ) {}

  @ApiOperation({ summary: 'process payment as user' })
  @ApiBody({
    description: 'process payment credentials',
    type: CreateBookingDto,
  })
  @ApiOkResponse({
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        status: { type: 'boolean', example: true },
        data: {
          $ref: getSchemaPath(CreateBookingResponseDto),
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'process payment Bad Request',
    type: WebErrorResponse,
  })
  @ApiBearerAuth()
  @Post('/payments/:id')
  @HttpCode(HttpStatus.OK)
  async processPayment(
    @JWTAuthorization() user: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() request: ProcessPaymentDto,
  ): Promise<WebSuccessResponse<any>> {
    this.logger.debug('Register request body', request);

    const result = await this.paymentsService.processPaymentService(
      id,
      user,
      request,
    );

    return {
      code: HttpStatus.OK,
      status: true,
      data: result,
    };
  }

  @ApiOperation({ summary: 'callback payment as user' })
  @ApiBody({
    description: 'callback payment credentials',
    type: CreateBookingDto,
  })
  @ApiOkResponse({
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        status: { type: 'boolean', example: true },
        data: {
          $ref: getSchemaPath(CreateBookingResponseDto),
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'create payment Bad Request',
    type: WebErrorResponse,
  })
  @Post('/payments/midtrans/callback')
  @HttpCode(HttpStatus.OK)
  async callbackPayment(
    @Headers() headers: any, // or just `any`
    @Body() notification: any,
  ): Promise<WebSuccessResponse<any>> {
    this.logger.debug('Midtrans callback headers', headers);
    this.logger.debug('Midtrans callback body', notification);

    await this.paymentsService.handleMidtransCallbackService(
      notification,
      headers,
    );

    return {
      code: HttpStatus.OK,
      status: true,
      data: 'Callback processed successfully',
    };
  }

  @ApiOperation({ summary: 'check payment payment as user' })
  @ApiBody({
    description: 'check payment payment credentials',
    type: CreateBookingDto,
  })
  @ApiOkResponse({
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        status: { type: 'boolean', example: true },
        data: {
          $ref: getSchemaPath(CreateBookingResponseDto),
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'check payment payment Bad Request',
    type: WebErrorResponse,
  })
  @ApiBearerAuth()
  @Get('/payments/:id/status')
  @HttpCode(HttpStatus.OK)
  async checkPaymentStatus(
    @JWTAuthorization() user: any,
    @Param('id', ParseIntPipe) bookingId: number,
  ): Promise<WebSuccessResponse<any>> {
    const result = await this.paymentsService.checkPaymentStatusService(
      user,
      bookingId,
    );

    return {
      code: HttpStatus.OK,
      status: true,
      data: result,
    };
  }

  @ApiOperation({ summary: 'get payment method as user' })
  @ApiOkResponse({
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        status: { type: 'boolean', example: true },
        data: {
          $ref: getSchemaPath(PaymentMethodResponseDto),
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'check payment payment Bad Request',
    type: WebErrorResponse,
  })
  @ApiBearerAuth()
  @Get('/payments/method')
  @HttpCode(HttpStatus.OK)
  async listPaymentMethod(
    @JWTAuthorization() user: any,
  ): Promise<WebSuccessResponse<any>> {
    const result = await this.paymentsService.getListPaymentMethodService(user);

    return {
      code: HttpStatus.OK,
      status: true,
      data: result,
    };
  }
}
