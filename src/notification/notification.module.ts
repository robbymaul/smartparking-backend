import { Global, Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationsController } from './notification.controller';
import { NotificationsRepository } from './notification.repository';

@Global()
@Module({
  providers: [
    NotificationService,
    { provide: 'INotificationsRepository', useClass: NotificationsRepository },
  ],
  exports: [NotificationService],
  controllers: [NotificationsController],
})
export class NotificationModule {}
