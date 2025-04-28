import { ApiProperty } from '@nestjs/swagger';

export class WebErrorResponse {
  @ApiProperty({ example: 400 })
  code: number;

  @ApiProperty({ example: false })
  status: boolean;

  @ApiProperty({
    example: 'error message ',
  })
  error: object | string;
}

export class WebSuccessResponse<T> {
  @ApiProperty({ example: 200 })
  code: number;

  @ApiProperty({ example: true })
  status: boolean;

  @ApiProperty({ type: Object, isArray: false })
  data: T;
}
