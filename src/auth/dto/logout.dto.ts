import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class LogoutRequestDto {
  @ApiProperty({
    description:
      'Refresh token untuk logout dari sesi spesifik. Jika tidak disediakan, semua sesi user akan logout',
    required: false,
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsOptional()
  @IsString()
  refreshToken?: string;

  @ApiProperty({
    description: 'ID sesi untuk logout dari sesi spesifik berdasarkan ID',
    required: false,
    example: 123,
  })
  @IsOptional()
  @IsNumber()
  sessionId?: number;

  @ApiProperty({
    description: 'Alasan logout, untuk pencatatan audit',
    required: false,
    example: 'manual_logout',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}
