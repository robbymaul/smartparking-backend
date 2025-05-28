import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController } from './bookings.controller';
import { BookingsRepository } from './bookings.repository';
import { GeneratorsService } from '../common/utils/generators';

@Module({
  providers: [
    BookingsService,
    { provide: 'IBookingsRepository', useClass: BookingsRepository },
    GeneratorsService,
  ],
  controllers: [BookingsController],
})
export class BookingsModule {}
