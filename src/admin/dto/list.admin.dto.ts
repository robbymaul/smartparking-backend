import { AdminResponseDto } from './admin.dto';

export class ListAdminQueryDto {
  page: number;
  perPage: number;
  sortBy: string;
  sortValue: string;
  search: string;
}

export class ListAdminResponseDto {
  Items: AdminResponseDto[];
  Metadata: Metadata;
}

export class Metadata {
  page: number;
  perPage: number;
  totalCount: number;
  pageCount: number;
}
