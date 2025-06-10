import { Inject, Injectable } from '@nestjs/common';
import { CONFIG } from '../../config/config.schema';
import { PaymentMethodEntity } from '../../entities/payment.method.entity';
import axios from 'axios';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { IBookingsRepository } from '../../bookings/bookings.repository';
import { PaymentStatus } from '../interfaces/payment.status.interface';

@Injectable()
export class MidtransGateway {
  private readonly MIDTRANS_BASE_URL: string;
  private readonly MIDTRANS_SERVER_KEY: string;
  private readonly MIDTRANS_CLIENT_KEY: string;

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    @Inject('IBookingsRepository')
    private readonly bookingRepository: IBookingsRepository,
  ) {
    // Tentukan URL berdasarkan mode development atau production
    this.MIDTRANS_BASE_URL = CONFIG.MIDTRANS_IS_PRODUCTION
      ? 'https://app.midtrans.com'
      : 'https://app.sandbox.midtrans.com';
    this.MIDTRANS_SERVER_KEY = CONFIG.MIDTRANS_SERVER_KEY;
    this.MIDTRANS_CLIENT_KEY = CONFIG.MIDTRANS_CLIENT_KEY;
  }

  async processPayment(
    paymentMethod: PaymentMethodEntity,
    paymentReference: string,
    amount: number,
    metadata: any,
  ) {
    try {
      let body: any = {
        transaction_details: {
          order_id: paymentReference,
          gross_amount: amount,
        },
        customer_details: {
          firstName: metadata.firstName || 'Customer',
          lastName: metadata.lastName || '',
          email: metadata.email || 'customer@customer.com',
          phone: metadata.phone || '',
        },
        item_details: {
          id: metadata.bookingId ? `BOOK-${metadata.bookingId}` : 'PARKING',
          price: amount,
          quantity: 1,
          name: metadata.bookingReference
            ? `Parking Booking #${metadata.bookingReference}`
            : 'Parking Fee',
        },
      };

      this.logger.debug(`method type ${paymentMethod.methodType}`);

      // Menambahkan konfigurasi berdasarkan tipe pembayaran
      switch (paymentMethod.methodType.toLowerCase()) {
        case 'e-wallet':
          // Untuk OVO
          if (paymentMethod.methodName.toLowerCase() === 'ovo') {
            body.payment_type = 'OVO';
            body.ovo = {
              callback_url: metadata.callbackUrl || '',
            };
          }
          // Untuk GoPay
          else if (paymentMethod.methodName === 'gopay') {
            body.payment_type = 'gopay';
            body.gopay = {
              enable_callback: true,
              callback_url: metadata.callbackUrl || '',
            };
          }
          // Untuk ShopeePay
          else if (paymentMethod.methodName === 'shopeepay') {
            body.payment_type = 'shopeepay';
            body.shopeepay = {
              callback_url: metadata.callbackUrl || '',
            };
          } else {
            throw new Error(
              `Tipe e-wallet ${metadata.ewalletType} tidak didukung`,
            );
          }
          break;
        case 'credit_card':
          body.payment_type = 'credit_card';
          body.credit_card = {
            token_id: paymentMethod.methodName,
            authentication: true,
          };
          break;
        case 'bank_transfer':
          body.payment_type = 'bank_transfer';
          body.bank_transfer = {
            bank: paymentMethod.methodName || 'bca',
          };
          break;
        default:
          throw new Error(
            `Tipe metode pembayaran Midtrans ${paymentMethod.methodType} tidak didukung`,
          );
      }

      // Mengatur header autentikasi untuk Midtrans
      const auth = Buffer.from(`${this.MIDTRANS_SERVER_KEY}:`).toString(
        'base64',
      );

      const url = `${this.MIDTRANS_BASE_URL}/snap/v1/transactions`;

      this.logger.debug(`body midtrans ${JSON.stringify(body)}`);
      this.logger.debug(`process payment url midtrans ${url}`);

      // Mengirim permintaan ke Midtrans API
      const response = await axios.post(url, body, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Basic ${auth}`,
        },
      });

      this.logger.debug(`response body: ${JSON.stringify(response.data)}`);

      // Mengembalikan hasil transaksi
      return {
        success: true,
        paymentReference,
        redirectUrl: response.data.redirect_url,
        token: response.data.token,
        transactionId: response.data.transaction_id || null,
        gatewayResponse: response.data,
        expiredAt: response.data.expired_at,
      };
    } catch (e) {
      this.logger.error(
        `Midtrans payment error: ${e.response?.data} || ${e.message}`,
      );

      throw new Error(
        `Gagal memproses pembayaran: ${e.response?.data?.error_messages?.[0] || e.message}`,
      );
    }
  }

  async verifyNotification(notification: any, headers: any) {
    try {
      // Validasi signature dari Midtrans
      const signature = headers['x-signature'] || '';
      const expectedSignature = this.generateMidtransSignature(
        notification.order_id,
        notification.status_code,
        notification.gross_amount,
        this.MIDTRANS_SERVER_KEY,
      );

      if (signature !== expectedSignature) {
        throw new Error('Invalid signature from Midtrans');
      }

      // Menentukan status pembayaran berdasarkan Midtrans notification
      let paymentStatus;
      switch (notification.transaction_status) {
        case 'capture':
        case 'settlement':
          paymentStatus = PaymentStatus.COMPLETED;
          break;
        case 'pending':
          paymentStatus = PaymentStatus.PENDING;
          break;
        default:
          paymentStatus = PaymentStatus.FAILED;
      }

      return {
        isValid: true,
        transactionId: notification.transaction_id,
        orderId: notification.order_id,
        paymentStatus,
        amount: parseFloat(notification.gross_amount),
        paymentType: notification.payment_type,
        transactionTime: notification.transaction_time,
        rawData: notification,
      };
    } catch (error) {
      console.error('Error verifying Midtrans notification:', error);
      return {
        isValid: false,
        errorMessage: error.message,
      };
    }
  }

  /**
   * Method untuk mengecek status transaksi di Midtrans
   */
  async checkTransactionStatus(orderId: string) {
    try {
      const auth = Buffer.from(`${this.MIDTRANS_SERVER_KEY}:`).toString(
        'base64',
      );

      const url = `https://api.sandbox.midtrans.com/v2/${orderId}/status`;

      this.logger.debug(`url midtrans check transaction: ${url}`);

      const response = await axios.get(url, {
        headers: {
          Accept: 'application/json',
          Authorization: `Basic ${auth}`,
        },
      });

      return {
        success: true,
        transactionStatus: response.data.transaction_status,
        fraudStatus: response.data.fraud_status,
        orderId: response.data.order_id,
        paymentType: response.data.payment_type,
        rawData: response.data,
      };
    } catch (error) {
      console.error(
        'Error checking transaction status:',
        error.response?.data || error.message,
      );

      throw new Error(
        `Gagal memeriksa status transaksi: ${error.response?.data?.error_messages?.[0] || error.message}`,
      );
    }
  }

  /**
   * Method untuk membatalkan transaksi di Midtrans
   */
  async cancelTransaction(orderId: string) {
    try {
      const auth = Buffer.from(`${this.MIDTRANS_SERVER_KEY}:`).toString(
        'base64',
      );

      const response = await axios.post(
        `${this.MIDTRANS_BASE_URL.replace('/snap', '')}/v2/${orderId}/cancel`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Basic ${auth}`,
          },
        },
      );

      return {
        success: true,
        transactionStatus: response.data.transaction_status,
        orderId: response.data.order_id,
        rawData: response.data,
      };
    } catch (error) {
      console.error(
        'Error cancelling transaction:',
        error.response?.data || error.message,
      );

      throw new Error(
        `Gagal membatalkan transaksi: ${error.response?.data?.error_messages?.[0] || error.message}`,
      );
    }
  }

  /**
   * Helper method untuk menghasilkan signature Midtrans untuk verifikasi
   * @private
   */
  private generateMidtransSignature(
    orderId: string,
    statusCode: string,
    grossAmount: string,
    serverKey: string,
  ): string {
    const crypto = require('crypto');
    const data = `${orderId}${statusCode}${grossAmount}${serverKey}`;

    return crypto.createHash('sha512').update(data).digest('hex');
  }
}
