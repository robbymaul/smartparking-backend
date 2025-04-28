import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { BookingEntity, mapToBookingEntity } from '../entities/booking.entity';
import { handlePrismaError } from '../common/helpers/handle.prisma.error';
import {
  BookingPaymentEntity,
  mapToBookingPaymentEntity,
} from '../entities/booking.payment.entity';
import {
  mapToPaymentMethodEntity,
  PaymentMethodEntity,
} from '../entities/payment.method.entity';
import {
  mapToUserPaymentMethodEntity,
  UserPaymentMethodEntity,
} from '../entities/user.payment.method.entity';
import {
  mapToPaymentTransactionEntity,
  PaymentTransactionEntity,
} from '../entities/payment.transaction.entity';
import { BookingStatusLogEntity } from '../entities/booking.status.log.entity';

export interface IPaymentsRepository {
  getBookingByIdRepository(bookingId: number): Promise<BookingEntity | null>;

  getExistBookingPaymentByBookingIdRepository(
    bookingId: number,
  ): Promise<BookingPaymentEntity | null>;

  getPaymentMethodByIdRepository(
    paymentMethodId: number,
  ): Promise<PaymentMethodEntity | null>;

  getUserPaymentMethodRepository(
    userId: number,
    paymentMethodId: number,
    tokenReference: string,
  ): Promise<UserPaymentMethodEntity | null>;

  getExistingUserPaymentMethodRepository(
    userId: number,
    paymentMethodId: number,
    tokenReference: string,
  ): Promise<UserPaymentMethodEntity | null>;

  updateUserPaymentMethodRepository(
    userPaymentMethodEntity: UserPaymentMethodEntity,
  ): Promise<UserPaymentMethodEntity>;

  updateManyUserPaymentMethodRepository(userId: number): Promise<void>;

  createUserPaymentMethodRepository(
    userPaymentMethodEntity: UserPaymentMethodEntity,
  ): Promise<UserPaymentMethodEntity>;

  updateBookingPaymentRepository(
    bookingPaymentEntity: BookingPaymentEntity,
  ): Promise<BookingPaymentEntity>;

  createBookingPaymentRepository(
    bookingPaymentEntity: BookingPaymentEntity,
  ): Promise<BookingPaymentEntity>;

  createPaymentTransactionRepository(
    paymentTransacctionEntity: PaymentTransactionEntity,
  ): Promise<PaymentTransactionEntity>;

  updateBookingRepository(bookingEntity: BookingEntity): Promise<void>;

  createBookingStatusLog(
    bookingStatusLogEnity: BookingStatusLogEntity,
  ): Promise<void>;
}

@Injectable()
export class PaymentsRepository implements IPaymentsRepository {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async createBookingStatusLog(
    bookingStatusLogEnity: BookingStatusLogEntity,
  ): Promise<void> {
    try {
      await this.prismaService.bookingStatusLog.create({
        data: {
          bookingId: bookingStatusLogEnity.bookingId,
          previousStatus: bookingStatusLogEnity.previousStatus,
          newStatus: bookingStatusLogEnity.newStatus,
          changedBy: bookingStatusLogEnity.changedBy,
          reason: bookingStatusLogEnity.reason,
        },
      });
    } catch (e) {
      this.logger.error(`update booking repository ${e}`);

      handlePrismaError(e, 'update booking repository');
    }
  }

  async updateBookingRepository(bookingEntity: BookingEntity): Promise<void> {
    try {
      await this.prismaService.booking.update({
        where: { id: bookingEntity.id },
        data: {
          bookingStatus: bookingEntity.bookingStatus,
          updatedAt: new Date(),
        },
      });
    } catch (e) {
      this.logger.error(`update booking repository ${e}`);

      handlePrismaError(e, 'update booking repository');
    }
  }

