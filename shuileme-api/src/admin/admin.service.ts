import { Injectable, NotFoundException, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { Admin } from './admin.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CacheService } from '../common/cache/cache.service';
import { UsersService } from '../users/users.service';
import { CheckinsService } from '../checkins/checkins.service';
import { SleepRecordsService } from '../sleep-records/sleep-records.service';

@Injectable()
export class AdminService {
  private readonly CACHE_TTL = 300;

  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private cacheService: CacheService,
    private usersService: UsersService,
    private checkinsService: CheckinsService,
    private sleepRecordsService: SleepRecordsService,
  ) {}

  // ==================== 管理员认证 ====================

  async validateAdmin(username: string, password: string): Promise<Admin | null> {
    const admin = await this.adminRepository.findOne({
      where: { username },
      select: ['id', 'username', 'name', 'password', 'role', 'isActive'],
    });

    if (!admin || !admin.isActive) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return null;
    }

    return admin;
  }

  async login(username: string, password: string, ip?: string) {
    const admin = await this.validateAdmin(username, password);
    
    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    admin.lastLoginAt = new Date();
    admin.lastLoginIp = ip;
    await this.adminRepository.save(admin);

    const payload = { 
      sub: admin.id, 
      username: admin.username,
      role: admin.role,
      type: 'admin'
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get('JWT_EXPIRATION', '7d'),
    });

    return {
      success: true,
      data: {
        accessToken,
        admin: {
          id: admin.id,
          username: admin.username,
          name: admin.name,
          role: admin.role,
        },
      },
    };
  }

  async getProfile(adminId: string) {
    const admin = await this.adminRepository.findOne({
      where: { id: adminId },
      select: ['id', 'username', 'name', 'role', 'isActive', 'lastLoginAt', 'createdAt'],
    });

    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    return {
      success: true,
      data: admin,
    };
  }

  // ==================== 管理员管理 ====================

  async findAllAdmins() {
    const admins = await this.adminRepository.find({
      select: ['id', 'username', 'name', 'role', 'isActive', 'lastLoginAt', 'createdAt'],
      order: { createdAt: 'DESC' },
    });

    return {
      success: true,
      data: admins,
    };
  }

  async createAdmin(createAdminDto: any) {
    const existing = await this.adminRepository.findOne({
      where: { username: createAdminDto.username },
    });

    if (existing) {
      throw new ConflictException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(createAdminDto.password, 10);
    
    const admin = this.adminRepository.create({
      ...createAdminDto,
      password: hashedPassword,
      role: createAdminDto.role || 'admin',
    });

    const savedAdmin = await this.adminRepository.save(admin);

    return {
      success: true,
      data: {
        id: savedAdmin.id,
        username: savedAdmin.username,
        name: savedAdmin.name,
        role: savedAdmin.role,
      },
    };
  }

  async updateAdmin(id: string, updateAdminDto: any) {
    const admin = await this.adminRepository.findOne({ where: { id } });
    
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    if (updateAdminDto.password) {
      updateAdminDto.password = await bcrypt.hash(updateAdminDto.password, 10);
    }

    Object.assign(admin, updateAdminDto);
    await this.adminRepository.save(admin);

    return {
      success: true,
      message: 'Admin updated successfully',
    };
  }

  async deleteAdmin(id: string) {
    const admin = await this.adminRepository.findOne({ where: { id } });
    
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    await this.adminRepository.remove(admin);

    return {
      success: true,
      message: 'Admin deleted successfully',
    };
  }

  // ==================== 数据统计 - 用户统计 ====================

  async getUserStats() {
    const cacheKey = 'admin:stats:users';
    const cached = await this.cacheService.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const totalUsers = await this.usersService.getTotalCount();
    const activeUsers = await this.usersService.getActiveCount();
    const newUsersToday = await this.usersService.getNewUsersCount(new Date());
    const newUsersThisWeek = await this.usersService.getNewUsersCount(new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000));
    const newUsersThisMonth = await this.usersService.getNewUsersCount(new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000));

    const stats = {
      totalUsers,
      activeUsers,
      activeRate: totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(2) : 0,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
      timestamp: new Date().toISOString(),
    };

    await this.cacheService.set(cacheKey, stats, 60);
    
    return {
      success: true,
      data: stats,
    };
  }

  // ==================== 数据统计 - 活跃度分析 ====================

  async getActivityStats() {
    const cacheKey = 'admin:stats:activity';
    const cached = await this.cacheService.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [todayCheckins, weekCheckins, monthCheckins] = await Promise.all([
      this.checkinsService.getDateRangeCount(today, new Date(today.getTime() + 1)),
      this.checkinsService.getDateRangeCount(weekAgo, today),
      this.checkinsService.getDateRangeCount(monthAgo, today),
    ]);

    const dailyCheckins = await this.checkinsService.getDailyStats(7);

    const stats = {
      checkins: {
        today: todayCheckins,
        thisWeek: weekCheckins,
        thisMonth: monthCheckins,
      },
      dailyCheckins,
      timestamp: new Date().toISOString(),
    };

    await this.cacheService.set(cacheKey, stats, 60);

    return {
      success: true,
      data: stats,
    };
  }

  // ==================== 数据统计 - 睡眠数据汇总 ====================

  async getSleepStats() {
    const cacheKey = 'admin:stats:sleep';
    const cached = await this.cacheService.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [totalRecords, avgDuration, avgScore, sleepDistribution] = await Promise.all([
      this.sleepRecordsService.getTotalCount(),
      this.sleepRecordsService.getAverageDuration(),
      this.sleepRecordsService.getAverageScore(),
      this.sleepRecordsService.getSleepDistribution(),
    ]);

    const weeklyTrend = await this.sleepRecordsService.getWeeklyTrend();

    const stats = {
      totalRecords,
      avgDuration: avgDuration || 0,
      avgScore: avgScore || 0,
      sleepDistribution,
      weeklyTrend,
      timestamp: new Date().toISOString(),
    };

    await this.cacheService.set(cacheKey, stats, 60);

    return {
      success: true,
      data: stats,
    };
  }

  // ==================== 数据统计 - 打卡率统计 ====================

  async getCheckinRateStats() {
    const cacheKey = 'admin:stats:checkin-rate';
    const cached = await this.cacheService.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const today = new Date();
    const totalUsers = await this.usersService.getTotalCount();
    
    const todayCheckins = await this.checkinsService.getDateRangeCount(today, new Date(today.getTime() + 1));
    const checkinRate = totalUsers > 0 ? ((todayCheckins / totalUsers) * 100).toFixed(2) : 0;

    const weeklyRate = await this.checkinsService.getWeeklyCheckinRate();
    const monthlyRate = await this.checkinsService.getMonthlyCheckinRate();

    const stats = {
      today: {
        checkins: todayCheckins,
        totalUsers,
        rate: parseFloat(checkinRate as string),
      },
      weeklyRate,
      monthlyRate,
      timestamp: new Date().toISOString(),
    };

    await this.cacheService.set(cacheKey, stats, 60);

    return {
      success: true,
      data: stats,
    };
  }

  // ==================== 用户管理 ====================

  async getUserList(page = 1, limit = 20, filters?: any) {
    const cacheKey = `admin:users:list:${page}:${limit}:${JSON.stringify(filters)}`;
    const cached = await this.cacheService.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const query = this.usersService.getQueryBuilder();
    
    if (filters?.keyword) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('user.nickname LIKE :keyword', { keyword: `%${filters.keyword}%` })
            .orWhere('user.phone LIKE :keyword', { keyword: `%${filters.keyword}%` });
        }),
      );
    }

    if (filters?.isActive !== undefined) {
      query.andWhere('user.isActive = :isActive', { isActive: filters.isActive });
    }

    const [users, total] = await query
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('user.createdAt', 'DESC')
      .getManyAndCount();

    const result = {
      data: users.map(u => ({
        id: u.id,
        nickname: u.nickname,
        phone: u.phone,
        avatar: u.avatar,
        isActive: u.isActive,
        totalCheckinDays: u.totalCheckinDays,
        continuousCheckinDays: u.continuousCheckinDays,
        createdAt: u.createdAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    await this.cacheService.set(cacheKey, result, 30);

    return {
      success: true,
      data: result,
    };
  }

  async getUserDetail(userId: string) {
    const user = await this.usersService.findOne(userId);
    
    const [checkinHistory, sleepRecords] = await Promise.all([
      this.checkinsService.getUserCheckins(userId, 30),
      this.sleepRecordsService.getUserRecords(userId, 30),
    ]);

    return {
      success: true,
      data: {
        ...user,
        checkinHistory,
        sleepRecords,
      },
    };
  }

  async updateUserStatus(userId: string, isActive: boolean) {
    await this.usersService.updateStatus(userId, isActive);
    
    return {
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
    };
  }

  // ==================== 综合仪表板 ====================

  async getDashboard() {
    const cacheKey = 'admin:dashboard';
    const cached = await this.cacheService.get(cacheKey);
    
    if (cached) {
      return cached;
    }

    const [userStats, activityStats, sleepStats, checkinRateStats] = await Promise.all([
      this.getUserStats(),
      this.getActivityStats(),
      this.getSleepStats(),
      this.getCheckinRateStats(),
    ]);

    const dashboard = {
      userStats: userStats.data,
      activityStats: activityStats.data,
      sleepStats: sleepStats.data,
      checkinRateStats: checkinRateStats.data,
      timestamp: new Date().toISOString(),
    };

    await this.cacheService.set(cacheKey, dashboard, 60);

    return {
      success: true,
      data: dashboard,
    };
  }
}
