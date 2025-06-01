import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { BookingEntity, mapToBookingEntity } from 'src/entities/booking.entity';
import { handlePrismaError } from '../common/helpers/handle.prisma.error';

export interface ITicketRepository {
  userGetListTicketBooking(user: any): Promise<BookingEntity[]>;
}

@Injectable()
export class TicketRepository implements ITicketRepository {
  constructor(
    private readonly prismaService: PrismaService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  async userGetListTicketBooking(user: any): Promise<BookingEntity[]> {
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    this.logger.debug(`fourteenDaysAgo: ${fourteenDaysAgo} `);

    try {
      const bookings = await this.prismaService.booking.findMany({
        where: {
          userId: user.id,
          bookingTime: {
            gte: fourteenDaysAgo,
          },
        },
        include: {
          parkingSlot: {
            include: {
              parkingZone: {
                include: {
                  place: true,
                },
              },
            },
          },
          vehicle: true,
        },
        orderBy: {
          bookingTime: 'desc',
        },
      });

      return bookings.map((booking) =>
        mapToBookingEntity({
          booking: booking,
          place: booking.parkingSlot?.parkingZone?.place,
          vehicle: booking.vehicle,
          slot: booking.parkingSlot,
        }),
      );
    } catch (e) {
      this.logger.error(`get list booking by user id repository ${e}`);

      handlePrismaError(e, 'get list booking by user id repository ');
    }
  }
}
