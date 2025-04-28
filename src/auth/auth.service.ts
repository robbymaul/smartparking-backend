import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { IAuthRepository } from './auth.repository';
import { Logger } from 'winston';
import {
  mapToRegisterResponseDto,
  RegisterRequestDto,
  RegisterResponseDto,
} from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { UserEntity } from '../entities/user.entity';
import { UserProfileEntity } from '../entities/user.profile.entity';
import { NotificationSettingEntity } from '../entities/notification.setting.entity';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaClient } from '../../generated/prisma';
import {
  LoginRequestDto,
  LoginResponseDto,
  mapToLoginResponseDto,
} from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { SystemLogEntity } from '../entities/system.log.entity';
import { handlePrismaError } from '../common/helpers/handle.prisma.error';
import {
  mapToRefreshTokenResponseDto,
  RefreshTokenRequestDto,
  RefreshTokenResponseDto,
} from './dto/refresh.token.dto';
import { LogoutRequestDto } from './dto/logout.dto';
import { UserSessionEntity } from '../entities/user.session.entity';
import { VerifyEmailRequestDto } from './dto/verify.email.dto';
import { EmailVerificationTokenEntity } from '../entities/verification.email.token.entity';
import { CONFIG } from '../config/config.schema';
import {
  mapToNotificationResponseDto,
  NotificationResponseDto,
} from './dto/notification.dto';
import {
  SendPhoneOtpRequestDto,
  VerifyPhoneRequestDto,
} from './dto/verify.phone.dto';
import { PhoneVerificationOtpEntity } from '../entities/phone.verification.otp.entity';
import { NotificationService } from '../notification/notification.service';
import {
  ForgotPasswordRequestDto,
  ResetPasswordRequestDto,
  VerifyForgotPasswordOtpRequestDto,
} from './dto/fogot.password.dto';
import { v4 as uuidv4 } from 'uuid';
import { PasswordResetTokenEntity } from '../entities/password.reset.token.entity';
import { GoogleAuthRequestDto } from './dto/google.auth.dto';
import { GoogleAuthStrategy } from '../common/strategies/google.strategy';
import { AccountType } from './interface/acount.type';

@Injectable()
export class AuthService {
  constructor(
    @Inject('IAuthRepository')
    private readonly authRepository: IAuthRepository,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly notificationService: NotificationService,
    private readonly googleAuthStrategy: GoogleAuthStrategy,
  ) {}

