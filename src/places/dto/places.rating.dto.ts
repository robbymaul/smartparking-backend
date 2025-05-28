import { ApiProperty } from '@nestjs/swagger';
import { UserProfileResponseDto } from '../../users/dto/profile.dto';

export class PlacesRatingDtoResponse {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ type: [UserProfileResponseDto], required: false })
  user: UserProfileResponseDto | null;

  @ApiProperty({ example: 5 })
  ratingScore: number;

  @ApiProperty({ example: 'lorem ipsum dolor sit amet' })
  reviewComment: string;
}

interface PlacesRatingDtoParams {
  id: number;
  user: UserProfileResponseDto | null;
  ratingScore: number;
  reviewComment: string;
}

export const mapToPlacesRatingDtoResponse = (
  param: PlacesRatingDtoParams,
): PlacesRatingDtoResponse => {
  return {
    id: param.id,
    user: param.user,
    ratingScore: param.ratingScore,
    reviewComment: param.reviewComment,
  };
};
