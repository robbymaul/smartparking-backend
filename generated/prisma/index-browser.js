
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.6.0
 * Query Engine version: f676762280b54cd07c770017ed3711ddde35f37a
 */
Prisma.prismaVersion = {
  client: "6.6.0",
  engine: "f676762280b54cd07c770017ed3711ddde35f37a"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UserScalarFieldEnum = {
  id: 'id',
  username: 'username',
  email: 'email',
  passwordHash: 'passwordHash',
  phoneNumber: 'phoneNumber',
  accountType: 'accountType',
  emailVerified: 'emailVerified',
  phoneVerified: 'phoneVerified',
  accountStatus: 'accountStatus',
  googleId: 'googleId',
  lastLogin: 'lastLogin',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.UserSessionScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  token: 'token',
  deviceInfo: 'deviceInfo',
  ipAddress: 'ipAddress',
  lastActivity: 'lastActivity',
  expiryTime: 'expiryTime',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.UserProfileScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  firstName: 'firstName',
  lastName: 'lastName',
  profilePhoto: 'profilePhoto',
  gender: 'gender',
  dateOfBirth: 'dateOfBirth',
  address: 'address',
  city: 'city',
  state: 'state',
  postalCode: 'postalCode',
  country: 'country',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.VehicleScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  licensePlate: 'licensePlate',
  vehicleType: 'vehicleType',
  brand: 'brand',
  model: 'model',
  color: 'color',
  rfidTag: 'rfidTag',
  length: 'length',
  width: 'width',
  height: 'height',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PlaceScalarFieldEnum = {
  id: 'id',
  name: 'name',
  placeType: 'placeType',
  address: 'address',
  latitude: 'latitude',
  longitude: 'longitude',
  contactNumber: 'contactNumber',
  email: 'email',
  description: 'description',
  totalCapacity: 'totalCapacity',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ParkingZoneScalarFieldEnum = {
  id: 'id',
  placeId: 'placeId',
  zoneName: 'zoneName',
  floorLevel: 'floorLevel',
  zoneType: 'zoneType',
  totalSlots: 'totalSlots',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ParkingSlotScalarFieldEnum = {
  id: 'id',
  zoneId: 'zoneId',
  slotNumber: 'slotNumber',
  slotType: 'slotType',
  isReserved: 'isReserved',
  isOccupied: 'isOccupied',
  isDisabledFriendly: 'isDisabledFriendly',
  hasEvCharger: 'hasEvCharger',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SlotAvailabilityScalarFieldEnum = {
  id: 'id',
  slotId: 'slotId',
  availableFrom: 'availableFrom',
  availableUntil: 'availableUntil',
  isBookable: 'isBookable',
  statusReason: 'statusReason',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TariffPlanScalarFieldEnum = {
  id: 'id',
  placeId: 'placeId',
  planName: 'planName',
  description: 'description',
  effectiveFrom: 'effectiveFrom',
  effectiveUntil: 'effectiveUntil',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.TariffRateScalarFieldEnum = {
  id: 'id',
  planId: 'planId',
  vehicleType: 'vehicleType',
  slotType: 'slotType',
  startTime: 'startTime',
  endTime: 'endTime',
  dayCategory: 'dayCategory',
  basePrice: 'basePrice',
  hourlyRate: 'hourlyRate',
  dayRate: 'dayRate',
  minimumCharge: 'minimumCharge',
  gracePeriodMinutes: 'gracePeriodMinutes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BookingScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  vehicleId: 'vehicleId',
  slotId: 'slotId',
  promoCodeId: 'promoCodeId',
  bookingReference: 'bookingReference',
  bookingTime: 'bookingTime',
  scheduledEntry: 'scheduledEntry',
  scheduledExit: 'scheduledExit',
  actualEntry: 'actualEntry',
  actualExit: 'actualExit',
  qrCode: 'qrCode',
  bookingStatus: 'bookingStatus',
  estimatedPrice: 'estimatedPrice',
  finalPrice: 'finalPrice',
  cancellationReason: 'cancellationReason',
  cancellationTimeMinutes: 'cancellationTimeMinutes',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BookingStatusLogScalarFieldEnum = {
  id: 'id',
  bookingId: 'bookingId',
  previousStatus: 'previousStatus',
  newStatus: 'newStatus',
  changedBy: 'changedBy',
  reason: 'reason',
  statusTime: 'statusTime',
  createdAt: 'createdAt'
};

exports.Prisma.BookingPaymentScalarFieldEnum = {
  id: 'id',
  bookingId: 'bookingId',
  paymentReference: 'paymentReference',
  paymentStatus: 'paymentStatus',
  originalAmount: 'originalAmount',
  discountAmount: 'discountAmount',
  taxAmount: 'taxAmount',
  surchargeAmount: 'surchargeAmount',
  finalAmount: 'finalAmount',
  isPrepaid: 'isPrepaid',
  isRefunded: 'isRefunded',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PaymentTransactionScalarFieldEnum = {
  id: 'id',
  paymentId: 'paymentId',
  paymentMethodId: 'paymentMethodId',
  transactionReference: 'transactionReference',
  transactionType: 'transactionType',
  amount: 'amount',
  currency: 'currency',
  transactionStatus: 'transactionStatus',
  gatewayResponse: 'gatewayResponse',
  transactionData: 'transactionData',
  transactionTime: 'transactionTime',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RefundTransactionScalarFieldEnum = {
  id: 'id',
  paymentId: 'paymentId',
  refundReference: 'refundReference',
  refundAmount: 'refundAmount',
  refundReason: 'refundReason',
  refundStatus: 'refundStatus',
  processorResponse: 'processorResponse',
  refundData: 'refundData',
  refundTime: 'refundTime',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PaymentMethodScalarFieldEnum = {
  id: 'id',
  methodName: 'methodName',
  provider: 'provider',
  methodType: 'methodType',
  description: 'description',
  processingFeePercent: 'processingFeePercent',
  fixedFee: 'fixedFee',
  supportsRefunds: 'supportsRefunds',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.UserPaymentMethodScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  paymentMethodId: 'paymentMethodId',
  tokenReference: 'tokenReference',
  maskedInfo: 'maskedInfo',
  expiryInfo: 'expiryInfo',
  isDefault: 'isDefault',
  isVerified: 'isVerified',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PromoCodeScalarFieldEnum = {
  id: 'id',
  code: 'code',
  description: 'description',
  discountType: 'discountType',
  discountValue: 'discountValue',
  minimumSpend: 'minimumSpend',
  validFrom: 'validFrom',
  validUntil: 'validUntil',
  usageLimit: 'usageLimit',
  usageCount: 'usageCount',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ParkingPassScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  placeId: 'placeId',
  passType: 'passType',
  passReference: 'passReference',
  startDate: 'startDate',
  endDate: 'endDate',
  price: 'price',
  status: 'status',
  autoRenew: 'autoRenew',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ParkingPassPaymentScalarFieldEnum = {
  id: 'id',
  passId: 'passId',
  paymentMethodId: 'paymentMethodId',
  amount: 'amount',
  paymentStatus: 'paymentStatus',
  transactionReference: 'transactionReference',
  paymentDate: 'paymentDate',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AccessLogScalarFieldEnum = {
  id: 'id',
  bookingId: 'bookingId',
  logType: 'logType',
  logTime: 'logTime',
  verificationMethod: 'verificationMethod',
  verifiedBy: 'verifiedBy',
  location: 'location',
  notes: 'notes',
  createdAt: 'createdAt'
};

exports.Prisma.BookingExtensionScalarFieldEnum = {
  id: 'id',
  bookingId: 'bookingId',
  originalEndTime: 'originalEndTime',
  newEndTime: 'newEndTime',
  additionalCharge: 'additionalCharge',
  paymentStatus: 'paymentStatus',
  requestTime: 'requestTime',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.NotificationSettingScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  emailEnabled: 'emailEnabled',
  smsEnabled: 'smsEnabled',
  pushEnabled: 'pushEnabled',
  bookingConfirmation: 'bookingConfirmation',
  paymentNotifications: 'paymentNotifications',
  reminderNotifications: 'reminderNotifications',
  marketingNotifications: 'marketingNotifications',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  bookingId: 'bookingId',
  notificationType: 'notificationType',
  channel: 'channel',
  content: 'content',
  isRead: 'isRead',
  sentTime: 'sentTime',
  readTime: 'readTime',
  createdAt: 'createdAt'
};

exports.Prisma.PlaceRatingScalarFieldEnum = {
  id: 'id',
  placeId: 'placeId',
  userId: 'userId',
  bookingId: 'bookingId',
  ratingScore: 'ratingScore',
  reviewComment: 'reviewComment',
  ratingDate: 'ratingDate',
  isVerified: 'isVerified',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.OperatingHourScalarFieldEnum = {
  id: 'id',
  placeId: 'placeId',
  dayOfWeek: 'dayOfWeek',
  openingTime: 'openingTime',
  closingTime: 'closingTime',
  is24hours: 'is24hours',
  isClosed: 'isClosed',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PlaceAdminScalarFieldEnum = {
  id: 'id',
  placeId: 'placeId',
  username: 'username',
  email: 'email',
  passwordHash: 'passwordHash',
  fullName: 'fullName',
  role: 'role',
  contactNumber: 'contactNumber',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SystemLogScalarFieldEnum = {
  id: 'id',
  entityType: 'entityType',
  entityId: 'entityId',
  action: 'action',
  performedBy: 'performedBy',
  logLevel: 'logLevel',
  logDetails: 'logDetails',
  logTime: 'logTime',
  createdAt: 'createdAt'
};

exports.Prisma.EmailVerificationTokenScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  token: 'token',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt'
};

exports.Prisma.PhoneVerificationOtpScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  phoneNumber: 'phoneNumber',
  otp: 'otp',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt'
};

exports.Prisma.PasswordResetTokenScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  token: 'token',
  expiresAt: 'expiresAt',
  createdAt: 'createdAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};


exports.Prisma.ModelName = {
  User: 'User',
  UserSession: 'UserSession',
  UserProfile: 'UserProfile',
  Vehicle: 'Vehicle',
  Place: 'Place',
  ParkingZone: 'ParkingZone',
  ParkingSlot: 'ParkingSlot',
  SlotAvailability: 'SlotAvailability',
  TariffPlan: 'TariffPlan',
  TariffRate: 'TariffRate',
  Booking: 'Booking',
  BookingStatusLog: 'BookingStatusLog',
  BookingPayment: 'BookingPayment',
  PaymentTransaction: 'PaymentTransaction',
  RefundTransaction: 'RefundTransaction',
  PaymentMethod: 'PaymentMethod',
  UserPaymentMethod: 'UserPaymentMethod',
  PromoCode: 'PromoCode',
  ParkingPass: 'ParkingPass',
  ParkingPassPayment: 'ParkingPassPayment',
  AccessLog: 'AccessLog',
  BookingExtension: 'BookingExtension',
  NotificationSetting: 'NotificationSetting',
  Notification: 'Notification',
  PlaceRating: 'PlaceRating',
  OperatingHour: 'OperatingHour',
  PlaceAdmin: 'PlaceAdmin',
  SystemLog: 'SystemLog',
  EmailVerificationToken: 'EmailVerificationToken',
  PhoneVerificationOtp: 'PhoneVerificationOtp',
  PasswordResetToken: 'PasswordResetToken'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }

        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
