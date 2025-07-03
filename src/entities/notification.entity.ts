import { Notification, User, UserProfile } from '../../generated/prisma';
import { mapToUserEntity, UserEntity } from './user.entity';
import {
  mapToUserProfileEntity,
  UserProfileEntity,
} from './user.profile.entity';

export class NotificationEntity {
  id: number;
  userId: number;
  bookingId: number | null;
  notificationType: string;
  channel: string;
  content: string;
  isRead: boolean;
  sentTime: Date;
  readTime: Date | null;
  createdAt: Date;
  User?: UserEntity;
  UserProfile?: UserProfileEntity;

  constructor(params: NotificationEntity) {
    Object.assign(this, params);
  }
}

const mapToNotificationEntity = (param: {
  notification: Notification;
  user?: User;
  userProfile?: UserProfile;
}): NotificationEntity => {
  return {
    bookingId: param.notification.bookingId,
    channel: param.notification.channel,
    content: param.notification.content,
    createdAt: param.notification.createdAt,
    id: param.notification.id,
    isRead: param.notification.isRead,
    notificationType: param.notification.notificationType,
    readTime: param.notification.readTime,
    sentTime: param.notification.sentTime,
    userId: param.notification.userId,
    User: param.user ? mapToUserEntity({ user: param.user }) : undefined,
    UserProfile: param.userProfile
      ? mapToUserProfileEntity({ profile: param.userProfile })
      : undefined,
  };
};

export default mapToNotificationEntity;
