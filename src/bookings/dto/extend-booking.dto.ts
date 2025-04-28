import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty } from 'class-validator';

export class ExtendBookingDto {
  @ApiProperty({
    description: 'Waktu keluar baru (ISO format)',
    example: '2025-04-12T18:00:00Z',
  })
  @IsDateString()
  @IsNotEmpty()
  newExitTime: string;
}
