export enum BookingStatus {
  PENDING = 'pending', // Menunggu pembayaran
  CONFIRMED = 'confirmed', // Sudah dibayar, belum check-in
  ACTIVE = 'active', // Sudah check-in, sedang parkir
  COMPLETED = 'completed', // Sudah check-out, selesai
  CANCELLED = 'cancelled', // Dibatalkan
  EXPIRED = 'expired', // Kedaluwarsa (tidak dibayar tepat waktu)
}
