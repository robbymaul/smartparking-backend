import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseFloatPipe,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  WebErrorResponse,
  WebSuccessResponse,
} from '../common/constant/web.response';
import {
  JWTAdminAuthorization,
  JWTAuthorization,
} from '../common/decorators/auth.decorator';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { PlacesService } from './places.service';
import { PlaceResponseDto, RegisterPlacesRequestDto } from './dto/places.dto';
import { CONFIG } from '../config/config.schema';
import { NearbyPlaceDto } from './dto/place.nearby.dto';
import { PlacesRatingDtoResponse } from './dto/places.rating.dto';
import { ParkingZoneDtoResponse } from './dto/parking.zone.dto';
import { ParkingSlotDtoResponse } from './dto/parking.slot.dto';
import { NotificationResponseDto } from '../auth/dto/notification.dto';
import { RolesAdmin } from '../common/decorators/roles.decorators';
import {
  OperatingHourDtoResponse,
  OperatingHourRequestDto,
} from './dto/operating.hour.dto';

@Controller(CONFIG.HEADER_API)
export class PlacesController {
  constructor(
    private readonly placesService: PlacesService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @ApiOperation({ summary: 'get places as user' })
  @ApiOkResponse({
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        status: { type: 'boolean', example: true },
        data: {
          $ref: getSchemaPath(PlaceResponseDto),
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'get places  bad request',
    type: WebErrorResponse,
  })
  @ApiBearerAuth()
  @Get('/places')
  @HttpCode(HttpStatus.OK)
  async getPlaces(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
    @Query('search') search: string,
    @Query('city') city: string,
    @Query('area') area: string,
    @JWTAuthorization() user: any,
  ): Promise<WebSuccessResponse<PlaceResponseDto[]>> {
    const result = await this.placesService.getPlacesService(
      user,
      page,
      limit,
      search,
      city,
      area,
    );

    return {
      code: HttpStatus.OK,
      status: true,
      data: result,
    };
  }

  @ApiOperation({ summary: 'get detail places as user' })
  @ApiOkResponse({
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        status: { type: 'boolean', example: true },
        data: {
          type: 'array',
          $ref: getSchemaPath(PlaceResponseDto),
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'get detail places bad request',
    type: WebErrorResponse,
  })
  @ApiBearerAuth()
  @Get('/places/:id')
  @HttpCode(HttpStatus.OK)
  async getDetailPlaces(
    @JWTAuthorization() user: any,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<WebSuccessResponse<PlaceResponseDto>> {
    const result = await this.placesService.getDetailPlacesService(user, id);

    return {
      code: HttpStatus.OK,
      status: true,
      data: result,
    };
  }

  @ApiOperation({ summary: 'get places nearby as user' })
  @ApiOkResponse({
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        status: { type: 'boolean', example: true },
        data: {
          type: 'array',
          $ref: getSchemaPath(PlaceResponseDto),
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'get places nearby bad request',
    type: WebErrorResponse,
  })
  @ApiBearerAuth()
  @Get('/places/user/nearby')
  @HttpCode(HttpStatus.OK)
  async getPlacesNearby(
    @JWTAuthorization() user: any,
    @Query('latitude', ParseFloatPipe) latitude: number,
    @Query('longitude', ParseFloatPipe) longitude: number,
    @Query('radius', ParseIntPipe) radius: number,
  ): Promise<WebSuccessResponse<PlaceResponseDto[]>> {
    const query = new NearbyPlaceDto({
      latitude: latitude,
      longitude: longitude,
      radius: radius,
    });

    this.logger.debug(`query: ${JSON.stringify(query)}`);

    const result = await this.placesService.getPlacesNearbyService(user, query);

    return {
      code: HttpStatus.OK,
      status: true,
      data: result,
    };
  }

  @ApiOperation({ summary: 'get places ratings as user' })
  @ApiOkResponse({
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        status: { type: 'boolean', example: true },
        data: {
          type: 'array',
          $ref: getSchemaPath(PlacesRatingDtoResponse),
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'get places ratings bad request',
    type: WebErrorResponse,
  })
  @ApiBearerAuth()
  @Get('/places/:id/ratings')
  @HttpCode(HttpStatus.OK)
  async getListPlacesRating(
    @Param('id', ParseIntPipe) id: number,
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
    @JWTAuthorization() user: any,
  ): Promise<WebSuccessResponse<PlacesRatingDtoResponse[]>> {
    const result = await this.placesService.getPlacesRatingService(
      user,
      id,
      page,
      limit,
    );

    return {
      code: HttpStatus.OK,
      status: true,
      data: result,
    };
  }

  @ApiOperation({ summary: 'get parking zones as user' })
  @ApiOkResponse({
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        status: { type: 'boolean', example: true },
        data: {
          type: 'array',
          $ref: getSchemaPath(ParkingZoneDtoResponse),
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'get parking zones bad request',
    type: WebErrorResponse,
  })
  @ApiBearerAuth()
  @Get('/places/:id/parking-zone')
  @HttpCode(HttpStatus.OK)
  async getListParkingZone(
    @Param('id', ParseIntPipe) id: number,
    @JWTAuthorization() user: any,
  ): Promise<WebSuccessResponse<ParkingZoneDtoResponse[]>> {
    const result = await this.placesService.getParkingZoneService(user, id);

    return {
      code: HttpStatus.OK,
      status: true,
      data: result,
    };
  }

  @ApiOperation({ summary: 'get parking slots as user' })
  @ApiOkResponse({
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        status: { type: 'boolean', example: true },
        data: {
          type: 'array',
          $ref: getSchemaPath(ParkingZoneDtoResponse),
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'get parking slots bad request',
    type: WebErrorResponse,
  })
  @ApiBearerAuth()
  @Get('/parking-zone/:id/parking-slot')
  @HttpCode(HttpStatus.OK)
  async getListParkingSlot(
    @Param('id', ParseIntPipe) id: number,
    @JWTAuthorization() user: any,
  ): Promise<WebSuccessResponse<ParkingSlotDtoResponse[]>> {
    const result = await this.placesService.getParkingSlotService(user, id);

    return {
      code: HttpStatus.OK,
      status: true,
      data: result,
    };
  }

  @ApiOperation({ summary: 'register place admin as places admin' })
  @ApiBody({
    description: 'register place credentials',
    type: RegisterPlacesRequestDto,
  })
  @ApiOkResponse({
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        status: { type: 'boolean', example: true },
        data: {
          type: 'array',
          $ref: getSchemaPath(ParkingZoneDtoResponse),
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'register place bad request',
    type: WebErrorResponse,
  })
  @Post('/places/register')
  @HttpCode(HttpStatus.OK)
  async registerPlaces(
    @Body() request: RegisterPlacesRequestDto,
  ): Promise<WebSuccessResponse<NotificationResponseDto>> {
    const result = await this.placesService.registerPlaces(request);

    return {
      code: HttpStatus.OK,
      status: true,
      data: result,
    };
  }

  @Get('/admins/places')
  @HttpCode(HttpStatus.OK)
  @RolesAdmin(['admin', 'master'])
  async adminGetPlace(
    @JWTAdminAuthorization() admin: any,
  ): Promise<WebSuccessResponse<PlaceResponseDto>> {
    const result: PlaceResponseDto =
      await this.placesService.adminGetPlaceService(admin);

    return {
      code: HttpStatus.OK,
      status: true,
      data: result,
    };
  }

  @Put('/admins/places')
  @HttpCode(HttpStatus.OK)
  @RolesAdmin(['master'])
  async adminUpdatePlace(
    @JWTAdminAuthorization() admin: any,
    @Body() request: PlaceResponseDto,
  ): Promise<WebSuccessResponse<NotificationResponseDto>> {
    const result: NotificationResponseDto =
      await this.placesService.adminUpdatePlaceService(admin, request);

    return {
      code: HttpStatus.OK,
      status: true,
      data: result,
    };
  }

  @Post('/admins/places/operating-hours')
  @HttpCode(HttpStatus.OK)
  @RolesAdmin(['master'])
  async adminCreatePlaceOperatingHour(
    @JWTAdminAuthorization() admin: any,
    @Body() request: OperatingHourRequestDto[],
  ): Promise<WebSuccessResponse<NotificationResponseDto>> {
    this.logger.debug(`request body: ${JSON.stringify(request)}`);

    const result: NotificationResponseDto =
      await this.placesService.adminCreatePlaceOperatingHourService(
        admin,
        request,
      );

    return {
      code: HttpStatus.OK,
      status: true,
      data: result,
    };
  }

  @Get('/admins/places/operating-hours')
  @HttpCode(HttpStatus.OK)
  @RolesAdmin(['master', 'admin'])
  async adminGetPlaceOperatingHour(
    @JWTAdminAuthorization() admin: any,
  ): Promise<WebSuccessResponse<OperatingHourDtoResponse[]>> {
    const result: OperatingHourDtoResponse[] =
      await this.placesService.adminGetPlaceOperatingHourService(admin);

    return {
      code: HttpStatus.OK,
      status: true,
      data: result,
    };
  }

  @Put('/admins/places/operating-hours')
  @HttpCode(HttpStatus.OK)
  @RolesAdmin(['master'])
  async adminUpdatePlaceOperatingHour(
    @JWTAdminAuthorization() admin: any,
    @Body() request: OperatingHourDtoResponse,
  ): Promise<WebSuccessResponse<NotificationResponseDto>> {
    const result: NotificationResponseDto =
      await this.placesService.adminUpdatePlaceOperatingHourService(
        admin,
        request,
      );

    return {
      code: HttpStatus.OK,
      status: true,
      data: result,
    };
  }
}
