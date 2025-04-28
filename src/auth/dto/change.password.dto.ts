import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Password lama',
    example: 'OldStrongP@ssw0rd',
  })
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @ApiProperty({
    description: 'Password baru',
    example: 'NewStrongP@ssw0rd',
  })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password harus mengandung huruf besar, huruf kecil, angka, dan karakter khusus',
  })
  newPassword: string;

  @ApiProperty({
    description: 'Konfirmasi password baru',
    example: 'NewStrongP@ssw0rd',
  })
  @IsString()
  @IsNotEmpty()
  confirmPassword: string;
}
