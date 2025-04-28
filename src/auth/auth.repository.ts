import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { handlePrismaError } from '../common/helpers/handle.prisma.error';
import { mapToUserEntity, UserEntity } from '../entities/user.entity';
import { UserProfileEntity } from '../entities/user.profile.entity';
import { NotificationSettingEntity } from '../entities/notification.setting.entity';
import { PrismaClient } from 'generated/prisma';
import { SystemLogEntity } from '../entities/system.log.entity';
import {
  mapToUserSessionEntity,
  UserSessionEntity,
} from '../entities/user.session.entity';
import {
  EmailVerificationTokenEntity,
  mapToEmailVerificationTokenEntity,
} from '../entities/verification.email.token.entity';
import {
  mapToPhoneVerificationOtpEntity,
  PhoneVerificationOtpEntity,
} from '../entities/phone.verification.otp.entity';
import {
  mapToPasswordResetTokenEntity,
  PasswordResetTokenEntity,
} from 'src/entities/password.reset.token.entity';

export interface IAuthRepository {
  getExistingUserRepository(param: {
    username: string;
    email: string;
  }): Promise<UserEntity | null>;

  createUserRepository(
    prisma: PrismaClient,
    userEntity: UserEntity,
    profileEntity: UserProfileEntity,
  ): Promise<UserEntity>;

  createNotificationSettingRepository(
    prisma: PrismaClient,
    notificationSettingEntity: NotificationSettingEntity,
  ): Promise<void>;

  getUserByUsernameOrEmailOrPhoneNumberRepository(
    usernameOrEmailOrPhoneNumber: string,
  ): Promise<UserEntity | null>;

  updateLastLoginUserRepository(
    prisma: PrismaClient,
    userEntity: UserEntity,
  ): Promise<void>;

  createSystemLogRepository(
    prisma: PrismaClient,
    newSystemLogEntity: SystemLogEntity,
  ): Promise<void>;

  getUserSessionByUserIdAndRefreshToken(
    userId: any,
    refreshToken: string,
  ): Promise<UserSessionEntity | null>;

  updateManyUserSessionInactiveRepository(
    prisma: PrismaClient,
    userId: any,
  ): Promise<void>;

  updateUserSessionInactiveRepository(
    prisma: PrismaClient,
    userSessionEntity: UserSessionEntity,
  ): Promise<void>;

  getUserSessionByUserIdAndSessionIdRepository(
    userId: any,
    sessionId: number,
  ): Promise<UserSessionEntity | null>;

  getEmailVerificationTokenRepository(
    token: string,
  ): Promise<EmailVerificationTokenEntity | null>;

  getUserByIdRepository(userId: number): Promise<UserEntity | null>;

  updateUserEmailVerifiedRepository(
    prisma: PrismaClient,
    userEntity: UserEntity,
  ): Promise<void>;

  deleteEmailVerificationTokenRepository(
    prisma: PrismaClient,
    token: string,
  ): Promise<void>;

  createEmailVerificationTokenEntity(
    prisma: PrismaClient,
    newVerificationEmailToken: EmailVerificationTokenEntity,
  ): Promise<void>;

  getEmailVerificationTokenByUserIdRepository(
    userId: any,
  ): Promise<EmailVerificationTokenEntity | null>;

  getPhoneVerificationOtpByUserIdAndOtpRepository(
    userId: any,
    otp: string,
  ): Promise<PhoneVerificationOtpEntity | null>;

  updateUserPhoneVerifiedRepository(
    prisma: PrismaClient,
    userEntity: UserEntity,
  ): Promise<void>;

  deleteManyPhoneVerificationOtpRepository(
    prisma: PrismaClient,
    userEntity: UserEntity,
  ): Promise<void>;

  getExistingPhoneVerificationOtpRepository(
    userEntity: UserEntity,
  ): Promise<PhoneVerificationOtpEntity | null>;

  createPhoneVerificationOtpRepository(
    prisma: PrismaClient,
    newPhoneVerificationEntity: PhoneVerificationOtpEntity,
  ): Promise<void>;

  getUserByPhoneNumberRepository(
    phoneNumber: string,
  ): Promise<UserEntity | null>;

  createPasswordResetTokenRepository(
    prisma: PrismaClient,
    newPasswordResetTokenEntity: PasswordResetTokenEntity,
  ): Promise<void>;

  getPasswordResetTokenByUserIdAndTokenRepository(
    userEntity: UserEntity,
    token: string,
  ): Promise<PasswordResetTokenEntity | null>;

