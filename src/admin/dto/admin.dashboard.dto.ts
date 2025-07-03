import { OperatingHourDtoResponse } from '../../places/dto/operating.hour.dto';
import { TariffPlanDtoResponse } from '../../places/dto/tariff.plan.dto';

export class AdminDashboardDto {
  placeName: string;
  availableParking: number;
  reservedParking: number;
  occupiedParking: number;
  operatingHours: OperatingHourDtoResponse | null;
  tariffPlan: TariffPlanDtoResponse[];
}

export class ListDashboardActivityQueryDto {
  page: number;
  perPage: number;
  // sortBy: string;
  // sortValue: string;
  // searchBy: string;
  // searchValue: string;
  status: string;
}
