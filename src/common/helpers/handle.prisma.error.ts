import { InternalServerErrorException } from '@nestjs/common';

export function handlePrismaError(e: any, action = 'operation'): never {
  // Ambil pesan terakhir dari error message (biasanya paling informatif)
  const message =
    e?.message?.split('\n')?.pop()?.trim() || 'Unknown database error';

  throw new InternalServerErrorException(`${action} error: ${message}`);
}
