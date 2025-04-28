import Decimal from 'decimal.js';
import { BookingPayment } from '../../generated/prisma';

export class BookingPaymentEntity {
  id?: number;
  bookingId: number;
  paymentReference?: string;
  paymentStatus: string;
  originalAmount: Decimal;
  discountAmount?: Decimal;
  taxAmount?: Decimal;
  surchargeAmount?: Decimal;
  finalAmount: Decimal;
  isPrepaid?: boolean;
  isRefunded?: boolean;
  createdAt: Date;
  updatedAt?: Date;

  constructor(param: {
    id?: number;
    bookingId: number;
    paymentReference?: string;
    paymentStatus: string;
    originalAmount: Decimal;
    discountAmount?: Decimal;
    taxAmount?: Decimal;
    surchargeAmount?: Decimal;
    finalAmount: Decimal;
    isPrepaid?: boolean;
    isRefunded?: boolean;
    createdAt: Date;
    updatedAt?: Date;
  }) {
    this.id = param.id;
    this.bookingId = param.bookingId;
    this.paymentReference = param.paymentReference;
    this.paymentStatus = param.paymentStatus;
    this.originalAmount = param.originalAmount;
    this.discountAmount = param.discountAmount;
    this.taxAmount = param.taxAmount;
    this.surchargeAmount = param.surchargeAmount;
    this.finalAmount = param.finalAmount;
    this.isPrepaid = param.isPrepaid;
    this.isRefunded = param.isRefunded;
    this.createdAt = param.createdAt;
    this.updatedAt = param.updatedAt;
  }
}

export function mapToBookingPaymentEntity(param: {
  bookingPayment: BookingPayment;
}): BookingPaymentEntity {
  const { bookingPayment } = param;

  return {
    id: bookingPayment.id,
    bookingId: bookingPayment.bookingId,
    paymentReference: bookingPayment.paymentReference ?? undefined,
    paymentStatus: bookingPayment.paymentStatus,
    originalAmount: bookingPayment.originalAmount,
    discountAmount: bookingPayment.discountAmount,
    taxAmount: bookingPayment.taxAmount,
    surchargeAmount: bookingPayment.surchargeAmount,
    finalAmount: bookingPayment.finalAmount,
    isPrepaid: bookingPayment.isPrepaid,
    isRefunded: bookingPayment.isRefunded,
    createdAt: new Date(bookingPayment.createdAt),
    updatedAt: bookingPayment.updatedAt
      ? new Date(bookingPayment.updatedAt)
      : undefined,
  };
}
