import { Module } from '@nestjs/common';
import { TicketService } from './ticket.service';
import { TicketRepository } from './ticket.repository';
import { TicketController } from './ticket.controller';

@Module({
  providers: [
    TicketService,
    { provide: 'ITicketRepository', useClass: TicketRepository },
  ],
  controllers: [TicketController],
})
export class TicketModule {}
