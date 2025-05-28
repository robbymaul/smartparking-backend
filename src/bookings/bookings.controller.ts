import {
  Body,
  Controller,
  Get,
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
  WebErrorResponse,
  WebSuccessResponse,
} from '../common/constant/web.response';
import {
  BookingResponseDto,
  CreateBookingDto,
  CreateBookingResponseDto,
} from './dto/create-booking.dto';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { BookingsService } from './bookings.service';
import { JWTAuthorization } from '../common/decorators/auth.decorator';

@Controller(CONFIG.HEADER_API)
export class BookingsController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly bookingService: BookingsService,
  ) {}

  @ApiOperation({ summary: 'create booking as user' })
  @ApiBody({
    description: 'create booking credentials',
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
    description: 'create booking Bad Request',
    type: WebErrorResponse,
  })
  @ApiBearerAuth()
  @Post('/bookings')
  @HttpCode(HttpStatus.OK)
  async register(
    @JWTAuthorization() user: any,
    @Body() request: CreateBookingDto,
  ): Promise<WebSuccessResponse<CreateBookingResponseDto>> {
    this.logger.debug('Register request body', request);

    const result = await this.bookingService.createBookingService(
      user,
      request,
    );

    return {
      code: HttpStatus.OK,
      status: true,
      data: result,
    };
  }

  @ApiOperation({ summary: 'get booking details for process payment' })
  @ApiOkResponse({
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        status: { type: 'boolean', example: true },
        data: {
          type: 'array',
          $ref: getSchemaPath(BookingResponseDto),
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'get booking details for process payment bad request',
    type: WebErrorResponse,
  })
  @ApiBearerAuth()
  @Get('/bookings/:id')
  @HttpCode(HttpStatus.OK)
  async getDetailPlaces(
    @JWTAuthorization() user: any,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<WebSuccessResponse<BookingResponseDto>> {
    const result = await this.bookingService.getBookingService(user, id);

    return {
      code: HttpStatus.OK,
      status: true,
      data: result,
    };
  }
}
