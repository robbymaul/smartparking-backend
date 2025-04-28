-- CreateTable
CREATE TABLE "users" (
    "user_id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "phone_number" TEXT,
    "account_type" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "account_status" TEXT NOT NULL DEFAULT 'active',
    "last_login" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "user_sessions" (
    "session_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "device_info" TEXT,
    "ip_address" TEXT,
    "last_activity" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiry_time" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("session_id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "profile_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "profile_photo" TEXT,
    "gender" TEXT,
    "date_of_birth" TIMESTAMP(3),
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "postal_code" TEXT,
    "country" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("profile_id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "vehicle_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "license_plate" TEXT NOT NULL,
    "vehicle_type" TEXT NOT NULL,
    "brand" TEXT,
    "model" TEXT,
    "color" TEXT,
    "rfid_tag" TEXT,
    "length" DECIMAL(5,2),
    "width" DECIMAL(5,2),
    "height" DECIMAL(5,2),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("vehicle_id")
);

-- CreateTable
CREATE TABLE "places" (
    "place_id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "place_type" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "contact_number" TEXT,
    "email" TEXT,
    "description" TEXT,
    "total_capacity" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "places_pkey" PRIMARY KEY ("place_id")
);

-- CreateTable
CREATE TABLE "parking_zones" (
    "zone_id" SERIAL NOT NULL,
    "place_id" INTEGER NOT NULL,
    "zone_name" TEXT NOT NULL,
    "floor_level" TEXT,
    "zone_type" TEXT,
    "total_slots" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "parking_zones_pkey" PRIMARY KEY ("zone_id")
);

-- CreateTable
CREATE TABLE "parking_slots" (
    "slot_id" SERIAL NOT NULL,
    "zone_id" INTEGER NOT NULL,
    "slot_number" TEXT NOT NULL,
    "slot_type" TEXT NOT NULL,
    "is_reserved" BOOLEAN NOT NULL DEFAULT false,
    "is_occupied" BOOLEAN NOT NULL DEFAULT false,
    "is_disabled_friendly" BOOLEAN NOT NULL DEFAULT false,
    "has_ev_charger" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "parking_slots_pkey" PRIMARY KEY ("slot_id")
);

-- CreateTable
CREATE TABLE "slot_availability" (
    "availability_id" SERIAL NOT NULL,
    "slot_id" INTEGER NOT NULL,
    "available_from" TIMESTAMP(3) NOT NULL,
    "available_until" TIMESTAMP(3) NOT NULL,
    "is_bookable" BOOLEAN NOT NULL DEFAULT true,
    "status_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "slot_availability_pkey" PRIMARY KEY ("availability_id")
);

-- CreateTable
CREATE TABLE "tariff_plans" (
    "plan_id" SERIAL NOT NULL,
    "place_id" INTEGER NOT NULL,
    "plan_name" TEXT NOT NULL,
    "description" TEXT,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "effective_until" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "tariff_plans_pkey" PRIMARY KEY ("plan_id")
);

-- CreateTable
CREATE TABLE "tariff_rates" (
    "rate_id" SERIAL NOT NULL,
    "plan_id" INTEGER NOT NULL,
    "vehicle_type" TEXT NOT NULL,
    "slot_type" TEXT NOT NULL,
    "start_time" TIME,
    "end_time" TIME,
    "day_category" TEXT,
    "base_price" DECIMAL(10,2) NOT NULL,
    "hourly_rate" DECIMAL(10,2) NOT NULL,
    "day_rate" DECIMAL(10,2),
    "minimum_charge" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "grace_period_minutes" INTEGER NOT NULL DEFAULT 15,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "tariff_rates_pkey" PRIMARY KEY ("rate_id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "booking_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "vehicle_id" INTEGER NOT NULL,
    "slot_id" INTEGER NOT NULL,
    "promo_code_id" INTEGER,
    "booking_reference" TEXT NOT NULL,
    "booking_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduled_entry" TIMESTAMP(3) NOT NULL,
    "scheduled_exit" TIMESTAMP(3) NOT NULL,
    "actual_entry" TIMESTAMP(3),
    "actual_exit" TIMESTAMP(3),
    "qr_code" TEXT,
    "booking_status" TEXT NOT NULL,
    "estimated_price" DECIMAL(10,2) NOT NULL,
    "final_price" DECIMAL(10,2),
    "cancellation_reason" TEXT,
    "cancellation_time_minutes" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("booking_id")
);

-- CreateTable
CREATE TABLE "booking_status_logs" (
    "log_id" SERIAL NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "previous_status" TEXT NOT NULL,
    "new_status" TEXT NOT NULL,
    "changed_by" TEXT NOT NULL,
    "reason" TEXT,
    "status_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "booking_status_logs_pkey" PRIMARY KEY ("log_id")
);

-- CreateTable
CREATE TABLE "booking_payments" (
    "payment_id" SERIAL NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "payment_reference" TEXT,
    "payment_status" TEXT NOT NULL,
    "original_amount" DECIMAL(10,2) NOT NULL,
    "discount_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "tax_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "surcharge_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "final_amount" DECIMAL(10,2) NOT NULL,
    "is_prepaid" BOOLEAN NOT NULL DEFAULT false,
    "is_refunded" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "booking_payments_pkey" PRIMARY KEY ("payment_id")
);

-- CreateTable
CREATE TABLE "payment_transactions" (
    "transaction_id" SERIAL NOT NULL,
    "payment_id" INTEGER NOT NULL,
    "payment_method_id" INTEGER NOT NULL,
    "transaction_reference" TEXT,
    "transaction_type" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'IDR',
    "transaction_status" TEXT NOT NULL,
    "gateway_response" TEXT,
    "transaction_data" TEXT,
    "transaction_time" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "payment_transactions_pkey" PRIMARY KEY ("transaction_id")
);

-- CreateTable
CREATE TABLE "refund_transactions" (
    "refund_id" SERIAL NOT NULL,
    "payment_id" INTEGER NOT NULL,
    "refund_reference" TEXT,
    "refund_amount" DECIMAL(10,2) NOT NULL,
    "refund_reason" TEXT,
    "refund_status" TEXT NOT NULL,
    "processor_response" TEXT,
    "refund_data" TEXT,
    "refund_time" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "refund_transactions_pkey" PRIMARY KEY ("refund_id")
);

-- CreateTable
CREATE TABLE "payment_methods" (
    "payment_method_id" SERIAL NOT NULL,
    "method_name" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "method_type" TEXT NOT NULL,
    "description" TEXT,
    "processing_fee_percent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "fixed_fee" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "supports_refunds" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "payment_methods_pkey" PRIMARY KEY ("payment_method_id")
);

-- CreateTable
CREATE TABLE "user_payment_methods" (
    "user_payment_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "payment_method_id" INTEGER NOT NULL,
    "token_reference" TEXT NOT NULL,
    "masked_info" TEXT,
    "expiry_info" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "user_payment_methods_pkey" PRIMARY KEY ("user_payment_id")
);

-- CreateTable
CREATE TABLE "promo_codes" (
    "promo_id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "discount_type" TEXT NOT NULL,
    "discount_value" DECIMAL(10,2) NOT NULL,
    "minimum_spend" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "valid_from" TIMESTAMP(3) NOT NULL,
    "valid_until" TIMESTAMP(3),
    "usage_limit" INTEGER,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "promo_codes_pkey" PRIMARY KEY ("promo_id")
);

-- CreateTable
CREATE TABLE "parking_passes" (
    "pass_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "place_id" INTEGER NOT NULL,
    "pass_type" TEXT NOT NULL,
    "pass_reference" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL,
    "auto_renew" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "parking_passes_pkey" PRIMARY KEY ("pass_id")
);

-- CreateTable
CREATE TABLE "parking_pass_payments" (
    "pass_payment_id" SERIAL NOT NULL,
    "pass_id" INTEGER NOT NULL,
    "payment_method_id" INTEGER NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "payment_status" TEXT NOT NULL,
    "transaction_reference" TEXT,
    "payment_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "parking_pass_payments_pkey" PRIMARY KEY ("pass_payment_id")
);

-- CreateTable
CREATE TABLE "access_logs" (
    "log_id" SERIAL NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "log_type" TEXT NOT NULL,
    "log_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verification_method" TEXT,
    "verified_by" TEXT,
    "location" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "access_logs_pkey" PRIMARY KEY ("log_id")
);

-- CreateTable
CREATE TABLE "booking_extensions" (
    "extension_id" SERIAL NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "original_end_time" TIMESTAMP(3) NOT NULL,
    "new_end_time" TIMESTAMP(3) NOT NULL,
    "additional_charge" DECIMAL(10,2) NOT NULL,
    "payment_status" TEXT NOT NULL,
    "request_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "booking_extensions_pkey" PRIMARY KEY ("extension_id")
);

-- CreateTable
CREATE TABLE "notification_settings" (
    "setting_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "email_enabled" BOOLEAN NOT NULL DEFAULT true,
    "sms_enabled" BOOLEAN NOT NULL DEFAULT false,
    "push_enabled" BOOLEAN NOT NULL DEFAULT true,
    "booking_confirmation" BOOLEAN NOT NULL DEFAULT true,
    "payment_notifications" BOOLEAN NOT NULL DEFAULT true,
    "reminder_notifications" BOOLEAN NOT NULL DEFAULT true,
    "marketing_notifications" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "notification_settings_pkey" PRIMARY KEY ("setting_id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "notification_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "booking_id" INTEGER,
    "notification_type" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "sent_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_time" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("notification_id")
);

-- CreateTable
CREATE TABLE "place_ratings" (
    "rating_id" SERIAL NOT NULL,
    "place_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "rating_score" DECIMAL(3,1) NOT NULL,
    "review_comment" TEXT,
    "rating_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_verified" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "place_ratings_pkey" PRIMARY KEY ("rating_id")
);

-- CreateTable
CREATE TABLE "operating_hours" (
    "hours_id" SERIAL NOT NULL,
    "place_id" INTEGER NOT NULL,
    "day_of_week" TEXT NOT NULL,
    "opening_time" TIME,
    "closing_time" TIME,
    "is_24hours" BOOLEAN NOT NULL DEFAULT false,
    "is_closed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "operating_hours_pkey" PRIMARY KEY ("hours_id")
);

-- CreateTable
CREATE TABLE "place_admins" (
    "admin_id" SERIAL NOT NULL,
    "place_id" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "contact_number" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "place_admins_pkey" PRIMARY KEY ("admin_id")
);

-- CreateTable
CREATE TABLE "system_logs" (
    "log_id" SERIAL NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "performed_by" TEXT NOT NULL,
    "log_level" TEXT NOT NULL,
    "log_details" TEXT,
    "log_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_logs_pkey" PRIMARY KEY ("log_id")
);

-- CreateTable
CREATE TABLE "email_verification_tokens" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_verification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phone_verification_otps" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "phone_number" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "phone_verification_otps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_number_key" ON "users"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "user_sessions_token_key" ON "user_sessions"("token");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_user_id_key" ON "user_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_license_plate_key" ON "vehicles"("license_plate");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_booking_reference_key" ON "bookings"("booking_reference");

-- CreateIndex
CREATE UNIQUE INDEX "booking_payments_booking_id_key" ON "booking_payments"("booking_id");

-- CreateIndex
CREATE UNIQUE INDEX "booking_payments_payment_reference_key" ON "booking_payments"("payment_reference");

-- CreateIndex
CREATE UNIQUE INDEX "payment_transactions_transaction_reference_key" ON "payment_transactions"("transaction_reference");

-- CreateIndex
CREATE UNIQUE INDEX "refund_transactions_refund_reference_key" ON "refund_transactions"("refund_reference");

-- CreateIndex
CREATE UNIQUE INDEX "promo_codes_code_key" ON "promo_codes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "parking_passes_pass_reference_key" ON "parking_passes"("pass_reference");

-- CreateIndex
CREATE UNIQUE INDEX "parking_pass_payments_transaction_reference_key" ON "parking_pass_payments"("transaction_reference");

-- CreateIndex
CREATE UNIQUE INDEX "notification_settings_user_id_key" ON "notification_settings"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "place_admins_username_key" ON "place_admins"("username");

-- CreateIndex
CREATE UNIQUE INDEX "place_admins_email_key" ON "place_admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "email_verification_tokens_token_key" ON "email_verification_tokens"("token");

-- CreateIndex
CREATE INDEX "email_verification_tokens_token_idx" ON "email_verification_tokens"("token");

-- CreateIndex
CREATE INDEX "phone_verification_otps_user_id_otp_idx" ON "phone_verification_otps"("user_id", "otp");

-- AddForeignKey
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parking_zones" ADD CONSTRAINT "parking_zones_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "places"("place_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parking_slots" ADD CONSTRAINT "parking_slots_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "parking_zones"("zone_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slot_availability" ADD CONSTRAINT "slot_availability_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "parking_slots"("slot_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tariff_plans" ADD CONSTRAINT "tariff_plans_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "places"("place_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tariff_rates" ADD CONSTRAINT "tariff_rates_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "tariff_plans"("plan_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "vehicles"("vehicle_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "parking_slots"("slot_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_promo_code_id_fkey" FOREIGN KEY ("promo_code_id") REFERENCES "promo_codes"("promo_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_status_logs" ADD CONSTRAINT "booking_status_logs_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("booking_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_payments" ADD CONSTRAINT "booking_payments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("booking_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "booking_payments"("payment_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_transactions" ADD CONSTRAINT "payment_transactions_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods"("payment_method_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refund_transactions" ADD CONSTRAINT "refund_transactions_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "booking_payments"("payment_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_payment_methods" ADD CONSTRAINT "user_payment_methods_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_payment_methods" ADD CONSTRAINT "user_payment_methods_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods"("payment_method_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parking_passes" ADD CONSTRAINT "parking_passes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parking_passes" ADD CONSTRAINT "parking_passes_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "places"("place_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parking_pass_payments" ADD CONSTRAINT "parking_pass_payments_pass_id_fkey" FOREIGN KEY ("pass_id") REFERENCES "parking_passes"("pass_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parking_pass_payments" ADD CONSTRAINT "parking_pass_payments_payment_method_id_fkey" FOREIGN KEY ("payment_method_id") REFERENCES "payment_methods"("payment_method_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "access_logs" ADD CONSTRAINT "access_logs_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("booking_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_extensions" ADD CONSTRAINT "booking_extensions_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("booking_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_settings" ADD CONSTRAINT "notification_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("booking_id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "place_ratings" ADD CONSTRAINT "place_ratings_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "places"("place_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "place_ratings" ADD CONSTRAINT "place_ratings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "place_ratings" ADD CONSTRAINT "place_ratings_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("booking_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operating_hours" ADD CONSTRAINT "operating_hours_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "places"("place_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "place_admins" ADD CONSTRAINT "place_admins_place_id_fkey" FOREIGN KEY ("place_id") REFERENCES "places"("place_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_verification_tokens" ADD CONSTRAINT "email_verification_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phone_verification_otps" ADD CONSTRAINT "phone_verification_otps_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE;
