import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { SleepRecord } from './sleep-record.entity';
import { CreateSleepRecordDto } from './dto/create-sleep-record.dto';

@Injectable()
export class SleepRecordsService {
  constructor(
    @InjectRepository(SleepRecord)
    private sleepRecordsRepository: Repository<SleepRecord>,
  ) {}

  async create(userId: string, createSleepRecordDto: CreateSleepRecordDto): Promise<SleepRecord> {
    const bedtime = new Date(createSleepRecordDto.bedtime);
    const wakeTime = new Date(createSleepRecordDto.wakeTime);

    // Calculate sleep duration if not provided
    let sleepDuration = createSleepRecordDto.sleepDuration;
    if (!sleepDuration) {
      sleepDuration = Math.floor((wakeTime.getTime() - bedtime.getTime()) / (1000 * 60));
    }

    // Determine record date (use wake time date)
    const recordDate = createSleepRecordDto.recordDate || wakeTime;
    const recordDateStr = new Date(recordDate).toISOString().split('T')[0];

    const sleepRecord = this.sleepRecordsRepository.create({
      ...createSleepRecordDto,
      user: { id: userId },
      userId,
      bedtime,
      wakeTime,
      sleepDuration,
      recordDate: new Date(recordDateStr),
    });

    return this.sleepRecordsRepository.save(sleepRecord);
  }

  async findAll(userId: string, startDate?: Date, endDate?: Date): Promise<SleepRecord[]> {
    const where: any = { user: { id: userId } };

    if (startDate && endDate) {
      where.recordDate = Between(startDate, endDate);
    }

    return this.sleepRecordsRepository.find({
      where,
      order: { recordDate: 'DESC' },
    });
  }

  async findOne(id: string): Promise<SleepRecord> {
    const record = await this.sleepRecordsRepository.findOne({ where: { id } });
    if (!record) {
      throw new NotFoundException(`Sleep record with ID ${id} not found`);
    }
    return record;
  }

  async update(id: string, updates: Partial<SleepRecord>): Promise<SleepRecord> {
    const record = await this.findOne(id);
    Object.assign(record, updates);
    return this.sleepRecordsRepository.save(record);
  }

  async remove(id: string): Promise<void> {
    const record = await this.findOne(id);
    await this.sleepRecordsRepository.remove(record);
  }

  async getStats(userId: string, startDate: Date, endDate: Date) {
    const records = await this.findAll(userId, startDate, endDate);

    if (records.length === 0) {
      return {
        totalRecords: 0,
        avgSleepDuration: 0,
        avgSleepQuality: 0,
        avgBedtime: null,
        avgWakeTime: null,
      };
    }

    const totalDuration = records.reduce((sum, r) => sum + r.sleepDuration, 0);
    const totalQuality = records.reduce((sum, r) => sum + (r.sleepQuality || 0), 0);

    return {
      totalRecords: records.length,
      avgSleepDuration: Math.round(totalDuration / records.length),
      avgSleepQuality: parseFloat((totalQuality / records.length).toFixed(1)),
      avgBedtime: this.calculateAverageTime(records.map((r) => r.bedtime)),
      avgWakeTime: this.calculateAverageTime(records.map((r) => r.wakeTime)),
    };
  }

  private calculateAverageTime(dates: Date[]): string {
    if (dates.length === 0) return null;

    const totalMinutes = dates.reduce((sum, date) => {
      return sum + date.getHours() * 60 + date.getMinutes();
    }, 0);

    const avgMinutes = Math.round(totalMinutes / dates.length);
    const hours = Math.floor(avgMinutes / 60) % 24;
    const minutes = avgMinutes % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  /**
   * 获取睡眠评分
   */
  async getScore(userId: string, date: Date): Promise<number> {
    const recordDateStr = date.toISOString().split('T')[0];
    const record = await this.sleepRecordsRepository.findOne({
      where: { userId, recordDate: new Date(recordDateStr) },
    });

    if (!record) {
      return 0;
    }

    // 简单评分逻辑：根据睡眠时长评分
    const duration = record.sleepDuration;
    if (duration >= 480 && duration <= 540) { // 8-9 小时
      return 100;
    } else if (duration >= 420 && duration < 480) { // 7-8 小时
      return 90;
    } else if (duration >= 360 && duration < 420) { // 6-7 小时
      return 75;
    } else if (duration >= 300 && duration < 360) { // 5-6 小时
      return 60;
    } else {
      return 50;
    }
  }

  /**
   * 获取总记录数
   */
  async getTotalCount(): Promise<number> {
    return await this.sleepRecordsRepository.count();
  }

  /**
   * 获取平均睡眠时长
   */
  async getAverageDuration(): Promise<number> {
    const result = await this.sleepRecordsRepository
      .createQueryBuilder('sleep_record')
      .select('AVG(sleep_record.sleepDuration)', 'avg')
      .getRawOne();
    
    return Math.round(parseFloat(result?.avg) || 0);
  }

  /**
   * 获取平均睡眠评分
   */
  async getAverageScore(): Promise<number> {
    const result = await this.sleepRecordsRepository
      .createQueryBuilder('sleep_record')
      .select('AVG(sleep_record.sleepQuality)', 'avg')
      .getRawOne();
    
    return Math.round(parseFloat(result?.avg) || 0);
  }

  /**
   * 获取睡眠分布
   */
  async getSleepDistribution() {
    const distribution = await this.sleepRecordsRepository
      .createQueryBuilder('sleep_record')
      .select('CASE WHEN sleep_record.sleepDuration < 360 THEN \'short\' WHEN sleep_record.sleepDuration < 480 THEN \'normal\' ELSE \'long\' END', 'category')
      .addSelect('COUNT(*)', 'count')
      .groupBy('category')
      .getRawMany();

    return distribution.reduce((acc: any, stat: any) => {
      acc[stat.category] = parseInt(stat.count, 10);
      return acc;
    }, { short: 0, normal: 0, long: 0 });
  }

  /**
   * 获取每周趋势
   */
  async getWeeklyTrend() {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const trend = await this.sleepRecordsRepository
      .createQueryBuilder('sleep_record')
      .select('DATE(sleep_record.recordDate)', 'date')
      .addSelect('AVG(sleep_record.sleepDuration)', 'avgDuration')
      .addSelect('AVG(sleep_record.sleepQuality)', 'avgQuality')
      .addSelect('COUNT(*)', 'count')
      .where('sleep_record.recordDate >= :weekAgo', { weekAgo: weekAgo.toISOString().split('T')[0] })
      .groupBy('DATE(sleep_record.recordDate)')
      .orderBy('DATE(sleep_record.recordDate)', 'ASC')
      .getRawMany();

    return trend.map((stat: any) => ({
      date: stat.date,
      avgDuration: Math.round(parseFloat(stat.avgDuration) || 0),
      avgQuality: Math.round(parseFloat(stat.avgQuality) || 0),
      count: parseInt(stat.count, 10),
    }));
  }

  /**
   * 获取用户睡眠记录
   */
  async getUserRecords(userId: string, limit: number = 30) {
    return await this.sleepRecordsRepository.find({
      where: { userId },
      order: { recordDate: 'DESC' },
      take: limit,
    });
  }
}
