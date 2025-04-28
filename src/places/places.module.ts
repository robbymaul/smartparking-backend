import { Module } from '@nestjs/common';
import { PlacesService } from './places.service';
import { PlacesController } from './places.controller';
import { PlacesRepository } from './places.repository';

@Module({
  providers: [
    PlacesService,
    { provide: 'IPlacesRepository', useClass: PlacesRepository },
  ],
  controllers: [PlacesController],
})
export class PlacesModule {}
