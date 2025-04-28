import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Put,
} from '@nestjs/common';
import { CONFIG } from '../config/config.schema';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { NotificationResponseDto } from '../auth/dto/notification.dto';
import {
  WebErrorResponse,
  WebSuccessResponse,
} from '../common/constant/web.response';
import { JWTAuthorization } from '../common/decorators/auth.decorator';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { UsersService } from './users.service';
import { UserProfileResponseDto } from './dto/profile.dto';
import { GetUserResponseDto } from './dto/user.dto';
import {
  CreateVehicleRequestDto,
  VehicleResponseDto,
} from './dto/vehicles.dto';

@Controller(CONFIG.HEADER_API)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @ApiOperation({ summary: 'get users as user' })
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
    description: 'get users  bad request',
    type: WebErrorResponse,
  })
  @ApiBearerAuth()
  @Get('/users')
  @HttpCode(HttpStatus.OK)
  async getUser(
    @JWTAuthorization() user: any,
  ): Promise<WebSuccessResponse<GetUserResponseDto>> {
    const result = await this.usersService.getUserService(user);

    return {
      code: HttpStatus.OK,
      status: true,
      data: result,
    };
  }

  @ApiOperation({ summary: 'get profile as user' })
  @ApiOkResponse({
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        status: { type: 'boolean', example: true },
        data: {
          $ref: getSchemaPath(UserProfileResponseDto),
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'get profilel bad request',
    type: WebErrorResponse,
  })
  @ApiBearerAuth()
  @Get('/users/profile')
  @HttpCode(HttpStatus.OK)
  async getProfile(
    @JWTAuthorization() user: any,
  ): Promise<WebSuccessResponse<UserProfileResponseDto>> {
    const result = await this.usersService.getProfileService(user);

    return {
      code: HttpStatus.OK,
      status: true,
      data: result,
    };
  }

  @ApiOperation({ summary: 'update profile as user' })
  @ApiBody({
    description: 'update profile credentials',
    type: UserProfileResponseDto,
  })
  @ApiOkResponse({
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        status: { type: 'boolean', example: true },
        data: {
          $ref: getSchemaPath(UserProfileResponseDto),
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'update profile bad request',
    type: WebErrorResponse,
  })
  @ApiBearerAuth()
  @Put('/users/profile')
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @JWTAuthorization() user: any,
    @Body() updateUserProfileRequest: UserProfileResponseDto,
  ): Promise<WebSuccessResponse<UserProfileResponseDto>> {
    const result = await this.usersService.updateUserProfileService(
      user,
      updateUserProfileRequest,
    );

    return {
      code: HttpStatus.OK,
      status: true,
      data: result,
    };
  }

  @ApiOperation({ summary: 'get user vehicles as user' })
  @ApiOkResponse({
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        status: { type: 'boolean', example: true },
        data: {
          type: 'array',
          $ref: getSchemaPath(VehicleResponseDto),
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'get user vehicles bad request',
    type: WebErrorResponse,
  })
  @ApiBearerAuth()
  @Get('/users/vehicles')
  @HttpCode(HttpStatus.OK)
  async getUserVehicles(
    @JWTAuthorization() user: any,
  ): Promise<WebSuccessResponse<VehicleResponseDto[]>> {
    const result = await this.usersService.getVehiclesService(user);

    return {
      code: HttpStatus.OK,
      status: true,
      data: result,
    };
  }

  @ApiOperation({ summary: 'create user vehicles as user' })
  @ApiBody({
    description: 'create vehicle credentials',
    type: CreateVehicleRequestDto,
  })
  @ApiOkResponse({
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        status: { type: 'boolean', example: true },
        data: {
          $ref: getSchemaPath(VehicleResponseDto),
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'create user vehicles bad request',
    type: WebErrorResponse,
  })
  @ApiBearerAuth()
  @Post('/users/vehicles')
  @HttpCode(HttpStatus.OK)
  async createUserVehicles(
    @JWTAuthorization() user: any,
    @Body() createVehicleRequest: CreateVehicleRequestDto,
  ): Promise<WebSuccessResponse<VehicleResponseDto>> {
    const result = await this.usersService.createVehiclesService(
      user,
      createVehicleRequest,
    );

    return {
      code: HttpStatus.OK,
      status: true,
      data: result,
    };
  }

  @ApiOperation({ summary: 'update user vehicles as user' })
  @ApiBody({
    description: 'update vehicle credentials',
    type: VehicleResponseDto,
  })
  @ApiOkResponse({
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        status: { type: 'boolean', example: true },
        data: {
          $ref: getSchemaPath(VehicleResponseDto),
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'update user vehicles bad request',
    type: WebErrorResponse,
  })
  @ApiBearerAuth()
  @Put('/users/vehicles/:id')
  @HttpCode(HttpStatus.OK)
  async updateUserVehicles(
    @JWTAuthorization() user: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateVehicleRequest: VehicleResponseDto,
  ): Promise<WebSuccessResponse<VehicleResponseDto>> {
    this.logger.debug(
      `[controller] update vehicle request: ${JSON.stringify(updateVehicleRequest)}`,
    );
    const result = await this.usersService.updateVehicleService(
      user,
      id,
      updateVehicleRequest,
    );

    return {
      code: HttpStatus.OK,
      status: true,
      data: result,
    };
  }

  @ApiOperation({ summary: 'delete user vehicles as user' })
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
    description: 'delete user vehicles bad request',
    type: WebErrorResponse,
  })
  @ApiBearerAuth()
  @Delete('/users/vehicles/:id')
  @HttpCode(HttpStatus.OK)
  async deleteUserVehicles(
    @JWTAuthorization() user: any,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<WebSuccessResponse<NotificationResponseDto>> {
    const result = await this.usersService.deleteVehicleService(user, id);

    return {
      code: HttpStatus.OK,
      status: true,
      data: result,
    };
  }
}