  async createPaymentTransactionRepository(
    paymentTransacctionEntity: PaymentTransactionEntity,
  ): Promise<PaymentTransactionEntity> {
    try {
      const paymentTransaction =
        await this.prismaService.paymentTransaction.create({
          data: {
            paymentId: paymentTransacctionEntity.paymentId,
            paymentMethodId: paymentTransacctionEntity.paymentMethodId,
            transactionReference:
              paymentTransacctionEntity.transactionReference,
            transactionType: paymentTransacctionEntity.transactionType,
            amount: paymentTransacctionEntity.amount,
            currency: paymentTransacctionEntity.currency,
            transactionStatus: paymentTransacctionEntity.transactionStatus,
            gatewayResponse: paymentTransacctionEntity.gatewayResponse,
            transactionData: paymentTransacctionEntity.transactionData,
            transactionTime: paymentTransacctionEntity.transactionTime,
          },
        });

      return mapToPaymentTransactionEntity({
        paymentTransaction: paymentTransaction,
      });
    } catch (e) {
      this.logger.error(`create payment transaction repository ${e}`);

      handlePrismaError(e, 'create payment transaction repository');
    }
  }

  async createBookingPaymentRepository(
    bookingPaymentEntity: BookingPaymentEntity,
  ): Promise<BookingPaymentEntity> {
    try {
      const bookingPayment = await this.prismaService.bookingPayment.create({
        data: {
          bookingId: bookingPaymentEntity.bookingId,
          paymentReference: bookingPaymentEntity.paymentReference,
          paymentStatus: bookingPaymentEntity.paymentStatus,
          originalAmount: bookingPaymentEntity.originalAmount,
          finalAmount: bookingPaymentEntity.finalAmount,
        },
      });

      return mapToBookingPaymentEntity({
        bookingPayment: bookingPayment,
      });
    } catch (e) {
      this.logger.error(`update booking payment repository ${e}`);

      handlePrismaError(e, 'update booking payment repository');
    }
  }

  async updateBookingPaymentRepository(
    bookingPaymentEntity: BookingPaymentEntity,
  ): Promise<BookingPaymentEntity> {
    try {
      const bookingPayment = await this.prismaService.bookingPayment.update({
        where: { id: bookingPaymentEntity.id },
        data: {
          paymentReference: bookingPaymentEntity.paymentReference,
          paymentStatus: bookingPaymentEntity.paymentStatus,
          originalAmount: bookingPaymentEntity.originalAmount,
          finalAmount: bookingPaymentEntity.finalAmount,
          updatedAt: new Date(),
        },
      });

      return mapToBookingPaymentEntity({
        bookingPayment: bookingPayment,
      });
    } catch (e) {
      this.logger.error(`update booking payment repository ${e}`);

      handlePrismaError(e, 'update booking payment repository');
    }
  }

  async createUserPaymentMethodRepository(
    userPaymentMethodEntity: UserPaymentMethodEntity,
  ): Promise<UserPaymentMethodEntity> {
    try {
      const userPaymentMethod =
        await this.prismaService.userPaymentMethod.create({
          data: {
            userId: userPaymentMethodEntity.userId,
            paymentMethodId: userPaymentMethodEntity.paymentMethodId,
            tokenReference: userPaymentMethodEntity.tokenReference,
            maskedInfo: userPaymentMethodEntity.maskedInfo,
            expiryInfo: userPaymentMethodEntity.expiryInfo,
            isDefault: userPaymentMethodEntity.isDefault,
            isVerified: true, // Asumsikan terverifikasi karena baru saja digunakan
          },
        });

      return mapToUserPaymentMethodEntity({
        userPaymentMethod: userPaymentMethod,
      });
    } catch (e) {
      this.logger.error(`update many user payment method repository ${e}`);

      handlePrismaError(e, 'update many user payment method repository');
    }
  }

