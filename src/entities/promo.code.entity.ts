import Decimal from 'decimal.js';

export class PromoCodeEntity {
  id: number;
  code: string;
  description: string | null;
  discountType: string;
  discountValue: Decimal;
  minimumSpend: Decimal;
  validFrom: Date;
  validUntil: Date | null;
  usageLimit: number | null;
  usageCount: number;
  isActive: boolean;

  constructor(partial: Partial<PromoCodeEntity>) {
    Object.assign(this, partial);
  }
}

export function mapToPromoCodeEntity(promoCode: {
  id: number;
  code: string;
  description: string | null;
  discountType: string;
  minimumSpend: Decimal;
  validFrom: Date;
  validUntil: Date | null;
  usageCount: number;
  isActive: boolean;
  discountValue: Decimal;
  usageLimit: number | null;
  createdAt: Date;
  updatedAt: Date | null;
}): PromoCodeEntity {
  return {
    code: promoCode.code,
    discountType: promoCode.discountType,
    description: promoCode.description,
    minimumSpend: promoCode.minimumSpend,
    usageCount: promoCode.usageCount,
    validFrom: promoCode.validFrom,
    validUntil: promoCode.validUntil,
    isActive: promoCode.isActive,
    id: promoCode.id,
    usageLimit: promoCode.usageLimit,
    discountValue: promoCode.discountValue,
  };
}
