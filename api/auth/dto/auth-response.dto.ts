import { ApiProperty } from '@nestjs/swagger';

export class TokenPairResponseDto {
  @ApiProperty({ example: 'eyJhbGci...' })
  accessToken: string;

  @ApiProperty({ example: 'eyJhbGci...' })
  refreshToken: string;

  @ApiProperty({ example: false })
  isNewUser: boolean;
}

export class AccessTokenResponseDto {
  @ApiProperty({ example: 'eyJhbGci...' })
  accessToken: string;
}

export class MessageResponseDto {
  @ApiProperty({ example: 'Logged out.' })
  message: string;
}
