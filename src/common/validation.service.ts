import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ValidationService {
  async validate<T extends object>(cls: new () => T, data: T): Promise<T> {
    const object = plainToInstance(cls, data);
    const errors = await validate(object);

    if (errors.length > 0) {
      const firstError = errors[0];
      const errorMessage =
        Object.values(firstError.constraints ?? {})[0] ?? 'Validation error';

      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          message: `Validation failed: ${errorMessage}`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    return object;
  }
}