  async registerService(
    registerDto: RegisterRequestDto,
  ): Promise<RegisterResponseDto> {
    const {
      username,
      email,
      password,
      phoneNumber,
      accountType = 'regular',
      firstName,
      lastName,
    } = registerDto;

    const result = await this.prismaService.transactional(
      async (prisma: PrismaClient): Promise<Record<any, any>> => {
        const existingUser =
          await this.authRepository.getExistingUserRepository({
            username: username,
            email: email,
          });

        if (existingUser) {
          throw new ConflictException(
            'Username, email, atau nomor telepon sudah terdaftar',
          );
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Generate verification token untuk email
        const emailVerificationToken = randomBytes(32).toString('hex');
        const emailTokenExpiry = new Date();
        emailTokenExpiry.setHours(emailTokenExpiry.getHours() + 24); // Berlaku 24 jam

        const newUser = new UserEntity({
          username: username,
          email: email,
          passwordHash: passwordHash,
          phoneNumber: phoneNumber,
          accountType: accountType,
          emailVerified: false,
          phoneVerified: false,
          accountStatus: 'active',
          googleId: null,
          createdAt: new Date(),
        });

        const newProfile = new UserProfileEntity({
          firstName: firstName,
          lastName: lastName,
          createdAt: new Date(),
        });

        const userEntity = await this.authRepository.createUserRepository(
          prisma,
          newUser,
          newProfile,
        );

        const newVerificationEmailToken = new EmailVerificationTokenEntity({
          userId: userEntity.id || 0,
          token: emailVerificationToken,
          expiresAt: emailTokenExpiry,
          createdAt: new Date(),
        });

        const newNotificationSetting = new NotificationSettingEntity({
          userId: userEntity.id ?? 0,
          emailEnabled: true,
          smsEnabled: true,
          pushEnabled: true,
          bookingConfirmation: true,
          paymentNotifications: true,
          reminderNotifications: true,
          marketingNotifications: false,
          createdAt: new Date(),
        });

        await this.authRepository.createEmailVerificationTokenEntity(
          prisma,
          newVerificationEmailToken,
        );

        await this.authRepository.createNotificationSettingRepository(
          prisma,
          newNotificationSetting,
        );

        return {
          user: userEntity,
          profile: newProfile,
        };
      },
    );

    const { user, profile } = result;

    return mapToRegisterResponseDto({ user: user, profile: profile });
  }

  async loginService(loginDto: LoginRequestDto): Promise<LoginResponseDto> {
    const { usernameOrEmailOrPhoneNumber, password } = loginDto;

    const result = await this.prismaService.transactional(
      async (prisma: PrismaClient): Promise<Record<any, any>> => {
        const userEntity =
          await this.authRepository.getUserByUsernameOrEmailOrPhoneNumberRepository(
            usernameOrEmailOrPhoneNumber,
          );

        // Jika user tidak ditemukan
        if (!userEntity) {
          throw new UnauthorizedException('Username atau password salah');
        }

        if (userEntity.accountStatus !== 'active') {
          throw new ForbiddenException(
            `Akun tidak aktif. Status: ${userEntity.accountStatus}`,
          );
        }

        // Verifikasi password
        const isPasswordValid = await bcrypt.compare(
          password,
          userEntity.passwordHash,
        );
        if (!isPasswordValid) {
          throw new UnauthorizedException('Username atau password salah');
        }

        userEntity.lastLogin = new Date();

        await this.authRepository.updateLastLoginUserRepository(
          prisma,
          userEntity,
        );

        const tokens = await this.generateTokens(userEntity);

        const newSystemLogEntity = new SystemLogEntity({
          entityType: 'user',
          entityId: userEntity.id ?? 0,
          action: 'login',
          performedBy: `user:${userEntity.id}`,
          logLevel: 'info',
          logDetails: JSON.stringify({
            ip: '127.0.0.1',
            userAgent: 'web',
            timeStamp: new Date(),
          }),
          logTime: new Date(),
          createdAt: new Date(),
        });

        await this.saveUserRefreshToken(prisma, userEntity, tokens);

        await this.authRepository.createSystemLogRepository(
          prisma,
          newSystemLogEntity,
        );

        return {
          token: tokens,
        };
      },
    );

    const { token } = result;

    return mapToLoginResponseDto({ token: token });
  }

  async refreshTokenService(userId: any, request: RefreshTokenRequestDto) {
    const { refreshToken } = request;

    const userSessionEntity =
      await this.authRepository.getUserSessionByUserIdAndRefreshToken(
        userId,
        refreshToken,
      );

    if (!userSessionEntity || !userSessionEntity.User) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const result = await this.prismaService.transactional(
      async (prisma: PrismaClient): Promise<Record<any, any>> => {
        if (userSessionEntity.User?.accountStatus !== 'active') {
          // Invalidasi semua session jika akun tidak aktif
          await this.authRepository.updateManyUserSessionInactiveRepository(
            prisma,
            userId,
          );

          throw new UnauthorizedException('User account is not active');
        }

        await this.authRepository.updateUserSessionInactiveRepository(
          prisma,
          userSessionEntity,
        );

        const tokens = await this.generateTokens(userId);

        await this.saveUserRefreshToken(prisma, userSessionEntity.User, tokens);

        const newSystemLogEntity = new SystemLogEntity({
          entityType: 'user',
          entityId: userId,
          action: 'login',
          performedBy: `user:${userId}`,
          logLevel: 'info',
          logDetails: JSON.stringify({
            ip: '127.0.0.1',
            userAgent: 'web',
            timeStamp: new Date(),
          }),
          logTime: new Date(),
          createdAt: new Date(),
        });

        await this.authRepository.createSystemLogRepository(
          prisma,
          newSystemLogEntity,
        );

        return {
          token: tokens,
        };
      },
    );

    const { token } = result;

    return mapToRefreshTokenResponseDto({ token: token });
  }

  async logoutService(
    userId: any,
    request: LogoutRequestDto,
  ): Promise<NotificationResponseDto> {
    const { refreshToken, sessionId, reason = 'manual_logout' } = request;

    if (refreshToken) {
      const userSessionEntity =
        await this.authRepository.getUserSessionByUserIdAndRefreshToken(
          userId,
          refreshToken,
        );

      if (!userSessionEntity) {
        throw new NotFoundException(
          'Session tidak ditemukan atau sudah tidak aktif',
        );
      }

      await this.invalidateSession(userSessionEntity, reason);

      return mapToNotificationResponseDto({
        success: true,
        loggedOut: 'single',
        message: 'Berhasil logout dari sesi',
      });
    }

    if (sessionId) {
      const userSessionEntity =
        await this.authRepository.getUserSessionByUserIdAndSessionIdRepository(
          userId,
          sessionId,
        );

      if (!userSessionEntity) {
        throw new NotFoundException(
          'Session tidak ditemukan atau sudah tidak aktif',
        );
      }
      await this.invalidateSession(userSessionEntity, reason);

      return mapToNotificationResponseDto({
        success: true,
        loggedOut: 'single',
        message: 'Berhasil logout dari sesi',
      });
    }

    const result = await this.prismaService.transactional(
      async (prisma: PrismaClient): Promise<number> => {
        try {
          const result = await prisma.userSession.updateMany({
            where: {
              userId,
              isActive: true,
            },
            data: {
              isActive: false,
              updatedAt: new Date(),
            },
          });

          // Log untuk audit
          await prisma.systemLog.create({
            data: {
              entityType: 'user',
              entityId: userId,
              action: 'logout_all',
              performedBy: `user:${userId}`,
              logLevel: 'info',
              logDetails: JSON.stringify({
                sessionsCount: result.count,
                reason,
                timestamp: new Date(),
              }),
            },
          });

          return result.count;
        } catch (e) {
          this.logger.error(`logout service ${e}`);

          handlePrismaError(e, 'logout service');
        }
      },
    );

    return mapToNotificationResponseDto({
      success: true,
      message: 'Berhasil logout dari semua sesi',
      sessionsCount: result,
      loggedOut: 'all',
    });
  }

  async verifyEmailService(
    verifyEmailRequestDto: VerifyEmailRequestDto,
  ): Promise<NotificationResponseDto> {
    const { token } = verifyEmailRequestDto;

    const verificationEmailTokenEntity =
      await this.authRepository.getEmailVerificationTokenRepository(token);

    if (!verificationEmailTokenEntity) {
      throw new BadRequestException(
        'Token verifikasi tidak valid atau sudah kedaluwarsa',
      );
    }

    const userEntity = await this.authRepository.getUserByIdRepository(
      verificationEmailTokenEntity.userId,
    );

    if (!userEntity) {
      throw new NotFoundException('User tidak ditemukan');
    }

    if (userEntity.emailVerified) {
      throw new ConflictException('Email sudah terverifikasi sebelumnya');
    }

    const result = await this.prismaService.transactional(
      async (prisma: PrismaClient): Promise<NotificationResponseDto> => {
        userEntity.emailVerified = true;

        await this.authRepository.updateUserEmailVerifiedRepository(
          prisma,
          userEntity,
        );

        await this.authRepository.deleteEmailVerificationTokenRepository(
          prisma,
          token,
        );

        const newSystemLog = new SystemLogEntity({
          entityType: 'user',
          entityId: userEntity.id || 0,
          action: 'email_verified',
          performedBy: `user:${userEntity.id}`,
          logLevel: 'info',
          logDetails: JSON.stringify({
            timestamp: new Date(),
            email: userEntity.email,
          }),
          logTime: new Date(),
          createdAt: new Date(),
        });

        await this.authRepository.createSystemLogRepository(
          prisma,
          newSystemLog,
        );

        return mapToNotificationResponseDto({
          success: true,
          message: 'Email berhasil diverifikasi',
          email: userEntity.email,
        });
      },
    );

    return result;
  }

  async resendVerifyEmailService(user: any): Promise<NotificationResponseDto> {
    const userEntity = await this.authRepository.getUserByIdRepository(user.id);

    if (!userEntity) {
      throw new NotFoundException('User tidak ditemukan');
    }

    // Cek apakah email sudah terverifikasi
    if (userEntity.emailVerified) {
      throw new ConflictException('Email sudah terverifikasi');
    }

    const verificationEmailTokenEntity =
      await this.authRepository.getEmailVerificationTokenByUserIdRepository(
        user.id,
      );

    const result = await this.prismaService.transactional(
      async (prisma: PrismaClient): Promise<NotificationResponseDto> => {
        if (verificationEmailTokenEntity) {
          const lastSentAt = new Date(verificationEmailTokenEntity.createdAt);
          const cooldownMinute = CONFIG.EMAIL_VERIFICATION_COOLDOWN_MINUTE;
          const cooldownMs = cooldownMinute * 60 * 1000;

          if (Date.now() - lastSentAt.getTime() < cooldownMs) {
            const waitTimeMinutes = Math.ceil(
              (cooldownMs - (Date.now() - lastSentAt.getTime())) / 60000,
            );
            throw new BadRequestException(
              `Terlalu banyak permintaan. Silakan tunggu ${waitTimeMinutes} menit sebelum meminta verifikasi lagi.`,
            );
          }

          await this.authRepository.deleteEmailVerificationTokenRepository(
            prisma,
            verificationEmailTokenEntity.token,
          );
        }

        // Generate token verifikasi baru
        const token = randomBytes(32).toString('hex');
        const expiryHours = CONFIG.EMAIL_VERIFICATION_EXPIRY_HOURS;
        const expiryTime = new Date();
        expiryTime.setHours(expiryTime.getHours() + expiryHours);

        const newVerificationEmailTokenEntity =
          new EmailVerificationTokenEntity({
            userId: userEntity.id || 0,
            token: token,
            expiresAt: expiryTime,
            createdAt: new Date(),
          });

        await this.authRepository.createEmailVerificationTokenEntity(
          prisma,
          newVerificationEmailTokenEntity,
        );

        const newSystemLog = new SystemLogEntity({
          entityType: 'user',
          entityId: userEntity.id || 0,
          action: 'email_verification_sent',
          performedBy: `user:${userEntity.id}`,
          logLevel: 'info',
          logDetails: JSON.stringify({
            timestamp: new Date(),
            email: userEntity.email,
          }),
          logTime: new Date(),
          createdAt: new Date(),
        });

        await this.authRepository.createSystemLogRepository(
          prisma,
          newSystemLog,
        );

        // Opsional: Kirim SMS konfirmasi
        // await this.smsService.sendMessage(
        //   otpData.phoneNumber,
        //   'Nomor telepon Anda telah berhasil diverifikasi untuk akun Smart Parking.'
        // );

        return mapToNotificationResponseDto({
          success: true,
          message: 'Email verifikasi telah dikirim',
          email: userEntity.email,
        });
      },
    );

    return result;
  }

  async verifyPhoneService(
    user: any,
    verifyPhoneDto: VerifyPhoneRequestDto,
  ): Promise<NotificationResponseDto> {
    const { otp } = verifyPhoneDto;

    const userEntity = await this.authRepository.getUserByIdRepository(user.id);

    if (!userEntity) {
      throw new NotFoundException('User tidak ditemukan');
    }

    const phoneVerificationOtpEntity =
      await this.authRepository.getPhoneVerificationOtpByUserIdAndOtpRepository(
        user.id,
        otp,
      );

    if (!phoneVerificationOtpEntity) {
      throw new BadRequestException('OTP tidak valid atau sudah kedaluwarsa');
    }

    const result = await this.prismaService.transactional(
      async (prisma: PrismaClient): Promise<NotificationResponseDto> => {
        userEntity.phoneVerified = true;
        userEntity.phoneNumber = phoneVerificationOtpEntity.phoneNumber;
        await this.authRepository.updateUserPhoneVerifiedRepository(
          prisma,
          userEntity,
        );

        await this.authRepository.deleteManyPhoneVerificationOtpRepository(
          prisma,
          userEntity,
        );

        const tokens = await this.generateTokens(userEntity);

        await this.saveUserRefreshToken(prisma, userEntity, tokens);

        const newSystemLog = new SystemLogEntity({
          entityType: 'user',
          entityId: userEntity.id || 0,
          action: 'phone_verified',
          performedBy: `user:${userEntity.id}`,
          logLevel: 'info',
          logDetails: JSON.stringify({
            timestamp: new Date(),
            phoneNumber: phoneVerificationOtpEntity.phoneNumber,
          }),
          logTime: new Date(),
          createdAt: new Date(),
        });

        await this.authRepository.createSystemLogRepository(
          prisma,
          newSystemLog,
        );

        return mapToNotificationResponseDto({
          success: true,
          message: 'Nomor telepon berhasil diverifikasi',
          phoneNumber: phoneVerificationOtpEntity.phoneNumber,
          token: tokens,
        });
      },
    );

    return result;
  }

  async sendPhoneOtpService(
    user: any,
    sendPhoneOtpDto: SendPhoneOtpRequestDto,
  ): Promise<NotificationResponseDto> {
    const { phoneNumber } = sendPhoneOtpDto;

    const userEntity = await this.authRepository.getUserByIdRepository(user.id);

    if (!userEntity) {
      throw new NotFoundException('User tidak ditemukan');
    }

    const result = await this.prismaService.transactional(
      async (prisma: PrismaClient): Promise<NotificationResponseDto> => {
        userEntity.phoneNumber = phoneNumber;
        const existingPhoneVerificationOtp =
          await this.authRepository.getExistingPhoneVerificationOtpRepository(
            userEntity,
          );

        // Jika ada OTP yang masih valid, cek waktu cooldown
        if (existingPhoneVerificationOtp) {
          const lastSentAt = existingPhoneVerificationOtp.createdAt;
          const cooldownMinutes = CONFIG.PHONE_VERIFICATION_COOLDOWN_MINUTES;
          const cooldownMs = cooldownMinutes * 60 * 1000;

          if (Date.now() - lastSentAt.getTime() < cooldownMs) {
            const waitTimeSeconds = Math.ceil(
              (cooldownMs - (Date.now() - lastSentAt.getTime())) / 1000,
            );
            throw new BadRequestException(
              `Terlalu banyak permintaan. Silakan tunggu ${waitTimeSeconds} detik sebelum meminta OTP baru.`,
            );
          }

          // Hapus OTP lama jika sudah melewati cooldown
          await this.authRepository.deleteManyPhoneVerificationOtpRepository(
            prisma,
            userEntity,
          );
        }

        // Generate OTP baru (6 digit angka)
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiryMinutes = CONFIG.PHONE_VERIFICATION_EXPIRY_MINUTES;
        const expiryTime = new Date();
        expiryTime.setMinutes(expiryTime.getMinutes() + expiryMinutes);

        const newPhoneVerificationEntity = new PhoneVerificationOtpEntity({
          userId: userEntity.id || 0,
          phoneNumber: userEntity.phoneNumber,
          otp: otp,
          expiresAt: expiryTime,
          createdAt: new Date(),
        });

        await this.authRepository.createPhoneVerificationOtpRepository(
          prisma,
          newPhoneVerificationEntity,
        );

        // Kirim OTP via SMS
        // Pada implementasi asli, gunakan SMS service, contoh:
        await this.notificationService.sendOtp(phoneNumber, otp);

        this.logger.info(
          `[DEV ONLY] Phone verification OTP for ${phoneNumber}: ${otp}`,
        );
        this.logger.info(`OTP kedaluwarsa dalam ${expiryMinutes} menit`);

        const newSystemLog = new SystemLogEntity({
          entityType: 'user',
          entityId: userEntity.id || 0,
          action: 'phone_otp_sent',
          performedBy: `user:${userEntity.id}`,
          logLevel: 'info',
          logDetails: JSON.stringify({
            timestamp: new Date(),
            phoneNumber: userEntity.phoneNumber,
          }),
          logTime: new Date(),
          createdAt: new Date(),
        });

        await this.authRepository.createSystemLogRepository(
          prisma,
          newSystemLog,
        );

        return mapToNotificationResponseDto({
          success: true,
          message: `OTP telah dikirim ke ${phoneNumber}`,
          phoneNumber: userEntity.phoneNumber,
          expiryMinutes: expiryMinutes,
        });
      },
    );

    return result;
  }

  async resendPhoneOtpService(user: any): Promise<NotificationResponseDto> {
    const userEntity = await this.authRepository.getUserByIdRepository(user.id);

    if (!userEntity) {
      throw new NotFoundException('User tidak ditemukan');
    }

    if (!userEntity.phoneNumber) {
      throw new BadRequestException(
        'Tidak ada nomor telepon yang tersimpan untuk akun ini',
      );
    }

    return this.sendPhoneOtpService(user, {
      phoneNumber: userEntity.phoneNumber,
    });
  }

  async forgotPasswordRequestService(
    forgotPasswordRequest: ForgotPasswordRequestDto,
  ): Promise<NotificationResponseDto> {
    const { phoneNumber } = forgotPasswordRequest;

    const userEntity =
      await this.authRepository.getUserByPhoneNumberRepository(phoneNumber);

    if (!userEntity) {
      throw new NotFoundException(
        'Tidak ada akun terdaftar dengan nomor telepon ini atau nomor telepon belum terverifikasi',
      );
    }

    if (userEntity.accountStatus !== 'active') {
      throw new BadRequestException(
        `Akun tidak aktif. Status: ${userEntity.accountStatus}`,
      );
    }

    const result = await this.prismaService.transactional(
      async (prisma: PrismaClient): Promise<NotificationResponseDto> => {
        const existingVerificationPhoneOtp =
          await this.authRepository.getExistingPhoneVerificationOtpRepository(
            userEntity,
          );

        if (existingVerificationPhoneOtp) {
          const lastSentAt = existingVerificationPhoneOtp.createdAt;
          const cooldownMinutes = CONFIG.FORGOT_PASSWORD_COOLDOWN_MINUTES;
          const cooldownMs = cooldownMinutes * 60 * 1000;

          if (Date.now() - lastSentAt.getTime() < cooldownMs) {
            const waitTimeSeconds = Math.ceil(
              (cooldownMs - (Date.now() - lastSentAt.getTime())) / 1000,
            );
            throw new BadRequestException(
              `Terlalu banyak permintaan. Silakan tunggu ${waitTimeSeconds} detik sebelum meminta OTP baru.`,
            );
          }

          await this.authRepository.deleteManyPhoneVerificationOtpRepository(
            prisma,
            userEntity,
          );
        }

        // Generate OTP baru
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiryMinutes = CONFIG.FORGOT_PASSWORD_OTP_EXPIRY_MINUTES;
        const expiryTime = new Date();
        expiryTime.setMinutes(expiryTime.getMinutes() + expiryMinutes);

        const newPhoneVerificationEntity = new PhoneVerificationOtpEntity({
          userId: userEntity.id || 0,
          phoneNumber: userEntity.phoneNumber,
          otp: otp,
          expiresAt: expiryTime,
          createdAt: new Date(),
          // purpose: 'forgot_password', // Tambahkan field purpose di model
        });

        await this.authRepository.createPhoneVerificationOtpRepository(
          prisma,
          newPhoneVerificationEntity,
        );

        // Kirim OTP via SMS
        // Gunakan pesan khusus untuk forgot password
        const otpMessage = `[Smart Parking] Kode reset password Anda: ${otp}. Kode berlaku selama ${expiryMinutes} menit. Jangan berikan kode ini kepada siapapun.`;
        await this.notificationService.sendMessage(phoneNumber, otpMessage);

        const newSystemLog = new SystemLogEntity({
          entityType: 'user',
          entityId: userEntity.id || 0,
          action: 'forgot_password_sent_otp',
          performedBy: `system`,
          logLevel: 'info',
          logDetails: JSON.stringify({
            timestamp: new Date(),
            phoneNumber: userEntity.phoneNumber,
          }),
          logTime: new Date(),
          createdAt: new Date(),
        });

        await this.authRepository.createSystemLogRepository(
          prisma,
          newSystemLog,
        );

        return mapToNotificationResponseDto({
          success: true,
          message: `OTP untuk reset password telah dikirim ke ${phoneNumber}`,
          phoneNumber: userEntity.phoneNumber,
          expiryMinutes: expiryMinutes,
        });
      },
    );

    return result;
  }

  async verifyForgotPasswordOtpService(
    verifyForgotPasswordOtpRequestDto: VerifyForgotPasswordOtpRequestDto,
  ): Promise<NotificationResponseDto> {
    const { phoneNumber, otp } = verifyForgotPasswordOtpRequestDto;

    const userEntity =
      await this.authRepository.getUserByPhoneNumberRepository(phoneNumber);

    if (!userEntity) {
      throw new NotFoundException(
        'Tidak ada akun terdaftar dengan nomor telepon ini',
      );
    }

    const verificationPhoneOtpEntity =
      await this.authRepository.getPhoneVerificationOtpByUserIdAndOtpRepository(
        userEntity.id,
        otp,
      );

    if (!verificationPhoneOtpEntity) {
      throw new BadRequestException('OTP tidak valid atau sudah kedaluwarsa');
    }

    // Generate token untuk reset password
    const resetToken = uuidv4();
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setMinutes(resetTokenExpiry.getMinutes() + 30); // Token berlaku 30 menit

    const result = await this.prismaService.transactional(
      async (prisma: PrismaClient): Promise<NotificationResponseDto> => {
        const newPasswordResetTokenEntity = new PasswordResetTokenEntity({
          userId: userEntity.id || 0,
          token: resetToken,
          expiresAt: resetTokenExpiry,
          createdAt: new Date(),
        });

        await this.authRepository.createPasswordResetTokenRepository(
          prisma,
          newPasswordResetTokenEntity,
        );

        await this.authRepository.deleteManyPhoneVerificationOtpRepository(
          prisma,
          userEntity,
        );

        const newSystemLog = new SystemLogEntity({
          entityType: 'user',
          entityId: userEntity.id || 0,
          action: 'forgot_password_otp_verified',
          performedBy: `system`,
          logLevel: 'info',
          logDetails: JSON.stringify({
            timestamp: new Date(),
            phoneNumber: userEntity.phoneNumber,
          }),
          logTime: new Date(),
          createdAt: new Date(),
        });

        await this.authRepository.createSystemLogRepository(
          prisma,
          newSystemLog,
        );

        return mapToNotificationResponseDto({
          success: true,
          message: 'OTP terverifikasi, silakan reset password Anda',
          token: resetToken,
          phoneNumber: userEntity.phoneNumber,
          validUntil: resetTokenExpiry,
        });
      },
    );

    return result;
  }

  async resetPasswordService(
    resetPasswordRequestDto: ResetPasswordRequestDto,
  ): Promise<NotificationResponseDto> {
    const { phoneNumber, token, newPassword, confirmPassword } =
      resetPasswordRequestDto;

    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Password baru dan konfirmasi tidak cocok');
    }

    const userEntity =
      await this.authRepository.getUserByPhoneNumberRepository(phoneNumber);

    if (!userEntity) {
      throw new NotFoundException(
        'Tidak ada akun terdaftar dengan nomor telepon ini',
      );
    }

    const passwordResetTokenEntity =
      await this.authRepository.getPasswordResetTokenByUserIdAndTokenRepository(
        userEntity,
        token,
      );

    if (!passwordResetTokenEntity) {
      throw new BadRequestException(
        'Token reset password tidak valid atau sudah kedaluwarsa',
      );
    }

    // Hash password baru
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    const result = await this.prismaService.transactional(
      async (prisma: PrismaClient): Promise<NotificationResponseDto> => {
        userEntity.passwordHash = passwordHash;

        await this.authRepository.updatePasswordUserRepository(
          prisma,
          userEntity,
        );

        await this.authRepository.deleteManyPasswordResetTokenRepository(
          prisma,
          userEntity,
        );

        await this.authRepository.deleteManyUserSessionRepository(
          prisma,
          userEntity,
        );

        const newSystemLog = new SystemLogEntity({
          entityType: 'user',
          entityId: userEntity.id || 0,
          action: 'forgot_password_otp_verified',
          performedBy: `system`,
          logLevel: 'info',
          logDetails: JSON.stringify({
            timestamp: new Date(),
            phoneNumber: userEntity.phoneNumber,
          }),
          logTime: new Date(),
          createdAt: new Date(),
        });

        await this.authRepository.createSystemLogRepository(
          prisma,
          newSystemLog,
        );

        return mapToNotificationResponseDto({
          success: true,
          message: 'Password berhasil di reset',
        });
      },
    );

    return result;
  }