  updatePasswordUserRepository(
    prisma: PrismaClient,
    userEntity: UserEntity,
  ): Promise<void>;

  deleteManyPasswordResetTokenRepository(
    prisma: PrismaClient,
    userEntity: UserEntity,
  ): Promise<void>;

  deleteManyUserSessionRepository(
    prisma: PrismaClient,
    userEntity: UserEntity,
  ): Promise<void>;

  getUserByGoogleIdRepository(
    googleId: string | null,
  ): Promise<UserEntity | null>;

  getUserByEmailRepository(email: string): Promise<UserEntity | null>;

  updateUserGoogleIdRepository(
    prisma: PrismaClient,
    googleId: string,
    userEntity: UserEntity | null,
  ): Promise<UserEntity>;
}

@Injectable()
export class AuthRepository implements IAuthRepository {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async updateUserGoogleIdRepository(
    prisma: PrismaClient,
    googleId: string,
    userEntity: UserEntity,
  ): Promise<UserEntity> {
    try {
      const user = await prisma.user.update({
        where: {
          id: userEntity?.id,
        },
        data: {
          googleId: googleId,
        },
      });

      return mapToUserEntity({ user: user });
    } catch (e) {
      this.logger.error(`update user google id repository ${e}`);

      handlePrismaError(e, 'update user google id repository');
    }
  }

  async getUserByEmailRepository(email: string): Promise<UserEntity | null> {
    try {
      const user = await this.prismaService.user.findFirst({
        where: {
          email: email,
        },
        include: {
          profile: true,
        },
      });

      return user
        ? mapToUserEntity({ user: user, profile: user.profile })
        : null;
    } catch (e) {
      this.logger.error(`get user by google id repository ${e}`);

      handlePrismaError(e, 'get user by google id repository');
    }
  }

  async getUserByGoogleIdRepository(
    googleId: string | null,
  ): Promise<UserEntity | null> {
    try {
      const user = await this.prismaService.user.findFirst({
        where: {
          googleId: googleId,
        },
        include: {
          profile: true,
        },
      });

      return user
        ? mapToUserEntity({ user: user, profile: user.profile })
        : null;
    } catch (e) {
      this.logger.error(`get user by google id repository ${e}`);

      handlePrismaError(e, 'get user by google id repository');
    }
  }

  async deleteManyUserSessionRepository(
    prisma: PrismaClient,
    userEntity: UserEntity,
  ): Promise<void> {
    try {
      await prisma.userSession.deleteMany({
        where: {
          userId: userEntity.id,
        },
      });
    } catch (e) {
      this.logger.error(`delete many user session repository ${e}`);

      handlePrismaError(e, 'delete many user session repository');
    }
  }

  async deleteManyPasswordResetTokenRepository(
    prisma: PrismaClient,
    userEntity: UserEntity,
  ): Promise<void> {
    try {
      await prisma.passwordResetToken.deleteMany({
        where: {
          userId: userEntity.id,
        },
      });
    } catch (e) {
      this.logger.error(`delete many password reset token repository ${e}`);

      handlePrismaError(e, 'delete many password reset token repository');
    }
  }

  async updatePasswordUserRepository(
    prisma: PrismaClient,
    userEntity: UserEntity,
  ): Promise<void> {
    try {
      await prisma.user.update({
        where: {
          id: userEntity.id,
        },
        data: {
          passwordHash: userEntity.passwordHash,
        },
      });
    } catch (e) {
      this.logger.error(`update password user repository ${e}`);

      handlePrismaError(e, 'update password user repository');
    }
  }

  async getPasswordResetTokenByUserIdAndTokenRepository(
    userEntity: UserEntity,
    token: string,
  ): Promise<PasswordResetTokenEntity | null> {
    try {
      const passwordResetToken =
        await this.prismaService.passwordResetToken.findFirst({
          where: {
            userId: userEntity.id || 0,
            token: token,
            expiresAt: {
              gt: new Date(),
            },
          },
        });

      return passwordResetToken
        ? mapToPasswordResetTokenEntity({ token: passwordResetToken })
        : null;
    } catch (e) {
      this.logger.error(
        `get password reset token by user id and token repository ${e}`,
      );

      handlePrismaError(
        e,
        'get password reset token by user id and token repository',
      );
    }
  }

