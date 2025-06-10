import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';
import { BookingStatus } from '../../bookings/interfaces/booking-status.interface';

export class TicketBookingResponseDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  id: number;

  @ApiProperty({ example: 'paid' })
  @IsString()
  payment: string;

  @ApiProperty({ example: BookingStatus.ACTIVE })
  @IsString()
  status: string;

  @ApiProperty({ example: 'Slot-Number' })
  @IsString()
  slotNumber: string;

  @ApiProperty({ example: 'B7887IUY' })
  @IsString()
  licencePlate: string;

  @ApiProperty({ example: 'Type' })
  @IsString()
  type: string;

  @ApiProperty({ example: 'Honda' })
  @IsString()
  vehicle: string;

  @ApiProperty({ example: '10:10AM' })
  @IsString()
  startTime: Date;

  @ApiProperty({ example: '10:10AM' })
  @IsString()
  endTime: Date;

  @ApiProperty({ example: 'Margonda City Mall' })
  @IsString()
  location: string;
}
