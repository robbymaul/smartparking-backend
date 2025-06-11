import { Reflector } from '@nestjs/core';

export const Roles = Reflector.createDecorator<string[]>();

export const RolesAdmin = Reflector.createDecorator<string[]>();