  async createPasswordResetTokenRepository(
    prisma: PrismaClient,
    newPasswordResetTokenEntity: PasswordResetTokenEntity,
  ): Promise<void> {
    try {
      await prisma.passwordResetToken.create({
        data: {
          userId: newPasswordResetTokenEntity.userId,
          token: newPasswordResetTokenEntity.token,
          expiresAt: newPasswordResetTokenEntity.expiresAt,
          createdAt: newPasswordResetTokenEntity.createdAt,
        },
      });
    } catch (e) {
      this.logger.error(`create password reset token repository ${e}`);

      handlePrismaError(e, 'create password reset token repository');
    }
  }

  async getUserByPhoneNumberRepository(
    phoneNumber: string,
  ): Promise<UserEntity | null> {
    try {
      const user = await this.prismaService.user.findFirst({
        where: {
          phoneNumber: phoneNumber,
          phoneVerified: true,
        },
      });

      return user ? mapToUserEntity({ user: user }) : null;
    } catch (e) {
      this.logger.error(`get user by phone number repository ${e}`);

      handlePrismaError(e, 'get user by phone number repository');
    }
  }

  async createPhoneVerificationOtpRepository(
    prisma: PrismaClient,
    newPhoneVerificationEntity: PhoneVerificationOtpEntity,
  ): Promise<void> {
    try {
      await prisma.phoneVerificationOtp.create({
        data: {
          userId: newPhoneVerificationEntity.userId,
          phoneNumber: newPhoneVerificationEntity.phoneNumber,
          otp: newPhoneVerificationEntity.otp,
          expiresAt: newPhoneVerificationEntity.expiresAt,
          createdAt: newPhoneVerificationEntity.createdAt,
        },
      });
    } catch (e) {
      this.logger.error(`get existing phone verification otp repository ${e}`);

      handlePrismaError(e, 'get existing phone verification otp repository');
    }
  }

