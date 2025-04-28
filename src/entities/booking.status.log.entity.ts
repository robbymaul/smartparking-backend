import { BookingEntity } from './booking.entity';

export class BookingStatusLogEntity {
  id?: number;
  bookingId: number;
  previousStatus: string;
  newStatus: string;
  changedBy: string;
  reason?: string;
  statusTime?: Date;
  createdAt: Date;

  // Relations
  booking?: BookingEntity;

  constructor(param: {
    id?: number;
    bookingId: number;
    previousStatus: string;
    newStatus: string;
    changedBy: string;
    reason?: string | undefined;
    statusTime?: Date;
    booking?: BookingEntity;
  }) {
    this.id = param.id;
    this.bookingId = param.bookingId;
    this.previousStatus = param.previousStatus;
    this.newStatus = param.newStatus;
    this.changedBy = param.changedBy;
    this.reason = param.reason;
    this.statusTime = param.statusTime;
    this.createdAt = new Date();
    this.booking = param.booking;
  }
}
