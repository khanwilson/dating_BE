import { Controller, ForbiddenException, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check' })
  health(): { status: string; timestamp: string } {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Post('seed')
  @ApiOperation({ summary: 'Reset + seed database với mock data (dev only)' })
  seed() {
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('Seed is disabled in production');
    }
    return this.appService.seed();
  }
}
