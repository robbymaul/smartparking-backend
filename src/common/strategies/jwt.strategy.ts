import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
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

    // Generate roles berdasarkan accountType
    let roles = ['user'];
    if (user.accountType === 'premium') {
      roles.push('premium');
    } else if (user.accountType === 'corporate') {
      roles.push('corporate');
    }

    // Admin role harus diatur secara manual di DB
    const isAdmin = await this.prisma.placeAdmin.findFirst({
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
      roles,
    };
  }
}
