import Decimal from 'decimal.js';
import { PaymentMethod } from '../../generated/prisma';

export class PaymentMethodEntity {
  id: number;
  methodName: string;
  provider: string;
  methodType: string;
  description?: string;
  processingFeePercent: Decimal; // pakai Decimal jika perlu
  fixedFee: any;
  supportsRefunds: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;

  constructor(param: {
    id: number;
    methodName: string;
    provider: string;
    methodType: string;
    description?: string;
    processingFeePercent: Decimal;
    fixedFee: any;
    supportsRefunds: boolean;
    isActive: boolean;
    createdAt: Date;
    updatedAt?: Date;
  }) {
    this.id = param.id;
    this.methodName = param.methodName;
    this.provider = param.provider;
    this.methodType = param.methodType;
    this.description = param.description;
    this.processingFeePercent = param.processingFeePercent;
    this.fixedFee = param.fixedFee;
    this.supportsRefunds = param.supportsRefunds;
    this.isActive = param.isActive;
    this.createdAt = param.createdAt;
    this.updatedAt = param.updatedAt;
  }
}

export function mapToPaymentMethodEntity(param: {
  paymentMethod: PaymentMethod;
}): PaymentMethodEntity {
  const { paymentMethod } = param;

  return {
    id: paymentMethod.id,
    methodName: paymentMethod.methodName,
    provider: paymentMethod.provider,
    methodType: paymentMethod.methodType,
    description: paymentMethod.description ?? undefined,
    processingFeePercent: paymentMethod.processingFeePercent,
    fixedFee: paymentMethod.fixedFee,
    supportsRefunds: paymentMethod.supportsRefunds,
    isActive: paymentMethod.isActive,
    createdAt: new Date(paymentMethod.createdAt),
    updatedAt: paymentMethod.updatedAt
      ? new Date(paymentMethod.updatedAt)
      : undefined,
  };
}
