import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AchievementsService } from './achievements.service';
import { AchievementResponseDto } from './dto/achievement-response.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, JwtPayload } from '../common/decorators/current-user.decorator';

@ApiTags('achievements')
@Controller('achievements')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Get()
  @ApiOperation({ summary: '获取我的成就列表' })
  @ApiResponse({ status: 200, type: [AchievementResponseDto] })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.achievementsService.findAll(user.sub);
  }

  @Get('unlocked')
  @ApiOperation({ summary: '获取已解锁的成就' })
  @ApiResponse({ status: 200, type: [AchievementResponseDto] })
  getUnlocked(@CurrentUser() user: JwtPayload) {
    return this.achievementsService.getUnlocked(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: '根据 ID 获取成就详情' })
  @ApiResponse({ status: 200, type: AchievementResponseDto })
  findOne(@Param('id') id: string) {
    return this.achievementsService.findOne(id);
  }
}
