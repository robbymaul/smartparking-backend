import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CancelBookingDto {
  @ApiProperty({
    description: 'Alasan pembatalan',
    example: 'Perubahan jadwal',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  reason: string;
}
