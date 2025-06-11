import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { CONFIG } from '../config/config.schema';
import axios from 'axios';
import qs from 'qs';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class NotificationService {
  // private twilioClient: twilio.Twilio;
  private zenzivaUserKey: string;
  private zenzivaPassKey: string;

  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly mailer: MailerService,
  ) {
    // const accountId = CONFIG.TWILIO_ACCOUNT_SID;
    // const authToken = CONFIG.TWILIO_AUTH_TOKEN;
    this.zenzivaUserKey = CONFIG.ZENZIVA_USERKEY;
    this.zenzivaPassKey = CONFIG.ZENZIVA_PASSKEY;
    // this.twilioClient = twilio(accountId, authToken);
  }

  async sendOtp(
    type: string,
    username: string,
    phoneNumber: string,
    otp: string,
  ): Promise<Boolean> {
    try {
      let message: string;

      switch (type) {
        case 'login':
          message = this.messageOtpLogin(username, otp);
          break;
        case 'reset-password':
          message = this.messageOtpForgotPassword(username, otp);
          break;
        default:
          message = this.messageOtpDefault(username, otp);
      }

      // const message = `[Smart Parking] Kode OTP Anda adalah: ${otp}. Kode ini berlaku selama 10 menit.`;
      // const message = `Verif ${otp}. Berlaku 10 Menit`;
      // return await this.sendMessage(phoneNumber, message);
      return await this.sendOtpViaZenziva(phoneNumber, message);
    } catch (error) {
      this.logger.error(
        `failed to send OTP to ${phoneNumber}: ${error.message}`,
      );
      return false;
    }
  }

  // async sendMessage(phoneNumber: string, message: string): Promise<Boolean> {
  //   try {
  //     // Implementasi pengiriman SMS dengan Twilio:
  //     await this.twilioClient.messages.create({
  //       body: message,
  //       from: CONFIG.TWILIO_PHONE_NUMBER,
  //       to: phoneNumber,
  //     });
  //
  //     // Untuk development, log saja
  //     this.logger.info(
  //       `[DEV ONLY] SMS would be sent to ${phoneNumber}: "${message}"`,
  //     );
  //
  //     return true;
  //   } catch (error) {
  //     this.logger.error(
  //       `Failed to send SMS to ${phoneNumber}: ${error.message}`,
  //     );
  //
  //     return false;
  //   }
  // }

  async sendOtpViaZenziva(
    phoneNumber: string,
    message: string,
  ): Promise<Boolean> {
    phoneNumber = phoneNumber.replace(/^\+/, '');
    const payload = {
      userkey: this.zenzivaUserKey,
      passkey: this.zenzivaPassKey,
      to: phoneNumber,
      message: message,
    };

    this.logger.debug(`payload zenziva ${JSON.stringify(payload)}`);

    try {
      const response = await axios.post(
        'https://console.zenziva.net/reguler/api/sendsms/',
        qs.stringify(payload),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      console.log(response.data);
      // Kamu bisa parsing response.data untuk lihat status

      return true;
    } catch (error) {
      console.error('Gagal kirim OTP:', error.message);
      return false;
    }
  }

  messageOtpLogin(username: string, otp: string): string {
    return `Percobaan login dengan username: ${username}\n. 
    Berikut kode OTP untuk Login Ke Smartparking: ${otp} Kode ini berlaku selama 10 menit.
    \n
    Abaikan Jika Anda Tidak Melakukan Login.
    `;
  }

  messageOtpForgotPassword(username: string, otp: string): string {
    return `Percobaan reset password dengan username: ${username}.\n
    Berikut kode OTP untuk reset password Ke Smartparking: ${otp} Kode ini berlaku selama 10 menit.
    \n
    Abaikan Jika Anda Tidak Melakukan Reset Password.
    `;
  }

  async sendRegisterInfoEmail(
    username: string,
    email: string,
    registrationDate: any,
    password: string,
  ): Promise<void> {
    this.logger.info(
      `send register info email: ${email}, password: ${password}`,
    );

    try {
      await this.mailer.sendMail({
        to: email,
        subject: 'register place smart parking',
        template: 'admin-register',
        context: {
          userName: username,
          userEmail: email,
          registrationDate: registrationDate,
          password: password,
        },
      });
    } catch (e) {
      this.logger.error(`error send register info email ${e}`);
    }
  }

  async sendActivationInfoEmail(
    username: string,
    email: string,
    url: string,
  ): Promise<void> {
    try {
      await this.mailer.sendMail({
        to: email,
        subject: 'activation info',
        template: 'admin-activation',
        context: {
          username: username,
          activationUrl: url,
        },
      });
    } catch (e) {
      this.logger.error(`send actiation info email: ${email}, email: ${url}`);
    }
  }

  private messageOtpDefault(username: string, otp: string): string {
    return `Kode OTP Smartparking Anda adalah: ${otp}. Kode ini berlaku selama 10 menit. \n
    \n
    Abaikan Jika Anda Tidak Melakukan Bukan Anda. `;
  }
}
