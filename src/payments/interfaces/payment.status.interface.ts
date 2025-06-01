export enum PaymentStatus {
  PENDING = 'pending', // Menunggu pembayaran
  PROCESSING = 'processing', // Sedang diproses
  SUCCESS = 'success', // Pembayaran berhasil
  COMPLETED = 'completed', // Pembayaran gagal
  FAILED = 'failed', // Pembayaran gagal
  EXPIRED = 'expired', // Pembayaran kedaluwarsa
  REFUNDED = 'refunded', // Refund penuh
  PARTIALLY_REFUNDED = 'partially_refunded', // Refund sebagian
}

export enum RefundStatus {
  PENDING = 'pending', // Menunggu proses refund
  PROCESSING = 'processing', // Refund sedang diproses
  SUCCESS = 'success', // Refund berhasil
  FAILED = 'failed', // Refund gagal
}

export enum TransactionType {
  PAYMENT = 'payment', // Pembayaran normal
  AUTHORIZATION = 'authorization', // Otorisasi (pre-auth)
  CAPTURE = 'capture', // Capture dari pre-auth
}
