import { HttpException, HttpStatus, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import type { Redis } from 'ioredis';
import { PrismaService } from '../prisma/prisma.service';
import { REDIS_CLIENT } from '../redis/redis.module';

const TOKEN_EXPIRES_DAYS = 7;
const REFRESH_EXPIRES_DAYS = 30;
const OTP_TTL_SECONDS = 300;
const DEV_OTP = '000000';

interface OtpPayload {
  otp: string;
  userId: string;
  isNewUser: boolean;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) { }

  async sendOtp(phoneCode: string, phoneNumber: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { phoneCode_phoneNumber: { phoneCode, phoneNumber } },
    });

    if (!user) {
      throw new HttpException(
        { code: 'PHONE_NOT_REGISTERED', message: 'Số điện thoại chưa đăng ký' },
        HttpStatus.NOT_FOUND,
      );
    }

    return this.generateAndStoreOtp(phoneCode, phoneNumber, user.id, false);
  }

  async register(
    phoneCode: string,
    phoneNumber: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const existing = await this.prisma.user.findUnique({
      where: { phoneCode_phoneNumber: { phoneCode, phoneNumber } },
    });

    if (existing) {
      throw new HttpException(
        { code: 'PHONE_ALREADY_REGISTERED', message: 'Số điện thoại đã được đăng ký' },
        HttpStatus.CONFLICT,
      );
    }

    const user = await this.prisma.user.create({ data: { phoneCode, phoneNumber } });
    const tokens = await this.issueTokenPair(user.id);
    return { ...tokens };
  }

  private async generateAndStoreOtp(
    phoneCode: string,
    phoneNumber: string,
    userId: string,
    isNewUser: boolean,
  ): Promise<{ message: string }> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const payload: OtpPayload = { otp, userId, isNewUser };
    const key = `otp:${phoneCode}:${phoneNumber}`;

    await this.redis.set(key, JSON.stringify(payload), 'EX', OTP_TTL_SECONDS);

    // Dev: print OTP to console instead of sending SMS
    // eslint-disable-next-line no-console
    console.log(`[OTP] +${phoneCode}${phoneNumber} → ${otp}`);

    return { message: 'OTP sent.' };
  }

  async verifyOtp(
    phoneCode: string,
    phoneNumber: string,
    otp: string,
  ): Promise<{ accessToken: string; refreshToken: string; isNewUser: boolean }> {
    const key = `otp:${phoneCode}:${phoneNumber}`;
    const raw = await this.redis.get(key);

    if (!raw) throw new UnauthorizedException('OTP expired or not requested');

    const payload: OtpPayload = JSON.parse(raw);
    const isDev = this.config.get('NODE_ENV') !== 'production';
    const valid = otp === payload.otp || (isDev && otp === DEV_OTP);

    if (!valid) throw new UnauthorizedException('Invalid OTP');

    await this.redis.del(key);

    const tokens = await this.issueTokenPair(payload.userId);
    return { ...tokens, isNewUser: payload.isNewUser };
  }

  async refresh(token: string): Promise<{ accessToken: string }> {
    let payload: { sub: string };
    try {
      payload = this.jwt.verify<{ sub: string }>(token);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const stored = await this.prisma.refreshToken.findUnique({ where: { token } });
    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token revoked or expired');
    }

    const accessToken = this.jwt.sign(
      { sub: payload.sub },
      { expiresIn: this.config.get('JWT_ACCESS_EXPIRES_IN', `${TOKEN_EXPIRES_DAYS}d`) },
    );
    return { accessToken };
  }

  async logout(token: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({ where: { token } });
  }

  private async issueTokenPair(userId: string) {
    const accessToken = this.jwt.sign(
      { sub: userId },
      { expiresIn: this.config.get('JWT_ACCESS_EXPIRES_IN', `${TOKEN_EXPIRES_DAYS}d`) },
    );
    const refreshToken = this.jwt.sign(
      { sub: userId },
      { expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', `${REFRESH_EXPIRES_DAYS}d`) },
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_EXPIRES_DAYS);

    await this.prisma.refreshToken.create({
      data: { userId, token: refreshToken, expiresAt },
    });

    return { accessToken, refreshToken };
  }
}
