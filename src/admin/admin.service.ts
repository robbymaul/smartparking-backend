import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { IAdminRepository } from './admin.repository';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { NotificationService } from 'src/notification/notification.service';
import {
  LoginAdminRequestDto,
  LoginAdminResponseDto,
} from './dto/login.admin.dto';
import { PrismaClient } from 'generated/prisma';
import * as bcrypt from 'bcrypt';
import { PlaceAdminEntity } from '../entities/place.admin.entity';
import { SystemLogEntity } from '../entities/system.log.entity';
import { NotificationResponseDto } from '../auth/dto/notification.dto';
import { RegisterAdminRequestDto } from './dto/register.admin.dto';
import { PlaceEntity } from '../entities/places.entity';
import { GeneratorsService } from '../common/utils/generators';
import {
  ListAdminQueryDto,
  ListAdminResponseDto,
  Metadata,
} from './dto/list.admin.dto';
import { AdminResponseDto, mapToAdminResponseDto } from './dto/admin.dto';

@Injectable()
export class AdminService {
  constructor(
    @Inject('IAdminRepository')
    private readonly adminRepository: IAdminRepository,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly notificationService: NotificationService,
    private readonly generatorService: GeneratorsService,
  ) {}

  async loginAdminService(
    loginDto: LoginAdminRequestDto,
  ): Promise<LoginAdminResponseDto> {
    const { email, password } = loginDto;

    const result = await this.prismaService.transactional(
      async (prisma: PrismaClient): Promise<Record<any, any>> => {
        const adminEntity =
          await this.adminRepository.getPlaceAdminByEmailRepository(email);

        // Jika user tidak ditemukan
        if (!adminEntity) {
          throw new UnauthorizedException('email atau password salah');
        }

        // if (!adminEntity.isActive) {
        //   throw new ForbiddenException(`Akun tidak aktif.`);
        // }

        // Verifikasi password
        const isPasswordValid = await bcrypt.compare(
          password,
          adminEntity.passwordHash,
        );

        this.logger.debug(`isPasswordValid ${isPasswordValid}`);

        if (!isPasswordValid) {
          throw new UnauthorizedException('email atau password salah');
        }

        const tokens = await this.generateTokens(adminEntity);

        const newSystemLogEntity = new SystemLogEntity({
          entityType: 'admin',
          entityId: adminEntity.id ?? 0,
          action: 'login admin',
          performedBy: `admin:${adminEntity.id}`,
          logLevel: 'info',
          logDetails: JSON.stringify({
            ip: '127.0.0.1',
            userAgent: 'web',
            timeStamp: new Date(),
          }),
          logTime: new Date(),
          createdAt: new Date(),
        });

        await this.adminRepository.createSystemLogRepository(
          prisma,
          newSystemLogEntity,
        );

        return {
          token: tokens,
        };
      },
    );

    const { token } = result;

    return { token: token };
  }

  async registerAdminService(
    admin: any,
    request: RegisterAdminRequestDto,
  ): Promise<NotificationResponseDto> {
    // destruct dto
    const { email, password, fullName, role, contactNumber } = request;

    // get admin
    const adminEntity: PlaceAdminEntity | null =
      await this.adminRepository.getPlaceAdminByIdRepository(admin, admin.id);

    // Jika user tidak ditemukan
    if (!adminEntity) {
      throw new UnauthorizedException('Akun tidak ditemukan');
    }

    if (!adminEntity.isActive) {
      throw new ForbiddenException(`Akun tidak aktif.`);
    }

    // get place admin by place id
    const place: PlaceEntity | null =
      await this.adminRepository.getPlaceByPlaceIdRepository(
        adminEntity.placeId,
      );

    if (!place) {
      throw new NotFoundException('Place tidak ditemukan.');
    }

    // transactional
    const result: NotificationResponseDto =
      await this.prismaService.transactional(
        async (prisma: PrismaClient): Promise<NotificationResponseDto> => {
          // generate random digit
          const digitRandom = await this.generatorService.getRandom9Digits();
          const passwordHash = await bcrypt.hash(password, 10);

          // create object admin
          const newPlaceAdmin = new PlaceAdminEntity({
            placeId: place.id,
            username: `admin${digitRandom}`,
            email: email,
            passwordHash: passwordHash,
            fullName: fullName,
            role: role,
            contactNumber: contactNumber,
            isActive: false,
          });

          // insert admin
          const placeAdmin: PlaceAdminEntity =
            await this.adminRepository.insertPlaceAdminRepository(
              prisma,
              newPlaceAdmin,
            );

          // system log
          const newSystemLogEntity = new SystemLogEntity({
            entityType: 'admin',
            entityId: placeAdmin.id ?? 0,
            action: 'create admin',
            performedBy: `admin:${adminEntity.id}`,
            logLevel: 'info',
            logDetails: JSON.stringify({
              ip: '127.0.0.1',
              userAgent: 'web',
              timeStamp: new Date(),
              reason: `created admin ${placeAdmin.fullName} by ${adminEntity.fullName}`,
            }),
            logTime: new Date(),
            createdAt: new Date(),
          });

          await this.adminRepository.createSystemLogRepository(
            prisma,
            newSystemLogEntity,
          );

          return {
            message: 'Berhasil membuat admin baru',
            success: true,
            email: email,
          };
        },
      );

    // return
    return result;
  }

