import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { CONFIG } from '../config/config.schema';

@Injectable()
export class NotificationService {
  // private twilioClient: twilio.Twilio;

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    const accountId = CONFIG.TWILIO_ACCOUNT_SID;
    const authToken = CONFIG.TWILIO_AUTH_TOKEN;
    // this.twilioClient = twilio(accountSid, authToken);
  }

  async sendOtp(phoneNumber: string, otp: string): Promise<Boolean> {
    try {
      const message = `[Smart Parking] Kode OTP Anda adalah: ${otp}. Kode ini berlaku selama 10 menit.`;
      return await this.sendMessage(phoneNumber, message);
    } catch (error) {
      this.logger.error(
        `failed to send OTP to ${phoneNumber}: ${error.message}`,
      );
      return false;
    }
  }

  async sendMessage(phoneNumber: string, message: string): Promise<Boolean> {
    try {
      // Implementasi pengiriman SMS dengan Twilio:
      /*
      await this.twilioClient.messages.create({
        body: message,
        from: this.configService.get<string>('TWILIO_PHONE_NUMBER'),
        to: phoneNumber,
      });
      */

      // Untuk development, log saja
      this.logger.info(
        `[DEV ONLY] SMS would be sent to ${phoneNumber}: "${message}"`,
      );

      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send SMS to ${phoneNumber}: ${error.message}`,
      );

      return false;
    }
  }
}
