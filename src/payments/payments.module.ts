import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { PaymentsRepository } from './payments.repository';

@Module({
  providers: [
    PaymentsService,
    { provide: 'IPaymentsRepository', useClass: PaymentsRepository },
  ],
  controllers: [PaymentsController],
})
export class PaymentsModule {}
