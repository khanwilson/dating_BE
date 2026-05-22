import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  AccessTokenResponseDto,
  MessageResponseDto,
  TokenPairResponseDto,
} from './dto/auth-response.dto';
import { PhoneLoginDto } from './dto/phone-login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('phone-otp/request')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Gửi OTP về số điện thoại (dev: xem console, mặc định 000000)' })
  @ApiResponse({ status: 200, type: MessageResponseDto })
  @ApiResponse({ status: 404, description: '{ code: "PHONE_NOT_REGISTERED" } — SĐT chưa đăng ký' })
  requestOtp(@Body() dto: PhoneLoginDto) {
    return this.auth.sendOtp(dto.phoneCode!, dto.phoneNumber!);
  }

  @Post('phone-otp/register')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Tạo user theo SĐT (không gửi OTP)' })
  register(@Body() dto: PhoneLoginDto) {
    return this.auth.register(dto.phoneCode!, dto.phoneNumber!);
  }

  @Post('phone-otp/confirm')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xác nhận OTP → trả JWT pair + isNewUser' })
  @ApiResponse({ status: 200, type: TokenPairResponseDto })
  @ApiResponse({ status: 401, description: 'OTP sai hoặc hết hạn' })
  confirmOtp(@Body() dto: VerifyOtpDto) {
    return this.auth.verifyOtp(dto.phoneCode!, dto.phoneNumber!, dto.otp!);
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
