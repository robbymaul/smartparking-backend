import {
  createParamDecorator,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CONFIG } from '../../config/config.schema';

export const BasicAuthorization = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    const basicAuth = request.basicauth;

    if (!basicAuth) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    if (basicAuth.username === '' || basicAuth.password === '') {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    if (
      basicAuth.username != CONFIG.USERNAME_BASIC_AUTH ||
      basicAuth.password != CONFIG.PASSWORD_BASIC_AUTH
    ) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }
  },
);

export const JWTAuthorization = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    const user = request.user;
    if (!user) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return user;
  },
);
