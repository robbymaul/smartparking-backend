import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import mapToNotificationEntity, {
  NotificationEntity,
} from '../entities/notification.entity';

export interface INotificationsRepository {
  getListNotificationUnreadRepository(user: any): Promise<NotificationEntity[]>;

  getNotificationByIdRepository(
    user: any,
    id: number,
  ): Promise<NotificationEntity | null>;
}

@Injectable()
export class NotificationsRepository implements INotificationsRepository {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async getNotificationByIdRepository(
    user: any,
    id: number,
  ): Promise<NotificationEntity | null> {
    const notification = await this.prismaService.notification.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    return notification
      ? mapToNotificationEntity({
          notification: notification,
          user: notification.user,
          userProfile: notification.user.profile ?? undefined,
        })
      : null;
  }

  async getListNotificationUnreadRepository(
    user: any,
  ): Promise<NotificationEntity[]> {
    const notifications = await this.prismaService.notification.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
      include: {
        user: {
          include: {
            profile: true,
          },
        },
      },
    });

    return notifications.map((notification) =>
      mapToNotificationEntity({
        notification: notification,
        userProfile: notification.user.profile ?? undefined,
      }),
    );
  }
}
