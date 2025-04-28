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
import { SavePaymentMethodDto } from './dto/save.payment.method.dto';
import { UserPaymentMethodEntity } from '../entities/user.payment.method.entity';
import { BookingPaymentEntity } from '../entities/booking.payment.entity';
import Decimal from 'decimal.js';

@Injectable()
export class PaymentsService {
  constructor(
    @Inject('IPaymentsRepository')
    private readonly paymentRepository: IPaymentsRepository,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}
  async processPayment(
    bookingId: number,
    userId: number,
    processPaymentDto: ProcessPaymentDto,
  ) {
    const { paymentMethodId, savePaymentMethod, paymentDetails } =
      processPaymentDto;

    const bookingEntity =
      await this.paymentRepository.getBookingByIdRepository(bookingId);

    if (!bookingEntity) {
      throw new NotFoundException('Booking tidak ditemukan');
    }

    if (bookingEntity.userId !== userId) {
      throw new BadRequestException(
        'Anda tidak memiliki akses untuk membayar booking ini',
      );
    }

    if (bookingEntity.bookingStatus !== 'pending') {
      throw new BadRequestException(
        `Booking dengan status ${bookingEntity.bookingStatus} tidak dapat dibayar`,
      );
    }

    const existingBookingPaymentEntity =
      await this.paymentRepository.getExistBookingPaymentByBookingIdRepository(
        bookingEntity.id,
      );

    if (
      existingBookingPaymentEntity &&
      existingBookingPaymentEntity.paymentStatus === PaymentStatus.SUCCESS
    ) {
      throw new BadRequestException('Booking ini sudah dibayar');
    }

    const paymentReference = `PAY-${uuidv4().substring(0, 8).toUpperCase()}`;
    const amount = Number(bookingEntity.estimatedPrice);

    if (savePaymentMethod && paymentDetails) {
      await this.savePaymentMethod(userId, {
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
  }

  async savePaymentMethod(
    userId: number,
    savePaymentMethodDto: SavePaymentMethodDto,
  ): Promise<UserPaymentMethodEntity> {
    const {
      paymentMethodId,
      tokenReference,
      maskedInfo,
      expiryInfo,
      isDefault = false,
    } = savePaymentMethodDto;

    const paymentMethodEntity =
      await this.paymentRepository.getPaymentMethodByIdRepository(
        paymentMethodId,
      );

    if (!paymentMethodEntity) {
      throw new NotFoundException('Metode pembayaran tidak ditemukan');
    }

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
