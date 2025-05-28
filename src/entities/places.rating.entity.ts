import Decimal from 'decimal.js';
import { PlaceRating, UserProfile } from 'generated/prisma';
import {
  mapToUserProfileEntity,
  UserProfileEntity,
} from './user.profile.entity';

export class PlacesRatingEntity {
  id: number;
  placeId: number;
  userId: number;
  bookingId: number;
  ratingScore: Decimal;
  reviewComment: string;
  ratingDate: Date;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date | null;
  User?: UserProfileEntity | null;
}

export function mapToPlacesRatingEntity(
  placesRating: PlaceRating,
  user?: UserProfile,
): PlacesRatingEntity {
  return {
    id: placesRating.id,
    placeId: placesRating.placeId,
    userId: placesRating.userId,
    bookingId: placesRating.bookingId,
    ratingScore: placesRating.ratingScore,
    reviewComment: placesRating.reviewComment ?? '',
    ratingDate: placesRating.ratingDate,
    isVerified: placesRating.isVerified,
    createdAt: placesRating.createdAt,
    updatedAt: placesRating.updatedAt,
    User: user ? mapToUserProfileEntity({ profile: user }) : null,
  };
}
