import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { PhoneLoginDto } from './dto/phone-login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import {
  AccessTokenResponseDto,
  MessageResponseDto,
  TokenPairResponseDto,
} from './dto/auth-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('phone')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Register or login with phone number — returns JWT pair + isNewUser' })
  @ApiResponse({ status: 200, type: TokenPairResponseDto })
  phone(@Body() dto: PhoneLoginDto) {
    return this.auth.loginWithPhone(dto.phoneCode!, dto.phoneNumber!);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exchange refresh token for a new access token' })
  @ApiResponse({ status: 200, type: AccessTokenResponseDto })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token' })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.auth.refresh(dto.refreshToken!);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke refresh token' })
  @ApiResponse({ status: 200, type: MessageResponseDto })
  async logout(@Body() dto: RefreshTokenDto) {
    await this.auth.logout(dto.refreshToken!);
    return { message: 'Logged out.' };
  }
}
