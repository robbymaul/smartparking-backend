import { NotificationSetting } from '../../generated/prisma';

export class NotificationSettingEntity {
  id?: number;
  userId: number;
  emailEnabled: boolean;
  smsEnabled: boolean;
  pushEnabled: boolean;
  bookingConfirmation: boolean;
  paymentNotifications: boolean;
  reminderNotifications: boolean;
  marketingNotifications: boolean;
  createdAt: Date;
  updatedAt?: Date | null;

  constructor(param: {
    id?: number;
    userId: number;
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    bookingConfirmation: boolean;
    paymentNotifications: boolean;
    reminderNotifications: boolean;
    marketingNotifications: boolean;
    createdAt: Date;
    updatedAt?: Date | null;
  }) {
    this.id = param.id;
    this.userId = param.userId;
    this.emailEnabled = param.emailEnabled;
    this.smsEnabled = param.smsEnabled;
    this.pushEnabled = param.pushEnabled;
    this.bookingConfirmation = param.bookingConfirmation;
    this.paymentNotifications = param.paymentNotifications;
    this.reminderNotifications = param.reminderNotifications;
    this.marketingNotifications = param.marketingNotifications;
    this.createdAt = param.createdAt;
    this.updatedAt = param.updatedAt;
  }
}

export function mapToNotificationSettingEntity(param: {
  setting: NotificationSetting;
}): NotificationSettingEntity {
  const { setting } = param;

  return new NotificationSettingEntity({
    id: setting.id,
    userId: setting.userId,
    emailEnabled: setting.emailEnabled,
    smsEnabled: setting.smsEnabled,
    pushEnabled: setting.pushEnabled,
    bookingConfirmation: setting.bookingConfirmation,
    paymentNotifications: setting.paymentNotifications,
    reminderNotifications: setting.reminderNotifications,
    marketingNotifications: setting.marketingNotifications,
    createdAt: new Date(setting.createdAt),
    updatedAt: setting.updatedAt ? new Date(setting.updatedAt) : null,
  });
}
