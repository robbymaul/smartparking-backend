import { PaymentTransaction } from '../../generated/prisma';

export class PaymentTransactionEntity {
  id: number;
  paymentId: number;
  paymentMethodId: number;
  transactionReference: string | null;
  transactionType: string;
  amount: number;
  currency: string;
  transactionStatus: string;
  gatewayResponse: string | null;
  transactionData: string | null;
  transactionTime: Date | null;
  createdAt: Date;
  updatedAt: Date | null;

  constructor(param: {
    id: number;
    paymentId: number;
    paymentMethodId: number;
    transactionReference: string | null;
    transactionType: string;
    amount: number;
    currency: string;
    transactionStatus: string;
    gatewayResponse: string | null;
    transactionData: string | null;
    transactionTime: Date | null;
    createdAt: Date;
    updatedAt: Date | null;
  }) {
    this.id = param.id;
    this.paymentId = param.paymentId;
    this.paymentMethodId = param.paymentMethodId;
    this.transactionReference = param.transactionReference;
    this.transactionType = param.transactionType;
    this.amount = Number(param.amount); // Decimal to number
    this.currency = param.currency;
    this.transactionStatus = param.transactionStatus;
    this.gatewayResponse = param.gatewayResponse;
    this.transactionData = param.transactionData;
    this.transactionTime = param.transactionTime;
    this.createdAt = param.createdAt;
    this.updatedAt = param.updatedAt;
  }
}

export function mapToPaymentTransactionEntity(param: {
  paymentTransaction: PaymentTransaction;
}): PaymentTransactionEntity {
  const { paymentTransaction } = param;

  return {
    id: paymentTransaction.id,
    paymentId: paymentTransaction.paymentId,
    paymentMethodId: paymentTransaction.paymentMethodId,
    transactionReference: paymentTransaction.transactionReference,
    transactionType: paymentTransaction.transactionType,
    amount: Number(paymentTransaction.amount),
    currency: paymentTransaction.currency,
    transactionStatus: paymentTransaction.transactionStatus,
    gatewayResponse: paymentTransaction.gatewayResponse,
    transactionData: paymentTransaction.transactionData,
    transactionTime: paymentTransaction.transactionTime
      ? new Date(paymentTransaction.transactionTime)
      : null,
    createdAt: new Date(paymentTransaction.createdAt),
    updatedAt: paymentTransaction.updatedAt
      ? new Date(paymentTransaction.updatedAt)
      : null,
  };
}
