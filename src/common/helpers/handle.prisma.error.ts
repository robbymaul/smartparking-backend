import { HttpException, HttpStatus } from '@nestjs/common';

export function handlePrismaError(e: any, action = 'operation'): never {
  // Ambil pesan terakhir dari error message (biasanya paling informatif)
  const message =
    e?.message?.split('\n')?.pop()?.trim() || 'Unknown database error';

  throw new HttpException(
    `${action} error: ${message}`,
    HttpStatus.INTERNAL_SERVER_ERROR,
  );
}
