import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Roles, RolesAdmin } from '../decorators/roles.decorators';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get(Roles, context.getHandler());
    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    return this.matchRoles(roles, user.role);
  }

  private matchRoles = (roles: string[], userRoles: string[]): boolean => {
    return userRoles.some((role) => {
      roles.includes(role);
    });
  };
}

@Injectable()
export class RolesAdminGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get(RolesAdmin, context.getHandler());
    if (!roles) {
      return true;
    }
    this.logger.debug(`roles ${roles.length} not found, ${roles}`);
    const request = context.switchToHttp().getRequest();
    const admin = request.admin;

    this.logger.debug(`admin admin admin role ${JSON.stringify(admin)}`);

    return this.matchRoles(roles, admin.role);
  }

  private matchRoles = (roles: string[], userRoles: string[]): boolean => {
    return userRoles.some((role) => {
      roles.includes(role);
    });
  };
}
