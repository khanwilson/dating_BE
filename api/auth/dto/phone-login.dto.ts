import { IsNotEmpty, IsString, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PhoneLoginDto {
  @ApiProperty({ example: '84', description: 'Country code without +' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{1,4}$/, { message: 'phoneCode must be 1–4 digits' })
  phoneCode?: string;

  @ApiProperty({ example: '901234567', description: 'Local phone number digits only' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{6,15}$/, { message: 'phoneNumber must be 6–15 digits' })
  phoneNumber?: string;
}
