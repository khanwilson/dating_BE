import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

const REFRESH_EXPIRES_DAYS = 30;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async loginWithPhone(
    phoneCode: string,
    phoneNumber: string,
  ): Promise<{ accessToken: string; refreshToken: string; isNewUser: boolean }> {
    let isNewUser = false;

    let user = await this.prisma.user.findUnique({
      where: { phoneCode_phoneNumber: { phoneCode, phoneNumber } },
    });

    if (!user) {
      user = await this.prisma.user.create({ data: { phoneCode, phoneNumber } });
      isNewUser = true;
    }

    const tokens = await this.issueTokenPair(user.id);
    return { ...tokens, isNewUser };
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
      { expiresIn: this.config.get('JWT_ACCESS_EXPIRES_IN', '15m') },
    );
    return { accessToken };
  }

  async logout(token: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({ where: { token } });
  }

  private async issueTokenPair(userId: string) {
    const accessToken = this.jwt.sign(
      { sub: userId },
      { expiresIn: this.config.get('JWT_ACCESS_EXPIRES_IN', '15m') },
    );
    const refreshToken = this.jwt.sign(
      { sub: userId },
      { expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '30d') },
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_EXPIRES_DAYS);

    await this.prisma.refreshToken.create({
      data: { userId, token: refreshToken, expiresAt },
    });

    return { accessToken, refreshToken };
  }
}
