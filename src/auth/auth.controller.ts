import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CONFIG } from '../config/config.schema';
import { AuthService } from './auth.service';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import {
  ApiBasicAuth,
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { RegisterRequestDto, RegisterResponseDto } from './dto/register.dto';
import {
  WebErrorResponse,
  WebSuccessResponse,
} from 'src/common/constant/web.response';
import { BasicAuthGuard } from '../common/guards/basic.auth.guard';
import { LoginRequestDto, LoginResponseDto } from './dto/login.dto';
import {
  RefreshTokenRequestDto,
  RefreshTokenResponseDto,
} from './dto/refresh.token.dto';
import { JWTAuthorization } from '../common/decorators/auth.decorator';
import { VerifyEmailRequestDto } from './dto/verify.email.dto';
import { NotificationResponseDto } from './dto/notification.dto';
import { LogoutRequestDto } from './dto/logout.dto';
import {
  SendPhoneOtpRequestDto,
  VerifyPhoneRequestDto,
} from './dto/verify.phone.dto';
import {
  ForgotPasswordRequestDto,
  ResetPasswordRequestDto,
  VerifyForgotPasswordOtpRequestDto,
} from './dto/fogot.password.dto';
import { GoogleAuthRequestDto } from './dto/google.auth.dto';

@Controller(CONFIG.HEADER_API)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @ApiOperation({ summary: 'register as user' })
  @ApiBody({
    description: 'sign in credentials',
    type: RegisterRequestDto,
  })
  @ApiOkResponse({
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        status: { type: 'boolean', example: true },
        data: {
          $ref: getSchemaPath(RegisterResponseDto),
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Register Bad Request',
    type: WebErrorResponse,
  })
  @ApiBasicAuth()
  @Post('/auth/register')
  @HttpCode(HttpStatus.OK)
  @UseGuards(BasicAuthGuard)
  async register(
    @Body() request: RegisterRequestDto,
  ): Promise<WebSuccessResponse<RegisterResponseDto>> {
    this.logger.debug('Register request body', request);

    const result = await this.authService.registerService(request);

    return {
      code: HttpStatus.OK,
      status: true,
      data: result,
    };
  }

  @ApiOperation({ summary: 'login as user' })
  @ApiBody({
    description: 'sign in credentials',
    type: RegisterRequestDto,
  })
  @ApiOkResponse({
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        status: { type: 'boolean', example: true },
        data: {
          $ref: getSchemaPath(LoginResponseDto),
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
  @Post('/auth/login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(BasicAuthGuard)
  async login(
    @Body() request: LoginRequestDto,
  ): Promise<WebSuccessResponse<LoginResponseDto>> {
    this.logger.debug('login request body', request);

    const result = await this.authService.loginService(request);

    return {
      code: HttpStatus.OK,
      status: true,
      data: result,
    };
  }

  @ApiOperation({ summary: 'refresh-token as user' })
  @ApiBody({
    description: 'refresh-token credentials',
    type: RefreshTokenRequestDto,
  })
  @ApiOkResponse({
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        status: { type: 'boolean', example: true },
        data: {
          $ref: getSchemaPath(RefreshTokenRequestDto),
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'refresh-token bad request',
    type: WebErrorResponse,
  })
  @ApiBasicAuth()
  @Post('/auth/refresh-token')
  @HttpCode(HttpStatus.OK)
  async refreshToken(
    @JWTAuthorization() user: any,
    @Body() request: RefreshTokenRequestDto,
  ): Promise<WebSuccessResponse<RefreshTokenResponseDto>> {
    this.logger.debug('refresh token request body', request);

    const result = await this.authService.refreshTokenService(user.id, request);

    return {
      code: HttpStatus.OK,
      status: true,
      data: result,
    };
  }

  @ApiOperation({ summary: 'logout as user' })
  @ApiBody({
    description: 'logout credentials',
    type: LogoutRequestDto,
  })
  @ApiOkResponse({
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        status: { type: 'boolean', example: true },
        data: {
          $ref: getSchemaPath(RefreshTokenRequestDto),
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'logout bad request',
    type: WebErrorResponse,
  })
  @ApiBasicAuth()
  @Delete('/auth/logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @JWTAuthorization() user: any,
    @Body() request: LogoutRequestDto,
  ): Promise<WebSuccessResponse<NotificationResponseDto>> {
    this.logger.debug('logout request body', request);

    const result = await this.authService.logoutService(user.id, request);

    return {
      code: HttpStatus.OK,
      status: true,
      data: result,
    };
  }

  @ApiOperation({ summary: 'logout post as user' })
  @ApiBody({
    description: 'logout credentials',
    type: LogoutRequestDto,
  })
  @ApiOkResponse({
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        status: { type: 'boolean', example: true },
        data: {
          $ref: getSchemaPath(RefreshTokenRequestDto),
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'logout bad request',
    type: WebErrorResponse,
  })
  @ApiBasicAuth()
  @Post('/auth/logout')
  @HttpCode(HttpStatus.OK)
  async logoutPost(
    @JWTAuthorization() user: any,
    @Body() request: LogoutRequestDto,
  ): Promise<WebSuccessResponse<NotificationResponseDto>> {
    this.logger.debug('logout request body', request);

    const result = await this.authService.logoutService(user.id, request);

    return {
      code: HttpStatus.OK,
      status: true,
      data: result,
    };
  }

  @ApiOperation({ summary: 'verify email as user' })
  @ApiBody({
    description: 'verify email credentials',
    type: VerifyEmailRequestDto,
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
    description: 'verify email bad request',
    type: WebErrorResponse,
  })
  @ApiBasicAuth()
  @UseGuards(BasicAuthGuard)
  @Post('/auth/verify-email')
  @HttpCode(HttpStatus.OK)
  async verifyEmail(
    @Body() request: VerifyEmailRequestDto,
  ): Promise<WebSuccessResponse<NotificationResponseDto>> {
    this.logger.debug('verify email request body', request);

    const result = await this.authService.verifyEmailService(request);

    return {
      code: HttpStatus.OK,
      status: true,
      data: result,
    };
  }

  @ApiOperation({ summary: 'resend verify email as user' })
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
    description: 'verify email bad request',
    type: WebErrorResponse,
  })
  @ApiBearerAuth()
  @Get('/auth/resend-verify-email')
  @HttpCode(HttpStatus.OK)
  async resendVerifyEmail(
    @JWTAuthorization() user: any,
  ): Promise<WebSuccessResponse<NotificationResponseDto>> {
    const result = await this.authService.resendVerifyEmailService(user);

    return {
      code: HttpStatus.OK,
      status: true,
      data: result,
    };
  }

  @ApiOperation({ summary: 'verify phone as user' })
  @ApiBody({
    description: 'verify phone credentials',
    type: VerifyPhoneRequestDto,
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
    description: 'verify phone bad request',
    type: WebErrorResponse,
  })
  @ApiBasicAuth()
  @Post('/auth/verify-phone')
  @HttpCode(HttpStatus.OK)
  async verifyPhone(
    @JWTAuthorization() user: any,
    @Body() request: VerifyPhoneRequestDto,
  ): Promise<WebSuccessResponse<NotificationResponseDto>> {
    this.logger.debug('verify phone request body', request);

    const result = await this.authService.verifyPhoneService(user, request);

    return {
      code: HttpStatus.OK,
      status: true,
      data: result,
    };
  }

  @ApiOperation({ summary: 'send phone otp as user' })
  @ApiBody({
    description: 'send phone otp credentials',
    type: SendPhoneOtpRequestDto,
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
    description: 'send phone otp bad request',
    type: WebErrorResponse,
  })
  @ApiBasicAuth()
  @Post('/auth/send-phone-otp')
  @HttpCode(HttpStatus.OK)
  async sendPhoneOtp(
    @JWTAuthorization() user: any,
    @Body() request: SendPhoneOtpRequestDto,
  ): Promise<WebSuccessResponse<NotificationResponseDto>> {
    this.logger.debug('send phone request body', request);

    const result = await this.authService.sendPhoneOtpService(user, request);

    return {
      code: HttpStatus.OK,
      status: true,
      data: result,
    };
  }

  @ApiOperation({ summary: 'resend phone otp as user' })
  @ApiBody({
    description: 'resend phone otp credentials',
    type: SendPhoneOtpRequestDto,
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
    description: 'resend phone otp bad request',
    type: WebErrorResponse,
  })
  @ApiBasicAuth()
  @Get('/auth/resend-phone-otp')
  @HttpCode(HttpStatus.OK)
  async resendPhoneOtp(
    @JWTAuthorization() user: any,
  ): Promise<WebSuccessResponse<NotificationResponseDto>> {
    const result = await this.authService.resendPhoneOtpService(user);

    return {
      code: HttpStatus.OK,
      status: true,
      data: result,
    };
  }

  @ApiOperation({ summary: 'forgot password request otp as user' })
  @ApiBody({
    description: 'forgot password request otp credentials',
    type: ForgotPasswordRequestDto,
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
    description: 'forgot password request otp bad request',
    type: WebErrorResponse,
  })
  @UseGuards(BasicAuthGuard)
  @Post('/auth/forgot-password/request')
  @HttpCode(HttpStatus.OK)
  async forgotPasswordRequest(
    @Body() forgotPasswordRequest: ForgotPasswordRequestDto,
  ): Promise<WebSuccessResponse<NotificationResponseDto>> {
    const result = await this.authService.forgotPasswordRequestService(
      forgotPasswordRequest,
    );

    return {
      code: HttpStatus.OK,
      status: true,
      data: result,
    };
  }

  @ApiOperation({ summary: 'verify forgot password otp as user' })
  @ApiBody({
    description: 'verify forgot password otp credentials',
    type: VerifyForgotPasswordOtpRequestDto,
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
    description: 'verify forgot password otp bad request',
    type: WebErrorResponse,
  })
  @UseGuards(BasicAuthGuard)
  @Post('/auth/forgot-password/verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyForgotPasswordOtp(
    @Body() verifyForgotPasswordOtp: VerifyForgotPasswordOtpRequestDto,
  ): Promise<WebSuccessResponse<NotificationResponseDto>> {
    const result = await this.authService.verifyForgotPasswordOtpService(
      verifyForgotPasswordOtp,
    );

    return {
      code: HttpStatus.OK,
      status: true,
      data: result,
    };
  }

  @ApiOperation({ summary: 'reset password as user' })
  @ApiBody({
    description: 'reset password credentials',
    type: ResetPasswordRequestDto,
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
    description: 'reset password bad request',
    type: WebErrorResponse,
  })
  @UseGuards(BasicAuthGuard)
  @Post('/auth/reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() resetPassword: ResetPasswordRequestDto,
  ): Promise<WebSuccessResponse<NotificationResponseDto>> {
    const result = await this.authService.resetPasswordService(resetPassword);

    return {
      code: HttpStatus.OK,
      status: true,
      data: result,
    };
  }

  @ApiOperation({ summary: 'login google as user' })
  @ApiBody({
    description: 'login google credentials',
    type: ResetPasswordRequestDto,
  })
  @ApiOkResponse({
    schema: {
      properties: {
        code: { type: 'number', example: 200 },
        status: { type: 'boolean', example: true },
        data: {
          $ref: getSchemaPath(RefreshTokenResponseDto),
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'login google bad request',
    type: WebErrorResponse,
  })
  @UseGuards(BasicAuthGuard)
  @Post('/auth/google')
  @HttpCode(HttpStatus.OK)
  async loginGoogle(
    @Body() googleAuthRequest: GoogleAuthRequestDto,
  ): Promise<WebSuccessResponse<RefreshTokenResponseDto>> {
    const result = await this.authService.googleAuthService(googleAuthRequest);

    return {
      code: HttpStatus.OK,
      status: true,
      data: result,
    };
  }

  @Get('')
  @HttpCode(HttpStatus.OK)
  async health(): Promise<WebSuccessResponse<Record<any, any>>> {
    return {
      code: HttpStatus.OK,
      status: true,
      data: {
        status: HttpStatus.OK,
        data: {
          service: 'ok',
        },
      },
    };
  }
}
