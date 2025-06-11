import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston/dist/winston.module';
import { CONFIG } from '../config/config.schema';
import { JwtModule } from '@nestjs/jwt';
import { ValidationService } from './validation.service';
import {
  AuthAdminMiddleware,
  AuthMiddleware,
} from './middleware/auth.middleware';
import * as winston from 'winston';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './guards/roles.guard';
import { GeneratorsService } from './utils/generators';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import * as path from 'node:path';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    WinstonModule.forRoot({
      level: CONFIG.LOG_LEVEL,
      format: winston.format.json(),
      transports: [new winston.transports.Console()],
    }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: `${configService.get<number>('JWT_EXPIRES')}h`,
          algorithm: 'HS256',
        },
      }),
    }),
    MailerModule.forRoot({
      transport: {
        host: `smtp.gmail.com`,
        port: 587,
        secure: false,
        auth: {
          user: CONFIG.EMAIL_NOTIFICATION_USER,
          pass: CONFIG.EMAIL_NOTIFICATION_PASS,
        },
      },
      defaults: {
        from: `"Smart Parking" <no-reply@smartparking.com>`,
      },
      template: {
        dir: path.join(__dirname, '..', 'src', 'lib'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    ValidationService,
    GeneratorsService,
  ],
  exports: [ValidationService, GeneratorsService],
})
export class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    const headerAPI = CONFIG.HEADER_API;
    consumer
      .apply(AuthMiddleware)
      .exclude(`${headerAPI}/admins/*`)
      .forRoutes(`${headerAPI}/*`);
    consumer.apply(AuthAdminMiddleware).forRoutes(`${headerAPI}/admins/*`);
  }
}