  async googleAuthService(
    googleAuthDto: GoogleAuthRequestDto,
  ): Promise<RefreshTokenResponseDto> {
    const { idToken } = googleAuthDto;

    const googleUser = await this.googleAuthStrategy.validate(idToken);

    const email = googleUser.email;
    const emailVerified = googleUser.verified_email;
    const googleId = googleUser.id;

    if (!email || !emailVerified || !googleId) {
      throw new BadRequestException(
        'Google account tidak valid atau belum diverifikasi',
      );
    }

    let userEntity =
      await this.authRepository.getUserByGoogleIdRepository(googleId);

    if (!userEntity) {
      userEntity = await this.authRepository.getUserByEmailRepository(email);
    }

    const result = await this.prismaService.transactional(
      async (prisma: PrismaClient): Promise<string> => {
        if (!userEntity) {
          const baseUsername =
            (email.split('@')[0] || googleUser.given_name?.toLowerCase()) ??
            `user${Math.floor(Math.random() * 10000)}`;

          const username = await this.generateUniqueUsername(baseUsername);
          const randomPassword = uuidv4();
          const passwordHash = await bcrypt.hash(randomPassword, 10);

          const newUserEntity = new UserEntity({
            username: username,
            email: email,
            phoneNumber: '',
            passwordHash: passwordHash,
            accountType: AccountType.REGULAR,
            emailVerified: true,
            phoneVerified: false,
            accountStatus: 'active',
            googleId: googleId,
            lastLogin: new Date(),
            createdAt: new Date(),
          });

          const newProfile = new UserProfileEntity({
            firstName: googleUser.given_name ?? null,
            lastName: googleUser.family_name ?? null,
            profilePhoto: googleUser.picture ?? null,
            createdAt: new Date() ?? null,
          });

          userEntity = await this.authRepository.createUserRepository(
            prisma,
            newUserEntity,
            newProfile,
          );

          const newNotificationSetting = new NotificationSettingEntity({
            userId: userEntity.id ?? 0,
            emailEnabled: true,
            smsEnabled: true,
            pushEnabled: true,
            bookingConfirmation: true,
            paymentNotifications: true,
            reminderNotifications: true,
            marketingNotifications: false,
            createdAt: new Date(),
          });

          await this.authRepository.createNotificationSettingRepository(
            prisma,
            newNotificationSetting,
          );

          const newSystemLog = new SystemLogEntity({
            entityType: 'user',
            entityId: userEntity.id || 0,
            action: 'google_signup',
            performedBy: `google`,
            logLevel: 'info',
            logDetails: JSON.stringify({
              email: userEntity.email,
              googleId: googleId,
              timestamp: new Date(),
            }),
            logTime: new Date(),
            createdAt: new Date(),
          });

          await this.authRepository.createSystemLogRepository(
            prisma,
            newSystemLog,
          );
        }

        if (userEntity) {
          if (!userEntity?.googleId) {
            userEntity = await this.authRepository.updateUserGoogleIdRepository(
              prisma,
              googleId,
              userEntity,
            );

            const newSystemLog = new SystemLogEntity({
              entityType: 'user',
              entityId: userEntity.id || 0,
              action: 'google_account_linked',
              performedBy: `google`,
              logLevel: 'info',
              logDetails: JSON.stringify({
                email: userEntity.email,
                googleId: userEntity.googleId,
                timestamp: new Date(),
              }),
              logTime: new Date(),
              createdAt: new Date(),
            });

            await this.authRepository.createSystemLogRepository(
              prisma,
              newSystemLog,
            );
          } else {
            await this.authRepository.updateLastLoginUserRepository(
              prisma,
              userEntity,
            );
          }
        }

        const tokens = await this.generateTokens(userEntity);

        await this.saveUserRefreshToken(prisma, userEntity, tokens);

        const newSystemLog = new SystemLogEntity({
          entityType: 'user',
          entityId: userEntity.id || 0,
          action: 'google_signup',
          performedBy: `google`,
          logLevel: 'info',
          logDetails: JSON.stringify({
            email: userEntity.email,
            googleId: googleId,
            timestamp: new Date(),
          }),
          logTime: new Date(),
          createdAt: new Date(),
        });

        await this.authRepository.createSystemLogRepository(
          this.prismaService,
          newSystemLog,
        );

        return tokens;
      },
    );

    return mapToRefreshTokenResponseDto({ token: result });
  }

