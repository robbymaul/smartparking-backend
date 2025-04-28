import { IsNumber, IsOptional } from 'class-validator';

interface NotificationResponseParams {
  success: boolean;
  message: string;
  email?: string;
  loggedOut?: 'all' | 'single';
  phoneNumber?: string;
  token?: string;
  sessionsCount?: number;
  expiryMinutes?: number;
  validUntil?: Date;
}

export function mapToNotificationResponseDto(
  params: NotificationResponseParams,
): NotificationResponseDto {
  return {
    success: params.success,
    message: params.message,
    email: params.email,
    phoneNumber: params.phoneNumber,
    loggedOut: params.loggedOut,
    sessionsCount: params.sessionsCount,
    expiryMinutes: params.expiryMinutes,
    token: params.token,
    validUntil: params.validUntil,
  };
}

export class NotificationResponseDto {
  success: boolean;
  message: string;
  email?: string;
  loggedOut?: 'all' | 'single';
  phoneNumber?: string;
  token?: string;
  expiryMinutes?: number;
  validUntil?: Date;

  @IsOptional()
  @IsNumber()
  sessionsCount?: number;
}
