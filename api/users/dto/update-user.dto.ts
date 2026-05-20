import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class InterestItemDto {
  @IsString() questionId!: string;
  @IsArray() @IsString({ each: true }) selectedOptions!: string[];
}

export class PhotoItemDto {
  @IsString() url!: string;
  @IsInt() @Min(0) order!: number;
}

export class UpdateUserDto {
  @ApiPropertyOptional() @IsOptional() @IsString() displayName?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() birthDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() zodiac?: string;
  @ApiPropertyOptional({ enum: ['Male', 'Female', 'NonBinary', 'PreferNotToSay'] })
  @IsOptional() @IsString() gender?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() bio?: string;

  @ApiPropertyOptional({ enum: ['Male', 'Female', 'Everyone'] })
  @IsOptional() @IsString() lookingFor?: string;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(18) ageMin?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Max(100) ageMax?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(1) maxDistanceKm?: number;
  @ApiPropertyOptional({ enum: ['ShortTerm', 'LongTerm', 'Friends'] })
  @IsOptional() @IsString() relationshipType?: string;

  @ApiPropertyOptional({ type: [InterestItemDto] })
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => InterestItemDto)
  interests?: InterestItemDto[];

  @ApiPropertyOptional({ type: [PhotoItemDto] })
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => PhotoItemDto)
  photos?: PhotoItemDto[];
}
