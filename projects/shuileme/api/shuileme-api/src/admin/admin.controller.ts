import { Controller, Post, Get, Put, Delete, Body, Param, Query, UseGuards, Request, Ip } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { AdminAuthGuard } from './guards/admin-auth.guard';
import { CurrentAdmin } from '../common/decorators/current-admin.decorator';

@ApiTags('Admin - 管理员后台')
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  // ==================== 认证接口 ====================

  @Post('auth/login')
  @ApiOperation({ summary: '管理员登录' })
  async login(@Body() body: any, @Ip() ip: string) {
    return this.adminService.login(body.username, body.password, ip);
  }

  @Get('auth/profile')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前管理员信息' })
  async getProfile(@CurrentAdmin() admin: any) {
    return this.adminService.getProfile(admin.sub);
  }

  // ==================== 管理员管理 ====================

  @Get('admins')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取所有管理员列表' })
  async findAllAdmins() {
    return this.adminService.findAllAdmins();
  }

  @Post('admins')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建新管理员' })
  async createAdmin(@Body() createAdminDto: any) {
    return this.adminService.createAdmin(createAdminDto);
  }

  @Put('admins/:id')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新管理员信息' })
  async updateAdmin(@Param('id') id: string, @Body() updateAdminDto: any) {
    return this.adminService.updateAdmin(id, updateAdminDto);
  }

  @Delete('admins/:id')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '删除管理员' })
  async deleteAdmin(@Param('id') id: string) {
    return this.adminService.deleteAdmin(id);
  }

  // ==================== 数据看板 ====================

  @Get('dashboard')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取综合数据看板' })
  async getDashboard() {
    return this.adminService.getDashboard();
  }

  @Get('stats/users')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '用户数据统计' })
  async getUserStats() {
    return this.adminService.getUserStats();
  }

  @Get('stats/activity')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '活跃度分析' })
  async getActivityStats() {
    return this.adminService.getActivityStats();
  }

  @Get('stats/sleep')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '睡眠数据汇总' })
  async getSleepStats() {
    return this.adminService.getSleepStats();
  }

  @Get('stats/checkin-rate')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '打卡率统计' })
  async getCheckinRateStats() {
    return this.adminService.getCheckinRateStats();
  }

  // ==================== 用户管理 ====================

  @Get('users')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '用户列表查询' })
  async getUserList(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('keyword') keyword?: string,
    @Query('isActive') isActive?: boolean,
  ) {
    const filters: any = {};
    if (keyword) filters.keyword = keyword;
    if (isActive !== undefined) filters.isActive = isActive;
    
    return this.adminService.getUserList(parseInt(page), parseInt(limit), filters);
  }

  @Get('users/:id')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '用户详情查看' })
  async getUserDetail(@Param('id') id: string) {
    return this.adminService.getUserDetail(id);
  }

  @Put('users/:id/status')
  @UseGuards(AdminAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '用户状态管理' })
  async updateUserStatus(
    @Param('id') id: string,
    @Body('isActive') isActive: boolean,
  ) {
    return this.adminService.updateUserStatus(id, isActive);
  }
}
