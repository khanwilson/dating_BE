import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser, CurrentUser as CurrentUserType } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CandidatesQueryDto } from './dto/candidates-query.dto';
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
}