  async updateManyUserPaymentMethodRepository(userId: number): Promise<void> {
    try {
      await this.prismaService.userPaymentMethod.updateMany({
        where: { userId: userId },
        data: {
          isDefault: false,
        },
      });
    } catch (e) {
      this.logger.error(`update many user payment method repository ${e}`);

      handlePrismaError(e, 'update many user payment method repository');
    }
  }

  async updateUserPaymentMethodRepository(
    userPaymentMethodEntity: UserPaymentMethodEntity,
  ): Promise<UserPaymentMethodEntity> {
    try {
      const userPaymentMethod =
        await this.prismaService.userPaymentMethod.update({
          where: { id: userPaymentMethodEntity.id },
          data: {
            maskedInfo: userPaymentMethodEntity.maskedInfo,
            expiryInfo: userPaymentMethodEntity.expiryInfo,
            isDefault: userPaymentMethodEntity.isDefault,
            updatedAt: new Date(),
          },
        });

      return mapToUserPaymentMethodEntity({
        userPaymentMethod: userPaymentMethod,
      });
    } catch (e) {
      this.logger.error(`update user payment method repository ${e}`);

      handlePrismaError(e, 'update user payment method repository');
    }
  }

  async getUserPaymentMethodRepository(
    userId: number,
    paymentMethodId: number,
    tokenReference: string,
  ): Promise<UserPaymentMethodEntity | null> {
    try {
      const userPaymentMethod =
        await this.prismaService.userPaymentMethod.findFirst({
          where: {
            userId,
            paymentMethodId,
            tokenReference,
          },
        });

      return userPaymentMethod
        ? mapToUserPaymentMethodEntity({ userPaymentMethod: userPaymentMethod })
        : null;
    } catch (e) {
      this.logger.error(`get user payment method repository ${e}`);

      handlePrismaError(e, 'get user payment method repository');
    }
  }

  async getExistingUserPaymentMethodRepository(
    userId: number,
    paymentMethodId: number,
    tokenReference: string,
  ): Promise<UserPaymentMethodEntity | null> {
    try {
      const userPaymentMethod =
        await this.prismaService.userPaymentMethod.findFirst({
          where: {
            userId,
            paymentMethodId,
            tokenReference,
          },
        });

      return userPaymentMethod
        ? mapToUserPaymentMethodEntity({ userPaymentMethod: userPaymentMethod })
        : null;
    } catch (e) {
      this.logger.error(`get user payment method repository ${e}`);

      handlePrismaError(e, 'get user payment method repository');
    }
  }

  async getPaymentMethodByIdRepository(
    paymentMethodId: number,
  ): Promise<PaymentMethodEntity | null> {
    try {
      const paymentMethod = await this.prismaService.paymentMethod.findUnique({
        where: { id: paymentMethodId },
      });

      return paymentMethod
        ? mapToPaymentMethodEntity({ paymentMethod: paymentMethod })
        : null;
    } catch (e) {
      this.logger.error(`get payment method by id repository ${e}`);

      handlePrismaError(e, 'get payment method by id repository');
    }
  }

  async getExistBookingPaymentByBookingIdRepository(
    bookingId: number,
  ): Promise<BookingPaymentEntity | null> {
    try {
      const bookingPayment = await this.prismaService.bookingPayment.findUnique(
        {
          where: { bookingId: bookingId },
        },
      );

      return bookingPayment
        ? mapToBookingPaymentEntity({ bookingPayment: bookingPayment })
        : null;
    } catch (e) {
      this.logger.error(`get booking by id repository ${e}`);

      handlePrismaError(e, 'get booking by id repository');
    }
  }

  async getBookingByIdRepository(
    bookingId: number,
  ): Promise<BookingEntity | null> {
    try {
      const booking = await this.prismaService.booking.findUnique({
        where: { id: bookingId },
      });

      return booking ? mapToBookingEntity({ booking: booking }) : null;
    } catch (e) {
      this.logger.error(`get booking by id repository ${e}`);

      handlePrismaError(e, 'get booking by id repository');
    }
  }
}
