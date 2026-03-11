import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { DashboardService } from './dashboard.service';

/**
 * 仪表板控制器
 * 聚合首页数据，减少客户端请求次数
 */
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  /**
   * 获取完整仪表板数据
   * GET /api/v1/dashboard
   */
  @Get()
  async getDashboard(@CurrentUser() user: { userId: string }) {
    return this.dashboardService.getDashboard(user.userId);
  }

  /**
   * 获取简化版仪表板（用于推送）
   * GET /api/v1/dashboard/mini
   */
  @Get('mini')
  async getMiniDashboard(@CurrentUser() user: { userId: string }) {
    return this.dashboardService.getMiniDashboard(user.userId);
  }

  /**
   * 刷新仪表板缓存
   * POST /api/v1/dashboard/refresh
   */
  @Get('refresh')
  async refreshDashboard(@CurrentUser() user: { userId: string }) {
    await this.dashboardService.clearCache(user.userId);
    return this.dashboardService.getDashboard(user.userId);
  }
}
