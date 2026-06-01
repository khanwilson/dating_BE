import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString } from 'class-validator';

export enum SwipeAction {
  LIKE = 'LIKE',
  PASS = 'PASS',
  SUPERLIKE = 'SUPERLIKE',
}

export class CreateSwipeDto {
  @ApiProperty({ description: 'ID của user bị swipe' })
  @IsString()
  toUserId!: string;

  @ApiProperty({ enum: SwipeAction })
  @IsEnum(SwipeAction)
  action!: SwipeAction;
}
