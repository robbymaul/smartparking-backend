import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PaymentsRepository } from './payments.repository';
import { MidtransGateway } from './gateways/midtrans.gateway';
import { BookingsRepository } from '../bookings/bookings.repository';
import { BookingsService } from '../bookings/bookings.service';
import { GeneratorsService } from '../common/utils/generators';

@Module({
  providers: [
    PaymentsService,
    { provide: 'IPaymentsRepository', useClass: PaymentsRepository },
    { provide: 'IBookingsRepository', useClass: BookingsRepository },
    MidtransGateway,
    BookingsService,
    GeneratorsService,
  ],
  controllers: [PaymentsController],
})
export class PaymentsModule {}
