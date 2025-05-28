import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  ParseFloatPipe,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  WebErrorResponse,
  WebSuccessResponse,
} from '../common/constant/web.response';
import { JWTAuthorization } from '../common/decorators/auth.decorator';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { PlacesService } from './places.service';
import { PlaceResponseDto } from './dto/places.dto';
import { CONFIG } from '../config/config.schema';
import { NearbyPlaceDto } from './dto/place.nearby.dto';
import { PlacesRatingDtoResponse } from './dto/places.rating.dto';
import { ParkingZoneDtoResponse } from './dto/parking.zone.dto';
import { ParkingSlotDtoResponse } from './dto/parking.slot.dto';

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
}
