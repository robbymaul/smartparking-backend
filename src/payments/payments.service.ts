import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ProcessPaymentDto } from './dto/process.payment.dto';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { IPaymentsRepository } from './payments.repository';
import { PaymentStatus } from './interfaces/payment.status.interface';
import { v4 as uuidv4 } from 'uuid';
import {
  PaymentMethodResponseDto,
  SavePaymentMethodDto,
} from './dto/save.payment.method.dto';
import { UserPaymentMethodEntity } from '../entities/user.payment.method.entity';
import { BookingPaymentEntity } from '../entities/booking.payment.entity';
import Decimal from 'decimal.js';
import { MidtransGateway } from './gateways/midtrans.gateway';
import { PaymentMethodEntity } from 'src/entities/payment.method.entity';
import { BookingStatus } from '../bookings/interfaces/booking-status.interface';
import { CONFIG } from '../config/config.schema';
import { GeneratorsService } from '../common/utils/generators';
import { BookingsService } from '../bookings/bookings.service';

@Injectable()
export class PaymentsService {
  constructor(
    @Inject('IPaymentsRepository')
    private readonly paymentRepository: IPaymentsRepository,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly midtransGateway: MidtransGateway,
    private readonly generatorsService: GeneratorsService,
    private readonly bookingsService: BookingsService,
  ) {}

  async processPaymentService(
    bookingId: number,
    user: any,
    processPaymentDto: ProcessPaymentDto,
  ) {
    const { paymentMethodId, savePaymentMethod, paymentDetails } =
      processPaymentDto;

    const bookingEntity =
      await this.paymentRepository.getBookingByIdRepository(bookingId);

    this.logger.debug(`booking entity: ${JSON.stringify(bookingEntity)}`);

    if (!bookingEntity) {
      throw new NotFoundException('Booking tidak ditemukan');
    }

    if (bookingEntity.userId !== user.id) {
      throw new BadRequestException(
        'Anda tidak memiliki akses untuk membayar booking ini',
      );
    }

    if (bookingEntity.bookingStatus !== BookingStatus.PENDING) {
      throw new BadRequestException(
        `Booking dengan status ${bookingEntity.bookingStatus} tidak dapat dibayar`,
      );
    }

    const existingBookingPaymentEntity =
      await this.paymentRepository.getExistBookingPaymentByBookingIdRepository(
        bookingEntity.id,
      );

    this.logger.debug(
      `existing booking payment entity: ${JSON.stringify(existingBookingPaymentEntity)}`,
    );

    if (
      existingBookingPaymentEntity &&
      existingBookingPaymentEntity.paymentStatus === PaymentStatus.SUCCESS
    ) {
      throw new BadRequestException('Booking ini sudah dibayar');
    }

    const paymentMethodEntity =
      await this.paymentRepository.getPaymentMethodByIdRepository(
        paymentMethodId,
      );

    this.logger.debug(
      `payment method entity ${JSON.stringify(paymentMethodEntity)}`,
    );

    if (!paymentMethodEntity) {
      throw new NotFoundException('Metode pembayaran tidak ditemukan');
    }

    const userProfileEntity =
      await this.paymentRepository.getUserProfileRepository(user);

    this.logger.debug(`user profile entity: ${userProfileEntity}`);

    const paymentReference = `PAY-${uuidv4().substring(0, 8).toUpperCase()}`;
    const amount = Number(bookingEntity.estimatedPrice);

    if (savePaymentMethod && paymentDetails) {
      await this.savePaymentMethod(user.id, paymentMethodEntity, {
        paymentMethodId,
        tokenReference: paymentDetails.token || uuidv4(),
        maskedInfo: paymentDetails.maskedInfo,
        expiryInfo: paymentDetails.expiryInfo,
      });
    }

    let bookingPaymentEntity: BookingPaymentEntity;
    if (existingBookingPaymentEntity) {
      existingBookingPaymentEntity.paymentReference = paymentReference;
      existingBookingPaymentEntity.paymentStatus = PaymentStatus.PROCESSING;
      existingBookingPaymentEntity.originalAmount = Decimal(amount);
      existingBookingPaymentEntity.finalAmount = Decimal(amount);
      existingBookingPaymentEntity.updatedAt = new Date();

      bookingPaymentEntity =
        await this.paymentRepository.updateBookingPaymentRepository(
          existingBookingPaymentEntity,
        );
    } else {
      const newBookingPaymentEntity = new BookingPaymentEntity({
        bookingId: bookingId,
        paymentReference: paymentReference,
        paymentStatus: PaymentStatus.PROCESSING,
        originalAmount: Decimal(amount),
        finalAmount: Decimal(amount),
        createdAt: new Date(),
      });

      bookingPaymentEntity =
        await this.paymentRepository.createBookingPaymentRepository(
          newBookingPaymentEntity,
        );
    }

    this.logger.debug(
      `booking payment entity: ${JSON.stringify(bookingPaymentEntity)}`,
    );

    const paymentResult = await this.midtransGateway.processPayment(
      paymentMethodEntity,
      paymentReference,
      bookingPaymentEntity.finalAmount.toNumber(),
      {
        metadata: {
          firstName: userProfileEntity?.firstName || user.username,
          lastName: userProfileEntity?.lastName || '',
          email: user.email,
          phone: user.phone,
          bookingId: bookingId,
          bookingReference: bookingEntity.bookingReference,
          callbackUrl: `${CONFIG.APP_URL}/api/payments/callback`,
        },
      },
    );

    return {
      orderId: bookingPaymentEntity.paymentReference,
      redirectUrl: paymentResult.redirectUrl,
      token: paymentResult.token,
      bookingId: bookingId,
      amount: bookingEntity.estimatedPrice,
      expiredAt: paymentResult.expiredAt,
    };
  }

