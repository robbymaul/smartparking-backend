import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthRepository } from './auth.repository';
import { GoogleAuthStrategy } from '../common/strategies/google.strategy';

@Module({
  providers: [
    AuthService,
    { provide: 'IAuthRepository', useClass: AuthRepository },
    GoogleAuthStrategy,
  ],
  controllers: [AuthController],
})
export class AuthModule {}
