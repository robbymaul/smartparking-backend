import { DateTime } from 'luxon';

const DEFAULT_TZ = 'Asia/Jakarta'; // Timezone WIB

export const DateUtil = {
  /**
   * Mendapatkan waktu lokal di zona waktu Asia/Jakarta.
   */
  nowLocal(): Date {
    return DateTime.now().setZone(DEFAULT_TZ).toJSDate();
  },

  /**
   * Mendapatkan waktu UTC.
   */
  nowUTC(): Date {
    return DateTime.utc().toJSDate(); // Mengembalikan waktu saat ini dalam UTC
  },

  /**
   * Mengonversi UTC ke waktu lokal (Asia/Jakarta).
   */
  utcToLocal(dateInput: string | Date): Date {
    return DateTime.fromJSDate(new Date(dateInput))
      .setZone(DEFAULT_TZ)
      .toJSDate();
  },

  /**
   * Mengonversi waktu lokal ke UTC.
   */
  localToUTC(dateInput: string | Date): Date {
    return DateTime.fromJSDate(new Date(dateInput))
      .setZone(DEFAULT_TZ)
      .toUTC()
      .toJSDate();
  },

  /**
   * Format waktu lokal (Asia/Jakarta) ke string.
   */
  formatLocal(
    dateInput: string | Date,
    format: string = 'DD/MM/YYYY HH:mm:ss [WIB]',
  ): string {
    return DateTime.fromJSDate(new Date(dateInput))
      .setZone(DEFAULT_TZ)
      .toFormat(format);
  },

  /**
   * Format waktu UTC ke waktu lokal (Asia/Jakarta) ke string.
   */
  formatUTCToLocal(
    dateInput: string | Date,
    format: string = 'DD/MM/YYYY HH:mm:ss [WIB]',
  ): string {
    return DateTime.fromJSDate(new Date(dateInput))
      .setZone(DEFAULT_TZ)
      .toFormat(format);
  },

  /**
   * Ambil waktu lokal (Asia/Jakarta) tapi disimpan seolah-olah itu UTC.
   */
  fakeUTCFromLocalNow(): Date {
    return DateTime.now().setZone(DEFAULT_TZ).toUTC().toJSDate();
  },
};
