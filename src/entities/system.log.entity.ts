import { SystemLog } from '../../generated/prisma';

export class SystemLogEntity {
  id?: number;
  entityType: string;
  entityId: number;
  action: string;
  performedBy: string;
  logLevel: string;
  logDetails?: string | null;
  logTime: Date;
  createdAt: Date;

  constructor(param: {
    id?: number;
    entityType: string;
    entityId: number;
    action: string;
    performedBy: string;
    logLevel: string;
    logDetails?: string | null;
    logTime: Date;
    createdAt: Date;
  }) {
    this.id = param.id;
    this.entityType = param.entityType;
    this.entityId = param.entityId;
    this.action = param.action;
    this.performedBy = param.performedBy;
    this.logLevel = param.logLevel;
    this.logDetails = param.logDetails;
    this.logTime = param.logTime;
    this.createdAt = param.createdAt;
  }
}

export function mapToSystemLogEntity(param: SystemLog): SystemLogEntity {
  return new SystemLogEntity({
    id: param.id,
    entityType: param.entityType,
    entityId: param.entityId,
    action: param.action,
    performedBy: param.performedBy,
    logLevel: param.logLevel,
    logDetails: param.logDetails,
    logTime: param.logTime,
    createdAt: param.createdAt,
  });
}
