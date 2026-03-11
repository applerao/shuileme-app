import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { StatsService } from './stats.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@ApiTags('stats')
@Controller('stats')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('sleep')
  @ApiOperation({ summary: '获取睡眠统计' })
  @ApiResponse({ status: 200, description: '睡眠统计数据' })
  @ApiQuery({ name: 'startDate', required: false, type: String, description: '开始日期 (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', required: false, type: String, description: '结束日期 (YYYY-MM-DD)' })
  getSleepStats(
    @CurrentUser() user: JwtPayload,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;
    return this.statsService.getSleepStats(user.userId, start, end);
  }

  @Get('weekly')
  @ApiOperation({ summary: '获取周统计' })
  @ApiResponse({ status: 200, description: '周统计数据，包含 7 天趋势和本周 vs 上周对比' })
  getWeeklyStats(@CurrentUser() user: JwtPayload) {
    return this.statsService.getWeeklyStats(user.userId);
  }
}
