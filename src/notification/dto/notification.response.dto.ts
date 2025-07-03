import { NotificationEntity } from '../../entities/notification.entity';

export class NotificationDto {
  id: number;
  bookingId: number | null;
  userId: number;
  notificationType: string;
  channel: string;
  content: string;
  isRead: boolean;
  sentTime: Date;
  readTime: Date | null;
  name: string;

  constructor(params: NotificationDto) {
    Object.assign(this, params);
  }
}

const mapToNotificationDto = (param: {
  notificationEntity: NotificationEntity;
}): NotificationDto => {
  return {
    bookingId: param.notificationEntity.bookingId,
    channel: param.notificationEntity.channel,
    content: param.notificationEntity.content,
    id: param.notificationEntity.id,
    isRead: param.notificationEntity.isRead,
    readTime: param.notificationEntity.readTime,
    sentTime: param.notificationEntity.sentTime,
    userId: param.notificationEntity.userId,
    notificationType: param.notificationEntity.notificationType,
    name: param.notificationEntity.UserProfile
      ? `${param.notificationEntity.UserProfile.firstName} ${param.notificationEntity.UserProfile.lastName}`
      : '',
  };
};

export default mapToNotificationDto;
