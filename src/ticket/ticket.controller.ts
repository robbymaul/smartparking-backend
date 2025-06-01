import { Controller, Get, HttpCode, HttpStatus, Inject } from '@nestjs/common';
import { CONFIG } from 'src/config/config.schema';
import { TicketService } from './ticket.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  WebErrorResponse,
  WebSuccessResponse,
} from 'src/common/constant/web.response';
import { TicketBookingResponseDto } from './dto/ticket.response';
import { JWTAuthorization } from '../common/decorators/auth.decorator';

@Controller(CONFIG.HEADER_API)
export class TicketController {
  constructor(
    private readonly ticketsService: TicketService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @ApiOperation({ summary: 'get tickets as user' })
  @ApiOkResponse({
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        status: { type: 'boolean', example: true },
        data: {
          $ref: getSchemaPath(TicketBookingResponseDto),
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'get tickets  bad request',
    type: WebErrorResponse,
  })
  @ApiBearerAuth()
  @Get('/tickets')
  @HttpCode(HttpStatus.OK)
  async getTicket(
    @JWTAuthorization() user: any,
  ): Promise<WebSuccessResponse<TicketBookingResponseDto[]>> {
    const result = await this.ticketsService.getListTicketBooking(user);

    return {
      code: HttpStatus.OK,
      status: true,
      data: result,
    };
  }
}
