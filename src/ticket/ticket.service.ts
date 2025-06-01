import { Inject, Injectable } from '@nestjs/common';
import { ITicketRepository } from './ticket.repository';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { TicketBookingResponseDto } from './dto/ticket.response';

@Injectable()
export class TicketService {
  constructor(
    @Inject('ITicketRepository')
    private readonly ticketRepository: ITicketRepository,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async getListTicketBooking(user: any): Promise<TicketBookingResponseDto[]> {
    const bookingEntities =
      await this.ticketRepository.userGetListTicketBooking(user);
    const result: TicketBookingResponseDto[] = [];

    bookingEntities.forEach((bookingEntity) => {
      let vehicle = '';
      if (bookingEntity.Vehicle?.brand) {
        vehicle = bookingEntity.Vehicle.brand;
      }

      if (bookingEntity.Vehicle?.model) {
        vehicle = vehicle + bookingEntity.Vehicle?.model;
      }
      result.push({
        type: bookingEntity.Slot?.slotType ?? '',
        vehicle: vehicle,
        endTime: bookingEntity.scheduledExit,
        id: bookingEntity.id,
        licencePlate: bookingEntity.Vehicle?.licensePlate ?? '',
        location: bookingEntity.Place?.name ?? '',
        payment: bookingEntity.bookingStatus,
        slotNumber: bookingEntity.Slot?.slotNumber ?? '',
        startTime: bookingEntity.scheduledEntry,
        status: bookingEntity.bookingStatus,
      });
    });

    return result;
  }
}
