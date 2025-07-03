export class AccessLogEntity {
  id: number;
  bookingId: number;
  logType: string;
  logTime: Date;
  verificationMethod: string;
  verifiedBy: string;
  location: string;
  notes: string;
  createdAt: Date;

  constructor(params: AccessLogEntity) {
    Object.assign(this, params);
  }
}
