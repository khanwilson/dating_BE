import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser, CurrentUser as CurrentUserType } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CandidatesQueryDto } from './dto/candidates-query.dto';
import { CreateSwipeDto } from './dto/create-swipe.dto';
import { SwipesService } from './swipes.service';

@ApiTags('swipes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('swipes')
export class SwipesController {
  constructor(private readonly swipesService: SwipesService) {}

  @Get('candidates')
  @ApiOkResponse({ description: 'Danh sách candidates gần nhất, sort theo khoảng cách' })
  getCandidates(@CurrentUser() user: CurrentUserType, @Query() query: CandidatesQueryDto) {
    return this.swipesService.getCandidates(user.userId, query);
  }

  @Post()
  @ApiOkResponse({ description: 'Ghi lại swipe, trả về { isMatch, matchId? }' })
  swipe(@CurrentUser() user: CurrentUserType, @Body() dto: CreateSwipeDto) {
    return this.swipesService.swipe(user.userId, dto);
  }

  @Get('liked-me')
  @ApiOkResponse({ description: 'Danh sách user đã LIKE mình nhưng chưa match' })
  getLikedMe(@CurrentUser() user: CurrentUserType) {
    return this.swipesService.getLikedMe(user.userId);
  }

  @Get('liked-by-me')
  @ApiOkResponse({ description: 'Danh sách user mình đã LIKE nhưng chưa được like ngược lại' })
  getLikedByMe(@CurrentUser() user: CurrentUserType) {
    return this.swipesService.getLikedByMe(user.userId);
  }

  @Patch('matches/:matchId')
  @ApiOkResponse({ description: 'Unmatch — xóa swipe records, cho phép re-discover' })
  unmatch(@CurrentUser() user: CurrentUserType, @Param('matchId') matchId: string) {
    return this.swipesService.unmatch(user.userId, matchId);
  }
}
