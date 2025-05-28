import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import * as QRCode from 'qrcode';
import { Readable } from 'node:stream';
import { CONFIG } from '../../config/config.schema';

@Injectable()
export class GeneratorsService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly configService: ConfigService,
  ) {
    cloudinary.config({
      cloud_name: CONFIG.CLOUDINARY_CLOUD_NAME,
      api_key: CONFIG.CLOUDINARY_API_KEY,
      api_secret: CONFIG.CLOUDINARY_API_SECRET,
      secure: true,
    });
  }

  async generateQRCode(
    bookingReference: string,
    options: any = {},
  ): Promise<any> {
    try {
      const defaultOptions = {
        errorCorrectionLevel: 'H',
        type: 'image/png',
        quality: 0.92,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        width: 300,
        cloudinaryFolder: 'parking/qrcodes',
        uploadToCloudinary: true,
      };

      const finalOptions = { ...defaultOptions, ...options };

      const timestamp = Date.now();
      const qrData = JSON.stringify({
        ref: bookingReference,
        ts: timestamp,
        type: 'parking',
      });

      const qrBuffer: Buffer = await (QRCode.toBuffer as any)(qrData, {
        errorCorrectionLevel: finalOptions.errorCorrectionLevel,
        type: finalOptions.type,
        quality: finalOptions.quality,
        margin: finalOptions.margin,
        color: finalOptions.color,
        width: finalOptions.width,
      });

      if (!finalOptions.uploadToCloudinary) {
        return `data:image/png;base64,${qrBuffer.toString('base64')}`;
      }

      const publicId = `${finalOptions.cloudinaryFolder}/${bookingReference.replace(/[^a-zA-Z0-9]/g, '_')}`;

      const uploadResult = await this.uploadBufferToCloudinary(qrBuffer, {
        public_id: publicId,
        folder: finalOptions.cloudinaryFolder,
        resource_type: 'image',
        format: 'png',
        overwrite: true,
        tags: ['qrcode', 'parking', 'booking'],
        transformation: [{ quality: 'auto:best' }],
      });

      return uploadResult.secure_url;
    } catch (error) {
      this.logger.error('Error generating QR code with Cloudinary:', error);
      throw new Error(`Failed to generate QR code: ${error.message}`);
    }
  }

  async deleteQRCodeFromCloudinary(
    bookingReference,
    folder = 'parking/qrcodes',
  ) {
    try {
      const publicId = `${folder}/${bookingReference.replace(/[^a-zA-Z0-9]/g, '_')}`;
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (error) {
      this.logger.error('Error deleting QR code from Cloudinary:', error);
      throw error;
    }
  }

  private async uploadBufferToCloudinary(
    buffer: Buffer,
    options: any,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      // Buat readable stream dari buffer
      const streamBuffer = new Readable({
        read() {
          this.push(buffer);
          this.push(null);
        },
      });

      // Upload stream ke Cloudinary
      const uploadStream = cloudinary.uploader.upload_stream(
        options,
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve(result);
        },
      );

      // Pipe stream buffer ke upload stream
      streamBuffer.pipe(uploadStream);
    });
  }
}
