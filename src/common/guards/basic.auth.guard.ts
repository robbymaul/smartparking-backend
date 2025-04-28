import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { CONFIG } from '../../config/config.schema';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const basicAuth = request.basicauth;

    if (!basicAuth) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    if (!basicAuth.username || !basicAuth.password) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    if (
      basicAuth.username !== CONFIG.USERNAME_BASIC_AUTH ||
      basicAuth.password !== CONFIG.PASSWORD_BASIC_AUTH
    ) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return true;
  }
}
