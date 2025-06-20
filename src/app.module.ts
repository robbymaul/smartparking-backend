import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from './common/common.module';
import { BookingsModule } from './bookings/bookings.module';
import { PaymentsModule } from './payments/payments.module';
import { AuthModule } from './auth/auth.module';
import { NotificationModule } from './notification/notification.module';
import { UsersModule } from './users/users.module';
import { PlacesModule } from './places/places.module';
import { TicketModule } from './ticket/ticket.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    CommonModule,
    BookingsModule,
    PaymentsModule,
    AuthModule,
    NotificationModule,
    UsersModule,
    PlacesModule,
    TicketModule,
    AdminModule,
  ],
})
export class AppModule {}
