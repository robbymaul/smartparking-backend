# Langkah-langkah Setup Proyek NestJS Smart Parking

## 1. Inisialisasi Proyek NestJS

# Install Nest CLI jika belum ada

```bash
# Install Nest CLI jika belum ada
npm i -g @nestjs/cli

# Buat proyek baru
nest new smart-parking-api

# Pindah ke direktori proyek
cd smart-parking-api
```

## 2. Setup Prisma

```bash
# Install Prisma CLI dan klien
  npm install -D prisma
  npm install @prisma/client

# Inisialisasi Prisma dengan PostgreSQL
  npx prisma init --datasource-provider postgresql
```

## 3. Konfigurasi Database di .env

Edit file `.env` di root proyek:

```
# Database connection
DATABASE_URL="postgresql://username:password@localhost:5432/smart_parking?schema=public"
```

## 4. Buat Prisma Service

```bash
# Generate Prisma module dan service
  nest generate module prisma
  nest generate service prisma
```

## 5. Generate Prisma DB Push
```bash
# generate prisma
  npx prisma generate

# prisma db push
  npx prisma db push
```

## 6. Install Dependency Tambahan yang Diperlukan

```bash
# Paket validasi
  npm install class-validator class-transformer

# Paket konfigurasi
  npm install @nestjs/config

# Swagger untuk dokumentasi API
  npm install @nestjs/swagger swagger-ui-express
  
# Logger Winston
  npm install --save nest-winston winston

# Zod Validation
  npm install zod

# Json Web Token
  npm install --save @nestjs/jwt

# Bcrypt
  npm install bcrypt
  npm install -D @types/bcrypt

# Decimal JS  
  npm install decimal.js
  
# Install UUID
  npm install uuid
  
# Install Nest Passport Jwt
  npm install @nestjs/jwt passport-jwt
  npm install --save-dev @types/passport-jwt
  npm install @nestjs/passport passport
  
# Install Google Auth Library
  npm install google-auth-library
```

# Struktur File Modul Booking

```bash
# Membuat modul booking
  nest generate module bookings

# Membuat service booking
  nest generate service bookings

# Membuat controller booking
  nest generate controller bookings

# Membuat DTO
  mkdir -p src/bookings/dto
  touch src/bookings/dto/create-booking.dto.ts
  touch src/bookings/dto/update-booking.dto.ts
  touch src/bookings/dto/cancel-booking.dto.ts
  touch src/bookings/dto/extend-booking.dto.ts
  touch src/bookings/dto/check-in-booking.dto.ts
  touch src/bookings/dto/check-out-booking.dto.ts
  touch src/bookings/dto/booking-response.dto.ts

# Membuat interfaces
  mkdir -p src/bookings/interfaces
  touch src/bookings/interfaces/booking-status.interface.ts
```

# Struktur File Modul Payment

```bash
# Membuat modul payment
nest generate module payments

# Membuat service payment
nest generate service payments

# Membuat controller payment
nest generate controller payments

# Membuat DTO
mkdir -p src/payments/dto
touch src/payments/dto/process.payment.dto.ts
touch src/payments/dto/refund.payment.dto.ts
touch src/payments/dto/payment.response.dto.ts
touch src/payments/dto/save.payment.method.dto.ts
touch src/payments/dto/payment.webhook.dto.ts

# Membuat interfaces
mkdir -p src/payments/interfaces
touch src/payments/interfaces/payment.status.interface.ts
touch src/payments/interfaces/payment-gateway.interface.ts

# Membuat gateway providers (adapters)
mkdir -p src/payments/gateways
touch src/payments/gateways/payment.gateway.provider.ts
touch src/payments/gateways/midtrans.gateway.ts
```