  async getListAdminService(
    admin: any,
    query: ListAdminQueryDto,
  ): Promise<ListAdminResponseDto> {
    // get count admin by place id
    const total: number =
      await this.adminRepository.getCountAdminByPlaceIdRepository(admin, query);

    // get admin by place id
    const adminEntities: PlaceAdminEntity[] =
      await this.adminRepository.findAllAdminByPlaceIdRepository(admin, query);

    // init array
    const admins: AdminResponseDto[] = [];

    adminEntities.forEach((adminEntity) =>
      admins.push(mapToAdminResponseDto(adminEntity)),
    );

    const metadata: Metadata = {
      page: query.page || 1,
      perPage: query.perPage || 10,
      totalCount: total,
      pageCount: Math.ceil(total / query.perPage || 10),
    };

    return {
      Items: admins,
      Metadata: metadata,
    };
  }

  async getAdminService(admin: any, id: number): Promise<AdminResponseDto> {
    // get admin
    const adminEntity: PlaceAdminEntity | null =
      await this.adminRepository.getPlaceAdminByIdRepository(admin, id);

    // check admin found
    if (!adminEntity) {
      throw new NotFoundException('Akun tidak ditemukan.');
    }

    // return
    return mapToAdminResponseDto(adminEntity);
  }

  async updateAdminService(
    admin: any,
    id: number,
    request: AdminResponseDto,
  ): Promise<NotificationResponseDto> {
    // destruct body
    const { fullName, role, contactNumber, isActive, email } = request;

    // check id param and id request body
    if (id !== request.id) {
      throw new ForbiddenException('Data tidak bisa diubah');
    }

    // get data admin
    const adminEntity: PlaceAdminEntity | null =
      await this.adminRepository.getPlaceAdminByIdRepository(admin, id);

    // check found data
    if (!adminEntity) {
      throw new NotFoundException('Akun tidak ditemukan.');
    }

    // transactional
    const result: NotificationResponseDto =
      await this.prismaService.transactional(
        async (prisma: PrismaClient): Promise<NotificationResponseDto> => {
          // check of data update
          const updatedAdmin = this.updatingAdmin(
            fullName,
            role,
            contactNumber,
            isActive,
            email,
            adminEntity,
          );

          // update admin
          await this.adminRepository.updatePlaceAdminRepository(
            prisma,
            updatedAdmin,
          );

          // system log
          const newSystemLogEntity = new SystemLogEntity({
            entityType: 'admin',
            entityId: adminEntity.id ?? 0,
            action: 'update admin',
            performedBy: `admin:${admin.id}`,
            logLevel: 'info',
            logDetails: JSON.stringify({
              ip: '127.0.0.1',
              userAgent: 'web',
              timeStamp: new Date(),
            }),
            logTime: new Date(),
            createdAt: new Date(),
          });

          await this.adminRepository.createSystemLogRepository(
            prisma,
            newSystemLogEntity,
          );

          return {
            success: true,
            message: 'admin updated successfully',
          };
        },
      );

    return result;
  }

  private async generateTokens(admin: PlaceAdminEntity): Promise<string> {
    const [access_token] = await Promise.all([
      this.jwtService.signAsync({
        sub: admin.id,
      }),
    ]);

    return access_token;
  }

  private updatingAdmin(
    fullName: string,
    role: string,
    contactNumber: string | null,
    isActive: boolean,
    email: string,
    adminEntity: PlaceAdminEntity,
  ): PlaceAdminEntity {
    if (adminEntity.fullName !== fullName) {
      adminEntity.fullName = fullName;
    }

    if (adminEntity.role !== role) {
      adminEntity.role = role;
    }

    if (adminEntity.isActive !== isActive) {
      adminEntity.isActive = isActive;
    }

    if (adminEntity.contactNumber !== contactNumber) {
      adminEntity.contactNumber = contactNumber;
    }

    if (adminEntity.email !== email) {
      adminEntity.email = email;
    }

    return adminEntity;
  }
}
