import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({ example: '84' })
  @IsString() @IsNotEmpty() @Matches(/^\d{1,4}$/)
  phoneCode?: string;

  @ApiProperty({ example: '901234567' })
  @IsString() @IsNotEmpty() @Matches(/^\d{6,15}$/)
  phoneNumber?: string;

  @ApiProperty({ example: '000000' })
  @IsString() @Length(6, 6)
  otp?: string;
}
