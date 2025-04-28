import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleAuthRequestDto {
  @ApiProperty({
    description: 'Token ID yang diperoleh dari Google Sign-In client',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjFlOWdkazcyOCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  idToken: string;
}