  private async generateUniqueUsername(baseUsername: string): Promise<string> {
    // Bersihkan username dari karakter non-alphanumeric
    const cleanUsername = baseUsername.replace(/[^a-zA-Z0-9_]/g, '');

    try {
      // Cek apakah username sudah ada
      const existingUser = await this.prismaService.user.findUnique({
        where: { username: cleanUsername },
      });

      if (!existingUser) {
        return cleanUsername;
      }

      // Jika sudah ada, tambahkan random suffix
      const randomSuffix = Math.floor(Math.random() * 10000).toString();
      return this.generateUniqueUsername(`${cleanUsername}${randomSuffix}`);
    } catch (e) {
      this.logger.error(`generate unique username ${e}`);

      throw new BadRequestException(e);
    }
  }

  private async generateTokens(userEntity: UserEntity) {
    const [access_token] = await Promise.all([
      this.jwtService.signAsync({
        sub: userEntity.id,
      }),
    ]);

    return access_token;
  }

  private async saveUserRefreshToken(
    prisma: PrismaClient,
    userEntity: UserEntity | Partial<UserEntity>,
    refreshToken: string,
  ): Promise<void> {
    try {
      const decodeToken = this.jwtService.decode(refreshToken) as {
        exp: number;
      };
      const expiryTime = new Date(decodeToken.exp * 1000);

      const deviceInfo = 'web';
      const ipAddress = '127.0.0.1';

      await prisma.userSession.create({
        data: {
          userId: userEntity.id || 0,
          token: refreshToken,
          deviceInfo: deviceInfo,
          expiryTime: expiryTime,
          isActive: true,
          lastActivity: new Date(),
        },
      });
    } catch (e) {
      this.logger.error(`save user refresh repository ${e}`);

      handlePrismaError(e, 'save user refresh token');
    }
  }

  private async invalidateSession(
    userSessionEntity: UserSessionEntity,
    reason: string,
  ): Promise<void> {
    try {
      await this.prismaService.transactional(
        async (prisma: PrismaClient): Promise<void> => {
          await prisma.userSession.update({
            where: {
              id: userSessionEntity.id,
            },
            data: {
              isActive: false,
              updatedAt: new Date(),
            },
          });

          await prisma.systemLog.create({
            data: {
              entityType: 'user_session',
              entityId: userSessionEntity.id,
              action: 'logout',
              performedBy: `user:${userSessionEntity.userId}`,
              logLevel: 'info',
              logDetails: JSON.stringify({
                deviceInfo: userSessionEntity.deviceInfo,
                ipAddress: userSessionEntity.ipAddress,
                reason,
                timestamp: new Date(),
              }),
            },
          });
        },
      );
    } catch (e) {
      this.logger.error(`invalidate session ${e}`);

      handlePrismaError(e, 'invalidate session');
    }
  }
}
