import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { CONFIG } from '../config/config.schema';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { NotificationService } from './notification.service';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JWTAuthorization } from '../common/decorators/auth.decorator';
import { WebSuccessResponse } from '../common/constant/web.response';
import { NotificationDto } from './dto/notification.response.dto';

@Controller(CONFIG.HEADER_API)
export class NotificationsController {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly notificationService: NotificationService,
  ) {}

  @ApiBearerAuth()
  @Get('/notifications')
  @HttpCode(HttpStatus.OK)
  async getListNotification(
    @JWTAuthorization() user: any,
  ): Promise<WebSuccessResponse<NotificationDto[]>> {
    const result: NotificationDto[] =
      await this.notificationService.getListNotificationService(user);

    return {
      code: HttpStatus.OK,
      status: true,
      data: result,
    };
  }

  @ApiBearerAuth()
  @Get('/notifications/:id')
  @HttpCode(HttpStatus.OK)
  async getDetailNotification(
    @JWTAuthorization() user: any,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<WebSuccessResponse<NotificationDto>> {
    const result: NotificationDto =
      await this.notificationService.getDetailNotificationService(user, id);

    return {
      code: HttpStatus.OK,
      status: true,
      data: result,
    };
  }

  @ApiBearerAuth()
  @Get('/notifications/:id/read')
  @HttpCode(HttpStatus.OK)
  async updateNotificationRead(
    @JWTAuthorization() user: any,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    await this.notificationService.updateNotificationReadService(user, id);
  }
}
