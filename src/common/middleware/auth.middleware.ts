import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { Authorization } from '../constant/authorization.interface';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import {
  BasicAuthorizationDto,
  HeaderAuthorizationDto,
} from './middleware.dto';
import { AccountType } from '../../auth/interface/acount.type';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly prismaService: PrismaService,
  ) {}

  async use(req: any, res: any, next: (error?: any) => void) {
    this.logger.debug('middleware for request authentication');
    const authType = await this.getAuthorizationHeaderValue(
      req,
      Authorization.AUTHORIZATION,
    );

    if (authType.header === Authorization.BASIC_AUTH_TYPE) {
      this.logger.debug(`authentication header value ${authType.header}`);
      req.basicauth = await this.getValueBasicAuth(authType.value);
      return next();
    }

    if (authType.header === Authorization.BEARER_AUTH_TYPE) {
      this.logger.debug(`authentication header value ${authType.header}`);
      req.user = await this.validateToken(authType.value);
      return next();
    }

    throw new UnauthorizedException('Unauthorized');
  }

  private async validateToken(token: string) {
    try {
      this.logger.debug(`Authentication request token valid: ${token}`);
      const decode: any = await this.jwtService.verifyAsync(token);

      this.logger.info(`authorization fetching user from database`);
      const userSession = await this.prismaService.userSession.findFirst({
        where: {
          userId: decode.sub,
          token: token,
          isActive: decode.isActive,
          expiryTime: {
            gt: new Date(),
          },
        },
      });

      if (!userSession) {
        this.logger.warn(`No valid session found for token`);
        throw new UnauthorizedException('Invalid or expired session');
      }

      const user = await this.prismaService.user.findUnique({
        where: {
          id: userSession.userId,
        },
        select: {
          id: true,
          username: true,
          email: true,
          accountType: true,
          accountStatus: true,
        },
      });

      if (!user || user.accountStatus !== 'active') {
        throw new UnauthorizedException('User tidak valid atau tidak aktif');
      }

      let roles = ['user'];
      if (user.accountType == AccountType.PREMIUM) {
        roles.push('premium');
      }

      if (user.accountType == AccountType.CORPORATE) {
        roles.push('corporate');
      }

      if (user.accountType == AccountType.REGULAR) {
        roles.push('reguler');
      }

      const isAdmin = await this.prismaService.placeAdmin.findFirst({
        where: {
          email: user.email,
          isActive: true,
        },
      });

      if (isAdmin) {
        roles.push('admin');
      }

      return {
        id: user.id,
        username: user.username,
        email: user.email,
        accountType: user.accountType,
        roles: roles,
      };
    } catch (error) {
      this.logger.warn(`Authentication request token invalid ${error}`);

      throw new UnauthorizedException('User tidak valid atau tidak aktif');
    }
  }

  private getAuthorizationHeaderValue = async (
    req: any,
    header: string,
  ): Promise<HeaderAuthorizationDto> => {
    this.logger.debug(`get authorization header value ${header}`);
    const getHeader = req.headers[header] as string;
    this.logger.debug(`get authorization header value ${getHeader}`);
    if (!getHeader || getHeader === '') {
      throw new UnauthorizedException('Unauthorized');
    }

    const _value = getHeader.split(' ');
    if (_value.length != 2) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    return {
      header: _value[0],
      value: _value[1],
    };
  };

  private getValueBasicAuth = async (
    value: string,
  ): Promise<BasicAuthorizationDto> => {
    const decode = Buffer.from(value, 'base64').toString('utf-8');
    const [username, password] = decode.split(':');
    return {
      username: username,
      password: password,
    };
  };
}
