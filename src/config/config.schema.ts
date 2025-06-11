import { z } from 'zod';
import * as process from 'node:process';

const envSchema = z.object({
  PORT: z.string().default('3000'),
  LOG_LEVEL: z.string().default('debug'),
  HEADER_API: z.string().default(''),
  USERNAME_BASIC_AUTH: z.string().default('rahasia'),
  PASSWORD_BASIC_AUTH: z.string().default('rahasia'),
  EMAIL_VERIFICATION_COOLDOWN_MINUTE: z.number().default(1),
  EMAIL_VERIFICATION_EXPIRY_HOURS: z.number().default(24),
  PHONE_VERIFICATION_COOLDOWN_MINUTES: z.number().default(2),
  PHONE_VERIFICATION_EXPIRY_MINUTES: z.number().default(10),
  // TWILIO_ACCOUNT_SID: z.string(),
  // TWILIO_AUTH_TOKEN: z.string(),
  // TWILIO_PHONE_NUMBER: z.string(),
  ZENZIVA_USERKEY: z.string(),
  ZENZIVA_PASSKEY: z.string(),
  FORGOT_PASSWORD_COOLDOWN_MINUTES: z.number().default(2),
  FORGOT_PASSWORD_OTP_EXPIRY_MINUTES: z.number().default(10),
  GOOGLE_CLIENT_ID: z.string().default('rahasia'),
  MIDTRANS_IS_PRODUCTION: z.boolean().default(false),
  MIDTRANS_SERVER_KEY: z.string(),
  MIDTRANS_CLIENT_KEY: z.string(),
  APP_URL: z.string(),
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
  EMAIL_NOTIFICATION_USER: z.string().default('rahasia'),
  EMAIL_NOTIFICATION_PASS: z.string().default('rahasia'),
});

const parsedEnvSchema = envSchema.safeParse(process.env);

if (!parsedEnvSchema.success) {
  console.error(
    'x Invalid environment variables',
    parsedEnvSchema.error.format(),
  );
  process.exit(1); // Stop aplikasi kalau ENV salah
}

export const CONFIG = parsedEnvSchema.data;