  async getExistingPhoneVerificationOtpRepository(
    userEntity: UserEntity,
  ): Promise<PhoneVerificationOtpEntity | null> {
    try {
      const phoneVerificationOtp =
        await this.prismaService.phoneVerificationOtp.findFirst({
          where: {
            userId: userEntity.id,
            phoneNumber: userEntity.phoneNumber,
            expiresAt: {
              gt: new Date(),
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

      return phoneVerificationOtp
        ? mapToPhoneVerificationOtpEntity({ otp: phoneVerificationOtp })
        : null;
    } catch (e) {
      this.logger.error(`get existing phone verification otp repository ${e}`);

      handlePrismaError(e, 'get existing phone verification otp repository');
    }
  }

  async deleteManyPhoneVerificationOtpRepository(
    prisma: PrismaClient,
    userEntity: UserEntity,
  ): Promise<void> {
    try {
      await prisma.phoneVerificationOtp.deleteMany({
        where: {
          userId: userEntity.id,
        },
      });
    } catch (e) {
      this.logger.error(
        `get phone verification otp by user id and otp repository ${e}`,
      );

      handlePrismaError(
        e,
        'get phone verification otp by user id and otp repository',
      );
    }
  }

  async updateUserPhoneVerifiedRepository(
    prisma: PrismaClient,
    userEntity: UserEntity,
  ): Promise<void> {
    try {
      await prisma.user.update({
        where: {
          id: userEntity.id,
        },
        data: {
          phoneVerified: userEntity.phoneVerified,
          phoneNumber: userEntity.phoneNumber,
          updatedAt: userEntity.updatedAt,
        },
      });
    } catch (e) {
      this.logger.error(`update user phone verified repository ${e}`);

      handlePrismaError(e, 'update user phone verified repository');
    }
  }

  async getPhoneVerificationOtpByUserIdAndOtpRepository(
    userId: any,
    otp: string,
  ): Promise<PhoneVerificationOtpEntity | null> {
    try {
      const phoneVerificationOtp =
        await this.prismaService.phoneVerificationOtp.findFirst({
          where: {
            userId: userId,
            otp: otp,
            expiresAt: {
              gt: new Date(),
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

      return phoneVerificationOtp
        ? mapToPhoneVerificationOtpEntity({ otp: phoneVerificationOtp })
        : null;
    } catch (e) {
      this.logger.error(
        `get phone verification otp by user id and otp repository ${e}`,
      );

      handlePrismaError(
        e,
        'get phone verification otp by user id and otp repository',
      );
    }
  }

  async getEmailVerificationTokenByUserIdRepository(
    userId: any,
  ): Promise<EmailVerificationTokenEntity | null> {
    try {
      const emailVerificationToken =
        await this.prismaService.emailVerificationToken.findFirst({
          where: {
            userId: userId,
            expiresAt: {
              gt: new Date(),
            },
          },
        });

      return emailVerificationToken
        ? mapToEmailVerificationTokenEntity({
            emailVerificationToken: emailVerificationToken,
          })
        : null;
    } catch (e) {
      this.logger.error(
        `get email verification token by user id repository ${e}`,
      );

      handlePrismaError(
        e,
        'get email verification token by user id repository',
      );
    }
  }

  async createEmailVerificationTokenEntity(
    prisma: PrismaClient,
    newVerificationEmailToken: EmailVerificationTokenEntity,
  ): Promise<void> {
    try {
      await prisma.emailVerificationToken.create({
        data: {
          userId: newVerificationEmailToken.userId,
          token: newVerificationEmailToken.token,
          expiresAt: newVerificationEmailToken.expiresAt,
        },
      });
    } catch (e) {
      this.logger.error(`update user email verified repository ${e}`);

      handlePrismaError(e, 'update user email verified repository');
    }
  }

  async deleteEmailVerificationTokenRepository(
    prisma: PrismaClient,
    token: string,
  ): Promise<void> {
    try {
      await prisma.emailVerificationToken.delete({
        where: {
          token: token,
        },
      });
    } catch (e) {
      this.logger.error(`update user email verified repository ${e}`);

      handlePrismaError(e, 'update user email verified repository');
    }
  }

  async updateUserEmailVerifiedRepository(
    prisma: PrismaClient,
    userEntity: UserEntity,
  ): Promise<void> {
    try {
      const user = await prisma.user.update({
        where: {
          id: userEntity.id,
        },
        data: {
          emailVerified: userEntity.emailVerified,
          updatedAt: userEntity.updatedAt,
        },
      });
    } catch (e) {
      this.logger.error(`update user email verified repository ${e}`);

      handlePrismaError(e, 'update user email verified repository');
    }
  }

  async getUserByIdRepository(userId: number): Promise<UserEntity | null> {
    try {
      const user = await this.prismaService.user.findUnique({
        where: {
          id: userId,
        },
      });

      return user ? mapToUserEntity({ user: user }) : null;
    } catch (e) {
      this.logger.error(`get user by id repository ${e}`);

      handlePrismaError(e, 'get user by id repository');
    }
  }

  async getEmailVerificationTokenRepository(
    token: string,
  ): Promise<EmailVerificationTokenEntity | null> {
    try {
      const emailVerificationToken =
        await this.prismaService.emailVerificationToken.findFirst({
          where: {
            token: token,
            expiresAt: {
              gt: new Date(),
            },
          },
        });

      return emailVerificationToken
        ? mapToEmailVerificationTokenEntity({
            emailVerificationToken: emailVerificationToken,
          })
        : null;
    } catch (e) {
      this.logger.error(`get email verification token repository ${e}`);

      handlePrismaError(e, 'get email verification token repository');
    }
  }

  async getUserSessionByUserIdAndSessionIdRepository(
    userId: any,
    sessionId: number,
  ): Promise<UserSessionEntity | null> {
    try {
      const userSession = await this.prismaService.userSession.findFirst({
        where: {
          id: sessionId,
          userId: userId,
          isActive: true,
        },
      });

      return userSession
        ? mapToUserSessionEntity({
            userSession: userSession,
          })
        : null;
    } catch (e) {
      this.logger.error(
        `get user session by user id and session id repository ${e}`,
      );

      handlePrismaError(
        e,
        'get user session by user id and session id repository',
      );
    }
  }

  async updateUserSessionInactiveRepository(
    prisma: PrismaClient,
    userSessionEntity: UserSessionEntity,
  ): Promise<void> {
    try {
      await prisma.userSession.updateMany({
        where: { id: userSessionEntity.id },
        data: {
          isActive: false,
        },
      });
    } catch (e) {
      this.logger.error(`update user session inactive repository ${e}`);

      handlePrismaError(e, 'update user session inactive repository');
    }
  }

  async updateManyUserSessionInactiveRepository(
    prisma: PrismaClient,
    userId: any,
  ): Promise<void> {
    try {
      await prisma.userSession.updateMany({
        where: { userId: userId },
        data: {
          isActive: false,
        },
      });
    } catch (e) {
      this.logger.error(`update many user session inactive repository ${e}`);

      handlePrismaError(e, 'update many user session inactive repository');
    }
  }

  async getUserSessionByUserIdAndRefreshToken(
    userId: any,
    refreshToken: string,
  ): Promise<UserSessionEntity | null> {
    try {
      const userSession = await this.prismaService.userSession.findFirst({
        where: {
          userId,
          token: refreshToken,
          isActive: true,
          expiryTime: {
            gt: new Date(),
          },
        },
        include: {
          user: {
            select: {
              id: true,
              accountStatus: true,
            },
          },
        },
      });

      return userSession
        ? mapToUserSessionEntity({
            userSession: userSession,
            user: userSession.user,
          })
        : null;
    } catch (e) {
      this.logger.error(
        `get user session by user id and refresh token repository ${e}`,
      );

      handlePrismaError(
        e,
        'get user session by user id and refresh token repository',
      );
    }
  }

  async createSystemLogRepository(
    prisma: PrismaClient,
    newSystemLogEntity: SystemLogEntity,
  ): Promise<void> {
    try {
      await prisma.systemLog.create({
        data: {
          entityType: newSystemLogEntity.entityType,
          entityId: newSystemLogEntity.entityId,
          action: newSystemLogEntity.action,
          performedBy: newSystemLogEntity.performedBy,
          logLevel: newSystemLogEntity.logLevel,
          logDetails: newSystemLogEntity.logDetails,
        },
      });
    } catch (e) {
      this.logger.error(`create system log repository ${e}`);

      handlePrismaError(e, 'create system log repository');
    }
  }

  async updateLastLoginUserRepository(
    prisma: PrismaClient,
    userEntity: UserEntity,
  ): Promise<void> {
    try {
      await prisma.user.update({
        where: { id: userEntity.id },
        data: { lastLogin: userEntity.lastLogin },
      });
    } catch (e) {
      this.logger.error(`update last login user repository ${e}`);

      handlePrismaError(e, 'update last login user repository');
    }
  }

  async getUserByUsernameOrEmailOrPhoneNumberRepository(
    usernameOrEmailOrPhoneNumber: string,
  ): Promise<UserEntity | null> {
    try {
      const user = await this.prismaService.user.findFirst({
        where: {
          OR: [
            { username: usernameOrEmailOrPhoneNumber },
            { email: usernameOrEmailOrPhoneNumber },
            { phoneNumber: usernameOrEmailOrPhoneNumber },
          ],
        },
        include: {
          profile: true,
        },
      });

      return user
        ? mapToUserEntity({ user: user, profile: user.profile })
        : null;
    } catch (e) {
      this.logger.error(
        `get user by username or email or phone number repository ${e}`,
      );

      handlePrismaError(
        e,
        'get user by username or email or phone number repository',
      );
    }
  }

  async getExistingUserRepository(param: {
    username: string;
    email: string;
  }): Promise<UserEntity | null> {
    const { username, email } = param;
    try {
      const user = await this.prismaService.user.findFirst({
        where: {
          OR: [{ username }, { email }],
        },
      });

      return user ? mapToUserEntity({ user: user }) : null;
    } catch (e) {
      this.logger.error(`get existing user repository ${e}`);

      handlePrismaError(e, 'get existing user repository');
    }
  }

  async createUserRepository(
    prisma: PrismaClient,
    userEntity: UserEntity,
    profileEntity: UserProfileEntity,
  ): Promise<UserEntity> {
    try {
      const user = await prisma.user.create({
        data: {
          username: userEntity.username,
          email: userEntity.email,
          passwordHash: userEntity.passwordHash,
          phoneNumber: userEntity.phoneNumber,
          accountType: userEntity.accountType,
          emailVerified: userEntity.emailVerified,
          phoneVerified: userEntity.phoneVerified,
          accountStatus: userEntity.accountStatus,
          profile: {
            create: {
              firstName: profileEntity.firstName,
              lastName: profileEntity.lastName,
            },
          },
        },
      });

      return mapToUserEntity({ user: user });
    } catch (e) {
      this.logger.error(`create user repository ${e}`);

      handlePrismaError(e, 'create user repository');
    }
  }

  async createNotificationSettingRepository(
    prisma: PrismaClient,
    notificationSettingEntity: NotificationSettingEntity,
  ): Promise<void> {
    try {
      await prisma.notificationSetting.create({
        data: {
          userId: notificationSettingEntity.userId,
          emailEnabled: notificationSettingEntity.emailEnabled,
          smsEnabled: notificationSettingEntity.smsEnabled,
          pushEnabled: notificationSettingEntity.pushEnabled,
        },
      });
    } catch (e) {
      this.logger.error(`create notification setting repository ${e}`);

      handlePrismaError(e, 'create notification setting repository');
    }
  }
}
