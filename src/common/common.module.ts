import { Global, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WinstonModule } from 'nest-winston/dist/winston.module';
import { CONFIG } from '../config/config.schema';
import { JwtModule } from '@nestjs/jwt';
import { ValidationService } from './validation.service';
import { AuthMiddleware } from './middleware/auth.middleware';
import * as winston from 'winston';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './guards/roles.guard';

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
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    ValidationService,
  ],
  exports: [ValidationService],
})
export class CommonModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    const headerAPI = CONFIG.HEADER_API;
    consumer.apply(AuthMiddleware).forRoutes(`${headerAPI}/*`);
  }
}
