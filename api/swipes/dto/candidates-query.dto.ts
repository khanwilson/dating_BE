import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsLatitude, IsLongitude, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CandidatesQueryDto {
  @ApiProperty() @Type(() => Number) @IsLatitude() lat!: number;
  @ApiProperty() @Type(() => Number) @IsLongitude() lng!: number;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional() @Type(() => Number) @IsNumber() @Min(1) @Max(100) limit?: number = 20;

  @ApiPropertyOptional({ description: 'Cursor từ response trước (nextCursor)' })
  @IsOptional() @IsString() cursor?: string;
}
