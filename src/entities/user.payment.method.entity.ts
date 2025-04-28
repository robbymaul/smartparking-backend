import { UserPaymentMethod } from '../../generated/prisma';

export class UserPaymentMethodEntity {
  id?: number;
  userId: number;
  paymentMethodId: number;
  tokenReference: string;
  maskedInfo: string | null;
  expiryInfo: string | null;
  isDefault: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt?: Date | null;

  constructor(param: {
    id?: number;
    userId: number;
    paymentMethodId: number;
    tokenReference: string;
    maskedInfo: string | null;
    expiryInfo: string | null;
    isDefault: boolean;
    isVerified: boolean;
    createdAt: Date;
    updatedAt?: Date | null;
  }) {
    this.id = param.id;
    this.userId = param.userId;
    this.paymentMethodId = param.paymentMethodId;
    this.tokenReference = param.tokenReference;
    this.maskedInfo = param.maskedInfo;
    this.expiryInfo = param.expiryInfo;
    this.isDefault = param.isDefault;
    this.isVerified = param.isVerified;
    this.createdAt = param.createdAt;
    this.updatedAt = param.updatedAt;
  }
}

export function mapToUserPaymentMethodEntity(param: {
  userPaymentMethod: UserPaymentMethod;
}): UserPaymentMethodEntity {
  const { userPaymentMethod } = param;

  return {
    id: userPaymentMethod.id,
    userId: userPaymentMethod.userId,
    paymentMethodId: userPaymentMethod.paymentMethodId,
    tokenReference: userPaymentMethod.tokenReference,
    maskedInfo: userPaymentMethod.maskedInfo,
    expiryInfo: userPaymentMethod.expiryInfo,
    isDefault: userPaymentMethod.isDefault,
    isVerified: userPaymentMethod.isVerified,
    createdAt: new Date(userPaymentMethod.createdAt),
    updatedAt: userPaymentMethod.updatedAt
      ? new Date(userPaymentMethod.updatedAt)
      : undefined,
  };
}
