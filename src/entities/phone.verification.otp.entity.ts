import { PhoneVerificationOtp } from '../../generated/prisma';

export class PhoneVerificationOtpEntity {
  id?: number;
  userId: number;
  phoneNumber: string;
  otp: string;
  expiresAt: Date;
  createdAt: Date;

  constructor(param: {
    id?: number;
    userId: number;
    phoneNumber: string;
    otp: string;
    expiresAt: Date;
    createdAt: Date;
  }) {
    this.id = param.id;
    this.userId = param.userId;
    this.phoneNumber = param.phoneNumber;
    this.otp = param.otp;
    this.expiresAt = param.expiresAt;
    this.createdAt = param.createdAt;
  }
}

export function mapToPhoneVerificationOtpEntity(param: {
  otp: PhoneVerificationOtp;
}): PhoneVerificationOtpEntity {
  return new PhoneVerificationOtpEntity({
    id: param.otp.id,
    userId: param.otp.userId,
    phoneNumber: param.otp.phoneNumber,
    otp: param.otp.otp,
    expiresAt: param.otp.expiresAt,
    createdAt: param.otp.createdAt,
  });
}