  async handleMidtransCallbackService(notification: any, headers: any) {
    const verificationResult = await this.midtransGateway.verifyNotification(
      notification,
      headers,
    );

    if (!verificationResult.isValid) {
      throw new BadRequestException(verificationResult.errorMessage);
    }

    const payment =
      await this.paymentRepository.findPaymentByReferenceRepository(
        verificationResult.orderId,
      );

    if (!payment) {
      throw new NotFoundException('payment tidak ditemukan');
    }

    payment.paymentStatus = verificationResult.paymentStatus;

    await this.paymentRepository.UpdateBookingPaymentStatusRepository(payment);

    if (verificationResult.paymentStatus == 'COMPLETED') {
      await this.paymentRepository.updateBookingCompletedStatusRepository(
        payment,
        BookingStatus.CONFIRMED,
      );

      await this.bookingsService.generateQRCode(payment.bookingId);
      // await this.notificationService.sendPaymentConfirmation(payment.bookingId);
    }
  }

  async checkPaymentStatusService(user: any, bookingId: number): Promise<any> {
    const bookingEntity =
      await this.paymentRepository.getBookingByIdRepository(bookingId);

    if (!bookingEntity || bookingEntity.userId !== user.id) {
      throw new BadRequestException('Booking tidak ditemukan');
    }

    const bookingPaymentEntity =
      await this.paymentRepository.getExistBookingPaymentByBookingIdRepository(
        bookingId,
      );

    if (!bookingPaymentEntity) {
      throw new NotFoundException('Belum ada pembayaran untuk booking ini');
    }

    if (
      bookingPaymentEntity.paymentStatus != PaymentStatus.COMPLETED &&
      bookingPaymentEntity.paymentStatus != PaymentStatus.FAILED
    ) {
      const statusResult = await this.midtransGateway.checkTransactionStatus(
        bookingPaymentEntity.paymentReference || '',
      );

      this.logger.debug(`status result ${JSON.stringify(statusResult)}`);

      if (statusResult.transactionStatus !== 'pending') {
        const newStatus =
          statusResult.transactionStatus === 'settlement' ||
          statusResult.transactionStatus === 'capture'
            ? PaymentStatus.COMPLETED
            : PaymentStatus.FAILED;

        bookingPaymentEntity.paymentStatus = newStatus;

        await this.paymentRepository.updateBookingPaymentRepository(
          bookingPaymentEntity,
        );

        // Update booking status jika pembayaran berhasil
        if (newStatus === PaymentStatus.COMPLETED) {
          bookingEntity.bookingStatus = BookingStatus.CONFIRMED;
          await this.paymentRepository.updateBookingRepository(bookingEntity);

          // Generate QR code dan kirim notifikasi
          await this.bookingsService.generateQRCode(bookingEntity.id);
          // await this.notificationService.sendPaymentConfirmation(booking.id);
        }

        // Update payment status for response
        bookingPaymentEntity.paymentStatus = newStatus;
      }
    }

    return {
      bookingId: bookingId,
      bookingStatus: bookingEntity.bookingStatus,
      paymentStatus: bookingPaymentEntity.paymentStatus,
      amount: bookingPaymentEntity.finalAmount,
      paymentReference: bookingPaymentEntity.paymentReference,
    };
  }

  async getListPaymentMethodService(
    user: any,
  ): Promise<PaymentMethodResponseDto[]> {
    const paymentMethodEntities =
      await this.paymentRepository.getListPaymentMethodRepository();

    const response: PaymentMethodResponseDto[] = [];
    paymentMethodEntities.map((paymentMethod) =>
      response.push({
        description: paymentMethod.description ?? '',
        id: paymentMethod.id,
        methodName: paymentMethod.methodName,
        methodType: paymentMethod.methodType,
        provider: paymentMethod.provider,
      }),
    );
    return response;
  }

  private async savePaymentMethod(
    userId: number,
    paymentMethodEntity: PaymentMethodEntity,
    savePaymentMethodDto: SavePaymentMethodDto,
  ): Promise<UserPaymentMethodEntity> {
    const {
      paymentMethodId,
      tokenReference,
      maskedInfo,
      expiryInfo,
      isDefault = false,
    } = savePaymentMethodDto;

    const existingUserPaymentMethodEntity =
      await this.paymentRepository.getExistingUserPaymentMethodRepository(
        userId,
        paymentMethodId,
        tokenReference,
      );

    if (existingUserPaymentMethodEntity) {
      return this.paymentRepository.updateUserPaymentMethodRepository(
        existingUserPaymentMethodEntity,
      );
    }

    if (isDefault) {
      await this.paymentRepository.updateManyUserPaymentMethodRepository(
        userId,
      );
    }

    const newUserPaymentMethodEntity = new UserPaymentMethodEntity({
      userId: userId,
      paymentMethodId: paymentMethodEntity.id,
      tokenReference: tokenReference,
      maskedInfo: maskedInfo ? maskedInfo : null,
      expiryInfo: expiryInfo ? expiryInfo : null,
      isDefault: isDefault,
      isVerified: true,
      createdAt: new Date(),
    });

    return await this.paymentRepository.createUserPaymentMethodRepository(
      newUserPaymentMethodEntity,
    );
  }
}
