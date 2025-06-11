import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { CONFIG } from 'src/config/config.schema';
import {
  ApiBasicAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  LoginAdminRequestDto,
  LoginAdminResponseDto,
} from './dto/login.admin.dto';
import {
  WebErrorResponse,
  WebSuccessResponse,
} from '../common/constant/web.response';
import { Logger } from 'winston';
import { BasicAuthGuard } from '../common/guards/basic.auth.guard';
import { AdminService } from './admin.service';
import { RegisterAdminRequestDto } from './dto/register.admin.dto';
import { NotificationResponseDto } from '../auth/dto/notification.dto';
import { JWTAdminAuthorization } from '../common/decorators/auth.decorator';
import { RolesAdmin } from '../common/decorators/roles.decorators';
import {
  ListAdminQueryDto,
  ListAdminResponseDto,
  Metadata,
} from './dto/list.admin.dto';
import { AdminResponseDto } from './dto/admin.dto';

@Controller(CONFIG.HEADER_API)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @ApiOperation({ summary: 'login as admin' })
  @ApiBody({
    description: 'sign in credentials',
    type: LoginAdminRequestDto,
  })
  @ApiOkResponse({
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        status: { type: 'boolean', example: true },
        data: {
          $ref: getSchemaPath(LoginAdminResponseDto),
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'login bad request',
    type: WebErrorResponse,
  })
  @ApiBasicAuth()
  @Post('/admins/login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(BasicAuthGuard)
  async login(
    @Body() request: LoginAdminRequestDto,
  ): Promise<WebSuccessResponse<LoginAdminResponseDto>> {
    this.logger.debug('login request body', request);

    const result: LoginAdminResponseDto =
      await this.adminService.loginAdminService(request);

    return {
      code: HttpStatus.OK,
      status: true,
      data: result,
    };
  }

  @ApiOperation({ summary: 'register as admin' })
  @ApiBody({
    description: 'register credentials',
    type: RegisterAdminRequestDto,
  })
  @ApiOkResponse({
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        status: { type: 'boolean', example: true },
        data: {
          $ref: getSchemaPath(NotificationResponseDto),
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'login bad request',
    type: WebErrorResponse,
  })
  @ApiBasicAuth()
  @Post('/admins/register')
  @HttpCode(HttpStatus.OK)
  @RolesAdmin(['master'])
  async registerAdmin(
    @JWTAdminAuthorization() admin: any,
    @Body() request: RegisterAdminRequestDto,
  ): Promise<WebSuccessResponse<NotificationResponseDto>> {
    this.logger.debug('register request body', request);

    const result: NotificationResponseDto =
      await this.adminService.registerAdminService(admin, request);

    return {
      code: HttpStatus.OK,
      status: true,
      data: result,
    };
  }

  @ApiOperation({ summary: 'get list admin as admin' })
  @ApiOkResponse({
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        status: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            items: {
              type: 'array',
              items: { $ref: getSchemaPath(ListAdminResponseDto) },
            },
            metadata: { $ref: getSchemaPath(Metadata) },
          },
        },
      },
    },
  })
  @Get('/admins/places/admins')
  @HttpCode(HttpStatus.OK)
  @RolesAdmin(['master'])
  async getListAdmin(
    @JWTAdminAuthorization() admin: any,
    @Query() query: ListAdminQueryDto,
  ): Promise<WebSuccessResponse<ListAdminResponseDto>> {
    this.logger.debug('login request body', query);

    const result: ListAdminResponseDto =
      await this.adminService.getListAdminService(admin, query);

    return {
      code: HttpStatus.OK,
      status: true,
      data: result,
    };
  }

  @Get('/admins/places/admins/:id')
  @HttpCode(HttpStatus.OK)
  @RolesAdmin(['master'])
  async getAdmin(
    @JWTAdminAuthorization() admin: any,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<WebSuccessResponse<AdminResponseDto>> {
    const result: AdminResponseDto = await this.adminService.getAdminService(
      admin,
      id,
    );

    return {
      code: HttpStatus.OK,
      status: true,
      data: result,
    };
  }

  @Put('/admins/places/admins/:id')
  @HttpCode(HttpStatus.OK)
  @RolesAdmin(['master'])
  async updateAdmin(
    @JWTAdminAuthorization() admin: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() request: AdminResponseDto,
  ): Promise<WebSuccessResponse<NotificationResponseDto>> {
    this.logger.debug(
      `id param ${id} | request body ${JSON.stringify(request)}`,
    );
    const result: NotificationResponseDto =
      await this.adminService.updateAdminService(admin, id, request);

    return {
      code: HttpStatus.OK,
      status: true,
      data: result,
    };
  }
}
