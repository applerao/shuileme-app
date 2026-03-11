import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { SleepRecord } from '../sleep-records/sleep-record.entity';
import { Checkin } from '../checkins/checkin.entity';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(SleepRecord)
    private sleepRecordsRepository: Repository<SleepRecord>,
    @InjectRepository(Checkin)
    private checkinsRepository: Repository<Checkin>,
  ) {}

  /**
   * 获取睡眠统计
   */
  async getSleepStats(userId: string, startDate?: Date, endDate?: Date) {
    const start = startDate || this.getStartOfWeek(new Date());
    const end = endDate || new Date();

    const records = await this.sleepRecordsRepository.find({
      where: {
        user: { id: userId },
        recordDate: Between(start, end),
      },
      order: { recordDate: 'DESC' },
    });

    if (records.length === 0) {
      return {
        avgBedtime: null,
        avgWakeTime: null,
        avgSleepDuration: 0,
        avgSleepQuality: 0,
        totalRecords: 0,
      };
    }

    const totalDuration = records.reduce((sum, r) => sum + r.sleepDuration, 0);
    const totalQuality = records.reduce((sum, r) => sum + (r.sleepQuality || 0), 0);

    return {
      avgBedtime: this.calculateAverageTime(records.map((r) => r.bedtime)),
      avgWakeTime: this.calculateAverageTime(records.map((r) => r.wakeTime)),
      avgSleepDuration: Math.round(totalDuration / records.length),
      avgSleepQuality: parseFloat((totalQuality / records.length).toFixed(1)),
      totalRecords: records.length,
    };
  }

  /**
   * 获取周统计
   */
  async getWeeklyStats(userId: string) {
    const today = new Date();
    const currentWeekStart = this.getStartOfWeek(today);
    const previousWeekStart = this.getStartOfWeek(new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000));
    const previousWeekEnd = new Date(currentWeekStart.getTime() - 1);

    // 获取本周数据
    const currentWeekRecords = await this.sleepRecordsRepository.find({
      where: {
        user: { id: userId },
        recordDate: Between(currentWeekStart, today),
      },
      order: { recordDate: 'ASC' },
    });

    // 获取上周数据
    const previousWeekRecords = await this.sleepRecordsRepository.find({
      where: {
        user: { id: userId },
        recordDate: Between(previousWeekStart, previousWeekEnd),
      },
      order: { recordDate: 'ASC' },
    });

    // 生成 7 天趋势数据
    const trend = this.generateDailyTrend(currentWeekRecords, currentWeekStart);

    // 计算对比数据
    const currentWeekAvgDuration =
      currentWeekRecords.length > 0
        ? Math.round(currentWeekRecords.reduce((sum, r) => sum + r.sleepDuration, 0) / currentWeekRecords.length)
        : 0;

    const previousWeekAvgDuration =
      previousWeekRecords.length > 0
        ? Math.round(previousWeekRecords.reduce((sum, r) => sum + r.sleepDuration, 0) / previousWeekRecords.length)
        : 0;

    const currentWeekAvgQuality =
      currentWeekRecords.length > 0
        ? parseFloat(
            (currentWeekRecords.reduce((sum, r) => sum + (r.sleepQuality || 0), 0) / currentWeekRecords.length).toFixed(
              1,
            ),
          )
        : 0;

    const previousWeekAvgQuality =
      previousWeekRecords.length > 0
        ? parseFloat(
            (
              previousWeekRecords.reduce((sum, r) => sum + (r.sleepQuality || 0), 0) / previousWeekRecords.length
            ).toFixed(1),
          )
        : 0;

    return {
      trend,
      comparison: {
        currentWeek: {
          avgSleepDuration: currentWeekAvgDuration,
          avgSleepQuality: currentWeekAvgQuality,
          totalRecords: currentWeekRecords.length,
        },
        previousWeek: {
          avgSleepDuration: previousWeekAvgDuration,
          avgSleepQuality: previousWeekAvgQuality,
          totalRecords: previousWeekRecords.length,
        },
        durationChange: currentWeekAvgDuration - previousWeekAvgDuration,
        qualityChange: parseFloat((currentWeekAvgQuality - previousWeekAvgQuality).toFixed(1)),
      },
    };
  }

  /**
   * 生成每日趋势数据
   */
  private generateDailyTrend(records: SleepRecord[], weekStart: Date) {
    const trend = [];
    const recordMap = new Map<string, SleepRecord>();

    records.forEach((record) => {
      const dateStr = new Date(record.recordDate).toISOString().split('T')[0];
      recordMap.set(dateStr, record);
    });

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const record = recordMap.get(dateStr);

      trend.push({
        date: dateStr,
        sleepDuration: record ? record.sleepDuration : 0,
        sleepQuality: record ? record.sleepQuality || 0 : 0,
        bedtime: record ? record.bedtime : null,
        wakeTime: record ? record.wakeTime : null,
      });
    }

    return trend;
  }

  /**
   * 计算平均时间
   */
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
   * 获取本周开始日期
   */
  private getStartOfWeek(date: Date): Date {
    const dayOfWeek = date.getDay();
    const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // 周一为起始
    const startOfWeek = new Date(date);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
  }
}
